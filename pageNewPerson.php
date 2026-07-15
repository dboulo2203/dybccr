<?php
/* Copyright (C) 2026 CCR
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * \file    dybccr/pageNewPerson.php
 * \ingroup dybccr
 * \brief   Création d'un nouvel adhérent (tiers)
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

/**
 * @var Conf      $conf
 * @var DoliDB    $db
 * @var Translate $langs
 * @var User      $user
 */

$langs->loadLangs(array("dybccr@dybccr", "dict"));

// ---- Paramètres du formulaire ----
$action     = GETPOST('action', 'aZ09');
$civility   = GETPOST('civility', 'int');
$nom        = GETPOST('nom', 'alphanohtml');
$prenom     = GETPOST('prenom', 'alphanohtml');
$email      = GETPOST('email', 'alphanohtml');
$telephone  = GETPOST('telephone', 'alphanohtml');
$birthday   = GETPOST('birthday', 'alpha');
$address    = GETPOST('address', 'alphanohtml');
$zip        = GETPOST('zip', 'alphanohtml');
$town       = GETPOST('town', 'alphanohtml');

$errors = array();
$newId  = 0;

// ---- Traitement de la sauvegarde ----
if ($action === 'save') {
	if (trim($nom) === '') {
		$errors[] = 'Le nom est obligatoire.';
	} elseif (preg_match('/\s/', trim($nom))) {
		$errors[] = "Le nom ne doit pas contenir d'espace.";
	}
	if (trim($prenom) !== '' && preg_match('/\s/', trim($prenom))) {
		$errors[] = "Le prénom ne doit pas contenir d'espace.";
	}
	if (trim($email) === '') {
		$errors[] = "L'email est obligatoire.";
	}
	if ($civility <= 0) {
		$errors[] = 'La civilité est obligatoire.';
	}

	if (empty($errors)) {
		$sqlCheck  = "SELECT rowid FROM ".MAIN_DB_PREFIX."societe";
		$sqlCheck .= " WHERE email = '".$db->escape($email)."'";
		$sqlCheck .= " AND entity IN (".getEntity('societe').")";
		$resCheck  = $db->query($sqlCheck);
		if ($resCheck && $db->num_rows($resCheck) > 0) {
			$errors[] = 'Un tiers existe déjà avec cet email.';
		}
	}

	if (empty($errors)) {
		$soc = new Societe($db);
		$soc->name    = trim(trim($nom).' '.trim($prenom));
		$soc->client  = 1;
		$soc->email   = $email;
		$soc->phone   = $telephone;
		$soc->address = $address;
		$soc->zip     = $zip;
		$soc->town    = $town;
		if ($civility > 0) {
			$soc->array_options['options_thi_civility'] = $civility;
		}
		if (trim($birthday) !== '') {
			$soc->array_options['options_thi_birthday'] = $birthday;
		}

		$newId = $soc->create($user);
		if ($newId > 0) {
			header('Location: pagePerson.php?id='.$newId);
			exit;
		}
		$errors[] = 'Erreur lors de la création du tiers : '.$soc->error;
	}
}

// ---- Chargement des civilités ----
$civilities = array();
$sqlCiv = "SELECT rowid, code, label FROM ".MAIN_DB_PREFIX."c_civility WHERE active = 1 ORDER BY label ASC";
$resCiv = $db->query($sqlCiv);
if ($resCiv) {
	while ($obj = $db->fetch_object($resCiv)) {
		// Si une traduction existe, on l'utilise, sinon on garde le libellé brut (même logique que Form::select_civility)
		$transKey = 'Civility'.$obj->code;
		$civLabel = ($langs->trans($transKey) !== $transKey) ? $langs->trans($transKey) : $obj->label;
		$civilities[] = array('rowid' => (int) $obj->rowid, 'label' => $civLabel);
	}
}

// ============================================================
// VUE
// ============================================================

llxHeader('', 'Nouvel adhérent', '', '', 0, 0, '', '', '', 'mod-dybccr page-newperson');

print load_fiche_titre('Nouvel adhérent', '', 'dybccr.png@dybccr');

if (!empty($errors)) {
	foreach ($errors as $err) {
		print '<div class="error">'.dol_escape_htmltag($err).'</div>';
	}
}

print '<form method="post" action="'.$_SERVER['PHP_SELF'].'">';
print '<input type="hidden" name="token" value="'.newToken().'">';
print '<input type="hidden" name="action" value="save">';

print '<div class="fichecenter" style="border:1px solid #ccc; padding:10px; border-radius:3px;">';
print '<table class="border centpercent">';

print '<tr>';
print '<td style="white-space:nowrap; width:1%; padding-right:6px">Nom <span class="star">*</span></td>';
print '<td style="padding-left:2px"><input type="text" name="nom" class="flat" size="30" value="'.dol_escape_htmltag($nom).'">';
print '<br><span class="small opacitymedium">pas d\'espace, remplacer par -</span>';
print '</td>';
print '<td style="white-space:nowrap; width:1%; padding-right:6px">Date naissance</td>';
print '<td style="padding-left:2px"><input type="date" name="birthday" class="flat" value="'.dol_escape_htmltag($birthday).'"></td>';
print '</tr>';

print '<tr>';
print '<td style="white-space:nowrap; width:1%; padding-right:6px">Prénom</td>';
print '<td style="padding-left:2px"><input type="text" name="prenom" class="flat" size="30" value="'.dol_escape_htmltag($prenom).'">';
print '<br><span class="small opacitymedium">pas d\'espace, remplacer par -</span>';
print '</td>';
print '<td style="white-space:nowrap; width:1%; padding-right:6px">Téléphone</td>';
print '<td style="padding-left:2px"><input type="text" name="telephone" class="flat" size="30" value="'.dol_escape_htmltag($telephone).'"></td>';
print '</tr>';

print '<tr>';
print '<td style="white-space:nowrap; width:1%; padding-right:6px">Email <span class="star">*</span></td>';
print '<td style="padding-left:2px"><input type="text" name="email" class="flat" size="30" value="'.dol_escape_htmltag($email).'"></td>';
print '<td style="white-space:nowrap; width:1%; padding-right:6px">Adresse</td>';
print '<td style="padding-left:2px"><input type="text" name="address" class="flat" size="30" value="'.dol_escape_htmltag($address).'"></td>';
print '</tr>';

print '<tr>';
print '<td style="white-space:nowrap; width:1%; padding-right:6px">Vous êtes <span class="star">*</span></td>';
print '<td style="padding-left:2px">';
print '<select name="civility" class="flat">';
print '<option value="">-- Choisir --</option>';
foreach ($civilities as $c) {
	$sel = ($civility === $c['rowid']) ? ' selected' : '';
	print '<option value="'.$c['rowid'].'"'.$sel.'>'.dol_escape_htmltag($c['label']).'</option>';
}
print '</select>';
print '</td>';
print '<td style="white-space:nowrap; width:1%; padding-right:6px">Ville</td>';
print '<td style="padding-left:2px"><input type="text" name="town" class="flat" size="30" value="'.dol_escape_htmltag($town).'"></td>';
print '</tr>';

print '<tr>';
print '<td></td>';
print '<td></td>';
print '<td style="white-space:nowrap; width:1%; padding-right:6px">Code postal</td>';
print '<td style="padding-left:2px"><input type="text" name="zip" class="flat" size="30" value="'.dol_escape_htmltag($zip).'"></td>';
print '</tr>';

print '</table>';
print '</div>';

print '<br>';
print '<input type="submit" class="butAction" value="Sauver">';
print '</form>';

llxFooter();
$db->close();
