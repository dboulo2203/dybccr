<?php
/* Copyright (C) 2026 CCR
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * \file    dybccr/pageReporting.php
 * \ingroup dybccr
 * \brief   Reporting DYBccr (onglets)
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

/**
 * @var Conf      $conf
 * @var DoliDB    $db
 * @var Translate $langs
 * @var User      $user
 */

$langs->loadLangs(array("dybccr@dybccr"));

// ---- Paramètres ----
$tab = GETPOST('tab', 'aZ09');
$allowedTabs = array('activites', 'montants');
if (!in_array($tab, $allowedTabs, true)) {
	$tab = 'activites';
}

// ============================================================
// VUE
// ============================================================

llxHeader('', 'Reporting', '', '', 0, 0, '', '', '', 'mod-dybccr page-reporting');

print load_fiche_titre('Reporting', '', 'dybccr.png@dybccr');

$head = array();
$head[0] = array($_SERVER['PHP_SELF'].'?tab=activites', 'Activités', 'activites');
$head[1] = array($_SERVER['PHP_SELF'].'?tab=montants', 'Montants', 'montants');

print dol_get_fiche_head($head, $tab, '', -1, '');

// ---- Les 3 dernières années d'exercice : saison courante (paramètre du module) + 2 précédentes ----
$currentSeasonId = getDolGlobalInt('DYBCCR_DYBWEB_CURRENT_SEASON');
$currentSeasonLabel = '';
if ($currentSeasonId > 0) {
	$sqlCurrent = "SELECT label FROM ".MAIN_DB_PREFIX."c_yearexercice WHERE rowid = ".$currentSeasonId;
	$resCurrent = $db->query($sqlCurrent);
	if ($resCurrent && $db->num_rows($resCurrent) > 0) {
		$currentSeasonLabel = $db->fetch_object($resCurrent)->label;
	}
}

$sqlYears = "SELECT rowid, label FROM ".MAIN_DB_PREFIX."c_yearexercice WHERE active = 1";
if ($currentSeasonLabel !== '') {
	$sqlYears .= " AND label <= '".$db->escape($currentSeasonLabel)."'";
}
$sqlYears .= " ORDER BY label DESC";
$sqlYears .= $db->plimit(3);

$years = array();
$resYears = $db->query($sqlYears);
if ($resYears) {
	while ($obj = $db->fetch_object($resYears)) {
		$years[] = array('rowid' => (int) $obj->rowid, 'label' => $obj->label);
	}
}
$years = array_reverse($years); // du plus ancien au plus récent

// ---- Liste des activités (services), avec leur code activité ----
$products = array();
$sqlProducts  = "SELECT p.rowid, p.ref, p.label, pe.type_activite";
$sqlProducts .= " FROM ".MAIN_DB_PREFIX."product AS p";
$sqlProducts .= " LEFT JOIN ".MAIN_DB_PREFIX."product_extrafields AS pe ON pe.fk_object = p.rowid";
$sqlProducts .= " WHERE p.entity IN (".getEntity('product').")";
$sqlProducts .= " ORDER BY p.label ASC";
$resProducts = $db->query($sqlProducts);
if ($resProducts) {
	while ($obj = $db->fetch_object($resProducts)) {
		$products[] = array(
			'rowid'         => (int) $obj->rowid,
			'ref'           => $obj->ref,
			'label'         => $obj->label,
			'type_activite' => $obj->type_activite,
		);
	}
}

// ---- Rowid du type d'activité "Adhésion" ----
$adhesionTypeId = 0;
$sqlAdhesionType = "SELECT rowid FROM ".MAIN_DB_PREFIX."c_typeactivity WHERE label = 'Adhésion'";
$resAdhesionType = $db->query($sqlAdhesionType);
if ($resAdhesionType && $db->num_rows($resAdhesionType) > 0) {
	$adhesionTypeId = (int) $db->fetch_object($resAdhesionType)->rowid;
}

$productsAdhesion = array();
$productsAutres = array();
foreach ($products as $p) {
	if ($adhesionTypeId > 0 && (int) $p['type_activite'] === $adhesionTypeId) {
		$productsAdhesion[] = $p;
	} else {
		$productsAutres[] = $p;
	}
}

// ---- Nombre de lignes de facture et montant TTC, par activité et par année ----
$counts = array();
$amounts = array();
if (!empty($years)) {
	$yearIds = array_map(function ($y) {
		return $y['rowid'];
	}, $years);

	$sqlCounts  = "SELECT fd.fk_product AS product_id, fe.inv_culturalseason AS year_id,";
	$sqlCounts .= " COUNT(fd.rowid) AS nb_lines, SUM(fd.total_ttc) AS total_ttc";
	$sqlCounts .= " FROM ".MAIN_DB_PREFIX."facturedet AS fd";
	$sqlCounts .= " INNER JOIN ".MAIN_DB_PREFIX."facture AS f ON f.rowid = fd.fk_facture";
	$sqlCounts .= " INNER JOIN ".MAIN_DB_PREFIX."facture_extrafields AS fe ON fe.fk_object = f.rowid";
	$sqlCounts .= " WHERE fe.inv_culturalseason IN (".implode(',', $yearIds).")";
	$sqlCounts .= " AND f.entity IN (".getEntity('facture').")";
	$sqlCounts .= " AND f.fk_statut > 0"; // exclure les brouillons
	$sqlCounts .= " GROUP BY fd.fk_product, fe.inv_culturalseason";

	$resCounts = $db->query($sqlCounts);
	if ($resCounts) {
		while ($obj = $db->fetch_object($resCounts)) {
			$counts[(int) $obj->product_id][(int) $obj->year_id] = (int) $obj->nb_lines;
			$amounts[(int) $obj->product_id][(int) $obj->year_id] = (float) $obj->total_ttc;
		}
	}
}

// ---- Affichage d'un tableau (titre, sous-ensemble de produits, valeurs, formateur de cellule) ----
$printActivityTable = function ($title, $productsSubset, $valuesMatrix, $formatter) use ($years) {
	$totals = array();
	foreach ($years as $y) {
		$total = 0;
		foreach ($productsSubset as $p) {
			$total += isset($valuesMatrix[$p['rowid']][$y['rowid']]) ? $valuesMatrix[$p['rowid']][$y['rowid']] : 0;
		}
		$totals[$y['rowid']] = $total;
	}

	print load_fiche_titre($title, '', '');

	print '<div class="div-table-responsive">';
	print '<table class="noborder centpercent">';
	print '<tr class="liste_titre">';
	print '<td>Activité</td>';
	foreach ($years as $y) {
		print '<td class="right">'.dol_escape_htmltag($y['label']).'</td>';
	}
	print '</tr>';

	print '<tr class="oddeven" style="font-weight:bold">';
	print '<td>Total</td>';
	foreach ($years as $y) {
		print '<td class="right">'.$formatter($totals[$y['rowid']]).'</td>';
	}
	print '</tr>';

	foreach ($productsSubset as $p) {
		print '<tr class="oddeven">';
		print '<td>'.dol_escape_htmltag($p['ref'].' - '.$p['label']).'</td>';
		foreach ($years as $y) {
			$val = isset($valuesMatrix[$p['rowid']][$y['rowid']]) ? $valuesMatrix[$p['rowid']][$y['rowid']] : 0;
			print '<td class="right">'.$formatter($val).'</td>';
		}
		print '</tr>';
	}

	print '</table>';
	print '</div>';
};

$intFormatter = function ($val) {
	return (string) (int) $val;
};
$amountFormatter = function ($val) {
	return price($val);
};

if ($tab === 'activites') {
	$printActivityTable('Adhésions', $productsAdhesion, $counts, $intFormatter);
	print '<br>';
	$printActivityTable('Autres activités', $productsAutres, $counts, $intFormatter);
} elseif ($tab === 'montants') {
	$printActivityTable('Adhésions', $productsAdhesion, $amounts, $amountFormatter);
	print '<br>';
	$printActivityTable('Autres activités', $productsAutres, $amounts, $amountFormatter);
}

print dol_get_fiche_end();

llxFooter();
$db->close();
