<?php
/* Copyright (C) 2026 CCR
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

use Luracast\Restler\RestException;

/**
 * API DYBccr — dictionaries endpoints
 *
 * Endpoints:
 *   GET /api/index.php/dybccrapi/typeactivities
 *   GET /api/index.php/dybccrapi/typeactivity/{id}
 *   GET /api/index.php/dybccrapi/typedomains
 *   GET /api/index.php/dybccrapi/typedomain/{id}
 *   GET /api/index.php/dybccrapi/yearexercices
 *   GET /api/index.php/dybccrapi/yearexercice/{id}
 *   GET /api/index.php/dybccrapi/moduleparameters
 *   POST /api/index.php/dybccrapi/invoices/{id}/sendemail
 *
 * @access protected
 * @class  DolibarrApiAccess {@requires user,external}
 */
class DybccrApi extends DolibarrApi
{
	public function __construct()
	{
		global $db;
		$this->db = $db;
	}

	// -----------------------------------------------------------------------
	// TypeActivity
	// -----------------------------------------------------------------------

	/**
	 * List type of activities
	 *
	 * @param string $sortfield   Sort field (default t.label)
	 * @param string $sortorder   Sort order ASC or DESC
	 * @param int    $active      Filter: 1=active only, 0=inactive only, -1=all
	 * @return array
	 *
	 * @throws RestException
	 */
	public function getTypeactivities($sortfield = 't.label', $sortorder = 'ASC', $active = 1)
	{
		$this->_checkAuth();
		return $this->_fetchDictionary('c_typeactivity', $sortfield, $sortorder, $active);
	}

	/**
	 * Get a type of activity by ID
	 *
	 * @param int $id  Rowid
	 * @return array
	 *
	 * @throws RestException
	 */
	public function getTypeactivity($id)
	{
		$this->_checkAuth();
		return $this->_fetchDictionaryById('c_typeactivity', (int)$id);
	}

	// -----------------------------------------------------------------------
	// TypeDomain
	// -----------------------------------------------------------------------

	/**
	 * List type of domains
	 *
	 * @param string $sortfield   Sort field (default t.label)
	 * @param string $sortorder   Sort order ASC or DESC
	 * @param int    $active      Filter: 1=active only, 0=inactive only, -1=all
	 * @return array
	 *
	 * @throws RestException
	 */
	public function getTypedomains($sortfield = 't.label', $sortorder = 'ASC', $active = 1)
	{
		$this->_checkAuth();
		return $this->_fetchDictionary('c_typedomain', $sortfield, $sortorder, $active);
	}

	/**
	 * Get a type of domain by ID
	 *
	 * @param int $id  Rowid
	 * @return array
	 *
	 * @throws RestException
	 */
	public function getTypedomain($id)
	{
		$this->_checkAuth();
		return $this->_fetchDictionaryById('c_typedomain', (int)$id);
	}

	// -----------------------------------------------------------------------
	// YearExercice
	// -----------------------------------------------------------------------

	/**
	 * List year exercises
	 *
	 * @param string $sortfield   Sort field (default t.label)
	 * @param string $sortorder   Sort order ASC or DESC
	 * @param int    $active      Filter: 1=active only, 0=inactive only, -1=all
	 * @return array
	 *
	 * @throws RestException
	 */
	public function getYearexercices($sortfield = 't.label', $sortorder = 'DESC', $active = 1)
	{
		$this->_checkAuth();
		return $this->_fetchDictionary('c_yearexercice', $sortfield, $sortorder, $active);
	}

	/**
	 * Get a year exercise by ID
	 *
	 * @param int $id  Rowid
	 * @return array
	 *
	 * @throws RestException
	 */
	public function getYearexercice($id)
	{
		$this->_checkAuth();
		return $this->_fetchDictionaryById('c_yearexercice', (int)$id);
	}

	// -----------------------------------------------------------------------
	// Module parameters
	// -----------------------------------------------------------------------

	/**
	 * Get the module setup parameters
	 *
	 * @return array
	 *
	 * @url GET moduleparameters
	 * @throws RestException
	 */
	public function getModuleparameters()
	{
		$this->_checkAuth();

		return array(
			'DYBCCR_DYBWEB_OPEN' => getDolGlobalString('DYBCCR_DYBWEB_OPEN'),
			'DYBCCR_DYBWEB_CLOSE_MESSAGE' => getDolGlobalString('DYBCCR_DYBWEB_CLOSE_MESSAGE'),
			'DYBCCR_DYBWEB_INFORMATION_MESSAGE' => getDolGlobalString('DYBCCR_DYBWEB_INFORMATION_MESSAGE'),
			'DYBCCR_DYBWEB_CURRENT_SEASON' => getDolGlobalString('DYBCCR_DYBWEB_CURRENT_SEASON'),
		);
	}

	// -----------------------------------------------------------------------
	// Invoice lines by product and year
	// -----------------------------------------------------------------------

	/**
	 * List invoice lines matching a product (by ref) and a year exercise (by label)
	 *
	 * Returns one entry per invoice line with the owning thirdparty.
	 *
	 * @param string $product_id   Product reference (llx_product.rowid)
	 * @param string $year_id    Year exercise label (llx_c_yearexercice.id)
	 * @param string $sortfield     Sort field: line_id|invoice_ref|invoice_date|thirdparty_name (default invoice_date)
	 * @param string $sortorder     ASC or DESC (default ASC)
	 * @return array
	 *
	 * @url GET invoicesforproductandyear
	 * @throws RestException
	 */
	public function getInvoicesforProductAndYear($product_id, $year_id, $sortfield = 'f.datef', $sortorder = 'ASC')
	{
		$this->_checkAuth();

		if (empty($product_id) || empty($year_id)) {
			throw new RestException(400, 'Parameters product_if and year_id are required');
		}

		$allowedSortfields = array('fd.rowid', 'f.ref', 'f.datef', 's.nom');
		if (!in_array($sortfield, $allowedSortfields)) {
			$sortfield = 'f.datef';
		}
		$sortorder = (strtoupper($sortorder) === 'DESC') ? 'DESC' : 'ASC';

		$sql  = "SELECT fd.rowid AS line_id, fd.description, fd.qty, fd.subprice, fd.total_ht,
 			p.ref AS product_ref, p.label AS product_label,
 			f.rowid AS invoice_id, f.ref AS invoice_ref, f.datef AS invoice_date,
 			s.rowid AS thirdparty_id, s.nom AS thirdparty_name, s.email as thirdparty_email, s.phone as thirdparty_telephone
			, ye.label AS year_label
FROM llx_facturedet AS fd
  JOIN llx_facture AS f ON f.rowid = fd.fk_facture
    JOIN llx_facture_extrafields AS fext ON fext.fk_object = f.rowid
 JOIN llx_societe AS s ON s.rowid = f.fk_soc
 JOIN llx_product AS p ON p.rowid = fd.fk_product
  JOIN llx_c_yearexercice AS ye ON ye.rowid = fext.inv_culturalseason";
		$sql .= " WHERE p.rowid = '".$this->db->escape($product_id)."'";
		$sql .= " AND ye.rowid = '".$this->db->escape($year_id)."'";
		$sql .= " AND f.entity IN (".getEntity('facture').")";
		$sql .= " AND f.fk_statut > 0"; // exclure brouillons
		$sql .= " ORDER BY ".$sortfield." ".$sortorder;

		$res = $this->db->query($sql);
		if (!$res) {
			throw new RestException(503, 'Query error: '.$this->db->lasterror());
		}

		$list = array();
		while ($obj = $this->db->fetch_object($res)) {
			$list[] = array(
				'line_id'          => (int)$obj->line_id,
				'description'      => $obj->description,
				'qty'              => (float)$obj->qty,
				'subprice'         => (float)$obj->subprice,
				'total_ht'         => (float)$obj->total_ht,
				'product_ref'      => $obj->product_ref,
				'product_label'    => $obj->product_label,
				'invoice_id'       => (int)$obj->invoice_id,
				'invoice_ref'      => $obj->invoice_ref,
				'invoice_date'     => $obj->invoice_date,
				'thirdparty_id'    => (int)$obj->thirdparty_id,
				'thirdparty_name'  => $obj->thirdparty_name,
				'thirdparty_email' => $obj->thirdparty_email,
				'thirdparty_telephone' => $obj->thirdparty_telephone,
				'year_label'       => $obj->year_label,
			);
		}

		if (empty($list)) {
			throw new RestException(404, 'No invoice lines found for product "'.$product_id.'" and year "'.$year_id.'"');
		}

		return $list;
	}

	// -----------------------------------------------------------------------
	// Invoice: send by email
	// -----------------------------------------------------------------------

	/**
	 * Send an invoice by email to its thirdparty, using the default email template
	 * configured for customer invoices ('facture_send') in Dolibarr's email templates setup.
	 *
	 * Mirrors the standard "Send by email" action of the invoice card (core/actions_sendmails.inc.php):
	 * builds subject/body from the template with tag substitution, joins the invoice PDF
	 * (generating it first if it does not exist yet), sends the mail, increments the invoice's
	 * email counter and fires the BILL_SENTBYMAIL trigger.
	 *
	 * @param int $id  Invoice ID
	 * @return array
	 *
	 * @url POST invoicesendemail/{id}
	 * @throws RestException
	 */
	public function postInvoicesendemail($id)
	{
		$this->_checkAuthWrite();

		global $conf, $langs, $user;

		require_once DOL_DOCUMENT_ROOT.'/compta/facture/class/facture.class.php';
		require_once DOL_DOCUMENT_ROOT.'/core/class/html.formmail.class.php';
		require_once DOL_DOCUMENT_ROOT.'/core/class/CMailFile.class.php';
		require_once DOL_DOCUMENT_ROOT.'/core/lib/files.lib.php';

		$langs->loadLangs(array('bills', 'mails'));

		$object = new Facture($this->db);
		$result = $object->fetch((int) $id);
		if ($result <= 0 || !in_array((string) $object->entity, explode(',', getEntity('facture')))) {
			throw new RestException(404, 'Invoice not found');
		}

		$object->fetch_thirdparty();
		if (empty($object->thirdparty) || empty($object->thirdparty->email)) {
			throw new RestException(400, 'Thirdparty has no email address');
		}

		// ---- Default email template for customer invoices ----
		$formmail = new FormMail($this->db);
		$emailtemplate = $formmail->getEMailTemplate($this->db, 'facture_send', $user, $langs, 0, 1, '', 1);
		if (!is_object($emailtemplate)) {
			throw new RestException(500, 'Unable to load the default email template for customer invoices');
		}

		$subject = $emailtemplate->topic ? $emailtemplate->topic : $langs->transnoentities('SendBillRef', '__REF__');
		$message = $emailtemplate->content;

		// ---- Tag substitution, same as the invoice card "send by email" form ----
		$substitutionarray = getCommonSubstitutionArray($langs, 0, null, $object);
		complete_substitutions_array($substitutionarray, $langs, $object);
		$subject = make_substitutions($subject, $substitutionarray);
		$message = make_substitutions($message, $substitutionarray);
		if (method_exists($object, 'makeSubstitution')) {
			$subject = $object->makeSubstitution($subject);
			$message = $object->makeSubstitution($message);
		}

		// ---- Join the invoice PDF, generating it first if it does not exist yet ----
		$filepath = array();
		$filename = array();
		$mimetype = array();

		$ref = dol_sanitizeFileName($object->ref);
		$entity = !empty($object->entity) ? $object->entity : $conf->entity;
		$outputdir = $conf->invoice->multidir_output[$entity].'/'.$ref;

		$fileparams = dol_most_recent_file($outputdir, preg_quote($ref, '/').'[^\-]+');
		if (empty($fileparams['fullname'])) {
			$modelpdf = !empty($object->model_pdf) ? $object->model_pdf : getDolGlobalString('FACTURE_ADDON_PDF');
			$object->generateDocument($modelpdf, $langs);
			$fileparams = dol_most_recent_file($outputdir, preg_quote($ref, '/').'[^\-]+');
		}
		if (!empty($fileparams['fullname'])) {
			$filepath[] = $fileparams['fullname'];
			$filename[] = basename($fileparams['fullname']);
			$mimetype[] = dol_mimetype($fileparams['fullname']);
		}

		// ---- Send ----
		$from = dol_string_nospecial(getDolGlobalString('MAIN_INFO_SOCIETE_NOM'), ' ', array(',')).' <'.getDolGlobalString('MAIN_MAIL_EMAIL_FROM').'>';
		$sendto = $object->thirdparty->email;
		$sendtobcc = getDolGlobalString('MAIN_MAIL_AUTOCOPY_INVOICE_TO');
		$trackid = 'inv'.$object->id;

		$mailfile = new CMailFile($subject, $sendto, $from, $message, $filepath, $mimetype, $filename, '', $sendtobcc, 0, -1, '', '', $trackid, '', 'standard');

		if (!empty($mailfile->error) || !empty($mailfile->errors)) {
			throw new RestException(500, 'Error preparing email: '.$mailfile->error.(!empty($mailfile->errors) ? ' '.implode(', ', $mailfile->errors) : ''));
		}

		if (!$mailfile->sendfile()) {
			throw new RestException(500, 'Error sending email: '.$mailfile->error.(!empty($mailfile->errors) ? ' '.implode(', ', $mailfile->errors) : ''));
		}

		// ---- Same bookkeeping as the standard "Send by email" action ----
		$this->db->begin();

		$sql = "UPDATE ".MAIN_DB_PREFIX."facture SET email_sent_counter = email_sent_counter + 1 WHERE rowid = ".((int) $object->id);
		$this->db->query($sql);
		$object->email_sent_counter += 1;

		$object->socid = $object->thirdparty->id;
		$object->actiontypecode = 'AC_OTH_AUTO';
		$object->actionmsg = $message;
		$object->actionmsg2 = $langs->transnoentities('MailSentByTo', CMailFile::getValidAddress($from, 4, 0, 1), CMailFile::getValidAddress($sendto, 4, 0, 1));
		$object->trackid = $trackid;
		$object->fk_element = $object->id;
		$object->elementtype = $object->element;
		$object->context['email_msgid'] = $mailfile->msgid;
		$object->context['email_from'] = $from;
		$object->context['email_subject'] = $subject;
		$object->context['email_to'] = $sendto;

		$triggerresult = $object->call_trigger('BILL_SENTBYMAIL', $user);
		if ($triggerresult < 0) {
			$this->db->rollback();
			throw new RestException(500, 'Email sent but trigger BILL_SENTBYMAIL failed: '.implode(', ', $object->errors));
		}

		$this->db->commit();

		return array(
			'success'     => true,
			'invoice_id'  => $object->id,
			'invoice_ref' => $object->ref,
			'sent_to'     => $sendto,
			'subject'     => $subject,
		);
	}

	// -----------------------------------------------------------------------
	// Private helpers
	// -----------------------------------------------------------------------

	/**
	 * @throws RestException
	 */
	private function _checkAuth()
	{
		if (!DolibarrApiAccess::$user->hasRight('dybccr', 'read') && !DolibarrApiAccess::$user->admin) {
			throw new RestException(403, 'Access not allowed');
		}
	}

	/**
	 * @throws RestException
	 */
	private function _checkAuthWrite()
	{
		if (!DolibarrApiAccess::$user->hasRight('dybccr', 'write') && !DolibarrApiAccess::$user->admin) {
			throw new RestException(403, 'Access not allowed');
		}
	}

	/**
	 * @throws RestException
	 */
	private function _fetchDictionary(string $table, string $sortfield, string $sortorder, int $active): array
	{
		$sql = "SELECT t.rowid, t.code, t.label, t.active FROM ".MAIN_DB_PREFIX.$table." AS t";
		if ($active >= 0) {
			$sql .= " WHERE t.active = ".$active;
		}
		$sql .= " ORDER BY ".$this->db->sanitize($sortfield)." ".$this->db->sanitize($sortorder);

		$res = $this->db->query($sql);
		if (!$res) {
			throw new RestException(503, 'Error querying '.$table.': '.$this->db->lasterror());
		}

		$list = array();
		while ($obj = $this->db->fetch_object($res)) {
			$list[] = array(
				'rowid'  => (int)$obj->rowid,
				'code'   => $obj->code,
				'label'  => $obj->label,
				'active' => (int)$obj->active,
			);
		}
		return $list;
	}

	/**
	 * @throws RestException
	 */
	private function _fetchDictionaryById(string $table, int $id): array
	{
		$sql = "SELECT t.rowid, t.code, t.label, t.active FROM ".MAIN_DB_PREFIX.$table." AS t WHERE t.rowid = ".$id;

		$res = $this->db->query($sql);
		if (!$res) {
			throw new RestException(503, 'Error querying '.$table.': '.$this->db->lasterror());
		}
		$obj = $this->db->fetch_object($res);
		if (!$obj) {
			throw new RestException(404, 'Record not found in '.$table);
		}

		return array(
			'rowid'  => (int)$obj->rowid,
			'code'   => $obj->code,
			'label'  => $obj->label,
			'active' => (int)$obj->active,
		);
	}
}
