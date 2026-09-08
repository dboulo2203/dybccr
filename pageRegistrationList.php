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
$activityTypeId = (int)GETPOST('activitytypeid', 'int');
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
	$_SESSION['registrationlist_yearid']         = $yearId;
	$_SESSION['registrationlist_status']         = $status;
	$_SESSION['registrationlist_productid']      = $productId;
	$_SESSION['registrationlist_activitytypeid'] = $activityTypeId;
	$_SESSION['registrationlist_searched']       = true;
} else {
	$yearId         = isset($_SESSION['registrationlist_yearid'])         ? (int)$_SESSION['registrationlist_yearid']         : 0;
	$status         = isset($_SESSION['registrationlist_status'])         ? $_SESSION['registrationlist_status']              : '';
	$productId      = isset($_SESSION['registrationlist_productid'])      ? (int)$_SESSION['registrationlist_productid']      : 0;
	$activityTypeId = isset($_SESSION['registrationlist_activitytypeid']) ? (int)$_SESSION['registrationlist_activitytypeid'] : 0;
	if (!empty($_SESSION['registrationlist_searched'])) { $action = 'search'; }
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

// ---- Chargement des types d'activité ----
$activityTypes = array();
$sqlActivityTypes = "SELECT rowid, label FROM ".MAIN_DB_PREFIX."c_typeactivity WHERE active = 1 ORDER BY label ASC";
$resActivityTypes = $db->query($sqlActivityTypes);
if ($resActivityTypes) {
	while ($obj = $db->fetch_object($resActivityTypes)) {
		$activityTypes[] = array('rowid' => (int)$obj->rowid, 'label' => $obj->label);
	}
}

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

llxHeader('', 'Suivi des inscriptions', '', '', 0, 0, $arrayofjs, $arrayofcss, '', 'mod-dybccr page-registrationlist');

print load_fiche_titre('Suivi des inscriptions', '', 'dybccr.png@dybccr');

// ---- Formulaire de recherche ----
print '<div style="border:1px solid #ccc;border-radius:4px;padding:10px 15px;margin-bottom:10px;">';
print '<form method="post" action="'.$_SERVER['PHP_SELF'].'">';
print '<input type="hidden" name="token" value="'.newToken().'">';
print '<input type="hidden" name="action" value="search">';

print '<table class="border" style="width:600px">';

// Sélecteur d'année
print '<tr>';
print '<td class="titlefield">Année de validité</td>';
print '<td>';
print '<select name="yearid" class="flat">';
print '<option value="">Toutes les années</option>';
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

// Sélecteur de type d'activité
print '<tr>';
print '<td class="titlefield">Type d\'activité</td>';
print '<td>';
print '<select name="activitytypeid" class="flat">';
print '<option value="">-- Tous les types d\'activité --</option>';
foreach ($activityTypes as $at) {
	$sel = ($activityTypeId === $at['rowid']) ? ' selected' : '';
	print '<option value="'.$at['rowid'].'"'.$sel.'>'.dol_escape_htmltag($at['label']).'</option>';
}
print '</select>';
print '</td>';
print '</tr>';

print '</table>';

print '<br>';
print '<input type="submit" class="butAction" value="Rechercher">';
print '</form>';
print '</div>';

// ---- Tableau des résultats ----
if ($action === 'search') {
	$sql  = "SELECT f.rowid, f.ref, f.total_ttc, f.fk_statut,f.datef as invoice_date,";
	$sql .= " s.rowid AS socid, s.nom AS thirdparty_name, s.email AS thirdparty_email,";
	$sql .= " (SELECT GROUP_CONCAT(SUBSTRING(COALESCE(fd.description, ''), 1, 20) SEPARATOR ' | ')";
	$sql .= "  FROM ".MAIN_DB_PREFIX."facturedet AS fd";
	$sql .= "  WHERE fd.fk_facture = f.rowid) AS lines_summary";
	$sql .= " FROM ".MAIN_DB_PREFIX."facture AS f";
	$sql .= " INNER JOIN ".MAIN_DB_PREFIX."societe AS s ON s.rowid = f.fk_soc";
	$sql .= " LEFT JOIN ".MAIN_DB_PREFIX."facture_extrafields AS fe ON fe.fk_object = f.rowid";
	$sql .= " WHERE f.entity IN (".getEntity('facture').")";
	if ($yearId > 0) {
		$sql .= " AND fe.inv_culturalseason = ".(int)$yearId;
	}
	if ($status !== '') {
		$sql .= " AND f.fk_statut = ".(int)$status;
	}
	if ($productId > 0) {
		$sql .= " AND EXISTS (SELECT 1 FROM ".MAIN_DB_PREFIX."facturedet AS fd2";
		$sql .= "  WHERE fd2.fk_facture = f.rowid AND fd2.fk_product = ".(int)$productId.")";
	}
	if ($activityTypeId > 0) {
		$sql .= " AND EXISTS (SELECT 1 FROM ".MAIN_DB_PREFIX."facturedet AS fd3";
		$sql .= "  INNER JOIN ".MAIN_DB_PREFIX."product_extrafields AS pe3 ON pe3.fk_object = fd3.fk_product";
		$sql .= "  WHERE fd3.fk_facture = f.rowid AND pe3.type_activite = ".(int)$activityTypeId.")";
	}
	$sql .= " ORDER BY ".$sortfield." ".$sortorder;

	$res = $db->query($sql);

	if (!$res) {
		print '<div class="error">Erreur SQL : '.dol_escape_htmltag($db->lasterror()).'</div>';
	} else {
		$nb = $db->num_rows($res);

		print '<br>';
		print '<div class="fichecenter" style="border:1px solid #ccc; border-radius:3px; overflow:hidden;">';

		print '<div style="background-color:#f0f0f0; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">';
		print '<span style="font-weight:bold;"><strong>'.$nb.'</strong> inscription(s) trouvée(s)</span>';
		print '<div class="dropdown">';
		print '<button type="button" class="btn btn-sm btn-link p-0" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">';
		print '<i class="bi bi-three-dots-vertical"></i>';
		print '</button>';
		print '<ul class="dropdown-menu dropdown-menu-end">';
		print '<li><a class="dropdown-item" href="#" id="registrationlist-export-csv">Copier la liste en CSV</a></li>';
		print '<li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#dyb-brevo-modal">Créer une liste Brevo</a></li>';
		print '</ul>';
		print '</div>';
		print '</div>';

		print '<div style="padding:10px;">';
		print '<div class="div-table-responsive">';
		print '<table class="noborder centpercent" id="registrationlist-table">';
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
		print '</div>';
		print '</div>';

		print '<script nonce="'.getNonce().'">';
		print <<<JS
(function () {
	var btn = document.getElementById('registrationlist-export-csv');
	var table = document.getElementById('registrationlist-table');
	if (!btn || !table) return;

	function csvEscape(value) {
		var text = String(value === null || value === undefined ? '' : value).replace(/\s+/g, ' ').trim();
		return '"' + text.replace(/"/g, '""') + '"';
	}

	function fallbackCopy(text) {
		var tmp = document.createElement('textarea');
		tmp.value = text;
		document.body.appendChild(tmp);
		tmp.select();
		try { document.execCommand('copy'); } catch (err) { /* ignore */ }
		document.body.removeChild(tmp);
	}

	btn.addEventListener('click', function (e) {
		e.preventDefault();

		var headerCells = table.querySelectorAll('tr.liste_titre th, tr.liste_titre td');
		var lines = [];
		var headerVals = [];
		for (var h = 0; h < headerCells.length; h++) {
			headerVals.push(csvEscape(headerCells[h].textContent));
		}
		lines.push(headerVals.join(';'));

		var rows = table.querySelectorAll('tr.oddeven');
		for (var i = 0; i < rows.length; i++) {
			var cells = rows[i].querySelectorAll('td');
			var vals = [];
			for (var j = 0; j < cells.length; j++) {
				vals.push(csvEscape(cells[j].textContent));
			}
			lines.push(vals.join(';'));
		}

		var csv = lines.join('\\r\\n');

		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(csv).catch(function () { fallbackCopy(csv); });
		} else {
			fallbackCopy(csv);
		}

		var original = btn.textContent;
		btn.textContent = 'Copié dans le presse-papier !';
		setTimeout(function () { btn.textContent = original; }, 2000);
	});
})();
JS;
		print '</script>';

		// ---- Modale de création de liste Brevo ----
		print '<div class="modal fade" id="dyb-brevo-modal" tabindex="-1" aria-hidden="true">';
		print '<div class="modal-dialog">';
		print '<div class="modal-content">';
		print '<div class="modal-header">';
		print '<span class="modal-title fs-5">Créer une liste Brevo</span>';
		print '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
		print '</div>';
		print '<div class="modal-body">';
		print '<div id="dyb-brevo-feedback"></div>';
		print '<p class="text-muted small">La liste sera créée dans Brevo à partir des emails (dédoublonnés) des inscriptions actuellement filtrées.</p>';
		print '<div class="mb-3">';
		print '<label class="form-label">Nom de la liste</label>';
		print '<input type="text" class="form-control" id="dyb-brevo-listname" placeholder="Ex. Adhérents 2025-2026">';
		print '</div>';
		print '</div>';
		print '<div class="modal-footer">';
		print '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>';
		print '<button type="button" class="btn btn-primary" id="dyb-brevo-submit">Créer la liste dans Brevo</button>';
		print '</div>';
		print '</div>';
		print '</div>';
		print '</div>';

		$brevoEndpointUrl = DOL_URL_ROOT.'/custom/dybccr/pageBrevoCreateList.php';
		$csrfToken = newToken();

		print '<script nonce="'.getNonce().'">';
		print <<<JS
(function () {
	var listInput = document.getElementById('dyb-brevo-listname');
	var feedback  = document.getElementById('dyb-brevo-feedback');
	var submitBtn = document.getElementById('dyb-brevo-submit');
	if (!listInput || !feedback || !submitBtn) return;

	function escapeHtml(str) {
		var div = document.createElement('div');
		div.textContent = String(str);
		return div.innerHTML;
	}

	submitBtn.addEventListener('click', async function () {
		var listName = listInput.value.trim();
		feedback.innerHTML = '';

		if (listName === '') {
			feedback.innerHTML = '<div class="error">Veuillez saisir un nom de liste.</div>';
			return;
		}

		submitBtn.disabled = true;
		var originalText = submitBtn.textContent;
		submitBtn.textContent = 'Création en cours...';

		var body = new URLSearchParams();
		body.set('token', '{$csrfToken}');
		body.set('listname', listName);

		try {
			var response = await fetch('{$brevoEndpointUrl}', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: body.toString()
			});
			var data = await response.json();

			if (data && data.success) {
				var msg = 'Liste "' + escapeHtml(data.listName) + '" créée dans Brevo : ' +
					data.nbAdded + ' / ' + data.nbEmails + ' email(s) ajouté(s).';
				if (data.nbErrors > 0) {
					msg += ' (' + data.nbErrors + ' erreur(s) lors de l\\'ajout)';
				}
				feedback.innerHTML = '<div class="ok">' + msg + '</div>';
			} else {
				var errMsg = (data && data.error) ? data.error : 'Erreur inconnue lors de la création de la liste.';
				feedback.innerHTML = '<div class="error">' + escapeHtml(errMsg) + '</div>';
			}
		} catch (err) {
			feedback.innerHTML = '<div class="error">Erreur réseau lors de l\\'appel au serveur.</div>';
		}

		submitBtn.disabled = false;
		submitBtn.textContent = originalText;
	});
})();
JS;
		print '</script>';
	}
}

llxFooter();
$db->close();
