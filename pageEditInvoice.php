<?php
/* Copyright (C) 2026 CCR
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * \file    dybccr/pageEditInvoice.php
 * \ingroup dybccr
 * \brief   Modifier une facture d'inscription (saison, lignes, paiements) — page PHP en session.
 *          L'enregistrement (DybccrInvoice::saveFull) est attribué à l'utilisateur connecté.
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

require_once DOL_DOCUMENT_ROOT.'/compta/facture/class/facture.class.php';
require_once DOL_DOCUMENT_ROOT.'/custom/dybccr/class/dybccrinvoice.class.php';

$langs->loadLangs(array('bills', 'dybccr@dybccr'));

// ---- Paramètres ----
$id     = GETPOSTINT('id');
$action = GETPOST('action', 'aZ09');

// ---- Contrôle d'accès ----
if (!$user->hasRight('facture', 'creer')) {
	accessforbidden();
}

// ---- Chargement de la facture ----
$object = new Facture($db);
if ($id <= 0 || $object->fetch($id) <= 0) {
	llxHeader('', 'Modifier facture');
	print '<div class="error">Facture introuvable.</div>';
	llxFooter();
	$db->close();
	exit;
}
if (!in_array((string) $object->entity, explode(',', getEntity('facture')))) {
	accessforbidden();
}
$object->fetch_thirdparty();
$object->fetch_optionals();

$backurl = DOL_URL_ROOT.'/custom/dybccr/pagePerson.php?id='.((int) $object->socid);

// Seule une facture brouillon ou validée est modifiable ici
if (!in_array((int) $object->status, array(Facture::STATUS_DRAFT, Facture::STATUS_VALIDATED), true)) {
	llxHeader('', 'Modifier facture');
	print '<div class="error">Cette facture ne peut plus être modifiée (statut : '.$object->getLibStatut(0).').</div>';
	print '<a class="butAction" href="'.$backurl.'">Retour</a>';
	llxFooter();
	$db->close();
	exit;
}

$errormsg            = '';
$reloadFromPost      = false;
$postLinesForForm    = array();
$postPaymentsForForm = array();

// ============================================================
// ENREGISTREMENT
// ============================================================
if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
	$season = GETPOST('culturalseason', 'alphanohtml');

	$lineIds       = GETPOST('line_id', 'array');
	$lineProducts  = GETPOST('line_fk_product', 'array');
	$lineDescs     = GETPOST('line_desc', 'array:restricthtml');
	$lineQtys      = GETPOST('line_qty', 'array');
	$lineSubprices = GETPOST('line_subprice', 'array');

	$lines = array();
	foreach ($lineIds as $k => $lid) {
		$lines[] = array(
			'id'         => (int) $lid,
			'fk_product' => isset($lineProducts[$k]) ? (int) $lineProducts[$k] : 0,
			'desc'       => isset($lineDescs[$k]) ? (string) $lineDescs[$k] : '',
			'qty'        => isset($lineQtys[$k]) ? $lineQtys[$k] : 1,
			'subprice'   => isset($lineSubprices[$k]) ? $lineSubprices[$k] : 0,
		);
	}

	$payTypeIds  = GETPOST('payment_type_id', 'array');
	$payAmounts  = GETPOST('payment_amount', 'array');
	$payIssuers  = GETPOST('payment_issuer', 'array');

	$payments = array();
	foreach ($payTypeIds as $k => $ptid) {
		$amount = isset($payAmounts[$k]) ? (float) price2num($payAmounts[$k]) : 0;
		if ($amount <= 0) {
			continue;
		}
		$payments[] = array(
			'payment_type_id' => (int) $ptid,
			'amount'          => $amount,
			'issuer'          => isset($payIssuers[$k]) ? (string) $payIssuers[$k] : '',
		);
	}

	try {
		$tool = new DybccrInvoice($db);
		$tool->saveFull($user, array(
			'id'             => $id,
			'culturalseason' => $season,
			'lines'          => $lines,
			'payments'       => $payments,
		));
		setEventMessages('Facture '.$object->ref.' enregistrée', null, 'mesgs');
		header('Location: '.$backurl);
		exit;
	} catch (Exception $e) {
		$errormsg = $e->getMessage();
		// Recharger l'objet (la transaction a été annulée)
		$object = new Facture($db);
		$object->fetch($id);
		$object->fetch_thirdparty();
		$object->fetch_optionals();
		// Ré-afficher le formulaire avec la saisie de l'utilisateur (pour ne pas perdre son travail)
		$reloadFromPost      = true;
		$postLinesForForm    = $lines;
		$postPaymentsForForm = $payments;
	}
}

// ============================================================
// DONNÉES DE RÉFÉRENCE POUR LE FORMULAIRE
// ============================================================
$currentSeason = isset($object->array_options['options_inv_culturalseason']) ? (string) $object->array_options['options_inv_culturalseason'] : '';

// Saisons culturelles
$seasons = array();
$resSeasons = $db->query("SELECT rowid, label FROM ".MAIN_DB_PREFIX."c_yearexercice WHERE active = 1 ORDER BY label DESC");
if ($resSeasons) {
	while ($o = $db->fetch_object($resSeasons)) {
		$seasons[] = array('rowid' => (int) $o->rowid, 'label' => $o->label);
	}
}

// Types de paiement
$payTypes = array();
$resPt = $db->query("SELECT id, code, libelle FROM ".MAIN_DB_PREFIX."c_paiement WHERE active = 1 ORDER BY libelle ASC");
if ($resPt) {
	while ($o = $db->fetch_object($resPt)) {
		$payTypes[] = array('id' => (int) $o->id, 'code' => $o->code, 'label' => $langs->trans($o->libelle) ? $langs->trans($o->libelle) : $o->libelle);
	}
}

// Produits vendables (pour l'autocomplete)
$products = array();
$resProd = $db->query("SELECT rowid, ref, label, price, price_ttc FROM ".MAIN_DB_PREFIX."product WHERE tosell = 1 AND entity IN (".getEntity('product').") ORDER BY label ASC");
if ($resProd) {
	while ($o = $db->fetch_object($resProd)) {
		$products[] = array(
			'id'      => (int) $o->rowid,
			'ref'     => $o->ref,
			'label'   => $o->label,
			'price'   => (float) $o->price,
			'display' => ($o->ref !== '' ? $o->ref.' - ' : '').$o->label,
		);
	}
}

// Paiements déjà enregistrés sur la facture
$existingPayments = array();
$existingPaidTotal = 0.0;
$sqlPay  = "SELECT pf.amount, p.datep, cp.code, cp.libelle";
$sqlPay .= " FROM ".MAIN_DB_PREFIX."paiement_facture AS pf";
$sqlPay .= " INNER JOIN ".MAIN_DB_PREFIX."paiement AS p ON p.rowid = pf.fk_paiement";
$sqlPay .= " LEFT JOIN ".MAIN_DB_PREFIX."c_paiement AS cp ON cp.id = p.fk_paiement";
$sqlPay .= " WHERE pf.fk_facture = ".((int) $id)." ORDER BY p.datep ASC";
$resPay = $db->query($sqlPay);
if ($resPay) {
	while ($o = $db->fetch_object($resPay)) {
		$existingPayments[] = array(
			'amount' => (float) $o->amount,
			'date'   => $db->jdate($o->datep),
			'label'  => trim(($o->code ? $o->code.' - ' : '').($o->libelle ? $langs->trans($o->libelle) : '')),
		);
		$existingPaidTotal += (float) $o->amount;
	}
}

// Produits indexés par rowid (pour retrouver un libellé lors d'un ré-affichage après erreur)
$productById = array();
foreach ($products as $pp) {
	$productById[$pp['id']] = $pp;
}

// Lignes affichées dans le formulaire
$formLines = array();
$formPayments = array();
if (!empty($reloadFromPost)) {
	// Ré-affichage après erreur : on repart de la saisie de l'utilisateur
	foreach ($postLinesForForm as $l) {
		$label = isset($productById[$l['fk_product']]) ? $productById[$l['fk_product']]['display'] : $l['desc'];
		$formLines[] = array(
			'id'         => (int) $l['id'],
			'fk_product' => (int) $l['fk_product'],
			'desc'       => (string) $l['desc'],
			'label'      => $label,
			'qty'        => (float) price2num($l['qty']),
			'subprice'   => (float) price2num($l['subprice']),
		);
	}
	foreach ($postPaymentsForForm as $p) {
		$formPayments[] = array(
			'payment_type_id' => (int) $p['payment_type_id'],
			'amount'          => (float) $p['amount'],
			'issuer'          => (string) $p['issuer'],
		);
	}
} else {
	$object->fetch_lines();
	foreach ($object->lines as $l) {
		$formLines[] = array(
			'id'         => (int) $l->id,
			'fk_product' => (int) $l->fk_product,
			'desc'       => (string) ($l->desc !== '' ? $l->desc : $l->product_label),
			'label'      => trim(($l->product_ref ? $l->product_ref.' - ' : '').($l->desc !== '' ? $l->desc : $l->product_label)),
			'qty'        => (float) $l->qty,
			'subprice'   => (float) $l->subprice,
		);
	}
}

$customerName = $object->thirdparty ? $object->thirdparty->name : '';

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

llxHeader('', 'Modifier facture '.$object->ref, '', '', 0, 0, $arrayofjs, $arrayofcss, '', 'mod-dybccr page-editinvoice');

print load_fiche_titre('Modifier facture '.dol_escape_htmltag($object->ref), '<a href="'.$backurl.'">'.dol_escape_htmltag($customerName).'</a>', 'bill');

if ($errormsg !== '') {
	print '<div class="error">'.dol_escape_htmltag($errormsg).'</div>';
}

print '<form method="POST" id="dyb-edit-invoice-form" action="'.$_SERVER['PHP_SELF'].'?id='.((int) $id).'">';
print '<input type="hidden" name="token" value="'.newToken().'">';
print '<input type="hidden" name="action" value="save">';

print '<div style="border:1px solid #ccc;border-radius:4px;padding:12px 15px;margin-bottom:10px;max-width:900px;">';

// ---- Saison culturelle ----
print '<div class="mb-3">';
print '<label class="fw-bold" style="display:block;margin-bottom:4px;">Saison culturelle</label>';
print '<select class="flat" name="culturalseason" required style="width:520px;max-width:100%;">';
print '<option value="">—</option>';
foreach ($seasons as $s) {
	$sel = ((string) $s['rowid'] === $currentSeason) ? ' selected' : '';
	print '<option value="'.$s['rowid'].'"'.$sel.'>'.dol_escape_htmltag($s['label']).'</option>';
}
print '</select>';
print '</div>';

// ---- Ajout d'un produit ----
print '<div class="mb-3">';
print '<label class="fw-bold" style="display:block;margin-bottom:4px;">Ajouter un produit</label>';
print '<div id="dyb-autocomplete" style="width:520px;max-width:100%;"></div>';
print '</div>';

// ---- Lignes ----
print '<div class="div-table-responsive">';
print '<table class="noborder centpercent" id="dyb-lines-table">';
print '<thead><tr class="liste_titre">';
print '<td>Produit</td>';
print '<td style="width:90px">Qté</td>';
print '<td style="width:110px">Prix unit.</td>';
print '<td class="right" style="width:110px">Sous-total</td>';
print '<td style="width:40px"></td>';
print '</tr></thead>';
print '<tbody id="dyb-lines-body"></tbody>';
print '</table>';
print '</div>';

print '<div class="right" style="font-weight:bold;font-size:1.1em;margin-top:6px;">Total : <span id="dyb-total">0,00 €</span></div>';

// ---- Paiements existants ----
if (!empty($existingPayments)) {
	print '<div style="margin-top:14px;"><span class="fw-bold">Paiements existants</span>';
	print '<table class="noborder" style="margin-top:4px;">';
	foreach ($existingPayments as $ep) {
		print '<tr class="oddeven"><td class="small">'.dol_escape_htmltag($ep['label']).'</td>';
		print '<td class="small">'.dol_print_date($ep['date'], 'day').'</td>';
		print '<td class="small right">'.price($ep['amount']).'</td>';
		print '<td class="small fst-italic">existant</td></tr>';
	}
	print '</table></div>';
}

// ---- Nouveaux paiements ----
print '<div style="margin-top:14px;">';
print '<div class="d-flex justify-content-between align-items-center" style="margin-bottom:6px;">';
print '<span class="fw-bold">Nouveaux paiements</span>';
print '<button type="button" class="butAction" id="dyb-add-payment"><i class="bi bi-plus"></i> Ajouter paiement</button>';
print '</div>';
print '<table class="noborder" id="dyb-payments-table"><tbody id="dyb-payments-body"></tbody></table>';
print '<div class="right small" style="margin-top:4px;">Reste à payer : <span id="dyb-remaining">0,00 €</span></div>';
print '</div>';

// ---- Lien HelloAsso ----
print '<hr>';
print '<a href="#" id="dyb-copy-hellopay" class="small"><i class="bi bi-clipboard me-1"></i>Copier le lien de paiement HelloAsso pour cette facture</a>';

print '</div>'; // cadre

print '<div class="center" style="margin-top:12px;">';
print '<a class="butActionRefused" href="'.$backurl.'">Annuler</a> ';
print '<input type="submit" class="butAction" value="Enregistrer">';
print '</div>';

print '</form>';

// ============================================================
// SCRIPT D'AFFICHAGE (aucun appel réseau : construit l'état du formulaire, soumis en un POST)
// ============================================================
$jsonFlags         = JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP;
$dolUrlRoot        = DOL_URL_ROOT;
$jsonProducts      = json_encode($products, $jsonFlags) ?: '[]';
$jsonFormLines     = json_encode($formLines, $jsonFlags) ?: '[]';
$jsonPayTypes      = json_encode($payTypes, $jsonFlags) ?: '[]';
$jsonFormPayments  = json_encode($formPayments, $jsonFlags) ?: '[]';
$jsExistingPaid    = json_encode(round($existingPaidTotal, 2)) ?: '0';
$jsCustomerName    = json_encode($customerName, $jsonFlags) ?: '""';
$jsInvoiceId       = (int) $id;

print '<script type="module" nonce="'.getNonce().'">';
print <<<JS
import AutocompleteSelector from '{$dolUrlRoot}/custom/dybccr/js/components/autocomplete-selector-plain.js';

const PRODUCTS         = {$jsonProducts};
const INITIAL_LINES    = {$jsonFormLines};
const INITIAL_PAYMENTS = {$jsonFormPayments};
const PAY_TYPES        = {$jsonPayTypes};
const EXISTING_PAID  = Number({$jsExistingPaid}) || 0;
const CUSTOMER_NAME  = {$jsCustomerName};
const INVOICE_ID     = {$jsInvoiceId};

const linesBody    = document.getElementById('dyb-lines-body');
const paymentsBody = document.getElementById('dyb-payments-body');
const totalEl      = document.getElementById('dyb-total');
const remainingEl  = document.getElementById('dyb-remaining');
const helloLink    = document.getElementById('dyb-copy-hellopay');

function fmt(n) {
	return (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function isChequeCode(code) {
	return String(code || '').toUpperCase() === 'CHQ';
}

function escapeAttr(v) {
	return String(v === null || v === undefined ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// ---------- Lignes ----------
function addLineRow(line) {
	const id       = line.id || 0;
	const fkProd   = line.fk_product || 0;
	const desc     = line.desc || '';
	const label    = line.label || desc;
	const qty      = (line.qty === undefined || line.qty === null) ? 1 : line.qty;
	const subprice = (line.subprice === undefined || line.subprice === null) ? 0 : line.subprice;

	const tr = document.createElement('tr');
	tr.className = 'oddeven dyb-line';
	tr.innerHTML =
		'<td><span>' + escapeAttr(label) + '</span>' +
		'<input type="hidden" name="line_id[]" value="' + escapeAttr(id) + '">' +
		'<input type="hidden" name="line_fk_product[]" value="' + escapeAttr(fkProd) + '">' +
		'<input type="hidden" name="line_desc[]" value="' + escapeAttr(desc) + '"></td>' +
		'<td><input type="number" class="flat dyb-line-qty" name="line_qty[]" value="' + escapeAttr(qty) + '" min="1" step="1" style="width:80px"></td>' +
		'<td><input type="number" class="flat dyb-line-price" name="line_subprice[]" value="' + escapeAttr(subprice) + '" step="0.01" style="width:100px"></td>' +
		'<td class="right dyb-line-sub">' + fmt(qty * subprice) + '</td>' +
		'<td><button type="button" class="btn btn-sm btn-link p-0 text-danger dyb-line-remove" title="Retirer la ligne"><i class="bi bi-trash"></i></button></td>';
	linesBody.appendChild(tr);

	tr.querySelector('.dyb-line-qty').addEventListener('input', recompute);
	tr.querySelector('.dyb-line-price').addEventListener('input', recompute);
	tr.querySelector('.dyb-line-remove').addEventListener('click', function () {
		tr.remove();
		recompute();
	});
}

// ---------- Paiements ----------
function paymentTypeOptions(selectedId) {
	return PAY_TYPES.map(function (t) {
		const sel = (String(t.id) === String(selectedId)) ? ' selected' : '';
		return '<option value="' + t.id + '" data-code="' + escapeAttr(t.code) + '"' + sel + '>' + escapeAttr(t.code + ' - ' + t.label) + '</option>';
	}).join('');
}

function addPaymentRow(preset) {
	preset = preset || {};
	const first = PAY_TYPES.length ? PAY_TYPES[0] : null;
	const selectedType = (preset.payment_type_id !== undefined && preset.payment_type_id !== null && Number(preset.payment_type_id) > 0)
		? preset.payment_type_id
		: (first ? first.id : '');
	const amount = (preset.amount === undefined || preset.amount === null) ? 0 : preset.amount;

	const tr = document.createElement('tr');
	tr.className = 'oddeven dyb-payment';
	tr.innerHTML =
		'<td><select class="flat dyb-payment-type" name="payment_type_id[]">' + paymentTypeOptions(selectedType) + '</select></td>' +
		'<td><input type="number" class="flat dyb-payment-amount" name="payment_amount[]" value="' + escapeAttr(amount) + '" min="0" step="0.01" style="width:100px"></td>' +
		'<td><input type="text" class="flat dyb-payment-issuer" name="payment_issuer[]" placeholder="Émetteur du chèque" value="' + escapeAttr(preset.issuer || '') + '" style="width:180px;display:none"></td>' +
		'<td><button type="button" class="btn btn-sm btn-link p-0 text-danger dyb-payment-remove" title="Retirer le paiement"><i class="bi bi-trash"></i></button></td>';
	paymentsBody.appendChild(tr);

	const typeSel  = tr.querySelector('.dyb-payment-type');
	const amountEl = tr.querySelector('.dyb-payment-amount');
	const issuerEl = tr.querySelector('.dyb-payment-issuer');

	function syncIssuer() {
		const opt = typeSel.selectedOptions[0];
		if (opt && isChequeCode(opt.dataset.code)) {
			if (!issuerEl.value) issuerEl.value = CUSTOMER_NAME;
			issuerEl.style.display = '';
		} else {
			issuerEl.style.display = 'none';
		}
	}
	typeSel.addEventListener('change', syncIssuer);
	amountEl.addEventListener('input', recompute);
	tr.querySelector('.dyb-payment-remove').addEventListener('click', function () {
		tr.remove();
		recompute();
	});
	syncIssuer();
}

// ---------- Recalcul ----------
function computeTotal() {
	let t = 0;
	linesBody.querySelectorAll('.dyb-line').forEach(function (tr) {
		const q = parseFloat(tr.querySelector('.dyb-line-qty').value) || 0;
		const p = parseFloat(tr.querySelector('.dyb-line-price').value) || 0;
		tr.querySelector('.dyb-line-sub').textContent = fmt(q * p);
		t += q * p;
	});
	return t;
}

function computeNewPaid() {
	let t = 0;
	paymentsBody.querySelectorAll('.dyb-payment-amount').forEach(function (el) {
		t += parseFloat(el.value) || 0;
	});
	return t;
}

function recompute() {
	const total = computeTotal();
	totalEl.textContent = fmt(total);
	remainingEl.textContent = fmt(total - EXISTING_PAID - computeNewPaid());

	const active = total > 0;
	helloLink.classList.toggle('disabled', !active);
	helloLink.style.pointerEvents = active ? '' : 'none';
	helloLink.style.opacity = active ? '' : '0.5';
}

// ---------- Autocomplete produit ----------
const autocomplete = new AutocompleteSelector('#dyb-autocomplete', {
	labelField: 'display',
	valueField: 'id',
	placeholder: 'Rechercher un produit...',
	onChange: function (value, item) {
		if (!item) return;
		addLineRow({
			id: 0,
			fk_product: item.id,
			desc: item.label,
			label: item.display,
			qty: 1,
			subprice: item.price || 0,
		});
		recompute();
		autocomplete.clear();
	},
});
autocomplete.setItems(PRODUCTS);

// ---------- Init ----------
INITIAL_LINES.forEach(addLineRow);
INITIAL_PAYMENTS.forEach(addPaymentRow);
recompute();

document.getElementById('dyb-add-payment').addEventListener('click', function () {
	const total = computeTotal();
	const remaining = Math.max(total - EXISTING_PAID - computeNewPaid(), 0);
	addPaymentRow({ amount: remaining });
	recompute();
});

// ---------- Lien HelloAsso ----------
helloLink.addEventListener('click', async function (e) {
	e.preventDefault();
	if (computeTotal() <= 0) return;
	const url = window.location.origin + '{$dolUrlRoot}/custom/helloassopay/public/start.php?ref=' + INVOICE_ID;
	try {
		await navigator.clipboard.writeText(url);
	} catch (err) {
		const tmp = document.createElement('textarea');
		tmp.value = url;
		document.body.appendChild(tmp);
		tmp.select();
		try { document.execCommand('copy'); } catch (e2) { /* ignore */ }
		tmp.remove();
	}
	const original = helloLink.innerHTML;
	helloLink.innerHTML = '<i class="bi bi-check2 me-1"></i>Lien copié dans le presse-papier';
	setTimeout(function () { helloLink.innerHTML = original; }, 2000);
});

// ---------- Garde-fous avant soumission ----------
document.getElementById('dyb-edit-invoice-form').addEventListener('submit', function (e) {
	if (linesBody.querySelectorAll('.dyb-line').length === 0) {
		e.preventDefault();
		alert('Veuillez ajouter au moins un produit.');
		return;
	}
	let chequeMissing = false;
	paymentsBody.querySelectorAll('.dyb-payment').forEach(function (tr) {
		const amount = parseFloat(tr.querySelector('.dyb-payment-amount').value) || 0;
		const opt = tr.querySelector('.dyb-payment-type').selectedOptions[0];
		const issuer = tr.querySelector('.dyb-payment-issuer').value.trim();
		if (amount > 0 && opt && isChequeCode(opt.dataset.code) && !issuer) {
			chequeMissing = true;
		}
	});
	if (chequeMissing) {
		e.preventDefault();
		alert('Veuillez saisir l\\'émetteur du chèque.');
	}
});
JS;
print '</script>';

llxFooter();
$db->close();
