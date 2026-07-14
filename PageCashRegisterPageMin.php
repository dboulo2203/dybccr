<?php



/*

 * To change this license header, choose License Headers in Project Properties.

 * To change this template file, choose Tools | Templates

 * and open the template in the editor.

 */

 





// Load Dolibarr environment

$res = 0;

// Try main.inc.php into web root known defined into CONTEXT_DOCUMENT_ROOT (not always defined)



if (!$res && !empty($_SERVER["CONTEXT_DOCUMENT_ROOT"]))

    $res = @include $_SERVER["CONTEXT_DOCUMENT_ROOT"] . "/main.inc.php";



// Try main.inc.php into web root detected using web root calculated from SCRIPT_FILENAME

$tmp = empty($_SERVER['SCRIPT_FILENAME']) ? '' : $_SERVER['SCRIPT_FILENAME'];

$tmp2 = realpath(__FILE__);

$i = strlen($tmp) - 1;

$j = strlen($tmp2) - 1;

while ($i > 0 && $j > 0 && isset($tmp[$i]) && isset($tmp2[$j]) && $tmp[$i] == $tmp2[$j]) {

    $i--;

    $j--;

}

if (!$res && $i > 0 && file_exists(substr($tmp, 0, ($i + 1)) . "/main.inc.php"))

    $res = @include substr($tmp, 0, ($i + 1)) . "/main.inc.php";

if (!$res && $i > 0 && file_exists(dirname(substr($tmp, 0, ($i + 1))) . "/main.inc.php"))

    $res = @include dirname(substr($tmp, 0, ($i + 1))) . "/main.inc.php";



// Try main.inc.php using relative path

if (!$res && file_exists("../main.inc.php"))

    $res = @include "../main.inc.php";

if (!$res && file_exists("../../main.inc.php"))

    $res = @include "../../main.inc.php";

if (!$res && file_exists("../../../main.inc.php"))

    $res = @include "../../../main.inc.php";

if (!$res)

    die("Include of main fails");



	//***** *******************************************************

	// *** LOad librairies

	// require_once DOL_DOCUMENT_ROOT . '/core/class/html.formfile.class.php';

	// require_once DOL_DOCUMENT_ROOT . '/custom/dklcompta/lib/dklcompta.lib.php';

	// require_once DOL_DOCUMENT_ROOT . '/core/class/html.formother.class.php';

	 llxHeader("", $langs->trans("Outils reporting compta DKL"));



	// *** Image de titre

	 print load_fiche_titre($langs->trans("Zöpa - Clôture de caisse pour la période"), '', 'favicon.png@dklcompta');



	// $head = dklcomptaPrepareHead();

	 // dol_fiche_head(null, '');





	// Security check

	if (!$user->rights->dklcompta->myobject->read)

		accessforbidden();



	require_once DOL_DOCUMENT_ROOT . '/core/class/html.formother.class.php';

	

// Security check

  if (!$user->rights->dklcompta->myobject->read)

    accessforbidden();



?>

<script type="text/javascript">     

    function PrintDiv() {    

       var divToPrint = document.getElementById('divToPrint');

       var popupWin = window.open('', '_blank', 'width=300,height=300');

       popupWin.document.open();

       popupWin.document.write('<html><body onload="window.print()">' + divToPrint.innerHTML + '</html>');

        popupWin.document.close();

            }

 </script>





<?php

//***** *******************************************************

print "<div class=\"div-table-responsive-no-min\">";

print "<div class=\"fichehalfleft\">";



print '<form method="get" name="statform" action="' . $_SERVER['PHP_SELF'] . '" >';

	print '<input type="hidden" name="token" value="' . newToken() . '">';

	print '<input type="hidden" name="action" value="get">';



	print '<table class="border centpercent">';

	print '<tr><td>' . "Date début : </td><td>";



	$search_sale = $_GET["search_sale"];

	$firstdate = DateTime::createFromFormat('d/m/Y H:i:s', $_GET["ddebut"] . " 00:00:00");

	$lastdate = DateTime::createFromFormat('d/m/Y H:i:s', $_GET["dfin2"] . "  23:59:59");



	print $form->selectDate($firstdate ? $firstdate->getTimestamp() : '', 'ddebut', 0, 0, 2, 'statform', 1, 1);





	print '</td></tr>';



	print '<tr><td>' . "Date fin : </td><td>";

	print $form->selectDate($lastdate ? $lastdate->getTimestamp() : '', 'dfin2', 0, 0, 2, 'statform', 1, 1);



	print "</td> </tr>";

	print "<tr><td>Utilisateur</td><td>";

	require_once DOL_DOCUMENT_ROOT . '/core/class/html.formother.class.php';

	$formother = new FormOther($db);

	print $formother->select_salesrepresentatives($search_sale, 'search_sale', $user, 0, 1, 'maxwidth300', 1);

	print "</td>";

	print '</tr>';

	print "<tr>";

	print "<td></td><td>";
	print '<div class="center"><input type="submit" class="button" name"submit" value="Rafraîchir"> &nbsp;</div>';
	print '</td> </tr>';
	print "</div>";	
	print "</table>";
print '</form>';
print "</div>";
print "<div class=\"fichehalfright\">";
print "</div>";
print "</div>";



if ($firstdate && $lastdate) {

 //  **************************************

// *** Paiements vus de llx_paiement

	print "<div id=divToPrint >";
		print "<div  class=\"div-table-responsive-no-min\">";
			print "<tr><td> <h3>Clôture de caisse du " . $firstdate->format('d/m/Y H:i:s') . " au " .
				$lastdate->format('d/m/Y H:i:s') . " pour " . $search_sale . "</h3></td></tr>";
			print "<div class=\"fichehalfleft\">";
				print "<hr><h3>Paiements (de la table des paiements)</h3> ";
				if ($search_sale > 0) {
					$sql = " select llx_user.lastname , llx_c_paiement.libelle, sum(amount) as total from llx_paiement
					left join llx_c_paiement on llx_c_paiement.id=llx_paiement.fk_paiement
					left join llx_user on llx_user.rowid=   llx_paiement.fk_user_creat
					where llx_paiement.datec>='" . $firstdate->format('Y-m-d H:i:s') . "' and llx_paiement.datec<='" . $lastdate->format('Y-m-d H:i:s') . "'";
					$sql .= " and llx_paiement.fk_user_creat='" . $search_sale . "'";
					$sql .= " group by llx_user.lastname ,llx_c_paiement.libelle";
				} else {
					$sql = "select  llx_c_paiement.libelle, sum(amount) as total from llx_paiement
					left join llx_c_paiement on llx_c_paiement.id=llx_paiement.fk_paiement
					left join llx_user on llx_user.rowid=   llx_paiement.fk_user_creat
					where llx_paiement.datec>='" . $firstdate->format('Y-m-d H:i:s') . "' and llx_paiement.datec<='" . $lastdate->format('Y-m-d H:i:s') . "'";
					$sql .= " group by llx_c_paiement.libelle";

				}



				$resql = $db->query($sql);

				if ($resql) {

					$num = $db->num_rows($resql);



					$total = 0;

					$stotal = 0;

					$oldlabel = "";

					$newlabel = "";

					print '<table class="noborder centpercent">';

					print "<tr>";

					print "<th>Mode paiement</th>";

					print "<th>Montant</th>";

					print "</tr>";

					for ($i = 1; $i <= $num; ++$i) {

						$obj = $db->fetch_object($resql);

						print '<tr class="liste_titre">';

						print "<td  class=\"nowrap left\">" . $obj->libelle . "</td>";

						print "<td class=\"nowrap right\">" . sprintf("%01.2f", $obj->total) . "</td>";

						$total += $obj->total;

						print "</tr>";

					}

					print '<tr class="liste_titre">';

					print "<td class=\"nowrap left\"><b>Total</b></td>";

					print "<td class=\"nowrap right\">" . sprintf("%01.2f", $total) . "</td>";



					print "</tr>";



					PRINT "</table>";

				} else {

					print ("nothing found");

				}

			print "</div>";



		 print "</div>";

	 

	 // ***********************************

// *** CA facturé 

			 print "<div  class=\"div-table-responsive-no-min\">";

				print "<div class=\"fichehalfleft\">";

				print "<hr><h3>CA facturé (de la table des factures payées)</h3> ";



				if ($search_sale > 0) {
					$sql = "select u.login as user, f.`type` as ftype,fd.description, p.accountancy_code_sell as ccompta, sum(fd.total_ttc) as ptotal from llx_facture as f
					left join llx_facturedet as fd on fd.fk_facture=f.rowid
					left join llx_product as p on p.rowid=fd.fk_product
					left join llx_user as u on u.rowid=f.fk_user_closing
					where f.paye=1 and f.date_closing>='" . $firstdate->format('Y-m-d H:i:s') . "' and f.date_closing<='" . $lastdate->format('Y-m-d H:i:s') . "'";
					$sql .= " and f.fk_user_closing='" . $search_sale . "'";
					$sql .= " group by u.login,f.`type`,p.accountancy_code_sell";
				} else {
					$sql = "select  f.`type` as ftype,fd.description,p.accountancy_code_sell as ccompta, sum(fd.total_ttc) as ptotal from llx_facture as f
					left join llx_facturedet as fd on fd.fk_facture=f.rowid
					left join llx_product as p on p.rowid=fd.fk_product
					left join llx_user as u on u.rowid=f.fk_user_closing
					where f.paye=1 and f.date_closing>='" . $firstdate->format('Y-m-d H:i:s') . "' and f.date_closing<='" . $lastdate->format('Y-m-d H:i:s') . "'";
					$sql .= " group by f.`type`,p.accountancy_code_sell";
				}

				$resql = $db->query($sql);
				if ($resql) {
					$num = $db->num_rows($resql);
					$total = 0;
					print '<table class="noborder centpercent">';
						print "<tr>";			   
						print "<th class=\"nowrap left\"> type facture</th>";
						print "<th class=\"nowrap left\">Code comptable</th>";
						print "<th>Montant</th>";
						print "</tr>";
						for ($i = 1; $i <= $num; ++$i) {
							print '<tr class=;"liste_titre">';
							$obj = $db->fetch_object($resql);
							print "<td class=\"nowrap left\">" . ($obj->ftype == 0 ? "Facture" : ($obj->ftype == 3 ? "Acompte" : "Autre")) . "</td>"; // '$obj->ftype
							print "<td class=\"nowrap left\">" . ($obj->ccompta==null ? ($obj->description== '(DEPOSIT)' ? "4191 - Déduction d'acompte" : $obj->description) : $obj->ccompta) . "</td>";
							print "<td class=\"nowrap right\">" . sprintf("%01.2f", $obj->ptotal) . "</td>";

							$total += $obj->ptotal;
						}
						print "</tr>";
						print "<tr class='liste_titre'>";
					   print"<td></td>";
						print"<td class=\"nowrap left\"><b>Total</b></td>";
						print "<td class=\"nowrap right\">" . sprintf("%01.2f", $total) . "</td>";
						print"</tr>";
					PRINT "</table>";

				print "</div>";
			print "</div>";
				} else {
					print ("nothing found");
				}

				

		

    print "</div>";

print "</div>";

?>





<div id="divToPrint" style="display:none;">

  <div style="width:400px;height:300px;background-color:teal;">

           <?php echo $html; ?>      

  </div>

</div>

<div>

  <input type="button" class="button" value="Imprimer clôture" onclick="PrintDiv();" />

</div>



<?php

}

