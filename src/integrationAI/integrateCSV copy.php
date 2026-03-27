<?php
/**
 * integrateCSV.php — Intégration CSV des adhésions et activités
 *
 * Colonnes CSV attendues :
 *   Nbr, Année, Statut, Nom, Prénom, Date de naissance, Titre, Téléphone, Portable,
 *   Courriel, Section, Code, Activités, Règlement, Image, Courriel-1, Date d'adhésion,
 *   Montant ADH, Montant ACT, ..., Code postal, Commune, ...
 *
 * Règle de groupement : des lignes CONTIGUËS ayant le même (Nom + Prénom + Date d'adhésion)
 * forment une transaction unique avec un seul règlement.
 *
 * Déduplication : avant toute insertion d'inscription, on vérifie qu'elle n'existe pas déjà
 * (per_id + act_id + ans_id).
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../outils/utils.php';

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Convertit une date JJ/MM/AAAA en AAAA-MM-JJ
 */
function parseFrDate(string $s): ?string
{
    $s = trim($s);
    if (empty($s)) return null;
    $d = DateTime::createFromFormat('d/m/Y', $s);
    return $d ? $d->format('Y-m-d') : null;
}

/**
 * Normalise un montant : remplace la virgule par un point
 */
function parseMontant(string $s): float
{
    return (float) str_replace(',', '.', trim($s));
}

/**
 * Détecte le délimiteur du CSV (virgule ou point-virgule)
 */
function detectDelimiter(string $filePath): string
{
    $h = fopen($filePath, 'r');
    $line = fgets($h);
    fclose($h);
    return (substr_count($line, ';') > substr_count($line, ',')) ? ';' : ',';
}

/**
 * Lit le fichier CSV et retourne un tableau de lignes associatives.
 * Gère le BOM UTF-8 et le padding des lignes courtes.
 */
function readCSV(string $filePath): array
{
    $delimiter = detectDelimiter($filePath);
    $h = fopen($filePath, 'r');

    // Consomme le BOM UTF-8 si présent
    $bom = fread($h, 3);
    if ($bom !== "\xEF\xBB\xBF") {
        rewind($h);
    }

    $headers = null;
    $rows    = [];

    while (($data = fgetcsv($h, 0, $delimiter)) !== false) {
        if ($headers === null) {
            $headers = array_map('trim', $data);
            continue;
        }
        // Normalise la longueur de la ligne
        while (count($data) < count($headers)) {
            $data[] = '';
        }
        $row    = array_combine($headers, array_slice($data, 0, count($headers)));
        $rows[] = $row;
    }
    fclose($h);
    return $rows;
}

/**
 * Regroupe les lignes CONTIGUËS ayant le même (Nom + Prénom + Date d'adhésion)
 * en transactions. Chaque transaction donne lieu à un seul règlement.
 */
function groupTransactions(array $rows): array
{
    $transactions = [];
    $currentGroup = [];
    $currentKey   = null;

    foreach ($rows as $row) {
        $nom    = trim($row['Nom']    ?? '');
        $prenom = trim($row['Prénom'] ?? '');
        $date   = trim($row["Date d'adhésion"] ?? '');

        // Ignore les lignes vides
        if (empty($nom) && empty($prenom)) {
            continue;
        }

        $key = mb_strtolower("$nom|$prenom|$date", 'UTF-8');

        if ($key === $currentKey) {
            // Même transaction : on accumule
            $currentGroup[] = $row;
        } else {
            // Nouvelle transaction : on clôt la précédente
            if ($currentGroup) {
                $transactions[] = $currentGroup;
            }
            $currentGroup = [$row];
            $currentKey   = $key;
        }
    }

    if ($currentGroup) {
        $transactions[] = $currentGroup;
    }

    return $transactions;
}

// ============================================================
// FONCTIONS D'ACCÈS BASE DE DONNÉES
// ============================================================

/**
 * Retourne l'act_id d'une activité à partir de son code externe, ou null si inconnu.
 */
function getActId(string $code, PDO $pdo): ?int
{
    $stmt = $pdo->prepare('SELECT act_id FROM activites WHERE act_ext_key = :c');
    $stmt->execute([':c' => $code]);
    $r = $stmt->fetch();
    return $r ? (int) $r['act_id'] : null;
}

/**
 * Retourne l'ans_id d'un exercice à partir de son libellé (ex : "2024-2025"), ou null.
 */
function getAnsId(string $annee, PDO $pdo): ?int
{
    $stmt = $pdo->prepare('SELECT ans_id FROM an_exercice WHERE ans_libelle = :a');
    $stmt->execute([':a' => $annee]);
    $r = $stmt->fetch();
    return $r ? (int) $r['ans_id'] : null;
}

/**
 * Vérifie si une inscription (per_id + act_id + ans_id) existe déjà en base.
 */
function inscriptionExiste(int $per_id, int $act_id, int $ans_id, PDO $pdo): bool
{
    $stmt = $pdo->prepare(
        'SELECT ins_id FROM inscriptions WHERE per_id = :p AND act_id = :a AND ans_id = :s'
    );
    $stmt->execute([':p' => $per_id, ':a' => $act_id, ':s' => $ans_id]);
    return (bool) $stmt->fetch();
}

/**
 * Trouve une personne par email ou la crée si elle n'existe pas.
 * Retourne son per_id (0 en mode simulation).
 */
function findOrCreatePerson(array $row, PDO $pdo, bool $dryRun, array &$stats): int
{
    $email = trim($row['Courriel'] ?? '');

    // Recherche par email
    $stmt = $pdo->prepare('SELECT per_id FROM personnes WHERE per_email = :e');
    $stmt->execute([':e' => $email]);
    $found = $stmt->fetch();
    if ($found) {
        return (int) $found['per_id'];
    }

    // Création
    if (!$dryRun) {
        $titre  = trim($row['Titre'] ?? '');
        $civ_id = ($titre === 'Madame') ? 2 : (($titre === 'Monsieur') ? 1 : null);
        $tel    = trim($row['Portable'] ?? '') ?: trim($row['Téléphone'] ?? '');

        $stmt = $pdo->prepare(
            'INSERT INTO personnes
                (per_nom, per_prenom, per_email, civ_id, per_tel, per_code_postal, per_ville, per_dat_naissance)
             VALUES
                (:nom, :prenom, :email, :civ, :tel, :cp, :ville, :naiss)'
        );
        $stmt->execute([
            ':nom'   => trim($row['Nom']    ?? ''),
            ':prenom'=> trim($row['Prénom'] ?? ''),
            ':email' => $email,
            ':civ'   => $civ_id,
            ':tel'   => $tel,
            ':cp'    => trim($row['Code postal'] ?? ''),
            ':ville' => trim($row['Commune']    ?? ''),
            ':naiss' => parseFrDate($row['Date de naissance'] ?? ''),
        ]);
        $stats['personnes']++;
        return (int) $pdo->lastInsertId();
    }

    $stats['personnes']++;
    return 0; // dry run : pas d'ID réel
}

/**
 * Crée un règlement et retourne son reg_id.
 * Lève une exception si le mode de règlement est inconnu.
 */
function createReglement(float $total, string $dateAdh, string $mregCode, PDO $pdo): int
{
    $stmt = $pdo->prepare('SELECT mreg_id FROM modereglement WHERE mreg_code = :c');
    $stmt->execute([':c' => $mregCode]);
    $mreg = $stmt->fetch();

    if (!$mreg) {
        throw new Exception("Mode de règlement inconnu : '$mregCode'");
    }

    $stmt = $pdo->prepare(
        'INSERT INTO reglements (reg_montant, mreg_id, reg_date) VALUES (:m, :r, :d)'
    );
    $stmt->execute([':m' => $total, ':r' => $mreg['mreg_id'], ':d' => $dateAdh]);
    return (int) $pdo->lastInsertId();
}

/**
 * Crée une inscription (adhésion ou activité).
 */
function createInscription(
    int    $per_id,
    int    $act_id,
    int    $ans_id,
    int    $reg_id,
    float  $montant,
    string $dateAdh,
    PDO    $pdo
): void {
    $fin  = getEndOfSeasonDate($dateAdh);
    $stmt = $pdo->prepare(
        'INSERT INTO inscriptions
            (per_id, act_id, ans_id, reg_id, ins_montant, ins_date_inscription, ins_debut, ins_fin)
         VALUES
            (:per, :act, :ans, :reg, :montant, :datins, :debut, :fin)'
    );
    $stmt->execute([
        ':per'    => $per_id,
        ':act'    => $act_id,
        ':ans'    => $ans_id,
        ':reg'    => $reg_id,
        ':montant'=> $montant,
        ':datins' => $dateAdh,
        ':debut'  => $dateAdh,
        ':fin'    => $fin,
    ]);
}

// ============================================================
// TRAITEMENT D'UNE TRANSACTION
// ============================================================

/**
 * Traite un groupe de lignes formant une transaction unique.
 *
 * @param array  $rows    Lignes CSV du groupe (contiguës, même personne + même date ADH)
 * @param PDO    $pdo     Connexion base de données
 * @param bool   $dryRun  Si true, aucune écriture en base
 * @param array  &$log    Journal des opérations (par référence)
 * @param array  &$stats  Compteurs (par référence)
 */
function processTransaction(
    array $rows,
    PDO   $pdo,
    bool  $dryRun,
    array &$log,
    array &$stats
): void {
    $first      = $rows[0];
    $nom        = trim($first['Nom']    ?? '');
    $prenom     = trim($first['Prénom'] ?? '');
    $email      = trim($first['Courriel'] ?? '');
    $mregCode   = trim($first['Règlement'] ?? '');
    $dateAdhRaw = trim($first["Date d'adhésion"] ?? '');
    $dateAdh    = parseFrDate($dateAdhRaw);
    $label      = "$nom $prenom";

    // --- Validations de base ---
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $log[] = ['type' => 'error', 'msg' => "[$label] Email invalide : '$email'"];
        $stats['errors']++;
        return;
    }
    if (!$dateAdh) {
        $log[] = ['type' => 'error', 'msg' => "[$label] Date d'adhésion invalide : '$dateAdhRaw'"];
        $stats['errors']++;
        return;
    }

    // --- Calcul du total du règlement ---
    $total = 0.0;
    foreach ($rows as $row) {
        $total += parseMontant($row['Montant ADH'] ?? '0');
        $total += parseMontant($row['Montant ACT'] ?? '0');
    }

    try {
        if (!$dryRun) {
            $pdo->beginTransaction();
        }

        // --- Personne ---
        $per_id = findOrCreatePerson($first, $pdo, $dryRun, $stats);

        // --- Règlement ---
        $reg_id = 0;
        if (!$dryRun) {
            $reg_id = createReglement($total, $dateAdh, $mregCode, $pdo);
            $stats['reglements']++;
        }
        $totalFormatted = number_format($total, 2, ',', ' ');
        $log[] = [
            'type' => 'info',
            'msg'  => "[$label] Transaction : {$totalFormatted}€, mode=$mregCode"
                    . ($dryRun ? ' [SIMULATION]' : " — règlement #$reg_id"),
        ];

        // --- Traitement ligne par ligne ---
        foreach ($rows as $row) {
            $annee      = trim($row['Année']       ?? '');
            $code       = trim($row['Code']        ?? '');
            $activite   = trim($row['Activités']   ?? '');
            $montantAdh = parseMontant($row['Montant ADH'] ?? '0');
            $montantAct = parseMontant($row['Montant ACT'] ?? '0');

            // Récupération de l'exercice
            $ans_id = $dryRun ? 1 : getAnsId($annee, $pdo);
            if (!$dryRun && !$ans_id) {
                $log[] = ['type' => 'warning', 'msg' => "[$label] Saison '$annee' introuvable en base — ligne ignorée"];
                $stats['warnings']++;
                continue;
            }

            // ---- Adhésion (Montant ADH > 0) ----
            if ($montantAdh > 0) {
                $act_id = $dryRun ? 0 : getActId('AUT01', $pdo);

                if (!$dryRun && !$act_id) {
                    $log[] = ['type' => 'error', 'msg' => "[$label] Code adhésion AUT01 introuvable en base"];
                    $stats['errors']++;
                } elseif (!$dryRun && inscriptionExiste($per_id, $act_id, $ans_id, $pdo)) {
                    $log[] = ['type' => 'skip', 'msg' => "[$label] Adhésion $annee déjà existante — ignorée"];
                    $stats['doublons']++;
                } else {
                    if (!$dryRun) {
                        createInscription($per_id, $act_id, $ans_id, $reg_id, $montantAdh, $dateAdh, $pdo);
                        $stats['inscriptions']++;
                    }
                    $mAdh = number_format($montantAdh, 2, ',', ' ');
                    $log[] = ['type' => 'ok', 'msg' => "[$label] Adhésion $annee : {$mAdh}€" . ($dryRun ? ' [SIMULATION]' : '')];
                }
            }

            // ---- Activité (Montant ACT > 0 et Code présent) ----
            if ($montantAct > 0 && !empty($code)) {
                $act_id = $dryRun ? 0 : getActId($code, $pdo);

                if (!$dryRun && !$act_id) {
                    $log[] = ['type' => 'error', 'msg' => "[$label] Code activité '$code' ($activite) introuvable en base"];
                    $stats['errors']++;
                } elseif (!$dryRun && inscriptionExiste($per_id, $act_id, $ans_id, $pdo)) {
                    $log[] = ['type' => 'skip', 'msg' => "[$label] Activité $code/$annee déjà existante — ignorée"];
                    $stats['doublons']++;
                } else {
                    if (!$dryRun) {
                        createInscription($per_id, $act_id, $ans_id, $reg_id, $montantAct, $dateAdh, $pdo);
                        $stats['inscriptions']++;
                    }
                    $mAct = number_format($montantAct, 2, ',', ' ');
                    $log[] = ['type' => 'ok', 'msg' => "[$label] Activité $code ($activite) $annee : {$mAct}€" . ($dryRun ? ' [SIMULATION]' : '')];
                }
            }
        }

        if (!$dryRun) {
            $pdo->commit();
        }

    } catch (Exception $e) {
        if (!$dryRun && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $log[]  = ['type' => 'error', 'msg' => "[$label] ERREUR : " . $e->getMessage()];
        $stats['errors']++;
    }
}

// ============================================================
// TRAITEMENT DE LA REQUÊTE
// ============================================================

$log            = [];
$stats          = ['personnes' => 0, 'reglements' => 0, 'inscriptions' => 0, 'doublons' => 0, 'errors' => 0, 'warnings' => 0];
$processed      = false;
$dryRun         = true;
$nbRows         = 0;
$nbTransactions = 0;
$fileName       = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_FILES['csv_file']['tmp_name'])) {
    $dryRun   = isset($_POST['dry_run']);
    $tmpFile  = $_FILES['csv_file']['tmp_name'];
    $fileName = htmlspecialchars($_FILES['csv_file']['name']);

    try {
        $pdo          = init_pdo($dbHost, $db, $dbUser, $dbMdp);
        $rows         = readCSV($tmpFile);
        $nbRows       = count($rows);
        $transactions = groupTransactions($rows);
        $nbTransactions = count($transactions);

        foreach ($transactions as $transaction) {
            processTransaction($transaction, $pdo, $dryRun, $log, $stats);
        }

        $processed = true;

    } catch (Exception $e) {
        $log[] = ['type' => 'error', 'msg' => 'Erreur fatale : ' . $e->getMessage()];
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
    <title>Intégration CSV — Adhésions</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; max-width: 1100px; margin: 30px auto; padding: 0 20px; color: #333; }
        h1 { border-bottom: 2px solid #0d6efd; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { margin-bottom: 12px; }
        h3 { margin: 16px 0 8px; }

        .card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 20px; margin-bottom: 20px; }
        .form-group { margin: 12px 0; }
        .form-group label { font-weight: bold; display: block; margin-bottom: 4px; }
        .form-group label.inline { display: inline; font-weight: normal; }
        input[type="file"] { padding: 4px; }

        .btn { display: inline-block; padding: 10px 24px; font-size: 15px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-primary { background: #0d6efd; color: white; }
        .btn-primary:hover { background: #0a58ca; }

        .badge-sim { background: #ffc107; color: #212529; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; vertical-align: middle; }
        .badge-real { background: #198754; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; vertical-align: middle; }

        .stats { display: flex; gap: 12px; flex-wrap: wrap; margin: 14px 0; }
        .stat-box { background: white; border: 1px solid #dee2e6; border-radius: 6px; padding: 10px 18px; text-align: center; min-width: 110px; }
        .stat-box .val { font-size: 30px; font-weight: bold; color: #0d6efd; }
        .stat-box .lbl { font-size: 11px; color: #666; margin-top: 2px; }
        .stat-box.s-err  .val { color: #dc3545; }
        .stat-box.s-skip .val { color: #6c757d; }
        .stat-box.s-warn .val { color: #fd7e14; }

        .filter-bar { margin: 10px 0; font-size: 13px; }
        .filter-bar label { display: inline-flex; align-items: center; gap: 5px; margin-right: 14px; cursor: pointer; font-weight: normal; }

        #log-container { max-height: 60vh; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 4px; padding: 6px; background: white; }
        .log-entry { padding: 3px 8px; margin: 2px 0; border-radius: 3px; font-family: monospace; font-size: 13px; white-space: pre-wrap; }
        .log-ok      { background: #d1e7dd; color: #0a3622; }
        .log-error   { background: #f8d7da; color: #58151c; font-weight: bold; }
        .log-warning { background: #fff3cd; color: #664d03; }
        .log-skip    { background: #e2e3e5; color: #41464b; }
        .log-info    { color: #555; }

        .meta { margin-bottom: 10px; color: #555; font-size: 14px; }
    </style>
</head>
<body>

<h1>Intégration CSV — Adhésions &amp; Activités</h1>

<div class="card">
    <form method="post" enctype="multipart/form-data">
        <div class="form-group">
            <label for="csv_file">Fichier CSV :</label>
            <input type="file" name="csv_file" id="csv_file" accept=".csv" required>
        </div>
        <div class="form-group">
            <label class="inline">
                <input type="checkbox" name="dry_run" value="1"
                    <?= (!$processed || $dryRun) ? 'checked' : '' ?>>
                &nbsp;Mode simulation <em>(aucune donnée écrite en base)</em>
            </label>
        </div>
        <button type="submit" class="btn btn-primary">Lancer l'intégration</button>
    </form>
</div>

<?php if ($processed): ?>
<div class="card">
    <h2>
        Résultats
        <?php if ($dryRun): ?>
            <span class="badge-sim">SIMULATION</span>
        <?php else: ?>
            <span class="badge-real">DONNÉES INTÉGRÉES</span>
        <?php endif; ?>
    </h2>

    <p class="meta">
        Fichier : <strong><?= $fileName ?></strong> —
        <?= $nbRows ?> ligne(s) CSV —
        <?= $nbTransactions ?> transaction(s) détectée(s)
    </p>

    <div class="stats">
        <div class="stat-box">
            <div class="val"><?= $stats['personnes'] ?></div>
            <div class="lbl">Personnes créées</div>
        </div>
        <div class="stat-box">
            <div class="val"><?= $stats['reglements'] ?></div>
            <div class="lbl">Règlements créés</div>
        </div>
        <div class="stat-box">
            <div class="val"><?= $stats['inscriptions'] ?></div>
            <div class="lbl">Inscriptions créées</div>
        </div>
        <div class="stat-box s-skip">
            <div class="val"><?= $stats['doublons'] ?></div>
            <div class="lbl">Doublons ignorés</div>
        </div>
        <div class="stat-box s-warn">
            <div class="val"><?= $stats['warnings'] ?></div>
            <div class="lbl">Avertissements</div>
        </div>
        <div class="stat-box s-err">
            <div class="val"><?= $stats['errors'] ?></div>
            <div class="lbl">Erreurs</div>
        </div>
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
            <div class="log-entry log-<?= $t ?>" data-type="<?= $t ?>">
                <?= htmlspecialchars($entry['msg'] ?? '') ?>
            </div>
        <?php endforeach; ?>
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
