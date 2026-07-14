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
 * \file    dybccr/import_products.php
 * \ingroup dybccr
 * \brief   Import des services depuis products.csv dans Dolibarr
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

require_once DOL_DOCUMENT_ROOT.'/product/class/product.class.php';

/**
 * @var Conf      $conf
 * @var DoliDB    $db
 * @var Translate $langs
 * @var User      $user
 */

$langs->loadLangs(array("dybccr@dybccr", "products"));

// Sécurité : admin uniquement
if (empty($user->admin)) {
	accessforbidden();
}

$action = GETPOST('action', 'aZ09');

// Chemin du fichier CSV source
define('CSV_PRODUCTS', __DIR__.'/integrationAI/products.csv');

// ============================================================
// FONCTIONS
// ============================================================

/**
 * Lit le fichier products.csv et retourne un tableau de lignes.
 * Exclut les lignes avec ref ou libelle vides, et les doublons de ref.
 */
function readProductsCSV(): array
{
	if (!file_exists(CSV_PRODUCTS)) {
		return [];
	}
	$h = fopen(CSV_PRODUCTS, 'r');
	$bom = fread($h, 3);
	if ($bom !== "\xEF\xBB\xBF") rewind($h);

	$headers = null;
	$rows    = [];
	$seenRef = [];

	while (($data = fgetcsv($h, 0, ',')) !== false) {
		if ($headers === null) {
			$headers = array_map('trim', $data);
			continue;
		}
		while (count($data) < count($headers)) $data[] = '';
		$row = array_combine($headers, array_slice($data, 0, count($headers)));

		$ref    = trim($row['act_ext_key'] ?? '');
		$label  = trim($row['act_libelle'] ?? '');
		$dom_id = trim($row['dom_id']      ?? '');
		$tyac   = trim($row['tyac_id']     ?? '');

		// Conversion ISO-8859-1 → UTF-8 si nécessaire
		if (!mb_check_encoding($label, 'UTF-8')) {
			$label = mb_convert_encoding($label, 'UTF-8', 'Windows-1252');
		}

		// Exclure lignes invalides ou doublons de ref
		if (empty($ref) || empty($label)) continue;
		if (isset($seenRef[$ref])) continue;
		// Exclure lignes avec dom_id ou tyac_id NULL (\N)
		if ($dom_id === '\\N' || $tyac === '\\N') continue;

		$prixRaw = trim($row['Prix'] ?? '');
		$prix    = ($prixRaw !== '' && $prixRaw !== '\\N') ? (float)str_replace(',', '.', $prixRaw) : 0.0;

		$seenRef[$ref] = true;
		$rows[] = [
			'ref'    => $ref,
			'label'  => $label,
			'dom_id' => ($dom_id !== '' && $dom_id !== '\\N') ? (int)$dom_id : null,
			'tyac_id'=> ($tyac   !== '' && $tyac   !== '\\N') ? (int)$tyac   : null,
			'prix'   => $prix,
		];
	}
	fclose($h);
	return $rows;
}

/**
 * Vérifie si un produit avec cette ref existe déjà dans Dolibarr.
 */
function productExists(string $ref, DoliDB $db): bool
{
	$sql = "SELECT rowid FROM ".MAIN_DB_PREFIX."product WHERE ref = '".$db->escape($ref)."' AND entity IN (".getEntity('product').")";
	$res = $db->query($sql);
	return ($res && $db->num_rows($res) > 0);
}

// ============================================================
// ACTIONS
// ============================================================

$log    = [];
$stats  = ['created' => 0, 'skipped' => 0, 'errors' => 0];

if ($action === 'import') {
	$rows = readProductsCSV();

	foreach ($rows as $row) {
		if (productExists($row['ref'], $db)) {
			$log[] = ['type' => 'skip', 'msg' => "[{$row['ref']}] {$row['label']} — déjà existant, ignoré"];
			$stats['skipped']++;
			continue;
		}

		$product = new Product($db);
		$product->ref    = $row['ref'];
		$product->label  = $row['label'];
		$product->type   = 1;       // service
		$product->tosell = 1;       // en vente
		$product->tobuy  = 0;       // pas en achat
		$product->status = 1;
		$product->status_buy = 0;
		$product->price_base_type = 'TTC';
		$product->price_ttc = $row['prix'];
		$product->price  = $row['prix'];
		$product->tva_tx = 0;
		$product->entity = $conf->entity;

		// Extrafields
		if ($row['dom_id'] !== null) {
			$product->array_options['options_dom_id'] = $row['dom_id'];
		}
		if ($row['tyac_id'] !== null) {
			$product->array_options['options_tyac_id'] = $row['tyac_id'];
		}

		$result = $product->create($user);
		if ($result > 0) {
			// Sauvegarde des extrafields
			$product->insertExtraFields();
			$log[]  = ['type' => 'ok', 'msg' => "[{$row['ref']}] {$row['label']} — créé (id={$result})"];
			$stats['created']++;
		} else {
			$log[]  = ['type' => 'error', 'msg' => "[{$row['ref']}] {$row['label']} — ERREUR : ".$product->error];
			$stats['errors']++;
		}
	}
}

// ============================================================
// VUE
// ============================================================

llxHeader('', 'Import services', '', '', 0, 0, '', '', '', 'mod-dybccr page-import-products');

print load_fiche_titre('Import des services depuis products.csv', '', 'product');

if (!file_exists(CSV_PRODUCTS)) {
	print '<div class="error">Fichier introuvable : '.CSV_PRODUCTS.'</div>';
	llxFooter();
	$db->close();
	exit;
}

// ---- Tableau de prévisualisation (avant import) ----
if ($action !== 'import') {
	$rows = readProductsCSV();

	print '<p>'.$langs->trans("NbProducts").': <strong>'.count($rows).'</strong></p>';
	print '<table class="noborder centpercent">';
	print '<tr class="liste_titre">';
	print '<th>Référence</th><th>Label</th><th>Prix TTC</th><th>dom_id</th><th>tyac_id</th><th>Statut</th>';
	print '</tr>';

	foreach ($rows as $row) {
		$exists = productExists($row['ref'], $db);
		print '<tr class="oddeven">';
		print '<td><strong>'.dol_escape_htmltag($row['ref']).'</strong></td>';
		print '<td>'.dol_escape_htmltag($row['label']).'</td>';
		print '<td>'.number_format($row['prix'], 2, ',', ' ').' €</td>';
		print '<td>'.($row['dom_id'] ?? '<em>-</em>').'</td>';
		print '<td>'.($row['tyac_id'] ?? '<em>-</em>').'</td>';
		if ($exists) {
			print '<td><span class="badge badge-status4 badge-status">Déjà existant</span></td>';
		} else {
			print '<td><span class="badge badge-status1 badge-status">À créer</span></td>';
		}
		print '</tr>';
	}
	print '</table>';

	print '<br>';
	print '<form method="post" action="'.$_SERVER['PHP_SELF'].'">';
	print '<input type="hidden" name="token" value="'.newToken().'">';
	print '<input type="hidden" name="action" value="import">';
	print '<button type="submit" class="butAction">Lancer l\'import</button>';
	print '</form>';
}

// ---- Résultats après import ----
if ($action === 'import') {
	print '<div class="div-table-responsive">';
	print '<table class="noborder centpercent">';
	print '<tr class="liste_titre">';
	print '<th>Résultat</th><th>Message</th>';
	print '</tr>';
	foreach ($log as $entry) {
		$css = ($entry['type'] === 'ok') ? 'valid' : (($entry['type'] === 'error') ? 'error' : 'warning');
		print '<tr class="oddeven">';
		print '<td><span class="'.$css.'">'.dol_escape_htmltag($entry['type']).'</span></td>';
		print '<td>'.dol_escape_htmltag($entry['msg']).'</td>';
		print '</tr>';
	}
	print '</table></div>';

	print '<br><div class="opacitymedium">';
	print '<strong>Créés : '.$stats['created'].'</strong> &nbsp;|&nbsp; ';
	print 'Ignorés (existants) : '.$stats['skipped'].' &nbsp;|&nbsp; ';
	print 'Erreurs : '.$stats['errors'];
	print '</div>';

	print '<br><a href="'.$_SERVER['PHP_SELF'].'" class="butAction">Retour</a>';
}

llxFooter();
$db->close();
