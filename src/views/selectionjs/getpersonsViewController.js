
import { getPersonforCriteria, getPersonforActivity, getSubList, addList, getActivities } from './selectionService.js'
import { displayPersonList, displaySelectionjsContent } from './selectjsViewController.js'
const editModaleString = `
        <div class="modal fade " id="myModalgetPerson" role="dialog" data-bs-backdrop="static"
                data-bs-keyboard="false" >
            <div class="modal-dialog modal-xl">
                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <!-- <button type="button" class="close" data-dismiss="modal">&times;</button> -->
                        <h5 class="modal-title">Ajouter des personnes à la liste en cours </h5>
                    </div>
                    <div class="row modal-body" id="modalbodyPack">
                        <p>Some text in the modal.</p>
                    </div>

                    <div class="modal-footer">
                    </div>

                </div>
            </div>
        </div>
`;

// TODO : Manage callback
export async function getpersonsViewDisplay(htlmPartId) {

    let personList = "";
    let editModal = null;

    try {
        // *** Display main part of the page
        document.querySelector("#" + htlmPartId).innerHTML = editModaleString;

        let personsList = [] // await getPersonforCriteria("");
        // console.log(json_encode(personsList));
        let activities = await getActivities();
        let outpuStr = `
        <!--<h1 class="modal-title fs-5" id="exampleModalLabel">Listes des personnes</h1>-->
        <div class="row">
            <div class="col-4">
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="" id="searchString" name="searchString" aria-label="" aria-describedby="" value="">
                    <button type="" value=""  class="btn btn-outline-secondary" id="buttonSearch">Chercher</button>
                </div>
            </div>

            <div class="col-6" style="margin-right:5px">
               <div class="dropdown" >
                    <a class="btn btn-outline-secondary dropdown-toggle"  href="#" role="button" id="activiteList" data-bs-toggle="dropdown" aria-expanded="false">
                        Recherches définies
                    </a>

                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink" id="activityChoice">
                    `;
        activities.map((activity, index) => {
            outpuStr += `<li class="dropdown-item" id="${activity.act_id}">${activity.act_libelle}</li>`
        });

        outpuStr += `</ul>
                </div>
            <!--</div>

            <div class="col-1"> -->
               <div class="dropdown">
                    <a class="btn btn-outline-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                        Année
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                    <li><a class="dropdown-item" href="#">Par défaut - année en cours</a></li>
                        <li><a class="dropdown-item" href="#">2024-2025</a></li>
                        <li><a class="dropdown-item" href="#">2023-2024</a></li>
                        <li><a class="dropdown-item" href="#">Tout</a></li>
                    </ul>
                </div>
            </div>
        </div>
 
        <div class="row ">
            <div class="col-12 d-flex flex-row-reverse">
                <button type="submit" class="btn btn-outline-secondary  btn-sm" id="btnSaveList" class="btn btn-primary" style= "margin-left:3px"  >Sauver</button>
                <button type="button" class="btn btn-outline-secondary  btn-sm" data-bs-dismiss="modal" style= "margin-left:3px" >Annuler</button>

            </div>
        </div>
 
        <div id="searchResultPart"></div>
        `;

        // outpuStr += displayResultList(personsList);

        // *** Display string
        // outpuStr += displayResultList(personsList);
        document.querySelector("#modalbodyPack").innerHTML = outpuStr;

        // *** Search with activity choice
        document.querySelector("#activityChoice").onclick = async function (event) {
            // *** Get data with criteria
            let act_id = event.target.id;
            let personsList = await getPersonforActivity(act_id);
            console.log("buttonSearch");
            // *** Display data
            let outpuStr = displayResultList(personsList);
            document.querySelector("#searchResultPart").innerHTML = outpuStr;
            // *** Add event listener
            document.getElementById("mainCheckSub").addEventListener('change', function (e) {
                const cbox = document.querySelectorAll(".personcheckSub");
                for (let i = 0; i < cbox.length; i++) {
                    cbox[i].checked = e.target.checked;
                }
            });
        }

        // *** Search with string criteria
        document.querySelector("#buttonSearch").onclick = async function (event) {
            // *** Get data with criteria
            let personsList = await getPersonforCriteria(document.querySelector("#searchString").value);
            console.log("buttonSearch");
            // *** Display data
            let outpuStr = displayResultList(personsList);
            document.querySelector("#searchResultPart").innerHTML = outpuStr;
            // *** Add event listener
            document.getElementById("mainCheckSub").addEventListener('change', function (e) {
                const cbox = document.querySelectorAll(".personcheckSub");
                for (let i = 0; i < cbox.length; i++) {
                    cbox[i].checked = e.target.checked;
                }
            });
        };

        document.querySelector("#btnSaveList").onclick = async function (event) {
            // let personsList = await getPersonforCriteria(document.querySelector("#searchString").value);
            //  console.log("btnSaveList");

            let subList = getCheckedPersonList();
            addList(subList);

            // *** Display list
            editModal.hide();
            displaySelectionjsContent("mainActiveSection");
        };

        // *** Initialisation
        // $(document).ready(function () {
        editModal = new bootstrap.Modal(document.querySelector("#myModalgetPerson"))
        editModal.show({ backdrop: 'static', keyboard: false });
        // });

    } catch (error) {
        // console.log(`Error: ${ error } `);
        document.querySelector("#" + htlmPartId).innerHTML = `<div class="alert alert-danger" style = "margin-top:30px" role = "alert" > ${error}</div > `;
    }
}

/**
 * 
 * @returns 
 */
function getCheckedPersonList() {
    let returnTab = [];
    let cbox = document.querySelectorAll(".personcheckSub");

    for (let i = 0; i < cbox.length; i++) {
        if (cbox[i].checked === true) {
            console.log("checked = " + + cbox[i].dataset.service + "</br>");
            returnTab.push(JSON.parse(cbox[i].dataset.service));
        }
    }
    return returnTab;
}
/**
 * 
 * @param {*} personsList 
 * @returns 
 */
function displayResultList(personsList) {
    let outpuStr = `</hr>
     <div class="col-12 "> ${personsList.length} résultats dans la liste
    </div >

    <table class="table table-striped">
    <thead>
        <tr>
            <th scope="col">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="mainCheckSub">
                </div>
            </th>
            <th scope="col">Nom Prénom</th>
            <th scope="col">Email</th>

        </tr>
    </thead>
    <tbody>`;

    personsList.map((person, index) => {
        outpuStr += `<tr>
        <td> <div class="form-check">
            <input class="form-check-input personcheckSub" type="checkbox" data-service='${JSON.stringify(person)}'>
        </div>
        <td>  ${person.per_nom} ${person.per_prenom}</td>
        <td> ${person.per_email}</td>
         </tr>`;
    });
    outpuStr += `</tbody>
    </table>
    `;
    return outpuStr;
}

