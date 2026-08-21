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

if (!isset($form) || !is_object($form)) {
	require_once DOL_DOCUMENT_ROOT.'/core/class/html.form.class.php';
	$form = new Form($db);
}

// ---- Paramètres ----
$tab = GETPOST('tab', 'aZ09');

$date_start = GETPOSTDATE('datedebut', '', 'tzuserrel');
$date_end   = GETPOSTDATE('datefin', 'end', 'tzuserrel');

// ============================================================
// CALCUL
// ============================================================

$codesSet = array();  // code comptable => true
$modesSet = array();  // fk_paiement (llx_c_paiement.id) => libellé
$matrixSingle = array(); // mode_id => array(code => montant) ; pour les factures à plusieurs modes, montant ventilé au prorata de chaque mode
$multiInvoices = array(); // détail des factures payées avec plusieurs modes
$unlinkedByMode = array(); // mode_id => montant, paiements créés sur la période mais non rattachés à une facture
$unlinkedPayments = array(); // détail des paiements non rattachés à une facture

if ($date_start && $date_end) {
	// ---- Factures payées sur la période ----
	$invoices = array();
	$sqlInvoices  = "SELECT f.rowid, f.ref, f.total_ttc, s.nom AS thirdparty_name";
	$sqlInvoices .= " FROM ".MAIN_DB_PREFIX."facture AS f";
	$sqlInvoices .= " LEFT JOIN ".MAIN_DB_PREFIX."societe AS s ON s.rowid = f.fk_soc";
	$sqlInvoices .= " WHERE f.paye = 1";
	$sqlInvoices .= " AND f.entity IN (".getEntity('facture').")";
	$sqlInvoices .= " AND f.date_closing >= '".$db->idate($date_start)."'";
	$sqlInvoices .= " AND f.date_closing <= '".$db->idate($date_end)."'";

	$resInvoices = $db->query($sqlInvoices);
	if ($resInvoices) {
		while ($obj = $db->fetch_object($resInvoices)) {
			$invoices[(int) $obj->rowid] = array(
				'ref'         => $obj->ref,
				'total_ttc'   => (float) $obj->total_ttc,
				'thirdparty'  => $obj->thirdparty_name,
			);
		}
	}

	$invoiceIds = array_keys($invoices);

	if (!empty($invoiceIds)) {
		// ---- Montants des lignes de facture, regroupés par code comptable ----
		$invoiceCodes = array(); // fact_id => array(code => montant)

		$sqlLines  = "SELECT fd.fk_facture,";
		$sqlLines .= " CASE";
		$sqlLines .= "  WHEN p.accountancy_code_sell IS NOT NULL AND p.accountancy_code_sell != '' THEN p.accountancy_code_sell";
		$sqlLines .= "  WHEN fd.description = '(DEPOSIT)' THEN '4191 - Deduction sur acompte'";
		$sqlLines .= "  ELSE COALESCE(NULLIF(fd.description, ''), 'Non defini')";
		$sqlLines .= " END AS code_compta,";
		$sqlLines .= " SUM(fd.total_ttc) AS amount";
		
		$sqlLines .= " FROM ".MAIN_DB_PREFIX."facturedet AS fd";
		$sqlLines .= " LEFT JOIN ".MAIN_DB_PREFIX."product AS p ON p.rowid = fd.fk_product";
		$sqlLines .= " WHERE fd.fk_facture IN (".implode(',', $invoiceIds).")";
		$sqlLines .= " GROUP BY fd.fk_facture, code_compta";

		$resLines = $db->query($sqlLines);
		if ($resLines) {
			while ($obj = $db->fetch_object($resLines)) {
				$invoiceCodes[(int) $obj->fk_facture][$obj->code_compta] = (float) $obj->amount;
				$codesSet[$obj->code_compta] = true;
			}
		}

		// ---- Paiements des factures, regroupés par mode de paiement ----
		$invoicePayments = array(); // fact_id => array(mode_id => array('label'=>, 'amount'=>))

		$sqlPayments  = "SELECT pf.fk_facture, pa.fk_paiement AS mode_id, c.libelle AS mode_label,";
		$sqlPayments .= " SUM(pf.amount) AS amount";
		$sqlPayments .= " FROM ".MAIN_DB_PREFIX."paiement_facture AS pf";
		$sqlPayments .= " INNER JOIN ".MAIN_DB_PREFIX."paiement AS pa ON pa.rowid = pf.fk_paiement";
		$sqlPayments .= " INNER JOIN ".MAIN_DB_PREFIX."c_paiement AS c ON c.id = pa.fk_paiement";
		$sqlPayments .= " WHERE pf.fk_facture IN (".implode(',', $invoiceIds).")";
		$sqlPayments .= " GROUP BY pf.fk_facture, pa.fk_paiement, c.libelle";

		$resPayments = $db->query($sqlPayments);
		if ($resPayments) {
			while ($obj = $db->fetch_object($resPayments)) {
				$invoicePayments[(int) $obj->fk_facture][(int) $obj->mode_id] = array(
					'label'  => $obj->mode_label,
					'amount' => (float) $obj->amount,
				);
			}
		}

		// ---- Répartition par facture : un seul mode de paiement, ou plusieurs ----
		foreach ($invoices as $factId => $inv) {
			$codes = isset($invoiceCodes[$factId]) ? $invoiceCodes[$factId] : array();
			$payments = isset($invoicePayments[$factId]) ? $invoicePayments[$factId] : array();
			$nbModes = count($payments);

			if ($nbModes === 1) {
				$modeId = array_key_first($payments);
				$modesSet[$modeId] = $payments[$modeId]['label'];
				foreach ($codes as $code => $amount) {
					$matrixSingle[$modeId][$code] = (isset($matrixSingle[$modeId][$code]) ? $matrixSingle[$modeId][$code] : 0) + $amount;
				}
			} elseif ($nbModes > 1) {
				// Répartition au prorata du poids de chaque mode dans le montant payé de la facture
				// (le paiement est enregistré au niveau de la facture, pas au niveau de la ligne, donc c'est la seule clé de répartition disponible)
				$totalPaid = 0.0;
				foreach ($payments as $p) {
					$totalPaid += $p['amount'];
				}
				if ($totalPaid > 0) {
					foreach ($payments as $modeId => $p) {
						$modesSet[$modeId] = $p['label'];
						$fraction = $p['amount'] / $totalPaid;
						foreach ($codes as $code => $amount) {
							$matrixSingle[$modeId][$code] = (isset($matrixSingle[$modeId][$code]) ? $matrixSingle[$modeId][$code] : 0) + ($amount * $fraction);
						}
					}
				}
				$multiInvoices[] = array(
					'ref'        => $inv['ref'],
					'thirdparty' => $inv['thirdparty'],
					'total_ttc'  => $inv['total_ttc'],
					'payments'   => $payments,
				);
			}
		}
	}

	// ---- Paiements créés sur la période mais non rattachés à une facture (llx_paiement sans ligne llx_paiement_facture), ventilés par mode ----
	$sqlOrphan  = "SELECT p.fk_paiement AS mode_id, c.libelle AS mode_label, SUM(p.amount) AS amount";
	$sqlOrphan .= " FROM ".MAIN_DB_PREFIX."paiement AS p";
	$sqlOrphan .= " LEFT JOIN ".MAIN_DB_PREFIX."paiement_facture AS pf ON pf.fk_paiement = p.rowid";
	$sqlOrphan .= " INNER JOIN ".MAIN_DB_PREFIX."c_paiement AS c ON c.id = p.fk_paiement";
	$sqlOrphan .= " WHERE p.datec >= '".$db->idate($date_start)."'";
	$sqlOrphan .= " AND p.datec <= '".$db->idate($date_end)."'";
	$sqlOrphan .= " AND p.entity IN (".getEntity('facture').")";
	$sqlOrphan .= " AND pf.rowid IS NULL";
	$sqlOrphan .= " GROUP BY p.fk_paiement, c.libelle";

	$resOrphan = $db->query($sqlOrphan);
	if ($resOrphan) {
		while ($obj = $db->fetch_object($resOrphan)) {
			$modeId = (int) $obj->mode_id;
			$unlinkedByMode[$modeId] = (float) $obj->amount;
			if (!isset($modesSet[$modeId])) {
				$modesSet[$modeId] = $obj->mode_label;
			}
		}
	}
}

$codes = array_keys($codesSet);
sort($codes);
asort($modesSet);
$modeIds = array_keys($modesSet);

// ============================================================
// VUE
// ============================================================

llxHeader('', 'Reporting Compta', '', '', 0, 0, '', '', '', 'mod-dybccr page-reporting');

print load_fiche_titre('Reporting Compta', '', 'dybccr.png@dybccr');

print '<div style="border:1px solid #ccc;border-radius:4px;padding:10px 15px;margin-bottom:10px;">';
print '<form method="GET" action="'.$_SERVER['PHP_SELF'].'">';
print '<input type="hidden" name="token" value="'.newToken().'">';
print '<table class="nobordernopadding">';
print '<tr><td class="nowrap" style="padding-right:5px;">Date début : </td><td>';
print $form->selectDate($date_start ? $date_start : '', 'datedebut', 0, 0, 1, 'statform', 1, 0);
print '</td></tr>';
print '<tr><td class="nowrap" style="padding-right:5px;">Date fin : </td><td>';
print $form->selectDate($date_end ? $date_end : '', 'datefin', 0, 0, 1, 'statform', 1, 0);
print '</td></tr>';
print '<tr><td></td><td>';
print '<div class="center"><input type="submit" class="button" name="submit" value="Rafraîchir"></div>';
print '</td></tr>';
print '</table>';
print '</form>';
print '</div>';

if ($date_start && $date_end) {
	print '<br>';
	print load_fiche_titre('Modes de paiement par code comptable', '', '');

	print '<div class="div-table-responsive">';
	print '<table class="noborder centpercent">';

	print '<tr class="liste_titre">';
	print '<td>Mode de paiement</td>';
	foreach ($codes as $code) {
		print '<td class="right">'.dol_escape_htmltag($code).'</td>';
	}
	print '<td class="right">Non rattaché à une facture</td>';
	print '<td class="right">Total</td>';
	print '</tr>';

	$columnTotals = array_fill_keys($codes, 0.0);
	$unlinkedColumnTotal = 0.0;
	$grandTotal = 0.0;

	foreach ($modeIds as $modeId) {
		$rowTotal = 0.0;
		print '<tr class="oddeven">';
		print '<td>'.dol_escape_htmltag($modesSet[$modeId]).'</td>';
		foreach ($codes as $code) {
			$val = isset($matrixSingle[$modeId][$code]) ? $matrixSingle[$modeId][$code] : 0;
			$rowTotal += $val;
			$columnTotals[$code] += $val;
			print '<td class="right">'.($val ? price($val) : '').'</td>';
		}
		$valUnlinked = isset($unlinkedByMode[$modeId]) ? $unlinkedByMode[$modeId] : 0;
		$rowTotal += $valUnlinked;
		$unlinkedColumnTotal += $valUnlinked;
		print '<td class="right">'.($valUnlinked ? price($valUnlinked) : '').'</td>';
		$grandTotal += $rowTotal;
		print '<td class="right"><b>'.price($rowTotal).'</b></td>';
		print '</tr>';
	}

	print '<tr class="liste_titre" style="font-weight:bold">';
	print '<td>Total</td>';
	foreach ($codes as $code) {
		print '<td class="right">'.price($columnTotals[$code]).'</td>';
	}
	print '<td class="right">'.price($unlinkedColumnTotal).'</td>';
	print '<td class="right">'.price($grandTotal).'</td>';
	print '</tr>';

	print '</table>';
	print '</div>';

	if (!empty($multiInvoices)) {
		print '<br>';
		print load_fiche_titre('Détail des factures payées avec plusieurs modes de paiement', '', '');
		print '<p class="opacitymedium">Dans le tableau ci-dessus, le montant de ces factures est ventilé entre les modes de paiement au prorata du poids de chaque mode dans le total payé (le paiement étant enregistré au niveau de la facture et non de la ligne).</p>';

		print '<div class="div-table-responsive">';
		print '<table class="noborder centpercent">';
		print '<tr class="liste_titre">';
		print '<td>Référence</td>';
		print '<td>Tiers</td>';
		print '<td class="right">Montant facture</td>';
		print '<td>Détail des paiements</td>';
		print '</tr>';

		foreach ($multiInvoices as $mi) {
			print '<tr class="oddeven">';
			print '<td>'.dol_escape_htmltag($mi['ref']).'</td>';
			print '<td>'.dol_escape_htmltag($mi['thirdparty']).'</td>';
			print '<td class="right">'.price($mi['total_ttc']).'</td>';
			print '<td>';
			$parts = array();
			foreach ($mi['payments'] as $p) {
				$parts[] = dol_escape_htmltag($p['label']).' : '.price($p['amount']);
			}
			print implode(' &nbsp;|&nbsp; ', $parts);
			print '</td>';
			print '</tr>';
		}

		print '</table>';
		print '</div>';
	}
}

print dol_get_fiche_end();

llxFooter();
$db->close();
