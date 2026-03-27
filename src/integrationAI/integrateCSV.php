<?php
/**
 * integrateCSV.php — Intégration CSV/Excel des adhésions et activités
 *
 * Formats acceptés : .csv, .xlsx, .xls
 *
 * Flux en 3 étapes :
 *   Étape 1 — Upload du fichier
 *   Étape 2 — Pré-vérification : an_exercice et codes activité présents en base ;
 *             proposition de création des an_exercice manquants.
 *   Étape 3 — Intégration des transactions.
 */

session_start();

require_once __DIR__ . '/../../public/config.php';
require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

// Répertoire temporaire pour conserver le fichier entre les étapes
define('TMP_DIR', __DIR__ . '/tmp/');
if (!is_dir(TMP_DIR)) {
    mkdir(TMP_DIR, 0750, true);
    file_put_contents(TMP_DIR . '.htaccess', "Deny from all\n");
}

// ============================================================
// FONCTIONS DE LECTURE DE FICHIER
// ============================================================

function parseFrDate(string $s): ?string
{
    $s = trim($s);
    if (empty($s)) return null;
    $d = DateTime::createFromFormat('d/m/Y', $s);
    return $d ? $d->format('Y-m-d') : null;
}

function parseMontant(string $s): float
{
    return (float) str_replace(',', '.', trim($s));
}

function detectDelimiter(string $filePath): string
{
    $h = fopen($filePath, 'r');
    $line = fgets($h);
    fclose($h);
    return (substr_count($line, ';') > substr_count($line, ',')) ? ';' : ',';
}

function readFromCSV(string $filePath): array
{
    $delimiter = detectDelimiter($filePath);
    $h = fopen($filePath, 'r');
    $bom = fread($h, 3);
    if ($bom !== "\xEF\xBB\xBF") rewind($h);

    $headers = null;
    $rows    = [];
    while (($data = fgetcsv($h, 0, $delimiter)) !== false) {
        if ($headers === null) { $headers = array_map('trim', $data); continue; }
        while (count($data) < count($headers)) $data[] = '';
        $rows[] = array_combine($headers, array_slice($data, 0, count($headers)));
    }
    fclose($h);
    return $rows;
}

function readFromExcel(string $filePath): array
{
    $spreadsheet = IOFactory::load($filePath);
    $sheet       = $spreadsheet->getActiveSheet();

    $headers = null;
    $nbCols  = 0;
    $rows    = [];

    foreach ($sheet->getRowIterator() as $row) {
        $cellIterator = $row->getCellIterator();
        $cellIterator->setIterateOnlyExistingCells(false);

        $rowData = [];
        foreach ($cellIterator as $cell) {
            $raw = $cell->getValue();
            // Détection fiable des cellules date via PhpSpreadsheet
            if (is_numeric($raw) && \PhpOffice\PhpSpreadsheet\Shared\Date::isDateTime($cell)) {
                $dt = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float)$raw);
                $rowData[] = $dt->format('d/m/Y');
            } else {
                $rowData[] = ($raw instanceof \DateTimeInterface) ? $raw->format('d/m/Y') : (string)($raw ?? '');
            }
        }

        if ($headers === null) {
            $headers = array_map('trim', $rowData);
            $nbCols  = count($headers);
            continue;
        }
        if (empty(array_filter($rowData, fn($v) => $v !== null && $v !== ''))) continue;
        while (count($rowData) < $nbCols) $rowData[] = '';
        $rows[] = array_combine($headers, array_slice($rowData, 0, $nbCols));
    }
    return $rows;
}

function loadFileAsRows(string $filePath, string $originalName): array
{
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    return in_array($ext, ['xlsx', 'xls'], true) ? readFromExcel($filePath) : readFromCSV($filePath);
}

// ============================================================
// FONCTIONS DE PRÉ-VÉRIFICATION
// ============================================================

/**
 * Extrait les années et codes activité uniques référencés dans le fichier.
 * Retourne ['annees' => [...], 'codes' => [code => libelle, ...]]
 */
function extractRequirements(array $rows): array
{
    $annees = [];
    $codes  = [];
    foreach ($rows as $row) {
        $annee      = trim($row['Année']      ?? '');
        $code       = trim($row['Code']       ?? '');
        $activite   = trim($row['Activités']  ?? '');
        $montantAdh = parseMontant($row['Montant ADH'] ?? '0');
        $montantAct = parseMontant($row['Montant ACT'] ?? '0');

        if (!empty($annee)) $annees[$annee] = true;
        if ($montantAdh > 0) $codes['AUT01'] = 'Adhésion';
        if ($montantAct > 0 && !empty($code)) $codes[$code] = $activite ?: $code;
        // Règle inscription gratuite : adhésion seule + code ≠ A05
        if ($montantAdh > 0 && $montantAct == 0 && !empty($code) && $code !== 'A05') $codes[$code] = $activite ?: $code;
    }
    return ['annees' => array_keys($annees), 'codes' => $codes];
}

/**
 * Compare les besoins du fichier avec la base de données.
 * Retourne ['annees' => [...manquants], 'codes' => [code=>libelle, ...manquants]]
 */
function checkPrerequisites(array $reqs, PDO $pdo): array
{
    $missing = ['annees' => [], 'codes' => []];

    foreach ($reqs['annees'] as $annee) {
        $stmt = $pdo->prepare('SELECT ans_id FROM an_exercice WHERE ans_libelle = :a');
        $stmt->execute([':a' => $annee]);
        if (!$stmt->fetch()) $missing['annees'][] = $annee;
    }
    foreach ($reqs['codes'] as $code => $libelle) {
        $stmt = $pdo->prepare('SELECT act_id FROM activites WHERE act_ext_key = :c');
        $stmt->execute([':c' => $code]);
        if (!$stmt->fetch()) $missing['codes'][$code] = $libelle;
    }
    return $missing;
}

/**
 * Dérive les dates de début/fin à partir d'un libellé "AAAA1-AAAA2".
 * Exemple : "2024-2025" → debut=2024-09-01, fin=2025-08-31
 */
function deriveDatesFromLabel(string $annee): ?array
{
    if (preg_match('/^(\d{4})-(\d{4})$/', $annee, $m)) {
        return ['debut' => $m[1] . '-09-01', 'fin' => $m[2] . '-08-31'];
    }
    return null;
}

/**
 * Crée un an_exercice en base et retourne son ans_id.
 */
function createAnExercice(string $annee, string $debut, string $fin, PDO $pdo): int
{
    $stmt = $pdo->prepare(
        'INSERT INTO an_exercice (ans_libelle, ans_date_debut, ans_date_fin) VALUES (:lib, :deb, :fin)'
    );
    $stmt->execute([':lib' => $annee, ':deb' => $debut, ':fin' => $fin]);
    return (int) $pdo->lastInsertId();
}

// ============================================================
// FONCTIONS D'INTÉGRATION
// ============================================================

function groupTransactions(array $rows): array
{
    $transactions = [];
    $currentGroup = [];
    $currentKey   = null;
    foreach ($rows as $row) {
        $nom    = trim($row['Nom']    ?? '');
        $prenom = trim($row['Prénom'] ?? '');
        $date   = trim($row["Date d'adhésion"] ?? '');
        if (empty($nom) && empty($prenom)) continue;
        $key = mb_strtolower("$nom|$prenom|$date", 'UTF-8');
        if ($key === $currentKey) {
            $currentGroup[] = $row;
        } else {
            if ($currentGroup) $transactions[] = $currentGroup;
            $currentGroup = [$row];
            $currentKey   = $key;
        }
    }
    if ($currentGroup) $transactions[] = $currentGroup;
    return $transactions;
}

function getActId(string $code, PDO $pdo): ?int
{
    $stmt = $pdo->prepare('SELECT act_id FROM activites WHERE act_ext_key = :c');
    $stmt->execute([':c' => $code]);
    $r = $stmt->fetch();
    return $r ? (int) $r['act_id'] : null;
}

function getAnsId(string $annee, PDO $pdo): ?int
{
    $stmt = $pdo->prepare('SELECT ans_id FROM an_exercice WHERE ans_libelle = :a');
    $stmt->execute([':a' => $annee]);
    $r = $stmt->fetch();
    return $r ? (int) $r['ans_id'] : null;
}

function inscriptionExiste(int $per_id, int $act_id, int $ans_id, PDO $pdo): bool
{
    $stmt = $pdo->prepare('SELECT ins_id FROM inscriptions WHERE per_id=:p AND act_id=:a AND ans_id=:s');
    $stmt->execute([':p' => $per_id, ':a' => $act_id, ':s' => $ans_id]);
    return (bool) $stmt->fetch();
}

function findOrCreatePerson(array $row, PDO $pdo, bool $dryRun, array &$stats): int
{
    $email = trim($row['Courriel'] ?? '');
    $stmt  = $pdo->prepare('SELECT per_id FROM personnes WHERE per_email = :e');
    $stmt->execute([':e' => $email]);
    $found = $stmt->fetch();
    if ($found) return (int) $found['per_id'];

    if (!$dryRun) {
        $titre  = trim($row['Titre'] ?? '');
        $civ_id = ($titre === 'Madame') ? 2 : (($titre === 'Monsieur') ? 1 : null);
        $tel    = trim($row['Portable'] ?? '') ?: trim($row['Téléphone'] ?? '');
        $stmt   = $pdo->prepare(
            'INSERT INTO personnes (per_nom,per_prenom,per_email,civ_id,per_tel,per_code_postal,per_ville,per_dat_naissance)
             VALUES (:n,:p,:e,:c,:t,:cp,:v,:d)'
        );
        $stmt->execute([
            ':n' => trim($row['Nom'] ?? ''), ':p' => trim($row['Prénom'] ?? ''),
            ':e' => $email, ':c' => $civ_id, ':t' => $tel,
            ':cp' => trim($row['Code postal'] ?? ''), ':v' => trim($row['Commune'] ?? ''),
            ':d' => parseFrDate($row['Date de naissance'] ?? ''),
        ]);
        $stats['personnes']++;
        return (int) $pdo->lastInsertId();
    }
    $stats['personnes']++;
    return 0;
}

function createReglement(float $total, string $dateAdh, string $mregCode, PDO $pdo): int
{
    $stmt = $pdo->prepare('SELECT mreg_id FROM modereglement WHERE mreg_code = :c');
    $stmt->execute([':c' => $mregCode]);
    $mreg = $stmt->fetch();
    if (!$mreg) throw new Exception("Mode de règlement inconnu : '$mregCode'");
    $stmt = $pdo->prepare('INSERT INTO reglements (reg_montant,mreg_id,reg_date) VALUES (:m,:r,:d)');
    $stmt->execute([':m' => $total, ':r' => $mreg['mreg_id'], ':d' => $dateAdh]);
    return (int) $pdo->lastInsertId();
}

function createInscription(int $per_id, int $act_id, int $ans_id, int $reg_id, float $montant, string $dateAdh, PDO $pdo): void
{
    $fin  = getEndOfSeasonDate($dateAdh);
    $stmt = $pdo->prepare(
        'INSERT INTO inscriptions (per_id,act_id,ans_id,reg_id,ins_montant,ins_date_inscription,ins_debut,ins_fin)
         VALUES (:per,:act,:ans,:reg,:montant,:datins,:debut,:fin)'
    );
    $stmt->execute([
        ':per' => $per_id, ':act' => $act_id, ':ans' => $ans_id, ':reg' => $reg_id,
        ':montant' => $montant, ':datins' => $dateAdh, ':debut' => $dateAdh, ':fin' => $fin,
    ]);
}

function processTransaction(array $rows, PDO $pdo, bool $dryRun, array &$log, array &$stats): void
{
    $first      = $rows[0];
    $nom        = trim($first['Nom']    ?? '');
    $prenom     = trim($first['Prénom'] ?? '');
    $email      = trim($first['Courriel'] ?? '');
    $mregCode   = trim($first['Règlement'] ?? '');
    $dateAdhRaw = trim($first["Date d'adhésion"] ?? '');
    $dateAdh    = parseFrDate($dateAdhRaw);
    $label      = "$nom $prenom";

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $log[] = ['type' => 'error', 'msg' => "[$label] Email invalide : '$email'"]; $stats['errors']++; return;
    }
    if (!$dateAdh) {
        $log[] = ['type' => 'error', 'msg' => "[$label] Date d'adhésion invalide : '$dateAdhRaw'"]; $stats['errors']++; return;
    }

    $total = 0.0;
    foreach ($rows as $row) {
        $total += parseMontant($row['Montant ADH'] ?? '0');
        $total += parseMontant($row['Montant ACT'] ?? '0');
    }

    try {
        if (!$dryRun) $pdo->beginTransaction();

        $per_id = findOrCreatePerson($first, $pdo, $dryRun, $stats);
        $reg_id = 0;
        if (!$dryRun) { $reg_id = createReglement($total, $dateAdh, $mregCode, $pdo); $stats['reglements']++; }

        $totalFmt = number_format($total, 2, ',', ' ');
        $log[] = ['type' => 'info', 'msg' => "[$label] Transaction : {$totalFmt}€, mode=$mregCode" . ($dryRun ? ' [SIMULATION]' : " — règlement #$reg_id")];

        foreach ($rows as $row) {
            $annee      = trim($row['Année']     ?? '');
            $code       = trim($row['Code']      ?? '');
            $activite   = trim($row['Activités'] ?? '');
            $montantAdh = parseMontant($row['Montant ADH'] ?? '0');
            $montantAct = parseMontant($row['Montant ACT'] ?? '0');

            $ans_id = $dryRun ? 1 : getAnsId($annee, $pdo);
            if (!$dryRun && !$ans_id) {
                $log[] = ['type' => 'warning', 'msg' => "[$label] Saison '$annee' introuvable — ligne ignorée"];
                $stats['warnings']++; continue;
            }

            // Adhésion
            if ($montantAdh > 0) {
                $act_id = $dryRun ? 0 : getActId('AUT01', $pdo);
                if (!$dryRun && !$act_id) {
                    $log[] = ['type' => 'error', 'msg' => "[$label] Code AUT01 introuvable en base"]; $stats['errors']++;
                } elseif (!$dryRun && inscriptionExiste($per_id, $act_id, $ans_id, $pdo)) {
                    $log[] = ['type' => 'skip', 'msg' => "[$label] Adhésion $annee déjà existante — ignorée"]; $stats['doublons']++;
                } else {
                    if (!$dryRun) { createInscription($per_id, $act_id, $ans_id, $reg_id, $montantAdh, $dateAdh, $pdo); $stats['inscriptions']++; }
                    $log[] = ['type' => 'ok', 'msg' => "[$label] Adhésion $annee : " . number_format($montantAdh, 2, ',', ' ') . "€" . ($dryRun ? ' [SIMULATION]' : '')];
                }
            }

            // Activité (montant ACT > 0)
            if ($montantAct > 0 && !empty($code)) {
                $act_id = $dryRun ? 0 : getActId($code, $pdo);
                if (!$dryRun && !$act_id) {
                    $log[] = ['type' => 'error', 'msg' => "[$label] Code '$code' introuvable en base"]; $stats['errors']++;
                } elseif (!$dryRun && inscriptionExiste($per_id, $act_id, $ans_id, $pdo)) {
                    $log[] = ['type' => 'skip', 'msg' => "[$label] Activité $code/$annee déjà existante — ignorée"]; $stats['doublons']++;
                } else {
                    if (!$dryRun) { createInscription($per_id, $act_id, $ans_id, $reg_id, $montantAct, $dateAdh, $pdo); $stats['inscriptions']++; }
                    $log[] = ['type' => 'ok', 'msg' => "[$label] Activité $code ($activite) $annee : " . number_format($montantAct, 2, ',', ' ') . "€" . ($dryRun ? ' [SIMULATION]' : '')];
                }
            }

            // Inscription gratuite : adhésion seule + code présent ≠ A05 (montant ACT = 0)
            if ($montantAdh > 0 && $montantAct == 0 && !empty($code) && $code !== 'A05') {
                $act_id = $dryRun ? 0 : getActId($code, $pdo);
                if (!$dryRun && !$act_id) {
                    $log[] = ['type' => 'error', 'msg' => "[$label] Code '$code' (inscription gratuite) introuvable en base"]; $stats['errors']++;
                } elseif (!$dryRun && inscriptionExiste($per_id, $act_id, $ans_id, $pdo)) {
                    $log[] = ['type' => 'skip', 'msg' => "[$label] Inscription gratuite $code/$annee déjà existante — ignorée"]; $stats['doublons']++;
                } else {
                    if (!$dryRun) { createInscription($per_id, $act_id, $ans_id, $reg_id, 0.0, $dateAdh, $pdo); $stats['inscriptions']++; }
                    $log[] = ['type' => 'ok', 'msg' => "[$label] Inscription gratuite $code ($activite) $annee : 0,00€" . ($dryRun ? ' [SIMULATION]' : '')];
                }
            }
        }

        if (!$dryRun) $pdo->commit();
    } catch (Exception $e) {
        if (!$dryRun && $pdo->inTransaction()) $pdo->rollBack();
        $log[] = ['type' => 'error', 'msg' => "[$label] ERREUR : " . $e->getMessage()];
        $stats['errors']++;
    }
}

// ============================================================
// CONTRÔLEUR — FLUX EN 3 ÉTAPES
// ============================================================

$step        = $_POST['step'] ?? '1';
$errorFatal  = null;

// Variables de vue (initialisées pour éviter les notices)
$fileName       = '';
$nbRows         = 0;
$nbTransactions = 0;
$reqs           = [];
$missing        = [];
$found          = ['annees' => [], 'codes' => []];
$log            = [];
$stats          = ['personnes' => 0, 'reglements' => 0, 'inscriptions' => 0, 'doublons' => 0, 'errors' => 0, 'warnings' => 0];
$dryRun         = true;

// ------------------------------------------------------------------
// ÉTAPE 2 : réception du fichier → pré-vérification
// ------------------------------------------------------------------
if ($step === '2' && !empty($_FILES['csv_file']['tmp_name'])) {
    $fileName   = $_FILES['csv_file']['name'];
    $uploadedTmp = $_FILES['csv_file']['tmp_name'];
    $ext        = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $dryRun     = isset($_POST['dry_run']);

    // Sauvegarde dans le répertoire tmp (persistent entre les requêtes)
    $savedPath = TMP_DIR . uniqid('integ_', true) . '.' . $ext;
    move_uploaded_file($uploadedTmp, $savedPath);

    // Persistance en session
    $_SESSION['integ_file']     = $savedPath;
    $_SESSION['integ_filename'] = $fileName;
    $_SESSION['integ_dryrun']   = $dryRun;

    try {
        $pdo  = init_pdo($dbHost, $db, $dbUser, $dbMdp);
        $rows = loadFileAsRows($savedPath, $fileName);
        $nbRows = count($rows);
        $reqs   = extractRequirements($rows);
        $missing = checkPrerequisites($reqs, $pdo);

        // Calcul des éléments trouvés (pour affichage)
        $found['annees'] = array_diff($reqs['annees'], $missing['annees']);
        $found['codes']  = array_diff_key($reqs['codes'], $missing['codes']);

        $_SESSION['integ_nbrows'] = $nbRows;
        $_SESSION['integ_reqs']   = $reqs;
    } catch (Exception $e) {
        $errorFatal = $e->getMessage();
    }
}

// ------------------------------------------------------------------
// ÉTAPE 3 : création des exercices manquants + intégration
// ------------------------------------------------------------------
elseif ($step === '3') {
    $savedPath = $_SESSION['integ_file']     ?? '';
    $fileName  = $_SESSION['integ_filename'] ?? '';
    $dryRun    = $_SESSION['integ_dryrun']   ?? true;
    $nbRows    = $_SESSION['integ_nbrows']   ?? 0;

    if (!$savedPath || !file_exists($savedPath)) {
        $errorFatal = 'Fichier temporaire introuvable. Veuillez recommencer depuis l\'étape 1.';
    } else {
        try {
            $pdo  = init_pdo($dbHost, $db, $dbUser, $dbMdp);
            $rows = loadFileAsRows($savedPath, $fileName);

            // Création des an_exercice cochés par l'utilisateur
            $createdExercices = [];
            foreach ($_POST['create_annee'] ?? [] as $annee) {
                $annee   = trim($annee);
                $debut   = trim($_POST['debut'][$annee]  ?? '');
                $fin     = trim($_POST['fin'][$annee]    ?? '');
                if ($annee && $debut && $fin && !$dryRun) {
                    createAnExercice($annee, $debut, $fin, $pdo);
                    $createdExercices[] = $annee;
                } elseif ($annee && $dryRun) {
                    $createdExercices[] = "$annee [SIMULATION]";
                }
            }
            if ($createdExercices) {
                $log[] = ['type' => 'ok', 'msg' => 'An_exercice créés : ' . implode(', ', $createdExercices)];
            }

            // Intégration des transactions
            $transactions   = groupTransactions($rows);
            $nbTransactions = count($transactions);
            foreach ($transactions as $transaction) {
                processTransaction($transaction, $pdo, $dryRun, $log, $stats);
            }

            // Nettoyage du fichier temporaire si intégration réelle
            if (!$dryRun) {
                @unlink($savedPath);
                unset($_SESSION['integ_file'], $_SESSION['integ_filename'], $_SESSION['integ_dryrun'], $_SESSION['integ_nbrows'], $_SESSION['integ_reqs']);
            }
        } catch (Exception $e) {
            $errorFatal = $e->getMessage();
        }
    }
}

// ============================================================
// VUE HTML
// ============================================================
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Intégration CSV/Excel — Adhésions</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; max-width: 1100px; margin: 30px auto; padding: 0 20px; color: #333; }
        h1 { border-bottom: 2px solid #0d6efd; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { margin-bottom: 12px; }
        h3 { margin: 16px 0 8px; color: #444; }

        .card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 20px; margin-bottom: 20px; }
        .form-group { margin: 12px 0; }
        .form-group label { font-weight: bold; display: block; margin-bottom: 4px; }
        .form-group label.inline { display: inline; font-weight: normal; }
        input[type="file"], input[type="date"], input[type="text"] { padding: 5px 8px; border: 1px solid #ced4da; border-radius: 4px; }

        .btn { display: inline-block; padding: 10px 24px; font-size: 15px; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px; }
        .btn-primary { background: #0d6efd; color: white; }
        .btn-primary:hover { background: #0a58ca; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-secondary:hover { background: #565e64; }

        .badge-sim  { background: #ffc107; color: #212529; padding: 2px 9px; border-radius: 10px; font-size: 12px; font-weight: bold; vertical-align: middle; }
        .badge-real { background: #198754; color: white;   padding: 2px 9px; border-radius: 10px; font-size: 12px; font-weight: bold; vertical-align: middle; }

        /* Étapes */
        .steps { display: flex; gap: 0; margin-bottom: 24px; }
        .step-item { flex: 1; padding: 10px 16px; background: #e9ecef; border: 1px solid #dee2e6; text-align: center; font-size: 13px; }
        .step-item:first-child { border-radius: 6px 0 0 6px; }
        .step-item:last-child  { border-radius: 0 6px 6px 0; }
        .step-item.active  { background: #0d6efd; color: white; font-weight: bold; }
        .step-item.done    { background: #198754; color: white; }

        /* Tables de vérification */
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { background: #495057; color: white; padding: 8px 12px; text-align: left; }
        td { padding: 7px 12px; border-bottom: 1px solid #dee2e6; }
        tr:last-child td { border-bottom: none; }
        tr.row-ok      td:first-child { color: #198754; font-weight: bold; }
        tr.row-missing td:first-child { color: #dc3545; font-weight: bold; }
        .icon-ok      { color: #198754; }
        .icon-missing { color: #dc3545; }
        .icon-warn    { color: #ffc107; }

        /* Dates inline */
        .date-inputs { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .date-inputs label { font-weight: normal; font-size: 13px; }
        .date-inputs input { width: 140px; }

        /* Alerte codes manquants */
        .alert { padding: 12px 16px; border-radius: 4px; margin: 10px 0; font-size: 14px; }
        .alert-danger  { background: #f8d7da; border: 1px solid #f5c2c7; color: #58151c; }
        .alert-warning { background: #fff3cd; border: 1px solid #ffecb5; color: #664d03; }
        .alert-success { background: #d1e7dd; border: 1px solid #badbcc; color: #0a3622; }

        /* Résultats intégration */
        .stats { display: flex; gap: 12px; flex-wrap: wrap; margin: 14px 0; }
        .stat-box { background: white; border: 1px solid #dee2e6; border-radius: 6px; padding: 10px 18px; text-align: center; min-width: 110px; }
        .stat-box .val { font-size: 30px; font-weight: bold; color: #0d6efd; }
        .stat-box .lbl { font-size: 11px; color: #666; margin-top: 2px; }
        .stat-box.s-err  .val { color: #dc3545; }
        .stat-box.s-skip .val { color: #6c757d; }
        .stat-box.s-warn .val { color: #fd7e14; }

        #log-container { max-height: 55vh; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 4px; padding: 6px; background: white; }
        .log-entry { padding: 3px 8px; margin: 2px 0; border-radius: 3px; font-family: monospace; font-size: 13px; white-space: pre-wrap; }
        .log-ok      { background: #d1e7dd; color: #0a3622; }
        .log-error   { background: #f8d7da; color: #58151c; font-weight: bold; }
        .log-warning { background: #fff3cd; color: #664d03; }
        .log-skip    { background: #e2e3e5; color: #41464b; }
        .log-info    { color: #555; }

        .filter-bar { margin: 10px 0; font-size: 13px; }
        .filter-bar label { display: inline-flex; align-items: center; gap: 5px; margin-right: 14px; cursor: pointer; font-weight: normal; }
        .meta { color: #555; font-size: 14px; margin-bottom: 10px; }
    </style>
</head>
<body>

<h1>Intégration CSV/Excel — Adhésions &amp; Activités</h1>

<!-- Indicateur d'étapes -->
<div class="steps">
    <div class="step-item <?= $step === '1' ? 'active' : ($step > '1' ? 'done' : '') ?>">① Chargement du fichier</div>
    <div class="step-item <?= $step === '2' ? 'active' : ($step > '2' ? 'done' : '') ?>">② Vérification des référentiels</div>
    <div class="step-item <?= $step === '3' ? 'active' : '' ?>">③ Intégration</div>
</div>

<?php if ($errorFatal): ?>
<div class="alert alert-danger">⛔ <?= htmlspecialchars($errorFatal) ?></div>
<a href="integrateCSV.php" class="btn btn-secondary">↩ Recommencer</a>

<?php elseif ($step === '1'): ?>
<!-- =========================================================
     ÉTAPE 1 — Formulaire de chargement
     ========================================================= -->
<div class="card">
    <h2>Étape 1 — Choisir le fichier</h2>
    <form method="post" enctype="multipart/form-data">
        <input type="hidden" name="step" value="2">
        <div class="form-group">
            <label for="csv_file">Fichier CSV ou Excel (.csv, .xlsx, .xls) :</label>
            <input type="file" name="csv_file" id="csv_file" accept=".csv,.xlsx,.xls" required>
        </div>
        <div class="form-group">
            <label class="inline">
                <input type="checkbox" name="dry_run" value="1" checked>
                &nbsp;Mode simulation <em>(aucune donnée écrite en base)</em>
            </label>
        </div>
        <button type="submit" class="btn btn-primary">Analyser le fichier →</button>
    </form>
</div>

<?php elseif ($step === '2'): ?>
<!-- =========================================================
     ÉTAPE 2 — Pré-vérification des référentiels
     ========================================================= -->
<div class="card">
    <h2>Étape 2 — Vérification des référentiels</h2>
    <p class="meta">
        Fichier : <strong><?= htmlspecialchars($fileName) ?></strong> —
        <?= $nbRows ?> ligne(s) —
        <?= $dryRun ? '<span class="badge-sim">SIMULATION</span>' : '<span class="badge-real">INTÉGRATION RÉELLE</span>' ?>
    </p>

    <?php
    $hasBlockingErrors = !empty($missing['codes']); // codes manquants = bloquant
    $hasMissingExercices = !empty($missing['annees']);
    ?>

    <!-- ---- Années d'exercice ---- -->
    <h3>Années d'exercice (an_exercice)</h3>
    <?php if (empty($reqs['annees'])): ?>
        <p class="alert alert-warning">⚠ Aucune année trouvée dans le fichier.</p>
    <?php else: ?>
    <table>
        <thead><tr><th>Statut</th><th>Libellé</th><th>Action</th></tr></thead>
        <tbody>
        <?php foreach ($reqs['annees'] as $annee): ?>
            <?php $isMissing = in_array($annee, $missing['annees']); ?>
            <tr class="<?= $isMissing ? 'row-missing' : 'row-ok' ?>">
                <td><?= $isMissing ? '<span class="icon-missing">✗ Absent</span>' : '<span class="icon-ok">✓ Présent</span>' ?></td>
                <td><?= htmlspecialchars($annee) ?></td>
                <td>
                    <?php if (!$isMissing): ?>
                        <em style="color:#6c757d;font-size:13px">Aucune action nécessaire</em>
                    <?php else:
                        $dates = deriveDatesFromLabel($annee);
                    ?>
                        <em style="color:#dc3545;font-size:13px">À créer — renseignez les dates :</em><br>
                        <div class="date-inputs" style="margin-top:4px">
                            <label>Début :
                                <input type="date" name="debut[<?= htmlspecialchars($annee) ?>]"
                                       value="<?= $dates['debut'] ?? '' ?>" form="precheck-form">
                            </label>
                            <label>Fin :
                                <input type="date" name="fin[<?= htmlspecialchars($annee) ?>]"
                                       value="<?= $dates['fin'] ?? '' ?>" form="precheck-form">
                            </label>
                        </div>
                    <?php endif; ?>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
    <?php endif; ?>

    <!-- ---- Codes activité ---- -->
    <h3 style="margin-top:20px">Codes activité</h3>
    <?php if (empty($reqs['codes'])): ?>
        <p class="alert alert-warning">⚠ Aucun code activité trouvé dans le fichier.</p>
    <?php else: ?>
    <table>
        <thead><tr><th>Statut</th><th>Code</th><th>Libellé</th><th>Remarque</th></tr></thead>
        <tbody>
        <?php foreach ($reqs['codes'] as $code => $libelle): ?>
            <?php $isMissing = array_key_exists($code, $missing['codes']); ?>
            <tr class="<?= $isMissing ? 'row-missing' : 'row-ok' ?>">
                <td><?= $isMissing ? '<span class="icon-missing">✗ Absent</span>' : '<span class="icon-ok">✓ Présent</span>' ?></td>
                <td><strong><?= htmlspecialchars($code) ?></strong></td>
                <td><?= htmlspecialchars($libelle) ?></td>
                <td>
                    <?php if ($isMissing): ?>
                        <span class="icon-missing">À créer dans l'application avant de continuer</span>
                    <?php else: ?>
                        <span style="color:#6c757d;font-size:13px">OK</span>
                    <?php endif; ?>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>

    <?php if ($hasBlockingErrors): ?>
    <div class="alert alert-danger" style="margin-top:12px">
        ⛔ <strong><?= count($missing['codes']) ?> code(s) activité introuvable(s)</strong> en base.
        Créez-les dans l'application principale avant de continuer l'intégration.
    </div>
    <?php endif; ?>
    <?php endif; ?>

    <!-- ---- Formulaire de confirmation ---- -->
    <form id="precheck-form" method="post" style="margin-top:20px">
        <input type="hidden" name="step" value="3">
        <?php foreach ($missing['annees'] as $annee): ?>
            <input type="hidden" name="create_annee[]" value="<?= htmlspecialchars($annee) ?>">
        <?php endforeach; ?>

        <?php if ($hasBlockingErrors): ?>
            <a href="integrateCSV.php" class="btn btn-secondary">↩ Recommencer</a>
        <?php elseif ($hasMissingExercices): ?>
            <div class="alert alert-warning">
                ⚠ <strong><?= count($missing['annees']) ?> année(s) d'exercice</strong> seront créées avec les dates indiquées.
                Vérifiez les dates avant de continuer.
            </div>
            <button type="submit" class="btn btn-primary">Créer les exercices et lancer l'intégration →</button>
            <a href="integrateCSV.php" class="btn btn-secondary">↩ Annuler</a>
        <?php else: ?>
            <div class="alert alert-success">✓ Tous les référentiels sont présents. L'intégration peut démarrer.</div>
            <button type="submit" class="btn btn-primary">Lancer l'intégration →</button>
            <a href="integrateCSV.php" class="btn btn-secondary">↩ Annuler</a>
        <?php endif; ?>
    </form>
</div>

<?php elseif ($step === '3'): ?>
<!-- =========================================================
     ÉTAPE 3 — Résultats de l'intégration
     ========================================================= -->
<div class="card">
    <h2>
        Étape 3 — Résultats
        <?= $dryRun ? '<span class="badge-sim">SIMULATION</span>' : '<span class="badge-real">DONNÉES INTÉGRÉES</span>' ?>
    </h2>
    <p class="meta">
        Fichier : <strong><?= htmlspecialchars($fileName) ?></strong> —
        <?= $nbRows ?> ligne(s) —
        <?= $nbTransactions ?> transaction(s)
    </p>

    <div class="stats">
        <div class="stat-box"><div class="val"><?= $stats['personnes'] ?></div><div class="lbl">Personnes créées</div></div>
        <div class="stat-box"><div class="val"><?= $stats['reglements'] ?></div><div class="lbl">Règlements créés</div></div>
        <div class="stat-box"><div class="val"><?= $stats['inscriptions'] ?></div><div class="lbl">Inscriptions créées</div></div>
        <div class="stat-box s-skip"><div class="val"><?= $stats['doublons'] ?></div><div class="lbl">Doublons ignorés</div></div>
        <div class="stat-box s-warn"><div class="val"><?= $stats['warnings'] ?></div><div class="lbl">Avertissements</div></div>
        <div class="stat-box s-err"><div class="val"><?= $stats['errors'] ?></div><div class="lbl">Erreurs</div></div>
    </div>

    <h3>Journal détaillé</h3>
    <div class="filter-bar">
        Afficher :
        <label><input type="checkbox" class="fcb" data-type="ok"      checked> OK</label>
        <label><input type="checkbox" class="fcb" data-type="error"   checked> Erreurs</label>
        <label><input type="checkbox" class="fcb" data-type="skip"    checked> Doublons</label>
        <label><input type="checkbox" class="fcb" data-type="warning" checked> Avertissements</label>
        <label><input type="checkbox" class="fcb" data-type="info"    checked> Infos</label>
    </div>
    <div id="log-container">
        <?php foreach ($log as $entry): ?>
            <?php $t = htmlspecialchars($entry['type'] ?? 'info'); ?>
            <div class="log-entry log-<?= $t ?>" data-type="<?= $t ?>"><?= htmlspecialchars($entry['msg'] ?? '') ?></div>
        <?php endforeach; ?>
    </div>

    <div style="margin-top:16px">
        <?php if ($dryRun): ?>
            <a href="integrateCSV.php" class="btn btn-primary">↩ Recommencer (intégration réelle)</a>
        <?php else: ?>
            <a href="integrateCSV.php" class="btn btn-secondary">↩ Nouvelle intégration</a>
        <?php endif; ?>
    </div>
</div>

<script>
document.querySelectorAll('.fcb').forEach(function(cb) {
    cb.addEventListener('change', function() {
        var type = this.dataset.type;
        document.querySelectorAll('.log-entry[data-type="' + type + '"]').forEach(function(el) {
            el.style.display = cb.checked ? '' : 'none';
        });
    });
});
</script>

<?php endif; ?>

</body>
</html>
