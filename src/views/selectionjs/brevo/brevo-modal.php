<?php
/**
 * Class de gestion des adhérents, ajout d'adhérents a une liste, récupération des emails adhérents
 * dans une liste, récupération des adérents présent dans une liste,
 * vérification des contacts présent dans la liste
 */
class Adherents{

    /**
     * Récupère tous les Emails des contact présent dans une liste
     * 
     * @param string $Idlist, l'identifiant de la liste
     * @param string $apiKey, Clé API afin d'accéder a la liste via l'API
     * 
     * @return array $allEmailsInList, retourne tous les emails présent dans la liste
     */
    function getAllContacts($Idlist, $apiKey){

        //limite de contact a récupérer
        $limit = 500;

        //nombre de fois ou on vas refaire le tour avant de renvoyer le résultat
        $offset = 0;
        $allContacts = [];
        do {
            //passage des paramètres limit et offset par GET
            $contactsUrl = "https://api.brevo.com/v3/contacts/lists/$Idlist/contacts?limit=$limit&offset=$offset";

            //initialisation du curl via le liens
            $curl = curl_init($contactsUrl);
            
            //indique que la réponse doit être retournée sous forme de chaîne (pas affichée directement)
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

            //ajout des paramètres dans le header
            curl_setopt($curl, CURLOPT_HTTPHEADER, [
                "api-key: $apiKey",
                "accept: application/json"
            ]);

            //exécution du curl définie
            $response = curl_exec($curl);

            //comparaison de type, si $reponse est un booléen alors on quitte la boucle,
            //s'il n'y a pas eu d'erreur alors le retour sera le résultat, sinon ce sera un booléen
            if ($response === false) {
                echo "Erreur cURL : " . curl_error($curl) . "\n";
                curl_close($curl);
                exit;
            }

            //Récupération du code HTTP afin de gérer l'erreur
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            //ferme la session curl
            curl_close($curl);

            //Regarde si le code http est supérieur a 400, si c'est le cas il renvoie le code ainsi que l'offset auquel c'est arrivé
            if ($httpCode >= 400) {
                echo "<div p-3>Erreur HTTP $httpCode lors de la récupération des contacts (offset $offset).</div>\n";
                exit;
            }

            //met les données au format d'un tableau PHP associatif
            $data = json_decode($response, true);

            //Vérifie si les données sont un tableau, qu'il y a bien contacts dans le retour
            if (!is_array($data) || !isset($data['contacts'])) {
                echo "Erreur de format JSON ou clé 'contacts' manquante à l’offset $offset.\n";
                exit;
            }

            $count = count($data['contacts']);
            $allContacts = array_merge($allContacts, $data['contacts']);
            $offset += $limit;

        } while ($count === $limit);
        
        return ['contacts' => $allContacts];

    }

    /**
     * Récupère tous les emails des contacts présents dans un tableau
     * 
     * @param array $data Tableau contenant des contacts
     * @return array Liste des emails en minuscules
     */
    function getAllEmails($data){
        $allEmailsInList = [];

        foreach ($data['contacts'] as $contact) {
            // Recherche insensible à la casse de la clé email dans chaque contact
            $email = null;
            foreach ($contact as $key => $value) {
                if (strtolower($key) === 'email' && !empty($value)) {
                    $email = $value;
                    break;
                }
            }

            if ($email !== null) {
                $allEmailsInList[] = strtolower($email);
            }
        }

        return $allEmailsInList;
    }

    /**
     * Récupère tous les noms des contacts présents dans un tableau
     * 
     * @param array $data Tableau contenant des contacts
     * @return array Liste des noms en minuscules
     */
    function getAllNames($data){
        $allNameInList = [];

        foreach ($data['contacts'] as $contact) {
            // Vérifie que la clé attributes existe et est un tableau
            if (!empty($contact['attributes']) && is_array($contact['attributes'])) {
                // Recherche insensible à la casse de la clé "nom"
                foreach ($contact['attributes'] as $key => $value) {
                    if (strtolower($key) === 'nom' && !empty($value)) {
                        $allNameInList[] = strtolower($value);
                        break;
                    }
                }
            }
        }

        return $allNameInList;
    }

    /**
     * Récupère tous les prénoms des contacts présents dans un tableau
     * 
     * @param array $data Tableau contenant des contacts
     * @return array Liste des prénoms en minuscules
     */
    function getAllFirstNames($data){
        $allFirstNameInList = [];

        foreach ($data['contacts'] as $contact) {
            // Vérifie que la clé attributes existe et est un tableau
            if (!empty($contact['attributes']) && is_array($contact['attributes'])) {
                // Recherche insensible à la casse de la clé "prenom"
                foreach ($contact['attributes'] as $key => $value) {
                    if (strtolower($key) === 'prenom' && !empty($value)) {
                        $allFirstNameInList[] = strtolower($value);
                        break;
                    }
                }
            }
        }

        return $allFirstNameInList;
    }
    
    /**
     * Envoie un fichier CSV de contacts à l'API Brevo pour importation dans une liste donnée.
     *
     * @param string $content Contenu texte brut du fichier CSV (non encodé en base64).
     * @param string $apikey Clé API pour authentification.
     * @param int $listId Identifiant de la liste de contacts dans laquelle importer les contacts.
     * 
     * @return int Code HTTP de la réponse de l'API.
     * @throws Exception En cas d'erreur cURL ou d'erreur HTTP lors de l'import.
     */
    function addContact(string $content, string $apikey, int $listId): array {
        $contactsUrlImport = "https://api.brevo.com/v3/contacts/import";

        $request = [
            "listIds" => [$listId],          // List of IDs into which contacts are to be imported
            "updateEnabled" => true,         // Update existing contacts
            "fileBody" => $content,
            "fileType" => "csv"
        ];

        $curl = curl_init($contactsUrlImport);

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($request));

        curl_setopt($curl, CURLOPT_POST, true);

        // define HTTP headers needed
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            "api-key: $apikey",
            "accept: application/json",
            "content-type: application/json"
        ]);

        $response = curl_exec($curl);

        // cURL error handlings
        if ($response === false) {
            $err = curl_error($curl); 
            curl_close($curl);         
            throw new Exception("Erreur cURL : $err");
        }


        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        curl_close($curl);

        // return HTTP code
        return array($httpCode, $response);
    }

    /**
     * 
     */
    function checkContact(array $csvContent, array $emails, array $noms, array $prenoms){
        $nbAdherent = 0;
        $erreur = [];
        foreach ($csvContent as $contact) {
            $trouveN = false;
            $trouveP = false;
            $trouveE = false;

            //print_r($contact);
            foreach ($noms as $unNom) {
                if (strtoupper(trim($unNom)) === strtoupper(trim($contact["Nom"]))) {
                    $trouveN = true;
                    break;
                }
            }
            foreach ($emails as $unEmail) {
                if (strtoupper(trim($unEmail)) === strtoupper(trim($contact["Courriel"]))) {
                    $trouveE = true;
                    break;
                }
            }
            foreach ($prenoms as $unPrenom) {
                if (strtoupper(trim($unPrenom)) === strtoupper(trim($contact["Prénom"]))) {
                    $trouveP = true;
                    break;
                }
            }

            if ($trouveN && $trouveP && $trouveE) {
                $nbAdherent++;
            }
            else {
                $erreur[] = $contact;
            }
            
        }
        return $erreur;
    }

    /**
     * get all list in brevo
     * @return string json text
     * example :
     * {
     *	"lists": [
    *		{
    *			"id": 7,
    *			"name": "Name list",
    *			"folderId": 1,
    *			"uniqueSubscribers": 0,
    *			"totalBlacklisted": 0,
    *			"totalSubscribers": 0
    *		},
    *		{
    *			"id": 6,
    *			"name": "Name list",
    *			"folderId": 1,
    *			"uniqueSubscribers": 0,
    *			"totalBlacklisted": 0,
    *			"totalSubscribers": 0
    *		},
    *		{
    *			"id": 5,
    *			"name": "Name list",
    *			"folderId": 1,
    *			"uniqueSubscribers": 0,
    *			"totalBlacklisted": 0,
    *			"totalSubscribers": 0
    *		},
    *		{
    *			"id": 4,
    *			"name": "Name list",
    *			"folderId": 1,
    *			"uniqueSubscribers": 0,
    *			"totalBlacklisted": 0,
    *			"totalSubscribers": 0
    *		},
    *		{
    *			"id": 3,
    *			"name": "Name list",
    *			"folderId": 1,
    *			"uniqueSubscribers": 0,
    *			"totalBlacklisted": 0,
    *			"totalSubscribers": 0
    *		}
    *	],
    *	"count": 5
    *})
    * api-key : BREVO_API_KEY
    */
    function getAllListName($apikey){

        //limit of contact to recive (it's between 0 and 50)
        $limit = 50;

        //number which we remake this before return result
        $offset = 0;
        $allLists = [];
        do {
            $curl = curl_init();

            curl_setopt_array($curl, [
            CURLOPT_URL => "https://api.brevo.com/v3/contacts/lists?limit=$limit&offset=$offset",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => array(
                'accept: application/json',
                "API-key: $apikey"
            ),
            ]);

            $response = curl_exec($curl);

            if ($response === false) {
                echo "Erreur cURL : " . curl_error($curl) . "\n";
                curl_close($curl);
                exit;
            }

            //get Http code
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            curl_close($curl);
            
            if ($httpCode >= 400) {
                echo "<div p-3>Erreur HTTP $httpCode lors de la récupération des contacts (offset $offset).</div>\n";
                exit;
            }

            //make data on php associatif table
            $data = json_decode($response, true);

            if (!is_array($data) || !isset($data['lists'])) {
                echo "Erreur de format JSON ou clé 'lists' manquante à l’offset $offset.\n";
                exit;
            }

            $count = count ($data['lists']);
            $offset += $limit;
            $allLists = array_merge($allLists, $data['lists']);

        } while ($count === $limit);
        return $allLists;
    }
}
// $adherent = new Adherents();
$apikey = 'BREVO_API_KEY';
// $allList = $adherent -> getAllListName($apikey);
//print_r($allList);