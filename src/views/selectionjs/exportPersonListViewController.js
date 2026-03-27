
// import { getPersonforCriteria, getSubList, addList } from './selectionService.js'
import { getList } from './selectionService.js'
// import { displayPersonList } from './selectjsViewController.js'
const editModaleStringexport = `
        <div class="modal fade " id="myModalgetPerson" role="dialog" data-bs-backdrop="static"
                data-bs-keyboard="false" >
            <div class="modal-dialog modal-xl">
                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <!-- <button type="button" class="close" data-dismiss="modal">&times;</button> -->
                        <h5 class="modal-title">Exporter la liste en cours </h5>
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
export async function getExportPersonListViewDisplay(htlmPartId) {

    let personList = "";
    let editModal = null;

    try {
        // *** Display main part of the page
        jQuery("#" + htlmPartId).append(editModaleStringexport);

        let personsList = getList();
        // console.log(json_encode(personsList));
        let outpuStr = `
        <!--<h1 class="modal-title fs-5" id="exampleModalLabel">Listes des personnes</h1>-->
        <div class="row">
                <div class="col-12">
                Cette fonction permet d'exporter la liste de personnes dans le clipboard/presse papier.
                </div>
             </div>
            </hr>`;
        outpuStr += `<div class= "row"><div class= "col-12">`;
        personsList.map((person, index) => {
            outpuStr += person.per_nom + ", ";
        });
        outpuStr += `</div></div>


        <div class="row ">
            <div class="col-12 d-flex flex-row-reverse">
                <button type="submit" class="btn btn-outline-secondary  btn-sm" id="btnSaveList" style= "margin-left:3px" class="btn btn-primary" >Exporter</button>
                <button type="button" class="btn btn-outline-secondary  btn-sm" data-bs-dismiss="modal">Annuler</button>

            </div>
        </div>
 
        <div id="searchResultPart"></div>
        `;

        // outpuStr += displayResultList(personsList);

        // *** Display string
        document.querySelector("#modalbodyPack").innerHTML = outpuStr;

        document.querySelector("#btnSaveList").onclick = async function (event) {
            // let personsList = await getPersonforCriteria(document.querySelector("#searchString").value);
            console.log("btnSaveList");
            let CSVString = getCSVString(personsList);

            // const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
            // const permissionStatus = await navigator.permissions.query(queryOpts);

            await navigator.clipboard.writeText(CSVString);


            // const type = "text/plain";
            // const clipboardItemData = {
            //     [type]: CSVString,
            // };
            // const clipboardItem = new ClipboardItem(clipboardItemData);
            // await navigator.clipboard.write([clipboardItem]);

            editModal.hide();
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
 * @param {*} personsList 
 * @returns 
 */
function displayResultList(personsList) {
    let outpuStr = `       </hr>
     <div class="col-12 "> ${personsList.length} résultats dans la liste
    </div >

 
    <table class="table table-striped">
    <thead>
        <tr>
            <th scope="col">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
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
            <input class="form-check-input" type="checkbox" value="" id="personcheck${person.per_id}">
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

function getCSVString(personsList) {
    let outpuStr = '';
    personsList.map((person, index) => {
        outpuStr += `${person.per_id};${person.per_nom.trim()};${person.per_prenom.trim()};${person.per_email.trim()};${person.per_tel.trim()}\n\r`

    })
    return outpuStr;
}


