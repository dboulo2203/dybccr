<?php
/* Copyright (C) 2026 CCR
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * \file    dybccr/pageCreateInvoice.php
 * \ingroup dybccr
 * \brief   Crée une facture brouillon vide pour un adhérent puis redirige vers pageEditInvoice.php.
 *          Exécuté en session : la facture est attribuée à l'utilisateur connecté.
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
 * @var DoliDB    $db
 * @var Translate $langs
 * @var User      $user
 */

require_once DOL_DOCUMENT_ROOT.'/compta/facture/class/facture.class.php';
require_once DOL_DOCUMENT_ROOT.'/societe/class/societe.class.php';

$langs->loadLangs(array('bills', 'dybccr@dybccr'));

$socid  = GETPOSTINT('socid');
$action = GETPOST('action', 'aZ09');

if (!$user->hasRight('facture', 'creer')) {
	accessforbidden();
}

$thirdparty = new Societe($db);
if ($socid <= 0 || $thirdparty->fetch($socid) <= 0) {
	llxHeader('', 'Créer une facture');
	print '<div class="error">Adhérent introuvable.</div>';
	llxFooter();
	$db->close();
	exit;
}
if (!in_array((string) $thirdparty->entity, explode(',', getEntity('societe')))) {
	accessforbidden();
}

$backurl = DOL_URL_ROOT.'/custom/dybccr/pagePerson.php?id='.((int) $socid);

// ---- Création (lien avec token) ----
if ($action === 'create') {
	$object = new Facture($db);
	$object->socid = $socid;
	$object->date  = dol_now();
	$object->type  = Facture::TYPE_STANDARD;

	$newid = $object->create($user);
	if ($newid > 0) {
		setEventMessages('Facture brouillon '.$object->ref.' créée', null, 'mesgs');
		header('Location: '.DOL_URL_ROOT.'/custom/dybccr/pageEditInvoice.php?id='.((int) $newid));
		exit;
	}

	llxHeader('', 'Créer une facture');
	print '<div class="error">Erreur lors de la création : '.dol_escape_htmltag($object->error.' '.implode(', ', $object->errors)).'</div>';
	print '<a class="butAction" href="'.$backurl.'">Retour</a>';
	llxFooter();
	$db->close();
	exit;
}

// ---- Confirmation ----
llxHeader('', 'Créer une facture');
print load_fiche_titre('Créer une facture d\'inscription', '', 'bill');
print '<div class="fichecenter"><div class="underbanner clearboth"></div>';
print '<br>Créer une facture brouillon vide pour <strong>'.dol_escape_htmltag($thirdparty->name).'</strong> ?<br><br>';
print '<a class="butAction" href="'.$_SERVER['PHP_SELF'].'?socid='.((int) $socid).'&action=create&token='.newToken().'">Créer et compléter</a> ';
print '<a class="butActionRefused" href="'.$backurl.'">Annuler</a>';
print '</div>';
llxFooter();
$db->close();
