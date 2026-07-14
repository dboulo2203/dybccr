<?php
/* Copyright (C) 2026 CCR
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * \file    dybccr/RegistrationList.php
 * \ingroup dybccr
 * \brief   Suivi des inscriptions (factures par année et statut)
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

// ---- Paramètres du formulaire ----
$yearId    = (int)GETPOST('yearid', 'int');
$statusRaw = GETPOST('status', 'alpha');
$productId = (int)GETPOST('productid', 'int');
$action    = GETPOST('action', 'aZ09');

// Paramètres de tri (GET uniquement, indépendants des filtres)
$sortfield = GETPOST('sortfield', 'aZ09comma');
$sortorder = GETPOST('sortorder', 'aZ09comma');
$allowedSortFields = array('s.nom', 's.email', 'f.total_ttc', 'f.fk_statut', 'f.datef');
if (!in_array($sortfield, $allowedSortFields, true)) { $sortfield = 's.nom'; }
$sortorder = (strtoupper($sortorder) === 'DESC') ? 'DESC' : 'ASC';

// Validation du statut (valeurs autorisées uniquement)
$allowedStatuses = array('', '0', '1', '2', '-1');
$status = in_array($statusRaw, $allowedStatuses, true) ? $statusRaw : '';

// Persistance des filtres en session
if ($action === 'search') {
	$_SESSION['registrationlist_yearid']    = $yearId;
	$_SESSION['registrationlist_status']    = $status;
	$_SESSION['registrationlist_productid'] = $productId;
} else {
	$yearId    = isset($_SESSION['registrationlist_yearid'])    ? (int)$_SESSION['registrationlist_yearid']    : 0;
	$status    = isset($_SESSION['registrationlist_status'])    ? $_SESSION['registrationlist_status']         : '';
	$productId = isset($_SESSION['registrationlist_productid']) ? (int)$_SESSION['registrationlist_productid'] : 0;
	if ($yearId > 0) { $action = 'search'; }
}

// Libellés des statuts de facture Dolibarr
$statusLabels = array(
	'0'  => 'Brouillon',
	'1'  => 'Validée',
	'2'  => 'Payée',
	'-1' => 'Annulée',
);

// ---- Chargement des années de validité ----
$years = array();
$sqlYears = "SELECT rowid, label FROM ".MAIN_DB_PREFIX."c_yearexercice WHERE active = 1 ORDER BY label DESC";
$resYears = $db->query($sqlYears);
if ($resYears) {
	while ($obj = $db->fetch_object($resYears)) {
		$years[] = array('rowid' => (int)$obj->rowid, 'label' => $obj->label);
	}
}

// ---- Chargement des services Dolibarr ----
$products = array();
$sqlProducts  = "SELECT rowid, ref, label FROM ".MAIN_DB_PREFIX."product";
$sqlProducts .= " WHERE entity IN (".getEntity('product').")";
$sqlProducts .= " ORDER BY label ASC";
$resProducts = $db->query($sqlProducts);
if ($resProducts) {
	while ($obj = $db->fetch_object($resProducts)) {
		$products[] = array('rowid' => (int)$obj->rowid, 'ref' => $obj->ref, 'label' => $obj->label);
	}
}

// ============================================================
// VUE
// ============================================================

llxHeader('', 'Suivi des inscriptions', '', '', 0, 0, '', '', '', 'mod-dybccr page-registrationlist');

print load_fiche_titre('Suivi des inscriptions', '', 'dybccr.png@dybccr');

// ---- Formulaire de recherche ----
print '<form method="post" action="'.$_SERVER['PHP_SELF'].'">';
print '<input type="hidden" name="token" value="'.newToken().'">';
print '<input type="hidden" name="action" value="search">';

print '<table class="border" style="width:600px">';

// Sélecteur d'année
print '<tr>';
print '<td class="titlefield">Année de validité</td>';
print '<td>';
print '<select name="yearid" class="flat">';
print '<option value="">-- Choisir une année --</option>';
foreach ($years as $y) {
	$sel = ($yearId === $y['rowid']) ? ' selected' : '';
	print '<option value="'.$y['rowid'].'"'.$sel.'>'.dol_escape_htmltag($y['label']).'</option>';
}
print '</select>';
print '</td>';
print '</tr>';

// Sélecteur de statut
print '<tr>';
print '<td class="titlefield">Statut de la facture</td>';
print '<td>';
print '<select name="status" class="flat">';
print '<option value="">-- Tous les statuts --</option>';
foreach ($statusLabels as $val => $lbl) {
	$sel = ($status === (string)$val) ? ' selected' : '';
	print '<option value="'.dol_escape_htmltag((string)$val).'"'.$sel.'>'.dol_escape_htmltag($lbl).'</option>';
}
print '</select>';
print '</td>';
print '</tr>';

// Sélecteur de service
print '<tr>';
print '<td class="titlefield">Service</td>';
print '<td>';
print '<select name="productid" class="flat">';
print '<option value="">-- Tous les services --</option>';
foreach ($products as $p) {
	$sel = ($productId === $p['rowid']) ? ' selected' : '';
	print '<option value="'.$p['rowid'].'"'.$sel.'>'.dol_escape_htmltag($p['ref'].' - '.$p['label']).'</option>';
}
print '</select>';
print '</td>';
print '</tr>';

print '</table>';

print '<br>';
print '<input type="submit" class="butAction" value="Rechercher">';
print '</form>';

// ---- Tableau des résultats ----
if ($action === 'search' && $yearId > 0) {
	$sql  = "SELECT f.rowid, f.ref, f.total_ttc, f.fk_statut,f.datef as invoice_date,";
	$sql .= " s.rowid AS socid, s.nom AS thirdparty_name, s.email AS thirdparty_email,";
	$sql .= " (SELECT GROUP_CONCAT(SUBSTRING(COALESCE(fd.description, ''), 1, 20) SEPARATOR ' | ')";
	$sql .= "  FROM ".MAIN_DB_PREFIX."facturedet AS fd";
	$sql .= "  WHERE fd.fk_facture = f.rowid) AS lines_summary";
	$sql .= " FROM ".MAIN_DB_PREFIX."facture AS f";
	$sql .= " INNER JOIN ".MAIN_DB_PREFIX."societe AS s ON s.rowid = f.fk_soc";
	$sql .= " INNER JOIN ".MAIN_DB_PREFIX."facture_extrafields AS fe ON fe.fk_object = f.rowid";
	$sql .= " WHERE fe.inv_culturalseason = ".(int)$yearId;
	$sql .= " AND f.entity IN (".getEntity('facture').")";
	if ($status !== '') {
		$sql .= " AND f.fk_statut = ".(int)$status;
	}
	if ($productId > 0) {
		$sql .= " AND EXISTS (SELECT 1 FROM ".MAIN_DB_PREFIX."facturedet AS fd2";
		$sql .= "  WHERE fd2.fk_facture = f.rowid AND fd2.fk_product = ".(int)$productId.")";
	}
	$sql .= " ORDER BY ".$sortfield." ".$sortorder;

	$res = $db->query($sql);

	if (!$res) {
		print '<div class="error">Erreur SQL : '.dol_escape_htmltag($db->lasterror()).'</div>';
	} else {
		$nb = $db->num_rows($res);
		print '<br><p><strong>'.$nb.'</strong> inscription(s) trouvée(s)</p>';

		print '<div class="div-table-responsive">';
		print '<table class="noborder centpercent">';
		print '<tr class="liste_titre">';
		print_liste_field_titre('Nom',         $_SERVER['PHP_SELF'], 's.nom',       '', '', '',               $sortfield, $sortorder);
		print_liste_field_titre('Email',        $_SERVER['PHP_SELF'], 's.email',     '', '', '',               $sortfield, $sortorder);
		print_liste_field_titre('Date',         $_SERVER['PHP_SELF'], 'f.datef',     '', '', '',               $sortfield, $sortorder);
		print_liste_field_titre('Montant TTC',  $_SERVER['PHP_SELF'], 'f.total_ttc', '', '', ' class="right"', $sortfield, $sortorder);
		print_liste_field_titre('Statut',       $_SERVER['PHP_SELF'], 'f.fk_statut', '', '', '',               $sortfield, $sortorder);
		print_liste_field_titre('Activités',    '');
		print '</tr>';

		while ($obj = $db->fetch_object($res)) {
			$statusLabel = isset($statusLabels[strval($obj->fk_statut)])
				? $statusLabels[strval($obj->fk_statut)]
				: (string)$obj->fk_statut;

			$personUrl = DOL_URL_ROOT.'/custom/dybccr/pagePerson.php?id='.((int) $obj->socid);

			print '<tr class="oddeven">';
			print '<td><a href="'.$personUrl.'">'.dol_escape_htmltag($obj->thirdparty_name).'</a></td>';
			print '<td>'.dol_escape_htmltag($obj->thirdparty_email).'</td>';
						print '<td>'.dol_print_date($obj->invoice_date,"day",false).'</td>';
			print '<td class="right">'.price($obj->total_ttc).'</td>';
			print '<td>'.dol_escape_htmltag($statusLabel).'</td>';

			
			print '<td class="small">'.dol_escape_htmltag($obj->lines_summary ?? '').'</td>';
			print '</tr>';
		}
		print '</table>';
		print '</div>';
	}
}

llxFooter();
$db->close();
