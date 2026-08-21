<?php
/* Copyright (C) 2026 CCR
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * \file    dybccr/pageSearchPerson.php
 * \ingroup dybccr
 * \brief   Recherche d'adhérent (tiers)
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
$action       = GETPOST('action', 'aZ09');
$searchType   = GETPOST('searchtype', 'aZ09');
$searchValue  = GETPOST('searchvalue', 'alphanohtml');

$allowedSearchTypes = array('nom', 'email', 'telephone', 'adresse', 'facture');
if (!in_array($searchType, $allowedSearchTypes, true)) {
	$searchType = 'nom';
}

$searchTypeLabels = array(
	'nom'       => 'Nom',
	'email'     => 'Email',
	'telephone' => 'Téléphone',
	'adresse'   => 'Adresse',
	'facture'   => 'Facture',
);

$searchColumns = array(
	'nom'       => 's.nom',
	'email'     => 's.email',
	'telephone' => 's.phone',
	'adresse'   => 's.address',
);

// ---- Recherche par ID de facture : redirige directement vers le tiers titulaire ----
$searchError = '';

if ($action === 'search' && $searchType === 'facture' && $searchValue !== '') {
	$invoiceId = (int) $searchValue;
	$socid = 0;

	if ($invoiceId > 0) {
		$sqlInvoice  = "SELECT fk_soc FROM ".MAIN_DB_PREFIX."facture";
		$sqlInvoice .= " WHERE rowid = ".$invoiceId;
		$sqlInvoice .= " AND entity IN (".getEntity('facture').")";
		$resInvoice = $db->query($sqlInvoice);
		if ($resInvoice && $db->num_rows($resInvoice) > 0) {
			$socid = (int) $db->fetch_object($resInvoice)->fk_soc;
		}
	}

	if ($socid > 0) {
		header('Location: '.DOL_URL_ROOT.'/custom/dybccr/pagePerson.php?id='.$socid);
		exit;
	}

	$searchError = 'Aucune facture trouvée avec l\'identifiant "'.$searchValue.'".';
}

// ============================================================
// VUE
// ============================================================

llxHeader('', 'Recherche adhérent', '', '', 0, 0, '', '', '', 'mod-dybccr page-searchperson');

print load_fiche_titre('Recherche adhérent', '', 'dybccr.png@dybccr');

// ---- Formulaire de recherche ----
print '<div style="border:1px solid #ccc;border-radius:4px;padding:10px 15px;margin-bottom:10px;">';
print '<form method="post" action="'.$_SERVER['PHP_SELF'].'">';
print '<input type="hidden" name="token" value="'.newToken().'">';
print '<input type="hidden" name="action" value="search">';

print '<table class="border" style="width:600px">';

print '<tr>';
print '<td class="titlefield">Type de recherche</td>';
print '<td>';
print '<select name="searchtype" class="flat">';
foreach ($searchTypeLabels as $val => $lbl) {
	$sel = ($searchType === $val) ? ' selected' : '';
	print '<option value="'.dol_escape_htmltag($val).'"'.$sel.'>'.dol_escape_htmltag($lbl).'</option>';
}
print '</select>';
print '</td>';
print '</tr>';

print '<tr>';
print '<td class="titlefield">Recherche</td>';
print '<td><input type="text" name="searchvalue" class="flat" size="40" value="'.dol_escape_htmltag($searchValue).'"></td>';
print '</tr>';

print '</table>';

print '<br>';
print '<input type="submit" class="butAction" value="Chercher">';
print '</form>';
print '</div>';

// ---- Résultats ----
if ($searchError !== '') {
	print '<div class="error">'.dol_escape_htmltag($searchError).'</div>';
} elseif ($action === 'search' && $searchType !== 'facture' && $searchValue !== '') {
	$searchColumn = $searchColumns[$searchType];

	$sql  = "SELECT s.rowid, s.nom, s.email, s.phone, s.town";
	$sql .= " FROM ".MAIN_DB_PREFIX."societe AS s";
	$sql .= " WHERE s.entity IN (".getEntity('societe').")";
	$sql .= " AND ".$searchColumn." LIKE '%".$db->escape($searchValue)."%'";
	$sql .= " ORDER BY s.nom ASC";

	$sqlRes = $db->query($sql);

	if (!$sqlRes) {
		print '<div class="error">Erreur SQL : '.dol_escape_htmltag($db->lasterror()).'</div>';
	} else {
		$nb = $db->num_rows($sqlRes);
		print '<br><p><strong>'.$nb.'</strong> résultat(s) trouvé(s)</p>';

		print '<div class="div-table-responsive">';
		print '<table class="noborder centpercent">';
		print '<tr class="liste_titre">';
		print '<td>Nom</td>';
		print '<td>Email</td>';
		print '<td>Téléphone</td>';
		print '<td>Ville</td>';
		print '</tr>';

		while ($obj = $db->fetch_object($sqlRes)) {
			$personUrl = DOL_URL_ROOT.'/custom/dybccr/pagePerson.php?id='.((int) $obj->rowid);

			print '<tr class="oddeven">';
			print '<td><a href="'.$personUrl.'">'.dol_escape_htmltag($obj->nom).'</a></td>';
			print '<td>'.dol_escape_htmltag($obj->email).'</td>';
			print '<td>'.dol_escape_htmltag($obj->phone).'</td>';
			print '<td>'.dol_escape_htmltag($obj->town).'</td>';
			print '</tr>';
		}
		print '</table>';
		print '</div>';
	}
}

llxFooter();
$db->close();
