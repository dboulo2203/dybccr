<?php
/* Copyright (C) 2026 CCR
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * \file    dybccr/import_adhesions.php
 * \ingroup dybccr
 * \brief   Import des adhésions depuis un fichier CSV/Excel — crée tiers, factures et paiements dans Dolibarr
 */

// Load Dolibarr environment
$res = 0;
if (!$res && !empty($_SERVER["CONTEXT_DOCUMENT_ROOT"])) {
	$res = @include $_SERVER["CONTEXT_DOCUMENT_ROOT"]."/main.inc.php";
}
$tmp = empty($_SERVER['SCRIPT_FILENAME']) ? '' : $_SERVER['SCRIPT_FILENAME'];
$tmp2 = realpath(__FILE__);
$i = strlen($tmp) - 1;
$j = strlen($tmp2) - 1;
while ($i > 0 && $j > 0 && isset($tmp[$i]) && isset($tmp2[$j]) && $tmp[$i] == $tmp2[$j]) {
	$i--;
	$j--;
}
if (!$res && $i > 0 && file_exists(substr($tmp, 0, ($i + 1))."/main.inc.php")) {
	$res = @include substr($tmp, 0, ($i + 1))."/main.inc.php";
}
if (!$res && $i > 0 && file_exists(dirname(substr($tmp, 0, ($i + 1)))."/main.inc.php")) {
	$res = @include dirname(substr($tmp, 0, ($i + 1)))."/main.inc.php";
}
if (!$res && file_exists("../../main.inc.php")) { $res = @include "../../main.inc.php"; }
if (!$res && file_exists("../../../main.inc.php")) { $res = @include "../../../main.inc.php"; }
if (!$res) { die("Include of main fails"); }

require_once DOL_DOCUMENT_ROOT.'/societe/class/societe.class.php';
require_once DOL_DOCUMENT_ROOT.'/compta/facture/class/facture.class.php';
require_once DOL_DOCUMENT_ROOT.'/compta/paiement/class/paiement.class.php';
require_once DOL_DOCUMENT_ROOT.'/product/class/product.class.php';
 require_once __DIR__.'/integrationAI/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

/**
 * @var Conf      $conf
 * @var DoliDB    $db
 * @var Translate $langs
 * @var User      $user
 */

$langs->loadLangs(array("dybccr@dybccr", "bills", "companies"));

// Sécurité : admin uniquement
if (empty($user->admin)) {
	accessforbidden();
}

// Répertoire temporaire Dolibarr
$tmpdir = DOL_DATA_ROOT.'/dybccr/temp/';
dol_mkdir($tmpdir);

// ============================================================
// FONCTIONS DE LECTURE DE FICHIER (réplique de integrateCSV.php)
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
	$h    = fopen($filePath, 'r');
	$line = fgets($h);
	fclose($h);
	return (substr_count($line, ';') > substr_count($line, ',')) ? ';' : ',';
}

function readFromCSV(string $filePath): array
{
	$delimiter = detectDelimiter($filePath);
	$h         = fopen($filePath, 'r');
	$bom       = fread($h, 3);
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
			if (is_numeric($raw) && \PhpOffice\PhpSpreadsheet\Shared\Date::isDateTime($cell)) {
				$dt        = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float)$raw);
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
// FONCTIONS DE GROUPEMENT (réplique de integrateCSV.php)
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

// ============================================================
// FONCTIONS DOLIBARR SPÉCIFIQUES
// ============================================================

function formatThirdpartyName(string $nom, string $prenom): string
{
	return str_replace(' ', '-', trim($nom)) . ' ' . str_replace(' ', '-', trim($prenom));
}

function getProductIdByRef(string $ref, DoliDB $db): ?int
{
	$sql = "SELECT rowid FROM ".MAIN_DB_PREFIX."product WHERE ref = '".$db->escape($ref)."' AND entity IN (".getEntity('product').")";
	$res = $db->query($sql);
	if ($res && $db->num_rows($res) > 0) {
		return (int)$db->fetch_object($res)->rowid;
	}
	return null;
}

function getYearExerciceId(string $annee, DoliDB $db): ?int
{
	$sql = "SELECT rowid FROM ".MAIN_DB_PREFIX."c_yearexercice WHERE label = '".$db->escape($annee)."' AND active = 1";
	$res = $db->query($sql);
	if ($res && $db->num_rows($res) > 0) {
		return (int)$db->fetch_object($res)->rowid;
	}
	return null;
}

function getPaymentModeId(string $code, DoliDB $db): ?int
{
	$sql = "SELECT id FROM ".MAIN_DB_PREFIX."c_paiement WHERE code = '".$db->escape($code)."' AND active = 1";
	$res = $db->query($sql);
	if ($res && $db->num_rows($res) > 0) {
		return (int)$db->fetch_object($res)->id;
	}
	return null;
}

function getCivilityCodeByLabel(string $label, DoliDB $db): ?string
{
	if (empty($label)) return null;
	$sql = "SELECT rowid FROM ".MAIN_DB_PREFIX."c_civility WHERE label = '".$db->escape($label)."' AND active = 1";
	$res = $db->query($sql);
	if ($res && $db->num_rows($res) > 0) {
		return $db->fetch_object($res)->rowid;
	}
	return null;
}

/**
 * Cherche ou crée un tiers Dolibarr.
 * En mode dryRun, incrémente les stats mais retourne 0.
 *
 * @param array   $firstRow  Première ligne du groupe (contient les données du tiers)
 * @param DoliDB  $db
 * @param User    $user
 * @param bool    $dryRun
 * @param array   $stats     Référence aux statistiques (incrémente 'tiers')
 * @return int  rowid du tiers (0 en dryRun)
 */
function findOrCreateSociete(array $firstRow, DoliDB $db, User $user, bool $dryRun, array &$stats): int
{
	$nom    = trim($firstRow['Nom']    ?? '');
	$prenom = trim($firstRow['Prénom'] ?? '');
	$name   = formatThirdpartyName($nom, $prenom);

	// Recherche par nom exact
	$sql = "SELECT rowid FROM ".MAIN_DB_PREFIX."societe WHERE nom = '".$db->escape($name)."' AND entity IN (".getEntity('societe').")";
	$res = $db->query($sql);
	if ($res && $db->num_rows($res) > 0) {
		return (int)$db->fetch_object($res)->rowid;
	}

	// Tiers non trouvé : créer
	$stats['tiers']++;

	if ($dryRun) {
		return 0;
	}

	$soc        = new Societe($db);
	$soc->name  = $name;
	$soc->client = 1;
	$soc->email = trim($firstRow['Courriel'] ?? '');
	$tel        = trim($firstRow['Portable'] ?? '') ?: trim($firstRow['Téléphone'] ?? '');
	$soc->phone = $tel;
	$soc->zip   = trim($firstRow['Code postal'] ?? '');
	$soc->town  = trim($firstRow['Commune'] ?? '');

	$titreLabel    = trim($firstRow['Titre'] ?? '');
	$civilityCode  = getCivilityCodeByLabel($titreLabel, $db);
	if ($civilityCode !== null) {
		$soc->array_options['options_thi_civility'] = $civilityCode;
	}

	$birthday = parseFrDate(trim($firstRow['Date de naissance'] ?? ''));
	if ($birthday !== null) {
		$soc->array_options['options_thi_birthday'] = $birthday;
	}

	$result = $soc->create($user);
	if ($result > 0) {
		return $result;
	}
	throw new Exception("Impossible de créer le tiers '$name' : ".$soc->error);
}

/**
 * Crée une facture Dolibarr avec ses lignes et le paiement associé.
 * En mode dryRun, incrémente les stats mais n'écrit rien en base.
 *
 * @param array   $rows      Lignes du groupe (même personne / même date)
 * @param int     $socid     rowid du tiers (0 en dryRun)
 * @param DoliDB  $db
 * @param User    $user
 * @param bool    $dryRun
 * @param array   $log       Référence au journal
 * @param array   $stats     Référence aux statistiques
 */
function processTransaction(
	array  $rows,
	int    $socid,
	DoliDB $db,
	User   $user,
	bool   $dryRun,
	array  &$log,
	array  &$stats
): void {
	$first      = $rows[0];
	$nom        = trim($first['Nom']    ?? '');
	$prenom     = trim($first['Prénom'] ?? '');
	$label      = formatThirdpartyName($nom, $prenom);
	$mregCode   = trim($first['Règlement'] ?? '');
	$dateAdhRaw = trim($first["Date d'adhésion"] ?? '');
	$dateAdh    = parseFrDate($dateAdhRaw);

	if (!$dateAdh) {
		$log[]          = ['type' => 'error', 'msg' => "[$label] Date d'adhésion invalide : '$dateAdhRaw'"];
		$stats['errors']++;
		return;
	}

	// Calcul du total de la facture
	$total = 0.0;
	foreach ($rows as $row) {
		$total += parseMontant($row['Montant ADH'] ?? '0');
		$total += parseMontant($row['Montant ACT'] ?? '0');
	}

	$totalFmt = number_format($total, 2, ',', ' ');

	if ($dryRun) {
		// Simulation : on compte les lignes prévisionnelles
		$nbLignes = 0;
		foreach ($rows as $row) {
			$montantAdh = parseMontant($row['Montant ADH'] ?? '0');
			$montantAct = parseMontant($row['Montant ACT'] ?? '0');
			$code       = trim($row['Code'] ?? '');
			if ($montantAdh > 0) $nbLignes++;
			if ($montantAct > 0 && !empty($code)) $nbLignes++;
			if ($montantAdh > 0 && $montantAct == 0 && !empty($code) && $code !== 'A05') $nbLignes++;
		}
		$stats['factures']++;
		$stats['lignes']    += $nbLignes;
		$stats['reglements']++;
		$log[] = ['type' => 'info', 'msg' => "[$label] [SIMULATION] Facture {$totalFmt}€, mode=$mregCode, {$nbLignes} ligne(s)"];
		return;
	}

	// Récupération de l'id du mode de règlement
	$paiementId = getPaymentModeId($mregCode, $db);
	if (!$paiementId) {
		$log[]          = ['type' => 'error', 'msg' => "[$label] Mode de règlement '$mregCode' introuvable dans llx_c_paiement"];
		$stats['errors']++;
		return;
	}

	// Vérification de la cohérence des années entre les lignes
	$anneesUniques = array_unique(array_map(fn($r) => trim($r['Année'] ?? ''), $rows));
	if (count($anneesUniques) > 1) {
		$log[]          = ['type' => 'error', 'msg' => "[$label] Années d'exercice différentes sur une même facture : ".implode(', ', $anneesUniques)." — transaction ignorée"];
		$stats['errors']++;
		return;
	}
	$anneeFacture  = reset($anneesUniques);
	$yearIdFacture = getYearExerciceId($anneeFacture, $db);
	if (!$yearIdFacture) {
		$log[] = ['type' => 'warning', 'msg' => "[$label] Année '$anneeFacture' introuvable dans llx_c_yearexercice — inv_culturalseason non renseigné"];
		$stats['warnings']++;
	}

	$db->begin();

	try {
		// --- Création de la facture ---
		$facture = new Facture($db);
		$facture->socid               = $socid;
		$facture->type                = Facture::TYPE_STANDARD;
		$facture->date                = strtotime($dateAdh);
		$facture->cond_reglement_code = 'RECEP';
		$facture->mode_reglement_code = $mregCode;
		if ($yearIdFacture) {
			$facture->array_options['options_inv_culturalseason'] = $yearIdFacture;
		}

		$factureId = $facture->create($user);
		if ($factureId <= 0) {
			throw new Exception("Impossible de créer la facture : ".$facture->error);
		}
		// Fetch obligatoire pour initialiser toutes les propriétés (multicurrency_tx, lines…)
		// nécessaires à addline()
		$facture->fetch($factureId);
		$stats['factures']++;
		$log[] = ['type' => 'info', 'msg' => "[$label] Facture #$factureId créée ({$totalFmt}€, mode=$mregCode)"];

		// --- Ajout des lignes ---
		foreach ($rows as $row) {
			$montantAdh = parseMontant($row['Montant ADH'] ?? '0');
			$montantAct = parseMontant($row['Montant ACT'] ?? '0');
			$code       = trim($row['Code'] ?? '');
			$activite   = trim($row['Activités'] ?? '');
			$annee      = trim($row['Année'] ?? '');

			$yearId     = getYearExerciceId($annee, $db);
			if (!$yearId) {
				$log[] = ['type' => 'warning', 'msg' => "[$label] Année '$annee' introuvable dans llx_c_yearexercice — year_excercice non renseigné"];
				$stats['warnings']++;
			}
			$lineOptions = $yearId ? array('options_year_excercice' => $yearId) : array();

			// Ligne adhésion (AUT01)
			if ($montantAdh > 0) {
				$prodId = getProductIdByRef('AUT01', $db);
				if (!$prodId) {
					throw new Exception("Produit 'AUT01' introuvable dans llx_product");
				}
				$res = $facture->addline(
					'Adhésion',
					$montantAdh,
					1,
					0,    // txtva
					0,    // txlocaltax1
					0,    // txlocaltax2
					$prodId,
					0,    // remise_percent
					'',   // date_start
					'',   // date_end
					0,    // fk_code_ventilation
					0,    // info_bits
					0,    // fk_remise_except
					'HT', // price_base_type
					0,    // pu_ttc
					0,    // type
					-1,   // rang
					0,    // special_code
					'',   // origin
					0,    // origin_id
					0,    // fk_parent_line
					null, // fk_fournprice
					0,    // pa_ht
					'',   // label
					$lineOptions
				);
				if ($res < 0) {
					throw new Exception("Erreur ajout ligne adhésion : ".$facture->error);
				}
				$stats['lignes']++;
				$log[] = ['type' => 'ok', 'msg' => "[$label] Ligne AUT01 (Adhésion) : ".number_format($montantAdh, 2, ',', ' ')."€"];
			}

			// Ligne activité payante (montant ACT > 0 et code présent)
			if ($montantAct > 0 && !empty($code)) {
				$prodId = getProductIdByRef($code, $db);
				if (!$prodId) {
					throw new Exception("Produit '$code' introuvable dans llx_product");
				}
				$desc = $activite ?: $code;
				$res  = $facture->addline(
					$desc,
					$montantAct,
					1,
					0,    // txtva
					0,    // txlocaltax1
					0,    // txlocaltax2
					$prodId,
					0,    // remise_percent
					'',   // date_start
					'',   // date_end
					0,    // fk_code_ventilation
					0,    // info_bits
					0,    // fk_remise_except
					'HT', // price_base_type
					0,    // pu_ttc
					0,    // type
					-1,   // rang
					0,    // special_code
					'',   // origin
					0,    // origin_id
					0,    // fk_parent_line
					null, // fk_fournprice
					0,    // pa_ht
					'',   // label
					$lineOptions
				);
				if ($res < 0) {
					throw new Exception("Erreur ajout ligne activité $code : ".$facture->error);
				}
				$stats['lignes']++;
				$log[] = ['type' => 'ok', 'msg' => "[$label] Ligne $code ($desc) : ".number_format($montantAct, 2, ',', ' ')."€"];
			}

			// Inscription gratuite : adhésion + code ≠ A05 + montant ACT = 0
			if ($montantAdh > 0 && $montantAct == 0 && !empty($code) && $code !== 'A05') {
				$prodId = getProductIdByRef($code, $db);
				if (!$prodId) {
					throw new Exception("Produit '$code' (inscription gratuite) introuvable dans llx_product");
				}
				$desc = $activite ?: $code;
				$res  = $facture->addline(
					$desc,
					0,
					1,
					0,    // txtva
					0,    // txlocaltax1
					0,    // txlocaltax2
					$prodId,
					0,    // remise_percent
					'',   // date_start
					'',   // date_end
					0,    // fk_code_ventilation
					0,    // info_bits
					0,    // fk_remise_except
					'HT', // price_base_type
					0,    // pu_ttc
					0,    // type
					-1,   // rang
					0,    // special_code
					'',   // origin
					0,    // origin_id
					0,    // fk_parent_line
					null, // fk_fournprice
					0,    // pa_ht
					'',   // label
					$lineOptions
				);
				if ($res < 0) {
					throw new Exception("Erreur ajout ligne inscription gratuite $code : ".$facture->error);
				}
				$stats['lignes']++;
				$log[] = ['type' => 'ok', 'msg' => "[$label] Ligne $code ($desc) inscription gratuite : 0,00€"];
			}
		}

		// --- Validation de la facture ---
		$resVal = $facture->validate($user);
		if ($resVal < 0) {
			throw new Exception("Impossible de valider la facture #$factureId : ".$facture->error);
		}

		// --- Création du paiement ---
		$paiement                = new Paiement($db);
		$paiement->datepaye      = strtotime($dateAdh);
		$paiement->amounts       = [$facture->id => $total];
		$paiement->paiementid    = $paiementId;
		$paiement->paiementcode  = $mregCode;
		$paiement->num_paiement  = '';
		$paiement->note_private  = '';

		$paiementResId = $paiement->create($user, 1);
		if ($paiementResId <= 0) {
			throw new Exception("Impossible de créer le paiement : ".$paiement->error);
		}
		$stats['reglements']++;
		$log[] = ['type' => 'ok', 'msg' => "[$label] Paiement #$paiementResId créé ({$totalFmt}€)"];

		$db->commit();
	} catch (Exception $e) {
		$db->rollback();
		$log[]          = ['type' => 'error', 'msg' => "[$label] ERREUR : ".$e->getMessage()];
		$stats['errors']++;
	}
}

// ============================================================
// FONCTIONS DE PRÉ-VÉRIFICATION
// ============================================================

/**
 * Extrait depuis les lignes CSV tous les codes produits et modes de règlement nécessaires.
 * Retourne ['produits' => [ref => label, ...], 'reglements' => [code, ...]]
 */
function extractRequirements(array $rows): array
{
	$produits   = [];
	$reglements = [];
	foreach ($rows as $row) {
		$code       = trim($row['Code'] ?? '');
		$activite   = trim($row['Activités'] ?? '');
		$montantAdh = parseMontant($row['Montant ADH'] ?? '0');
		$montantAct = parseMontant($row['Montant ACT'] ?? '0');
		$mreg       = trim($row['Règlement'] ?? '');

		if ($montantAdh > 0) {
			$produits['AUT01'] = 'Adhésion';
		}
		if ($montantAct > 0 && !empty($code)) {
			$produits[$code] = $activite ?: $code;
		}
		if ($montantAdh > 0 && $montantAct == 0 && !empty($code) && $code !== 'A05') {
			$produits[$code] = $activite ?: $code;
		}
		if (!empty($mreg)) {
			$reglements[$mreg] = true;
		}
	}
	return ['produits' => $produits, 'reglements' => array_keys($reglements)];
}

/**
 * Vérifie la présence des produits et modes de règlement dans Dolibarr.
 * Retourne ['produits' => [ref manquant, ...], 'reglements' => [code manquant, ...]]
 */
function checkPrerequisites(array $reqs, DoliDB $db): array
{
	$missing = ['produits' => [], 'reglements' => []];

	foreach ($reqs['produits'] as $ref => $label) {
		if (!getProductIdByRef($ref, $db)) {
			$missing['produits'][$ref] = $label;
		}
	}
	foreach ($reqs['reglements'] as $code) {
		if (!getPaymentModeId($code, $db)) {
			$missing['reglements'][] = $code;
		}
	}
	return $missing;
}

// ============================================================
// CONTRÔLEUR — FLUX EN 3 ÉTAPES
// ============================================================

$step       = GETPOST('step', 'int') ?: '1';
$errorFatal = null;

// Variables de vue
$fileName       = '';
$nbRows         = 0;
$nbTransactions = 0;
$reqs           = ['produits' => [], 'reglements' => []];
$missing        = ['produits' => [], 'reglements' => []];
$log            = [];
$stats          = ['tiers' => 0, 'factures' => 0, 'lignes' => 0, 'reglements' => 0, 'doublons' => 0, 'errors' => 0, 'warnings' => 0];
$dryRun         = true;

// ------------------------------------------------------------------
// ÉTAPE 2 : réception du fichier → pré-vérification
// ------------------------------------------------------------------
if ($step === '2' && !empty($_FILES['csv_file']['tmp_name'])) {
	$fileName    = $_FILES['csv_file']['name'];
	$uploadedTmp = $_FILES['csv_file']['tmp_name'];
	$ext         = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
	$dryRun      = (bool)GETPOST('dry_run', 'int');

	// Sauvegarde dans le répertoire tmp Dolibarr
	$savedPath = $tmpdir . uniqid('adh_', true) . '.' . $ext;
	move_uploaded_file($uploadedTmp, $savedPath);

	// Persistance en session
	$_SESSION['integ_adh_file']     = $savedPath;
	$_SESSION['integ_adh_filename'] = $fileName;
	$_SESSION['integ_adh_dryrun']   = $dryRun;

	try {
		$rows   = loadFileAsRows($savedPath, $fileName);
		$nbRows = count($rows);
		$reqs   = extractRequirements($rows);
		$missing = checkPrerequisites($reqs, $db);

		$_SESSION['integ_adh_nbrows'] = $nbRows;
		$_SESSION['integ_adh_reqs']   = $reqs;
	} catch (Exception $e) {
		$errorFatal = $e->getMessage();
	}
}

// ------------------------------------------------------------------
// ÉTAPE 3 : intégration
// ------------------------------------------------------------------
elseif ($step === '3') {
	$savedPath = $_SESSION['integ_adh_file']     ?? '';
	$fileName  = $_SESSION['integ_adh_filename'] ?? '';
	$dryRun    = $_SESSION['integ_adh_dryrun']   ?? true;
	$nbRows    = $_SESSION['integ_adh_nbrows']   ?? 0;

	if (!$savedPath || !file_exists($savedPath)) {
		$errorFatal = "Fichier temporaire introuvable. Veuillez recommencer depuis l'étape 1.";
	} else {
		try {
			$rows           = loadFileAsRows($savedPath, $fileName);
			$transactions   = groupTransactions($rows);
			$nbTransactions = count($transactions);

			foreach ($transactions as $transaction) {
				$firstRow = $transaction[0];
				$nom      = trim($firstRow['Nom']    ?? '');
				$prenom   = trim($firstRow['Prénom'] ?? '');
				$label    = formatThirdpartyName($nom, $prenom);

				if (empty($nom) && empty($prenom)) {
					$log[]           = ['type' => 'warning', 'msg' => "[?] Nom et prénom vides — transaction ignorée"];
					$stats['warnings']++;
					continue;
				}

				// Vérification doublon (facture existante pour ce tiers à cette date)
				$dateAdhRaw = trim($firstRow["Date d'adhésion"] ?? '');
				$dateAdh    = parseFrDate($dateAdhRaw);

				if (!$dateAdh) {
					$log[]           = ['type' => 'error', 'msg' => "[$label] Date d'adhésion invalide : '$dateAdhRaw'"];
					$stats['errors']++;
					continue;
				}

				if (!$dryRun) {
					// Vérification doublon : facture existante pour ce tiers à cette date exacte
					$tpName   = formatThirdpartyName($nom, $prenom);
					$sqlCheck = "SELECT f.rowid FROM ".MAIN_DB_PREFIX."facture f"
						." INNER JOIN ".MAIN_DB_PREFIX."societe s ON s.rowid = f.fk_soc"
						." WHERE s.nom = '".$db->escape($tpName)."'"
						." AND f.datef = '".$db->escape($dateAdh)."'"
						." AND f.entity IN (".getEntity('facture').")";
					$resCheck = $db->query($sqlCheck);
					if ($resCheck && $db->num_rows($resCheck) > 0) {
						$existingId = $db->fetch_object($resCheck)->rowid;
						$log[]      = ['type' => 'skip', 'msg' => "[$label] Facture du $dateAdhRaw déjà existante (#$existingId) — ignorée"];
						$stats['doublons']++;
						continue;
					}
				}

				try {
					$socid = findOrCreateSociete($firstRow, $db, $user, $dryRun, $stats);
				} catch (Exception $e) {
					$log[]           = ['type' => 'error', 'msg' => "[$label] Tiers : ".$e->getMessage()];
					$stats['errors']++;
					continue;
				}

				processTransaction($transaction, $socid, $db, $user, $dryRun, $log, $stats);
			}

			// Nettoyage du fichier temporaire si intégration réelle
			if (!$dryRun) {
				@unlink($savedPath);
				unset(
					$_SESSION['integ_adh_file'],
					$_SESSION['integ_adh_filename'],
					$_SESSION['integ_adh_dryrun'],
					$_SESSION['integ_adh_nbrows'],
					$_SESSION['integ_adh_reqs']
				);
			}
		} catch (Exception $e) {
			$errorFatal = $e->getMessage();
		}
	}
}

// ============================================================
// VUE HTML
// ============================================================

$form = new Form($db);
llxHeader('', 'Import adhésions', '', '', 0, 0, '', '', '', 'mod-dybccr page-import-adhesions');
print load_fiche_titre('Import des adhésions CSV/Excel', '', 'bill');

?>
<style>
.adh-steps { display: flex; gap: 0; margin-bottom: 24px; }
.adh-step-item { flex: 1; padding: 10px 16px; background: #e9ecef; border: 1px solid #dee2e6; text-align: center; font-size: 13px; }
.adh-step-item:first-child { border-radius: 6px 0 0 6px; }
.adh-step-item:last-child  { border-radius: 0 6px 6px 0; }
.adh-step-item.active  { background: #0d6efd; color: #fff; font-weight: bold; }
.adh-step-item.done    { background: #198754; color: #fff; }

.adh-card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 20px; margin-bottom: 20px; }
.adh-meta { color: #555; font-size: 14px; margin-bottom: 10px; }

.adh-badge-sim  { background: #ffc107; color: #212529; padding: 2px 9px; border-radius: 10px; font-size: 12px; font-weight: bold; vertical-align: middle; }
.adh-badge-real { background: #198754; color: #fff;   padding: 2px 9px; border-radius: 10px; font-size: 12px; font-weight: bold; vertical-align: middle; }

.adh-alert { padding: 12px 16px; border-radius: 4px; margin: 10px 0; font-size: 14px; }
.adh-alert-danger  { background: #f8d7da; border: 1px solid #f5c2c7; color: #58151c; }
.adh-alert-warning { background: #fff3cd; border: 1px solid #ffecb5; color: #664d03; }
.adh-alert-success { background: #d1e7dd; border: 1px solid #badbcc; color: #0a3622; }

.adh-icon-ok      { color: #198754; }
.adh-icon-missing { color: #dc3545; }

.adh-stats { display: flex; gap: 12px; flex-wrap: wrap; margin: 14px 0; }
.adh-stat-box { background: #fff; border: 1px solid #dee2e6; border-radius: 6px; padding: 10px 18px; text-align: center; min-width: 110px; }
.adh-stat-box .adh-val { font-size: 30px; font-weight: bold; color: #0d6efd; }
.adh-stat-box .adh-lbl { font-size: 11px; color: #666; margin-top: 2px; }
.adh-stat-box.s-err  .adh-val { color: #dc3545; }
.adh-stat-box.s-skip .adh-val { color: #6c757d; }
.adh-stat-box.s-warn .adh-val { color: #fd7e14; }

#adh-log-container { max-height: 55vh; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 4px; padding: 6px; background: #fff; }
.adh-log-entry { padding: 3px 8px; margin: 2px 0; border-radius: 3px; font-family: monospace; font-size: 13px; white-space: pre-wrap; }
.adh-log-ok      { background: #d1e7dd; color: #0a3622; }
.adh-log-error   { background: #f8d7da; color: #58151c; font-weight: bold; }
.adh-log-warning { background: #fff3cd; color: #664d03; }
.adh-log-skip    { background: #e2e3e5; color: #41464b; }
.adh-log-info    { color: #555; }

.adh-filter-bar { margin: 10px 0; font-size: 13px; }
.adh-filter-bar label { display: inline-flex; align-items: center; gap: 5px; margin-right: 14px; cursor: pointer; font-weight: normal; }
</style>

<!-- Indicateur d'étapes -->
<div class="adh-steps">
    <div class="adh-step-item <?php echo ($step === '1') ? 'active' : (($step > '1') ? 'done' : ''); ?>">&#x2460; Chargement du fichier</div>
    <div class="adh-step-item <?php echo ($step === '2') ? 'active' : (($step > '2') ? 'done' : ''); ?>">&#x2461; Vérification des référentiels</div>
    <div class="adh-step-item <?php echo ($step === '3') ? 'active' : ''; ?>">&#x2462; Intégration</div>
</div>

<?php if ($errorFatal): ?>
<div class="adh-alert adh-alert-danger">&#x26D4; <?php echo dol_escape_htmltag($errorFatal); ?></div>
<a href="<?php echo $_SERVER['PHP_SELF']; ?>" class="butAction">&#x21A9; Recommencer</a>

<?php elseif ($step === '1'): ?>
<!-- =========================================================
     ÉTAPE 1 — Formulaire de chargement
     ========================================================= -->
<div class="adh-card">
    <h2 style="margin-bottom:16px">Étape 1 — Choisir le fichier</h2>
    <form method="post" enctype="multipart/form-data" action="<?php echo $_SERVER['PHP_SELF']; ?>">
        <input type="hidden" name="token" value="<?php echo newToken(); ?>">
        <input type="hidden" name="step" value="2">
        <div style="margin-bottom:12px">
            <label for="adh_csv_file" style="font-weight:bold;display:block;margin-bottom:4px">
                Fichier CSV ou Excel (.csv, .xlsx, .xls) :
            </label>
            <input type="file" name="csv_file" id="adh_csv_file" accept=".csv,.xlsx,.xls" required>
        </div>
        <div style="margin-bottom:16px">
            <label style="font-weight:normal;cursor:pointer">
                <input type="checkbox" name="dry_run" value="1" checked>
                &nbsp;Mode simulation <em>(aucune donnée écrite en base)</em>
            </label>
        </div>
        <button type="submit" class="butAction">Analyser le fichier &#x2192;</button>
    </form>
</div>

<?php elseif ($step === '2'): ?>
<!-- =========================================================
     ÉTAPE 2 — Pré-vérification des référentiels
     ========================================================= -->
<div class="adh-card">
    <h2 style="margin-bottom:12px">Étape 2 — Vérification des référentiels</h2>
    <p class="adh-meta">
        Fichier : <strong><?php echo dol_escape_htmltag($fileName); ?></strong> &mdash;
        <?php echo $nbRows; ?> ligne(s) &mdash;
        <?php echo $dryRun
            ? '<span class="adh-badge-sim">SIMULATION</span>'
            : '<span class="adh-badge-real">INTÉGRATION RÉELLE</span>'; ?>
    </p>

    <?php
    $hasBlockingProduits    = !empty($missing['produits']);
    $hasBlockingReglements  = !empty($missing['reglements']);
    $hasBlockingErrors      = $hasBlockingProduits || $hasBlockingReglements;
    ?>

    <!-- ---- Produits requis ---- -->
    <h3 style="margin:16px 0 8px;color:#444">Produits requis (llx_product)</h3>
    <?php if (empty($reqs['produits'])): ?>
        <p class="adh-alert adh-alert-warning">&#x26A0; Aucun produit requis détecté dans le fichier.</p>
    <?php else: ?>
    <table class="noborder centpercent" style="font-size:14px">
        <tr class="liste_titre">
            <th>Statut</th><th>Référence</th><th>Libellé</th>
        </tr>
        <?php foreach ($reqs['produits'] as $ref => $libelle): ?>
            <?php $isMissing = array_key_exists($ref, $missing['produits']); ?>
            <tr class="oddeven">
                <td>
                    <?php if ($isMissing): ?>
                        <span class="adh-icon-missing">&#x2717; Absent</span>
                    <?php else: ?>
                        <span class="adh-icon-ok">&#x2713; Présent</span>
                    <?php endif; ?>
                </td>
                <td><strong><?php echo dol_escape_htmltag($ref); ?></strong></td>
                <td><?php echo dol_escape_htmltag($libelle); ?></td>
            </tr>
        <?php endforeach; ?>
    </table>
    <?php if ($hasBlockingProduits): ?>
    <div class="adh-alert adh-alert-danger" style="margin-top:10px">
        &#x26D4; <strong><?php echo count($missing['produits']); ?> produit(s) introuvable(s)</strong> dans Dolibarr.
        Créez-les (Admin &rarr; Produits/Services) avant de continuer.
    </div>
    <?php endif; ?>
    <?php endif; ?>

    <!-- ---- Modes de règlement requis ---- -->
    <h3 style="margin:20px 0 8px;color:#444">Modes de règlement requis (llx_c_paiement)</h3>
    <?php if (empty($reqs['reglements'])): ?>
        <p class="adh-alert adh-alert-warning">&#x26A0; Aucun mode de règlement détecté dans le fichier.</p>
    <?php else: ?>
    <table class="noborder centpercent" style="font-size:14px">
        <tr class="liste_titre">
            <th>Statut</th><th>Code</th>
        </tr>
        <?php foreach ($reqs['reglements'] as $code): ?>
            <?php $isMissing = in_array($code, $missing['reglements']); ?>
            <tr class="oddeven">
                <td>
                    <?php if ($isMissing): ?>
                        <span class="adh-icon-missing">&#x2717; Absent</span>
                    <?php else: ?>
                        <span class="adh-icon-ok">&#x2713; Présent</span>
                    <?php endif; ?>
                </td>
                <td><strong><?php echo dol_escape_htmltag($code); ?></strong></td>
            </tr>
        <?php endforeach; ?>
    </table>
    <?php if ($hasBlockingReglements): ?>
    <div class="adh-alert adh-alert-danger" style="margin-top:10px">
        &#x26D4; <strong><?php echo count($missing['reglements']); ?> mode(s) de règlement introuvable(s)</strong> dans Dolibarr.
        Vérifiez les valeurs de la colonne "Règlement" dans votre fichier ou activez les modes manquants
        (Configuration &rarr; Dictionnaires &rarr; Modes de paiement).
    </div>
    <?php endif; ?>
    <?php endif; ?>

    <!-- ---- Formulaire de confirmation ---- -->
    <form id="adh-precheck-form" method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>" style="margin-top:20px">
        <input type="hidden" name="token" value="<?php echo newToken(); ?>">
        <input type="hidden" name="step" value="3">

        <?php if ($hasBlockingErrors): ?>
            <a href="<?php echo $_SERVER['PHP_SELF']; ?>" class="butActionDelete">&#x21A9; Recommencer</a>
        <?php else: ?>
            <div class="adh-alert adh-alert-success">&#x2713; Tous les référentiels sont présents. L'intégration peut démarrer.</div>
            <button type="submit" class="butAction">Lancer l'intégration &#x2192;</button>
            <a href="<?php echo $_SERVER['PHP_SELF']; ?>" class="butActionDelete">&#x21A9; Annuler</a>
        <?php endif; ?>
    </form>
</div>

<?php elseif ($step === '3'): ?>
<!-- =========================================================
     ÉTAPE 3 — Résultats de l'intégration
     ========================================================= -->
<div class="adh-card">
    <h2 style="margin-bottom:12px">
        Étape 3 — Résultats
        <?php echo $dryRun
            ? '<span class="adh-badge-sim">SIMULATION</span>'
            : '<span class="adh-badge-real">DONNÉES INTÉGRÉES</span>'; ?>
    </h2>
    <p class="adh-meta">
        Fichier : <strong><?php echo dol_escape_htmltag($fileName); ?></strong> &mdash;
        <?php echo $nbRows; ?> ligne(s) &mdash;
        <?php echo $nbTransactions; ?> transaction(s)
    </p>

    <div class="adh-stats">
        <div class="adh-stat-box">
            <div class="adh-val"><?php echo $stats['tiers']; ?></div>
            <div class="adh-lbl">Tiers créés</div>
        </div>
        <div class="adh-stat-box">
            <div class="adh-val"><?php echo $stats['factures']; ?></div>
            <div class="adh-lbl">Factures créées</div>
        </div>
        <div class="adh-stat-box">
            <div class="adh-val"><?php echo $stats['lignes']; ?></div>
            <div class="adh-lbl">Lignes créées</div>
        </div>
        <div class="adh-stat-box">
            <div class="adh-val"><?php echo $stats['reglements']; ?></div>
            <div class="adh-lbl">Paiements créés</div>
        </div>
        <div class="adh-stat-box s-skip">
            <div class="adh-val"><?php echo $stats['doublons']; ?></div>
            <div class="adh-lbl">Doublons ignorés</div>
        </div>
        <div class="adh-stat-box s-warn">
            <div class="adh-val"><?php echo $stats['warnings']; ?></div>
            <div class="adh-lbl">Avertissements</div>
        </div>
        <div class="adh-stat-box s-err">
            <div class="adh-val"><?php echo $stats['errors']; ?></div>
            <div class="adh-lbl">Erreurs</div>
        </div>
    </div>

    <h3 style="margin:16px 0 8px;color:#444">Journal détaillé</h3>
    <div class="adh-filter-bar">
        Afficher :
        <label><input type="checkbox" class="adh-fcb" data-type="ok"      checked> OK</label>
        <label><input type="checkbox" class="adh-fcb" data-type="error"   checked> Erreurs</label>
        <label><input type="checkbox" class="adh-fcb" data-type="skip"    checked> Doublons</label>
        <label><input type="checkbox" class="adh-fcb" data-type="warning" checked> Avertissements</label>
        <label><input type="checkbox" class="adh-fcb" data-type="info"    checked> Infos</label>
    </div>
    <div id="adh-log-container">
        <?php foreach ($log as $entry): ?>
            <?php $t = dol_escape_htmltag($entry['type'] ?? 'info'); ?>
            <div class="adh-log-entry adh-log-<?php echo $t; ?>" data-type="<?php echo $t; ?>">
                <?php echo dol_escape_htmltag($entry['msg'] ?? ''); ?>
            </div>
        <?php endforeach; ?>
    </div>

    <div style="margin-top:16px">
        <?php if ($dryRun): ?>
            <a href="<?php echo $_SERVER['PHP_SELF']; ?>" class="butAction">&#x21A9; Recommencer (intégration réelle)</a>
        <?php else: ?>
            <a href="<?php echo $_SERVER['PHP_SELF']; ?>" class="butAction">&#x21A9; Nouvelle intégration</a>
        <?php endif; ?>
    </div>
</div>

<script>
document.querySelectorAll('.adh-fcb').forEach(function(cb) {
    cb.addEventListener('change', function() {
        var type = this.dataset.type;
        document.querySelectorAll('.adh-log-entry[data-type="' + type + '"]').forEach(function(el) {
            el.style.display = cb.checked ? '' : 'none';
        });
    });
});
</script>

<?php endif; ?>

<?php
llxFooter();
$db->close();
