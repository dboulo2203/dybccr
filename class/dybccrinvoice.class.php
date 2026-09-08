<?php
/* Copyright (C) 2026 CCR
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * \file    dybccr/class/dybccrinvoice.class.php
 * \ingroup dybccr
 * \brief   Enregistrement complet d'une facture d'inscription (édition depuis pageEditInvoice.php)
 */

/**
 * Regroupe, avec les objets natifs Dolibarr et dans une seule transaction, toute la séquence
 * d'enregistrement d'une facture éditée depuis la fiche adhérent :
 *   - repassage en brouillon si la facture était validée
 *   - mise à jour de la saison culturelle (extrafield inv_culturalseason)
 *   - lignes : conservation des inchangées, suppression des retirées, suppression + recréation
 *     des modifiées (qty ou prix unitaire), création des nouvelles
 *   - revalidation
 *   - enregistrement des nouveaux paiements (émetteur obligatoire pour un chèque)
 *
 * Utilisé à la fois par la page pageEditInvoice.php (en session, $user = utilisateur connecté)
 * et par l'API REST DybccrApi::postInvoicessave (avec une clé DOLAPIKEY).
 */
class DybccrInvoice
{
	/** @var DoliDB */
	private $db;

	/**
	 * @param DoliDB $db  Handler base de données
	 */
	public function __construct($db)
	{
		$this->db = $db;
	}

	/**
	 * Enregistre une facture éditée.
	 *
	 * @param User  $user  Utilisateur réalisant l'action (auteur des modifications et des paiements)
	 * @param array $data  {
	 *   id: int, culturalseason: string,
	 *   lines:    array de { id?:int, fk_product:int, desc:string, qty:float, subprice:float, tva_tx?:float },
	 *   payments: array de { payment_type_id:int, amount:float, issuer?:string, num_payment?:string, account_id?:int }
	 * }
	 * @return array  { success, invoice_id, invoice_ref, status, total_ttc, lines_added, lines_deleted, lines_kept, payments_created }
	 * @throws Exception  Message d'erreur + code HTTP indicatif (400 / 403 / 404 / 500). Rien n'est persisté.
	 */
	public function saveFull($user, array $data)
	{
		global $langs;

		require_once DOL_DOCUMENT_ROOT.'/compta/facture/class/facture.class.php';
		require_once DOL_DOCUMENT_ROOT.'/compta/paiement/class/paiement.class.php';

		$invoiceId = !empty($data['id']) ? (int) $data['id'] : 0;
		$season    = isset($data['culturalseason']) ? trim((string) $data['culturalseason']) : '';
		$lines     = (isset($data['lines']) && is_array($data['lines'])) ? $data['lines'] : array();
		$payments  = (isset($data['payments']) && is_array($data['payments'])) ? $data['payments'] : array();

		if (!is_object($user) || empty($user->id)) {
			throw new Exception('Utilisateur non authentifié', 403);
		}
		if (!$user->hasRight('facture', 'creer') && empty($user->admin)) {
			throw new Exception('Droits insuffisants (facture / créer)', 403);
		}
		if ($invoiceId <= 0) {
			throw new Exception('Identifiant de facture manquant', 400);
		}
		if ($season === '') {
			throw new Exception('Veuillez choisir une saison culturelle', 400);
		}
		if (count($lines) === 0) {
			throw new Exception('Veuillez ajouter au moins un produit', 400);
		}

		$object = new Facture($this->db);
		if ($object->fetch($invoiceId) <= 0) {
			throw new Exception('Facture introuvable', 404);
		}
		if (!in_array((string) $object->entity, explode(',', getEntity('facture')))) {
			throw new Exception('Accès non autorisé sur cette facture', 403);
		}
		$object->fetch_optionals();

		$wasValidated = ((int) $object->status === Facture::STATUS_VALIDATED);

		// ---- Normalisation des lignes reçues ----
		$normLines = array();
		foreach ($lines as $l) {
			$l = (array) $l;
			$normLines[] = array(
				'id'         => !empty($l['id']) ? (int) $l['id'] : 0,
				'fk_product' => !empty($l['fk_product']) ? (int) $l['fk_product'] : 0,
				'qty'        => (float) price2num(isset($l['qty']) ? $l['qty'] : 1),
				'subprice'   => (float) price2num(isset($l['subprice']) ? $l['subprice'] : 0),
				'desc'       => isset($l['desc']) ? (string) $l['desc'] : '',
				'tva_tx'     => isset($l['tva_tx']) ? (float) price2num($l['tva_tx']) : 0,
			);
		}

		// ---- Lignes existantes en base, indexées par id ----
		$existingById = array();
		foreach ($object->lines as $dbline) {
			$existingById[(int) $dbline->id] = $dbline;
		}
		$incomingIds = array();
		foreach ($normLines as $nl) {
			if ($nl['id'] > 0) {
				$incomingIds[$nl['id']] = true;
			}
		}

		// ---- Décision par ligne ----
		$toDelete = array();
		$toAdd    = array();
		$nbKept   = 0;

		foreach ($existingById as $eid => $dbline) {
			if (empty($incomingIds[$eid])) {
				$toDelete[] = $eid; // ligne retirée par l'utilisateur
			}
		}
		foreach ($normLines as $nl) {
			if ($nl['id'] > 0 && isset($existingById[$nl['id']])) {
				$dbline = $existingById[$nl['id']];
				$changed = (abs((float) $dbline->qty - $nl['qty']) > 0.00001)
					|| (abs((float) $dbline->subprice - $nl['subprice']) > 0.00001);
				if ($changed) {
					$toDelete[] = $nl['id'];
					$toAdd[] = $nl;
				} else {
					$nbKept++;
				}
			} else {
				$toAdd[] = $nl; // nouvelle ligne (ou id inconnu => traitée comme nouvelle)
			}
		}
		$toDelete = array_values(array_unique($toDelete));

		$newPaymentsTotal = 0.0;
		foreach ($payments as $p) {
			$p = (array) $p;
			$newPaymentsTotal += (float) price2num(isset($p['amount']) ? $p['amount'] : 0);
		}

		// ============================================================
		// Transaction
		// ============================================================
		$this->db->begin();

		if ($wasValidated && $object->setDraft($user) <= 0) {
			$this->db->rollback();
			throw new Exception('Impossible de repasser la facture en brouillon : '.$object->error, 500);
		}

		$object->array_options['options_inv_culturalseason'] = $season;
		if ($object->insertExtraFields() < 0) {
			$this->db->rollback();
			throw new Exception('Impossible de mettre à jour la saison culturelle : '.$object->error, 500);
		}

		$nbDeleted = 0;
		foreach ($toDelete as $lid) {
			if ($object->deleteLine($lid, $object->id) <= 0) {
				$this->db->rollback();
				throw new Exception('Impossible de supprimer la ligne '.$lid.' : '.$object->error, 500);
			}
			$nbDeleted++;
		}

		$nbAdded = 0;
		foreach ($toAdd as $nl) {
			$res = $object->addline(
				$nl['desc'],
				$nl['subprice'],
				$nl['qty'],
				$nl['tva_tx'],
				0,
				0,
				$nl['fk_product'],
				0,
				'',
				'',
				0,
				0,
				0,
				'HT',
				0,
				0
			);
			if ($res <= 0) {
				$this->db->rollback();
				throw new Exception('Impossible d\'ajouter une ligne : '.$object->error, 500);
			}
			$nbAdded++;
		}

		if ($object->validate($user, '', 0) <= 0) {
			$this->db->rollback();
			throw new Exception('Impossible de valider la facture : '.$object->error.' '.implode(', ', $object->errors), 500);
		}

		// ---- Paiements ----
		$object->fetch($object->id); // rafraîchit les totaux après modification des lignes
		$invoiceTotal = (float) $object->total_ttc;
		$alreadyPaid  = (float) $object->getSommePaiement();
		if (($alreadyPaid + $newPaymentsTotal) > ($invoiceTotal + 0.00001)) {
			$this->db->rollback();
			throw new Exception('Le total des paiements ('.price($alreadyPaid + $newPaymentsTotal).') dépasse le montant de la facture ('.price($invoiceTotal).')', 400);
		}

		$nbPayments = 0;
		foreach ($payments as $p) {
			$p = (array) $p;
			$amount = (float) price2num(isset($p['amount']) ? $p['amount'] : 0);
			if ($amount <= 0) {
				continue;
			}
			$paymentTypeId = !empty($p['payment_type_id']) ? (int) $p['payment_type_id'] : 0;
			if ($paymentTypeId <= 0) {
				$this->db->rollback();
				throw new Exception('Type de paiement manquant', 400);
			}
			$issuer    = isset($p['issuer']) ? trim((string) $p['issuer']) : '';
			$accountId = !empty($p['account_id']) ? (int) $p['account_id'] : 1;

			$paymentobj = new Paiement($this->db);
			$paymentobj->datepaye              = dol_now();
			$paymentobj->amounts               = array($object->id => $amount);
			$paymentobj->multicurrency_amounts = array();
			$paymentobj->paiementid            = $paymentTypeId;
			$paymentobj->paiementcode          = (string) dol_getIdFromCode($this->db, (string) $paymentTypeId, 'c_paiement', 'id', 'code', 1);
			$paymentobj->num_payment           = isset($p['num_payment']) ? (string) $p['num_payment'] : '';
			$paymentobj->note_private          = '';

			if ($paymentobj->paiementcode == 'CHQ' && $issuer === '') {
				$this->db->rollback();
				throw new Exception('Veuillez saisir l\'émetteur du chèque', 400);
			}

			$paymentId = $paymentobj->create($user, 1); // 1 => solde les factures payées
			if ($paymentId < 0) {
				$this->db->rollback();
				throw new Exception('Erreur lors de la création du paiement : '.$paymentobj->error, 500);
			}

			if (isModEnabled('bank')) {
				$resbank = $paymentobj->addPaymentToBank($user, 'payment', '(CustomerInvoicePayment)', $accountId, $issuer, '');
				if ($resbank < 0) {
					$this->db->rollback();
					throw new Exception('Erreur lors de l\'enregistrement bancaire du paiement : '.$paymentobj->error, 500);
				}
			}
			$nbPayments++;
		}

		$this->db->commit();

		$object->fetch($object->id);

		return array(
			'success'          => true,
			'invoice_id'       => (int) $object->id,
			'invoice_ref'      => $object->ref,
			'status'           => (int) $object->status,
			'total_ttc'        => (float) $object->total_ttc,
			'lines_added'      => $nbAdded,
			'lines_deleted'    => $nbDeleted,
			'lines_kept'       => $nbKept,
			'payments_created' => $nbPayments,
		);
	}
}
