// *** Component ressources
import { getpersonsViewDisplay } from './getpersonsViewController.js'
import { getAppPath } from '../../shared/commonServices/commonFunctions.js'
import { exportPersonListtoBrevoMVC } from './exportPersonListtoBrevoViewController.js'
import { getExportPersonListViewDisplay } from './exportPersonListViewController.js'

import { getActivities, getPersonforActivity, removeSubList } from './selectionService.js'
import { getList } from './selectionService.js'
import { headerViewDisplaySelectionjs } from '../../shared/commonServices/commonFunctions.js'
/**
 * when called from the url
 * get the parameters and launch the controller
 */
export async function startSelectionjsController() {

  // *** Initialisations
  try {
    headerViewDisplaySelectionjs("menuSection")
    displaySelectionjsContent("mainActiveSection");

  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert(
      'alert-danger',
      error.message || error
    );
  }
}

/**
 * Display 
 * @param {*} htlmPartId 
 * @param {*} searchString : the string to searched in the database 
 */
export async function displaySelectionjsContent(htlmPartId) {

  // *** Display the controller skeleton
  let initString = `
      <div class="row" style="margin-top:100px">
        <div class="col-12">
          <div class="d-flex justify-content-between" style="backgournd-color:">
              <div class="h5" style="color:#d07d29">Liste de personnes
              </div>

              <div class="d-flex justify-content-end" >
                <div id="removePersonButton" style="cursor: pointer;margin-right:2px" data-toggle="tooltip" data-placement="bottom" title="Créer une liste Brevo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                  </svg>             
                </div>

                <div id="plusPersonButton" style="cursor: pointer;margin-right:10px" data-toggle="tooltip" data-placement="bottom" title="Créer une liste Brevo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-clipboard-plus" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7"/>
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
                  </svg>
              </div>
 
              <div class="" style="cursor: pointer;margin-left:10px" data-toggle="tooltip" data-placement="bottom" title="Créer une liste Brevo">
                <div id="brevoButton" style="cursor: pointer;margin-left:5px" data-toggle="tooltip" data-placement="bottom" title="Créer une liste Brevo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-mailbox-flag" viewBox="0 0 16 16">
                      <path d="M10.5 8.5V3.707l.854-.853A.5.5 0 0 0 11.5 2.5v-2A.5.5 0 0 0 11 0H9.5a.5.5 0 0 0-.5.5v8zM5 7c0 .334-.164.264-.415.157C4.42 7.087 4.218 7 4 7s-.42.086-.585.157C3.164 7.264 3 7.334 3 7a1 1 0 0 1 2 0"/>
                      <path d="M4 3h4v1H6.646A4 4 0 0 1 8 7v6h7V7a3 3 0 0 0-3-3V3a4 4 0 0 1 4 4v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v6h6V7a3 3 0 0 0-3-3"/>
                  </svg>
                </div>
              </div>
              <div class="" style="cursor: pointer;margin-left:2px" data-toggle="tooltip" data-placement="bottom" title="Exporter la liste" >
                <div id="exportButton" style="cursor: pointer;margin-left:5px" data-toggle="tooltip" data-placement="bottom" title="Créer une liste Brevo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-cloud-download" viewBox="0 0 16 16">
                          <path d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383"/>
                          <path d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708z"/>
                      </svg>
                  </div>
              </div>
              <!-- <div class="" style="cursor: pointer;margin-left:2px" data-toggle="tooltip" data-placement="bottom" title="Imprimer la liste">
                  <svg   xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-printer" viewBox="0 0 16 16">
                      <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
                      <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>
                      </svg>
              </div>-->
              
            </div>
        </div>
      </div>
            <hr/>
            <div id='modalePart'></div>
    <div id='resultPart'></div>
    
    `;
  document.querySelector("#" + htlmPartId).innerHTML = initString;

  try {

    // *** Load data from API
    let output = '';
    // let activities = await getActivities();
    let personListhtml = displayPersonList();


    document.querySelector("#resultPart").innerHTML = personListhtml;

    // $('#flexSwitchCheckDefault').change(function () {
    //   console.log($(this).is(':checked'))
    // })


    /*** Actions */
    document.querySelector("#plusPersonButton").onclick = function () {
      getpersonsViewDisplay("modalePart");
      let personListhtml = displayPersonList();
      document.querySelector("#resultPart").innerHTML = personListhtml;
    };

    document.querySelector("#brevoButton").onclick = async function () {
      await exportPersonListtoBrevoMVC("modalePart");
    };

    document.querySelector("#exportButton").onclick = async function () {
      await getExportPersonListViewDisplay("modalePart");
    };

    document.querySelector("#removePersonButton").onclick = function () {
      let chechedPersons = getCheckedPersonList();
      removeSubList(chechedPersons);
      displaySelectionjsContent("mainActiveSection");

    };


    // *** Main checkboxe change => change person checkbox
    document.getElementById("mainCheck").addEventListener('change', function (e) {
      const cbox = document.querySelectorAll(".personcheck");
      for (let i = 0; i < cbox.length; i++) {
        cbox[i].checked = e.target.checked;
      }
    });


  } catch (error) {
    document.querySelector("#messageSection").innerHTML = `<div class="alert alert-danger" style = "margin-top:30px" role = "alert" > ${error} - ${error.fileName}</br > ${error.stack}  </div > `;
  }
}

/**
 * 
 * @returns 
 */
function getCheckedPersonList() {
  let returnTab = [];
  let cbox = document.querySelectorAll(".personcheck");

  for (let i = 0; i < cbox.length; i++) {
    if (cbox[i].checked === true) {
      console.log("checked = " + + cbox[i].dataset.service + "</br>");
      returnTab.push(JSON.parse(cbox[i].dataset.service));
    }
  }
  return returnTab;
}
// *** VIEW **********************************//
export function displayPersonList() {
  let personlist = getList();

  // sort by name
  personlist.sort((a, b) => {
    const nameA = a.per_nom.toUpperCase(); // ignore upper and lowercase
    const nameB = b.per_nom.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  let outputStr =
    `<div>${personlist.length} résultats dans la liste</div>
  <table class="table table-striped">
      <thead>
          <tr>
          <th scope="col">
            <div class="form-check" >
                <input class="form-check-input" type="checkbox"  id="mainCheck" >
            </div>
          </th>

          <th scope="col">Nom Prénom</th>
          <th scope="col">Email</th>
          <th scope="col">Téléphone</th>
          <th scope="col">Adhésions</th>
          <th scope="col">Activités</th>            
          </tr>
      </thead>
      <tbody>`;
  //   
  personlist.map((person, index) => {
    outputStr +=
      `<tr>
        <td> <div class="form-check">
          <input class="form-check-input personcheck" type="checkbox"   data-service='${JSON.stringify(person)}' >
        </div>   
        <td><a href="${getAppPath()}/index.php?uc=crea&action=getpersonne&per_id=${person.per_id}">${person.per_nom}  ${person.per_prenom}</a></td >
        <td><a href=\"${getAppPath()}/index.php?uc=crea&action=getpersonne&per_id=${person.per_id}">${person.per_email}</a></td >
        <td><a href=\"${getAppPath()}/index.php?uc=crea&action=getpersonne&per_id=${person.per_id}">${person.per_tel}</a></td >
        <td><a href=\"${getAppPath()}/index.php?uc=crea&action=getpersonne&per_id=${person.per_id}">${person.subscrCOncat}</a></td >
        <td><a href=\"${getAppPath()}/index.php?uc=crea&action=getpersonne&per_id=${person.per_id}">${person.inscrptCOncat}</a></td>
      </tr > `;
  });

  outputStr += `</tbody>
  </table >
</div > 
`;
  //  document.querySelector("#resultPart").innerHTML = outputStr;

  // *** Add event listener for the checkboxes
  // addMultipleEnventListener(".personcheck", function (event) {
  //   let test = $(this);
  // });


  // $('#mainCheck').change(function () {
  //   console.log($(this).is(':checked'))
  // })

  return outputStr;

}
