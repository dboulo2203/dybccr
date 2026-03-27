<?php
// *** Main entry for the API
use Src\Controller\PersonController;

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$body="Request not found";

// *** Parse URL and check url validity
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );

$apiIndex = array_search("api",$uri);
if (count($uri)<($apiIndex+2)) {
    header("HTTP/1.1 404 Not Found");
    echo "Incorrect url";
    exit();
}

// *** Get the main request (the verb)
$domain=$uri [$apiIndex+2];
$requestMethod = $_SERVER["REQUEST_METHOD"];

/** Open database */
 // require_once '../../outils/utils.php';
 require_once '../../public/config.php';
 require_once('./apiController.php');
 $pdo = init_pdo($dbHost, $db, $dbUser, $dbMdp);

switch ($domain) {
    case 'person':
      //   if ($requestMethod=="GET") {
        // require_once('./apiController.php');
            if (isset($uri[$apiIndex+3])) {
                // require_once('../creation/creationMVC.php');
                $body=getPersonApi($uri[$apiIndex+3], $pdo);
            }
      //  } else {if ($requestMethod=="PUT") {}

        break;
    case 'personbymail':
        require_once('./apiController.php');
        if (isset($uri[$apiIndex+3])) {
            // require_once('../creation/creationMVC.php');
            $body=getPersonByMailWS( $pdo,$uri[$apiIndex+3]);
        }
        break;
    case 'personSubscriptions':
        require_once('./apiController.php');
        if (isset($uri[5])) {
            // require_once('../creation/creationMVC.php');
            $body=getPersonSubscriptionsApi($uri[$apiIndex+3], $pdo);
        }
        break;
    case 'personInscriptions':
        require_once('./apiController.php');
        if (isset($uri[5])) {
            // require_once('../creation/creationMVC.php');
            $body=getPersonInscriptionsApi($uri[$apiIndex+3], $pdo);
        }
        break;
    case 'personpayments':
        require_once('./apiController.php');
        if (isset($uri[5])) {
            // require_once('../creation/creationMVC.php');
            $body=getPersonPaymentsApi($uri[$apiIndex+3], $pdo);
        }
        break;
    
    case 'searchperson' : 
        require_once('./apiController.php');
        $body=getSearchWS($pdo,$uri[$apiIndex+3]);
        break;

    case 'searchpersonbyactivity' : 
        require_once('./apiController.php');
        $body=getInscriptionPersonListToActivityWS($pdo,$uri[$apiIndex+3]);
        break;
    
    case 'activities':
        require_once('./apiController.php');
        if (isset($uri[$apiIndex+3])) {
          $body=getActivityWS($pdo, $uri[$apiIndex+3],);
          
        }
        else
            // *** Get all activities
            $body=getActivitesWS($pdo);
       //** */ require_once('../creation/creationMVC.php');
        break;   
        
    case 'activitybycode':
        require_once('./apiController.php');
        if (isset($uri[$apiIndex+3]))
          $body=getActivityByCodeWS($pdo, $uri[$apiIndex+3],);  
        
        break;   
   case 'checkorderintegration':
        require_once('./apiController.php');      
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
          $body=checkOrderIntegrationApi($pdo, $data);  
        
        break;   

    default:
        header("HTTP/1.1 404 Not Found");
        echo "Incorrect url, unknowned verb : " . $domain;
        exit();
}

// *** Send the response
$response['body'] = json_encode($body );

$response['status_code_header'] = 'HTTP/1.1 200 OK';
header($response['status_code_header']);
echo $response['body'];



/**
 * Function for initialize PDO
 * @param mixed $host (ex: localhost)
 * @param mixed $db name of database
 * @param mixed $user user who we want connect
 * @param mixed $pass the password of this user
 * @return PDO connexion to the database
 */
function init_pdo($host, $db, $user, $pass) {
    $port = "3306";
    $charset = 'utf8mb4';
    $options = [
        \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        \PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset;port=$port";
    $pdo = new \PDO($dsn, $user, $pass, $options);
    return $pdo;
}
