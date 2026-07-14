<?php
/* Copyright (C) 2026 CCR
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * \file    dybccr/pagePerson.php
 * \ingroup dybccr
 * \brief   Fiche d'un adhérent (tiers) : identité et factures d'inscription
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

// ---- Statuts de facture ----
$statusLabels = array(
	'0'  => 'Brouillon',
	'1'  => 'Validée',
	'2'  => 'Payée',
	'-1' => 'Annulée',
);

// ---- Paramètres ----
$socid = GETPOST('id', 'int');

// ============================================================
// VUE
// ============================================================

$arrayofcss = array(
	'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
	'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css',
);
$arrayofjs = array(
	'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
);

llxHeader('', 'Adhérent', '', '', 0, 0, $arrayofjs, $arrayofcss, '', 'mod-dybccr page-person');

print load_fiche_titre('Adhérent', '', 'dybccr.png@dybccr');

if ($socid <= 0) {
	print '<div class="error">Adhérent non spécifié.</div>';
	llxFooter();
	$db->close();
	exit;
}

// ---- Chargement de l'identité ----
$sqlPerson  = "SELECT s.rowid, s.nom, s.email, s.phone, s.address, s.zip, s.town,";
$sqlPerson .= " ef.thi_birthday, cv.label AS civility_label";
$sqlPerson .= " FROM ".MAIN_DB_PREFIX."societe AS s";
$sqlPerson .= " LEFT JOIN ".MAIN_DB_PREFIX."societe_extrafields AS ef ON ef.fk_object = s.rowid";
$sqlPerson .= " LEFT JOIN ".MAIN_DB_PREFIX."c_civility AS cv ON cv.rowid = ef.thi_civility";
$sqlPerson .= " WHERE s.rowid = ".((int) $socid);
$sqlPerson .= " AND s.entity IN (".getEntity('societe').")";

$resPerson = $db->query($sqlPerson);
$person = ($resPerson && $db->num_rows($resPerson) > 0) ? $db->fetch_object($resPerson) : null;

if (!$person) {
	print '<div class="error">Adhérent introuvable.</div>';
	llxFooter();
	$db->close();
	exit;
}

// ---- Zone identité ----
print '<div class="fichecenter" style="border:1px solid #ccc; padding:10px; border-radius:3px;">';
print '<div class="underbanner clearboth"></div>';
print '<table class="border centpercent">';

print '<tr>';
print '<td style="font-weight:bold; white-space:nowrap; width:1%; padding-right:6px">Vous êtes</td>';
print '<td style="padding-left:2px">'.dol_escape_htmltag($person->civility_label).'</td>';
print '<td style="font-weight:bold; white-space:nowrap; width:1%; padding-right:6px">Date naissance</td>';
print '<td style="padding-left:2px">'.($person->thi_birthday ? dol_print_date($db->jdate($person->thi_birthday), 'day') : '').'</td>';
print '</tr>';

print '<tr>';
print '<td style="font-weight:bold; white-space:nowrap; width:1%; padding-right:6px">Nom</td>';
print '<td style="padding-left:2px">'.dol_escape_htmltag($person->nom).'</td>';
print '<td style="font-weight:bold; white-space:nowrap; width:1%; padding-right:6px">Adresse</td>';
print '<td style="padding-left:2px">'.dol_escape_htmltag($person->address).'</td>';
print '</tr>';

print '<tr>';
print '<td style="font-weight:bold; white-space:nowrap; width:1%; padding-right:6px">Email</td>';
print '<td style="padding-left:2px">'.dol_escape_htmltag($person->email).'</td>';
print '<td style="font-weight:bold; white-space:nowrap; width:1%; padding-right:6px">Code postal</td>';
print '<td style="padding-left:2px">'.dol_escape_htmltag($person->zip).'</td>';
print '</tr>';

print '<tr>';
print '<td style="font-weight:bold; white-space:nowrap; width:1%; padding-right:6px">Téléphone</td>';
print '<td style="padding-left:2px">'.dol_escape_htmltag($person->phone).'</td>';
print '<td style="font-weight:bold; white-space:nowrap; width:1%; padding-right:6px">Ville</td>';
print '<td style="padding-left:2px">'.dol_escape_htmltag($person->town).'</td>';
print '</tr>';

print '</table>';
print '</div>';

// ---- Zone factures d'inscription ----
print load_fiche_titre("Factures d'inscription", '', '');

$sqlInv  = "SELECT f.rowid, f.ref, f.datef, f.total_ttc, f.fk_statut, cy.label AS year_label";
$sqlInv .= " FROM ".MAIN_DB_PREFIX."facture AS f";
$sqlInv .= " LEFT JOIN ".MAIN_DB_PREFIX."facture_extrafields AS fe ON fe.fk_object = f.rowid";
$sqlInv .= " LEFT JOIN ".MAIN_DB_PREFIX."c_yearexercice AS cy ON cy.rowid = fe.inv_culturalseason";
$sqlInv .= " WHERE f.fk_soc = ".((int) $socid);
$sqlInv .= " AND f.entity IN (".getEntity('facture').")";
$sqlInv .= " ORDER BY f.datef DESC";

$resInv = $db->query($sqlInv);

if (!$resInv) {
	print '<div class="error">Erreur SQL : '.dol_escape_htmltag($db->lasterror()).'</div>';
} else {
	print '<div class="div-table-responsive">';
	print '<table class="noborder centpercent">';
	print '<tr class="liste_titre">';
	print '<td>Année</td>';
	print '<td>Référence</td>';
	print '<td>Date</td>';
	print '<td class="right">Montant TTC</td>';
	print '<td>Statut</td>';
	print '<td></td>';
	print '</tr>';

	while ($invoice = $db->fetch_object($resInv)) {
		$statusLabel = isset($statusLabels[strval($invoice->fk_statut)])
			? $statusLabels[strval($invoice->fk_statut)]
			: (string) $invoice->fk_statut;
		$isEditable = in_array((string) $invoice->fk_statut, array('0', '1'), true);

		print '<tr class="oddeven" style="font-weight:bold">';
		print '<td>'.dol_escape_htmltag($invoice->year_label).'</td>';
		print '<td>'.dol_escape_htmltag($invoice->ref).'</td>';
		print '<td>'.dol_print_date($db->jdate($invoice->datef), 'day').'</td>';
		print '<td class="right">'.price($invoice->total_ttc).'</td>';
		print '<td>'.dol_escape_htmltag($statusLabel).'</td>';
		print '<td class="right">';
		if ($isEditable) {
			print '<div class="dropdown">';
			print '<button type="button" class="btn btn-sm btn-link p-0" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">';
			print '<i class="bi bi-three-dots-vertical"></i>';
			print '</button>';
			print '<ul class="dropdown-menu dropdown-menu-end">';
			print '<li><a class="dropdown-item dyb-edit-invoice" href="#" data-invoice-id="'.((int) $invoice->rowid).'">Éditer</a></li>';
			print '</ul>';
			print '</div>';
		}
		print '</td>';
		print '</tr>';

		$sqlLines  = "SELECT fd.label, fd.description, fd.total_ht, p.ref AS product_ref";
		$sqlLines .= " FROM ".MAIN_DB_PREFIX."facturedet AS fd";
		$sqlLines .= " LEFT JOIN ".MAIN_DB_PREFIX."product AS p ON p.rowid = fd.fk_product";
		$sqlLines .= " WHERE fd.fk_facture = ".((int) $invoice->rowid);
		$sqlLines .= " ORDER BY fd.rowid ASC";

		$resLines = $db->query($sqlLines);
		if ($resLines) {
			while ($line = $db->fetch_object($resLines)) {
				print '<tr class="oddeven">';
				print '<td></td>';
				print '<td>'.dol_escape_htmltag($line->product_ref).'</td>';
				print '<td>'.dol_escape_htmltag($line->description).'</td>';
				print '<td class="right">'.price($line->total_ht).'</td>';
				print '<td></td>';
				print '<td></td>';
				print '</tr>';
			}
		}
	}

	print '</table>';
	print '</div>';
}

// ---- Édition de facture (modal réutilisé depuis js/src/views/person/actionEditInvoice) ----
?>
<script type="module" nonce="<?php echo getNonce(); ?>">
	import { displayActionEditInvoice } from '<?php echo DOL_URL_ROOT; ?>/custom/dybccr/js/src/views/person/actionEditInvoice/actionEditInvoice.js';
	import { loadProducts } from '<?php echo DOL_URL_ROOT; ?>/custom/dybccr/js/src/shared/appWSServices/dolibarrProductServices.js';
	import { loadPaymentTypesTable, loadYearExerciceTable } from '<?php echo DOL_URL_ROOT; ?>/custom/dybccr/js/src/shared/appWSServices/dolibarrListsServices.js';
	import { getInvoice } from '<?php echo DOL_URL_ROOT; ?>/custom/dybccr/js/src/shared/appWSServices/dolibarrInvoicesServices.js';

	sessionStorage.setItem('configuration', JSON.stringify({
		wsUrlformel: '<?php echo DOL_URL_ROOT; ?>/api/index.php/',
	}));

	const customer = { name: <?php echo json_encode($person->nom); ?> };
	let referenceDataLoaded = false;

	async function ensureReferenceData() {
		if (referenceDataLoaded) return;
		await Promise.all([loadProducts(), loadPaymentTypesTable(), loadYearExerciceTable()]);
		referenceDataLoaded = true;
	}

	document.querySelectorAll('.dyb-edit-invoice').forEach((link) => {
		link.addEventListener('click', async (e) => {
			e.preventDefault();
			try {
				await ensureReferenceData();
				const invoice = await getInvoice(link.dataset.invoiceId);
				await displayActionEditInvoice(invoice, customer, async () => {
					location.reload();
				});
			} catch (error) {
				alert(error.message || error);
			}
		});
	});
</script>
<?php

llxFooter();
$db->close();
