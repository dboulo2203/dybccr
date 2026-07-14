<?php

/**
 * Récupère les Nom, les prénoms, les numéros de téléphone et les email de chaque adhérents.
 * 
 * @param string Chemin du fichier
 * @return array Renvoie le contenue des colonnes donnée dans $header_need
 */
function getNPTMA($path): array|bool{
  
  $header_need = ['Nbr', 'Nom', 'Prénom', 'Portable', 'Courriel', 'Année'];
  //essaye d'ouvrir le fichier
  if (($handle = fopen($path, 'r')) !== false) {

    //initialisation des variables
    $rows = [];
    $index_need = [];

    //lecture des headers uniquement
    $headers = fgetcsv($handle, 0, ',');
    //suppression du BOM si présent
    if (isset($headers[0])) {
        $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', $headers[0]);
    }
    
    //récupération des indexs des colonnes qui nous intéressent
    foreach ($headers as $index => $header) {
      if (in_array($header, $header_need)){
        $header = trim($header);
        $index_need[$header] = $index;
      }
    }
    

    //lecture des lignes qui sont dans les colonnes choisie
    while (($ligne = fgetcsv($handle, 0, ',')) !== false) {
        $extrait = [];
        foreach ($index_need as $nom_colonne => $index) {
            $extrait[$nom_colonne] = $ligne[$index];
        }
        
        if (intval($extrait['Nbr']) == 1) {
          $rows[] = $extrait;
        }
        
    }

      fclose($handle);

      return $rows;
  }
  //En cas d'erreur
  else {
    return false;
  }
}

/**
 * Renomme les colonnes dans le bon format
 * @param array $arrays, un tableau récupérer dans la fonction getNPTMA()
 * @return array{EMAIL: string, NOM: string, PRENOM: string, SMS: string} Renvoie le tableau avec les colonnes renommers avec les standards demander par brevo (en français)
 */
function renameRightColumn($arrays){
  $result = [];

  foreach ($arrays as $array) {
      $result[] = [
          'EMAIL' => $array['Courriel'],
          'PRENOM' => $array['Prénom'],
          'NOM' => $array['Nom'],
          'SMS' => formatPhoneNumber($array['Portable'])
      ];
  }
  return $result;
}

/**
 * Summary of formatPhoneNumber
 * @param mixed $number
 */
function formatPhoneNumber($number) {
    // Supprimer tout sauf les chiffres
    $digits = preg_replace('/\D/', '', $number);

    // Si le numéro commence par 0 et fait 10 chiffres (ex: 0601020304)
    if (strlen($digits) === 10 && $digits[0] === '0') {
        return '+33' . substr($digits, 1);
    }

    // Si déjà en format international
    if (preg_match('/^\+33\d{9}$/', $number)) {
        return $number;
    }

    // Sinon retour vide (mauvais format)
    return '';
}

/**
 * transformation du tableau en string
 * @param array $arrays, Un tableau comportant les colonnes que l'on souhaite
 * @return string Renvoie le tableau sous la forme d'une chaine de caractère séparer par des vigurles
 */
function arrayTOstring($arrays){
  $csvString = "EMAIL,PRENOM,NOM,SMS\n";
  foreach ($arrays as $array) {
    $csvString .= "{$array['EMAIL']},{$array['PRENOM']},{$array['NOM']},{$array['SMS']}\n";
  }
  return $csvString;
}



 /**
 * Écrit un tableau de données dans un fichier CSV
 */
function ecrireCsv($cheminFichier, $donnees, $entetes = [], $separateur = ',') {
    $dir = dirname($cheminFichier);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    $f = fopen($cheminFichier, 'w');
    if ($f === false) {
        die("Impossible d'ouvrir le fichier pour écriture : $cheminFichier");
    }
    if ($entetes) {
        fputcsv($f, $entetes, $separateur);
    }
    foreach ($donnees as $ligne) {
        fputcsv($f, $ligne, $separateur);
    }
    fclose($f);
}

/**
 * Récupère l'année en cours et l'année suivante
 *
 * @return string Une chaine de caractère sous la forme "$anneeCourante-$anneeSuivante"
 */
function getAnnees() {
    $date = date("Y-m");
    $anneeCourante = date("Y");
    if ($date >= "$anneeCourante-09"){
        $anneeSuivante = $anneeCourante + 1;
        return "$anneeCourante-$anneeSuivante";
    }
    else{
        $anneeprecedente = $anneeCourante - 1;
        return "$anneeprecedente-$anneeCourante";
    }    
}


/**
 * Valide et trie les contacts d'un fichier CSV en séparant les valides et les invalides.
 * 
 * @param string $fichierOriginal Chemin du fichier CSV source.
 * @param string $fichierValide Chemin du fichier où seront enregistrés les contacts valides.
 * @param string $fichierInvalide Chemin du fichier où seront enregistrés les contacts invalides.
 */
function verifierContactEtClasser($fichierOriginal, $fichierValide, $fichierInvalide) {
    if (!file_exists($fichierOriginal)) {
        die("Fichier introuvable : $fichierOriginal");
    }

    $handle = fopen($fichierOriginal, 'r');
    $entetes = fgetcsv($handle, 0, ';');
    $separateur = ';';

    // Réessaie avec ',' si mauvais format
    if (!$entetes || count($entetes) < 3) {
        fclose($handle);
        $handle = fopen($fichierOriginal, 'r');
        $entetes = fgetcsv($handle, 0, ',');
        $separateur = ',';
    }

    // Nettoyage des entêtes
    $entetes = array_map(function ($col) {
        return trim(preg_replace('/^\xEF\xBB\xBF/', '', $col));
    }, $entetes);

    // Localisation des colonnes clés
    $emailKey = null;
    $telKey = null;
    $nbrKey = null;
    $anneeKey = null;
   
    foreach ($entetes as $col) {
        $colUpper = strtoupper(trim($col));
        if (in_array($colUpper, ['COURRIEL'])) $emailKey = $col;
        if (in_array($colUpper, ['PORTABLE'])) $telKey = $col;
        if (in_array($colUpper, ['NBR'])) $nbrKey = $col;
        if (in_array($colUpper, ['ANNéE'])) $anneeKey = $col;
        
    }
    
    if (!$emailKey) {
        die("Colonne courriel introuvable");
    }

    // Initialisation
    $valideData = [];
    $invalideData = [];
    $doublons = [];
    $date = getAnnees();
    $emailsMap = []; // Associe chaque email à ses lignes
    $ColonnesSouhaiter = ['Nom', 'Prénom', 'Courriel', 'Portable'];

    while (($ligne = fgetcsv($handle, 0, $separateur)) !== false) {
        if (count($ligne) != count($entetes)) {
            $invalideData[] = array_merge($ligne, ['Ligne mal formée']);
            continue;
        }
        
        $data = array_combine($entetes, $ligne);
        $email = trim(preg_replace('/^\xEF\xBB\xBF/', '', $data[$emailKey] ?? ''));
        $tel = isset($data[$telKey]) ? preg_replace('/\D/', '', $data[$telKey]) : '';
        $nbr = trim($data[$nbrKey] ?? '');
        $annee = trim($data[$anneeKey] ?? '');
        $erreurs = [];
        
        if ($annee === $date){
            if ($nbr === '1') {
                // Vérification email
                if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    // Vérification téléphone si présent
                    if ($tel !== '' && !preg_match('/^(?:\+33|0033|0)[1-9]\d{8}$/', $tel)) {
                        $erreurs[] = "Telephone invalide";
                        $donneesFiltrees = array_intersect_key($data, array_flip($ColonnesSouhaiter));
                        $invalideData[] = array_merge($donneesFiltrees, [implode(', ', $erreurs)]);
                    }

                    // Ajoute aux doublons l'email
                    if (!isset($emailsMap[$email])) {
                        $emailsMap[$email] = [];
                    }
                    $emailsMap[$email][] = $data;
                }
                else {
                    $erreurs[] = "Email invalide";
                    $donneesFiltrees = array_intersect_key($data, array_flip($ColonnesSouhaiter));
                    $invalideData[] = array_merge($donneesFiltrees, [implode(', ', $erreurs)]);
                }
            }
        }
    }
    

    fclose($handle);

    // Analyse des emails groupés
    foreach ($emailsMap as $email => $group) {
        if (count($group) > 1 && $email !== '-') {
            foreach ($group as $ligne) {
                $doublons[] = $ligne;
            }
        } else {
            $valideData[] = array_values($group[0]); // format ligne simple
        }
    }

    // Fusionne les doublons avec concatNomPrenomDoublons()
    if (!empty($doublons)) {
        $fusionnes = concatNomPrenomDoublons($doublons, $emailKey, 'Nom', 'Prénom');
        foreach ($fusionnes as $ligne) {
            $valideData[] = array_map(function ($col) {
                return is_string($col) ? $col : '';
            }, array_values($ligne)); // ligne formatée
        }
    }

    // Écrit les fichiers
    $entetesInvalide = ['Nom', 'Prenom', 'Telephone', 'Courriel', 'Code d\'erreurs'];
    ecrireCsv($fichierValide, $valideData, $entetes, ',');
    ecrireCsv($fichierInvalide, $invalideData, $entetesInvalide, ';');
    return true;
}

/**
 * En cas de doublon d'email, concatène les noms/prénoms associés sauf si email = '-'.
 */
function concatNomPrenomDoublons($data, $emailKey, $nomKey, $prenomKey) {
    $groupes = [];

    foreach ($data as $ligne) {
        $email = trim(preg_replace('/^\xEF\xBB\xBF/', '', $ligne[$emailKey]));

        if (!isset($groupes[$email])) {
            $groupes[$email] = [];
        }

        $groupes[$email][] = $ligne;
    }

    $resultat = [];

    foreach ($groupes as $email => $group) {
        if ($email === '-') {
            foreach ($group as $ligne) {
                $resultat[] = $ligne;
            }
        } elseif (count($group) > 1) {
            $noms = [];
            $prenoms = [];

            foreach ($group as $ligne) {
                $noms[] = trim($ligne[$nomKey]);
                $prenoms[] = trim($ligne[$prenomKey]);
            }

            $fusion = $group[0];
            $fusion[$nomKey] = implode(' / ', array_unique($noms));
            $fusion[$prenomKey] = implode(' / ', array_unique($prenoms));
            $resultat[] = $fusion;
        } else {
            $resultat[] = $group[0];
        }
    }
    return $resultat;
}



