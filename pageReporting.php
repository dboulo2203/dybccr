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
$allowedTabs = array('activites', 'montants', 'typesactivite', 'typesdomaine', 'typesdomainemontants', 'modespaiement');
if (!in_array($tab, $allowedTabs, true)) {
	$tab = 'activites';
}

// ============================================================
// VUE
// ============================================================

llxHeader('', 'Reporting', '', '', 0, 0, '', '', '', 'mod-dybccr page-reporting');

print load_fiche_titre('Reporting inscriptions', '', 'dybccr.png@dybccr');

$head = array();
$head[0] = array($_SERVER['PHP_SELF'].'?tab=activites', 'Activités (nb)', 'activites');
$head[1] = array($_SERVER['PHP_SELF'].'?tab=montants', 'Activités (€)', 'montants');
$head[2] = array($_SERVER['PHP_SELF'].'?tab=typesactivite', "Type d'activité (nb)", 'typesactivite');
$head[3] = array($_SERVER['PHP_SELF'].'?tab=typesdomaine', 'Type de domaine (nb)', 'typesdomaine');
$head[4] = array($_SERVER['PHP_SELF'].'?tab=typesdomainemontants', 'Type de domaine (€)', 'typesdomainemontants');
$head[5] = array($_SERVER['PHP_SELF'].'?tab=modespaiement', 'Mode de paiement (€)', 'modespaiement');

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
$sqlProducts  = "SELECT p.rowid, p.ref, p.label, pe.type_activite, pe.type_domaine";
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
			'type_domaine'  => $obj->type_domaine,
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

// ---- Nombre de lignes de facture par type d'activité (regroupement des activités par leur code activité) ----
$typeActivities = array();
$sqlTypes = "SELECT rowid, label FROM ".MAIN_DB_PREFIX."c_typeactivity WHERE active = 1 ORDER BY label ASC";
$resTypes = $db->query($sqlTypes);
if ($resTypes) {
	while ($obj = $db->fetch_object($resTypes)) {
		$typeActivities[] = array('rowid' => (int) $obj->rowid, 'ref' => '', 'label' => $obj->label);
	}
}

$countsByType = array();
foreach ($products as $p) {
	$typeId = (int) $p['type_activite'];
	if (!isset($counts[$p['rowid']])) {
		continue;
	}
	foreach ($counts[$p['rowid']] as $yearId => $nb) {
		$countsByType[$typeId][$yearId] = (isset($countsByType[$typeId][$yearId]) ? $countsByType[$typeId][$yearId] : 0) + $nb;
	}
}
if (isset($countsByType[0])) {
	$typeActivities[] = array('rowid' => 0, 'ref' => '', 'label' => 'Non catégorisé');
}

$typeActivitiesAdhesion = array();
$typeActivitiesAutres = array();
foreach ($typeActivities as $t) {
	if ($adhesionTypeId > 0 && $t['rowid'] === $adhesionTypeId) {
		$typeActivitiesAdhesion[] = $t;
	} else {
		$typeActivitiesAutres[] = $t;
	}
}

// ---- Nombre de lignes de facture par type de domaine ----
$typeDomains = array();
$sqlDomains = "SELECT rowid, label FROM ".MAIN_DB_PREFIX."c_typedomain WHERE active = 1 ORDER BY label ASC";
$resDomains = $db->query($sqlDomains);
if ($resDomains) {
	while ($obj = $db->fetch_object($resDomains)) {
		$typeDomains[] = array('rowid' => (int) $obj->rowid, 'ref' => '', 'label' => $obj->label);
	}
}

$countsByDomain = array();
$amountsByDomain = array();
foreach ($products as $p) {
	$domainId = (int) $p['type_domaine'];
	if (!isset($counts[$p['rowid']])) {
		continue;
	}
	foreach ($counts[$p['rowid']] as $yearId => $nb) {
		$countsByDomain[$domainId][$yearId] = (isset($countsByDomain[$domainId][$yearId]) ? $countsByDomain[$domainId][$yearId] : 0) + $nb;
	}
	foreach ($amounts[$p['rowid']] as $yearId => $amount) {
		$amountsByDomain[$domainId][$yearId] = (isset($amountsByDomain[$domainId][$yearId]) ? $amountsByDomain[$domainId][$yearId] : 0) + $amount;
	}
}
if (isset($countsByDomain[0])) {
	$typeDomains[] = array('rowid' => 0, 'ref' => '', 'label' => 'Non catégorisé');
}

// ---- Rowid du domaine "Adhésion" : pour scinder les tableaux de montant en 2 ----
$adhesionDomainId = 0;
$sqlAdhesionDomain = "SELECT rowid FROM ".MAIN_DB_PREFIX."c_typedomain WHERE label = 'Adhésion'";
$resAdhesionDomain = $db->query($sqlAdhesionDomain);
if ($resAdhesionDomain && $db->num_rows($resAdhesionDomain) > 0) {
	$adhesionDomainId = (int) $db->fetch_object($resAdhesionDomain)->rowid;
}

$domainsAdhesion = array();
$domainsAutres = array();
foreach ($typeDomains as $d) {
	if ($adhesionDomainId > 0 && $d['rowid'] === $adhesionDomainId) {
		$domainsAdhesion[] = $d;
	} else {
		$domainsAutres[] = $d;
	}
}

// ---- Montants payés par mode de paiement ----
$paymentModes = array();
$sqlPaymentModes = "SELECT id, libelle FROM ".MAIN_DB_PREFIX."c_paiement WHERE active = 1 ORDER BY libelle ASC";
$resPaymentModes = $db->query($sqlPaymentModes);
if ($resPaymentModes) {
	while ($obj = $db->fetch_object($resPaymentModes)) {
		$paymentModes[] = array('rowid' => (int) $obj->id, 'ref' => '', 'label' => $obj->libelle);
	}
}

$amountsByPaymentMode = array();
$countsByPaymentMode = array();
if (!empty($years)) {
	$sqlPayments  = "SELECT pa.fk_paiement AS mode_id, fe.inv_culturalseason AS year_id,";
	$sqlPayments .= " COUNT(pf.rowid) AS nb_payments, SUM(pf.amount) AS total_amount";
	$sqlPayments .= " FROM ".MAIN_DB_PREFIX."paiement_facture AS pf";
	$sqlPayments .= " INNER JOIN ".MAIN_DB_PREFIX."paiement AS pa ON pa.rowid = pf.fk_paiement";
	$sqlPayments .= " INNER JOIN ".MAIN_DB_PREFIX."facture AS f ON f.rowid = pf.fk_facture";
	$sqlPayments .= " INNER JOIN ".MAIN_DB_PREFIX."facture_extrafields AS fe ON fe.fk_object = f.rowid";
	$sqlPayments .= " WHERE fe.inv_culturalseason IN (".implode(',', $yearIds).")";
	$sqlPayments .= " AND f.entity IN (".getEntity('facture').")";
	$sqlPayments .= " GROUP BY pa.fk_paiement, fe.inv_culturalseason";

	$resPayments = $db->query($sqlPayments);
	if ($resPayments) {
		while ($obj = $db->fetch_object($resPayments)) {
			$amountsByPaymentMode[(int) $obj->mode_id][(int) $obj->year_id] = (float) $obj->total_amount;
			$countsByPaymentMode[(int) $obj->mode_id][(int) $obj->year_id] = (int) $obj->nb_payments;
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
		$rowLabel = ($p['ref'] !== '') ? $p['ref'].' - '.$p['label'] : $p['label'];
		print '<td>'.dol_escape_htmltag($rowLabel).'</td>';
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
} elseif ($tab === 'typesactivite') {
	$printActivityTable("Nombre de lignes - Type d'activité Adhésion", $typeActivitiesAdhesion, $countsByType, $intFormatter);
	print '<br>';
	$printActivityTable("Nombre de lignes - Autres types d'activité", $typeActivitiesAutres, $countsByType, $intFormatter);
} elseif ($tab === 'typesdomaine') {
	$printActivityTable('Nombre de lignes - Domaine Adhésion', $domainsAdhesion, $countsByDomain, $intFormatter);
	print '<br>';
	$printActivityTable('Nombre de lignes - Autres domaines', $domainsAutres, $countsByDomain, $intFormatter);
} elseif ($tab === 'typesdomainemontants') {
	$printActivityTable('Montant TTC - Domaine Adhésion', $domainsAdhesion, $amountsByDomain, $amountFormatter);
	print '<br>';
	$printActivityTable('Montant TTC - Autres domaines', $domainsAutres, $amountsByDomain, $amountFormatter);
} elseif ($tab === 'modespaiement') {
	$printActivityTable('Montants par mode de paiement', $paymentModes, $amountsByPaymentMode, $amountFormatter);
	print '<br>';
	$printActivityTable('Nombre de paiements par mode de paiement', $paymentModes, $countsByPaymentMode, $intFormatter);
}

print dol_get_fiche_end();

llxFooter();
$db->close();
