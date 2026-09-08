<?php
/* Copyright (C) 2026 CCR
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * \file    dybccr/pageBrevoCreateList.php
 * \ingroup dybccr
 * \brief   Endpoint AJAX : crée une liste de diffusion Brevo à partir des inscriptions
 *          actuellement filtrées sur pageRegistrationList.php (réponse JSON)
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

top_httphead('application/json');

/**
 * Stoppe le script et renvoie une erreur JSON.
 * @param string $message
 */
function dybccrBrevoJsonError($message)
{
	global $db;
	echo json_encode(array('success' => false, 'error' => $message));
	if (!empty($db)) {
		$db->close();
	}
	exit;
}

/**
 * Appelle l'API Brevo (v3).
 * @param string      $method  GET|POST
 * @param string      $url     URL complète
 * @param string      $apiKey  Clé API Brevo
 * @param array|null  $payload Corps JSON de la requête (optionnel)
 * @return array{ok:bool,httpCode:int,error:?string,data:?array}
 */
function dybccrBrevoCall($method, $url, $apiKey, $payload = null)
{
	$curl = curl_init();
	$opts = array(
		CURLOPT_URL            => $url,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_CUSTOMREQUEST  => $method,
		CURLOPT_TIMEOUT        => 30,
		CURLOPT_HTTPHEADER     => array(
			'Accept: application/json',
			'Content-Type: application/json',
			'api-key: '.$apiKey,
		),
	);
	if ($payload !== null) {
		$opts[CURLOPT_POSTFIELDS] = json_encode($payload);
	}
	curl_setopt_array($curl, $opts);
	$body = curl_exec($curl);
	$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
	$curlError = curl_error($curl);
	curl_close($curl);

	if ($body === false) {
		return array('ok' => false, 'httpCode' => 0, 'error' => $curlError, 'data' => null);
	}

	$data = json_decode($body, true);
	return array(
		'ok'       => ($httpCode >= 200 && $httpCode < 300),
		'httpCode' => $httpCode,
		'error'    => null,
		'data'     => $data,
	);
}

if (empty($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
	dybccrBrevoJsonError("Méthode non autorisée.");
}

$listName = trim((string) GETPOST('listname', 'alphanohtml'));
if ($listName === '') {
	dybccrBrevoJsonError("Veuillez saisir un nom de liste.");
}

$apiKey   = getDolGlobalString('DYBCCR_BREVO_API_KEY');
$folderId = getDolGlobalInt('DYBCCR_BREVO_FOLDER_ID');

if ($apiKey === '') {
	dybccrBrevoJsonError("La clé API Brevo n'est pas configurée (Configuration du module DYBccr).");
}
if ($folderId <= 0) {
	dybccrBrevoJsonError("L'identifiant du dossier Brevo (DYBCCR_BREVO_FOLDER_ID) n'est pas configuré.");
}

// ---- Filtres repris de la session : les mêmes que ceux appliqués sur pageRegistrationList.php ----
$yearId         = isset($_SESSION['registrationlist_yearid'])         ? (int) $_SESSION['registrationlist_yearid']         : 0;
$status         = isset($_SESSION['registrationlist_status'])         ? $_SESSION['registrationlist_status']               : '';
$productId      = isset($_SESSION['registrationlist_productid'])      ? (int) $_SESSION['registrationlist_productid']      : 0;
$activityTypeId = isset($_SESSION['registrationlist_activitytypeid']) ? (int) $_SESSION['registrationlist_activitytypeid'] : 0;

// ---- Emails distincts des factures correspondant aux filtres actuels ----
$sql  = "SELECT DISTINCT s.email";
$sql .= " FROM ".MAIN_DB_PREFIX."facture AS f";
$sql .= " INNER JOIN ".MAIN_DB_PREFIX."societe AS s ON s.rowid = f.fk_soc";
$sql .= " LEFT JOIN ".MAIN_DB_PREFIX."facture_extrafields AS fe ON fe.fk_object = f.rowid";
$sql .= " WHERE f.entity IN (".getEntity('facture').")";
$sql .= " AND s.email IS NOT NULL AND s.email <> ''";
if ($yearId > 0) {
	$sql .= " AND fe.inv_culturalseason = ".(int) $yearId;
}
if ($status !== '') {
	$sql .= " AND f.fk_statut = ".(int) $status;
}
if ($productId > 0) {
	$sql .= " AND EXISTS (SELECT 1 FROM ".MAIN_DB_PREFIX."facturedet AS fd2";
	$sql .= "  WHERE fd2.fk_facture = f.rowid AND fd2.fk_product = ".(int) $productId.")";
}
if ($activityTypeId > 0) {
	$sql .= " AND EXISTS (SELECT 1 FROM ".MAIN_DB_PREFIX."facturedet AS fd3";
	$sql .= "  INNER JOIN ".MAIN_DB_PREFIX."product_extrafields AS pe3 ON pe3.fk_object = fd3.fk_product";
	$sql .= "  WHERE fd3.fk_facture = f.rowid AND pe3.type_activite = ".(int) $activityTypeId.")";
}

$resEmails = $db->query($sql);
if (!$resEmails) {
	dybccrBrevoJsonError("Erreur SQL : ".$db->lasterror());
}

// Dédoublonnage insensible à la casse (en plus du DISTINCT SQL, qui est sensible à la casse)
$emailsByKey = array();
while ($obj = $db->fetch_object($resEmails)) {
	$email = trim($obj->email);
	if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
		continue;
	}
	$emailsByKey[strtolower($email)] = $email;
}
$emails = array_values($emailsByKey);

if (count($emails) === 0) {
	dybccrBrevoJsonError("Aucune adresse email valide trouvée pour les filtres sélectionnés.");
}

// ---- 1) Création de la liste dans Brevo ----
$brevoBase = 'https://api.brevo.com/v3';

$createResult = dybccrBrevoCall('POST', $brevoBase.'/contacts/lists', $apiKey, array(
	'name'     => $listName,
	'folderId' => $folderId,
));

if (!$createResult['ok']) {
	$errMsg = "Erreur lors de la création de la liste Brevo";
	if (!empty($createResult['data']['message'])) {
		$errMsg .= " : ".$createResult['data']['message'];
	} elseif (!empty($createResult['error'])) {
		$errMsg .= " : ".$createResult['error'];
	} else {
		$errMsg .= " (HTTP ".$createResult['httpCode'].")";
	}
	dybccrBrevoJsonError($errMsg);
}

$newListId = !empty($createResult['data']['id']) ? (int) $createResult['data']['id'] : 0;
if ($newListId <= 0) {
	dybccrBrevoJsonError("La liste Brevo semble créée mais son identifiant n'a pas été retourné.");
}

// ---- 2) Ajout des contacts à la liste, par lots ----
$batchSize   = 100;
$nbAdded     = 0;
$nbErrors    = 0;
$batchErrors = array();

for ($i = 0; $i < count($emails); $i += $batchSize) {
	$batch = array_slice($emails, $i, $batchSize);

	$addResult = dybccrBrevoCall('POST', $brevoBase.'/contacts/lists/'.$newListId.'/contacts/add', $apiKey, array(
		'emails' => $batch,
	));

	if (!$addResult['ok']) {
		$nbErrors += count($batch);
		$msg = !empty($addResult['data']['message']) ? $addResult['data']['message'] : ('HTTP '.$addResult['httpCode']);
		$batchErrors[] = $msg;
		continue;
	}

	$failures = !empty($addResult['data']['contacts']['failure']) ? $addResult['data']['contacts']['failure'] : array();
	$nbAdded  += (count($batch) - count($failures));
	$nbErrors += count($failures);
	foreach ($failures as $failure) {
		$batchErrors[] = !empty($failure['email']) ? $failure['email'].' : '.(!empty($failure['reason']) ? $failure['reason'] : 'erreur') : 'erreur';
	}
}

echo json_encode(array(
	'success'  => true,
	'listId'   => $newListId,
	'listName' => $listName,
	'nbEmails' => count($emails),
	'nbAdded'  => $nbAdded,
	'nbErrors' => $nbErrors,
	'errors'   => $batchErrors,
));

$db->close();
