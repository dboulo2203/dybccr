const editModaleStringBrevo = `
        <div class="modal fade" id="myModalBrevo" role="dialog" data-bs-backdrop="static"
                data-bs-keyboard="false" >
            <div class="modal-dialog modal-xl">
                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <!-- <button type="button" class="close" data-dismiss="modal">&times;</button> -->
                        <h5 class="modal-title">Exporter vers une liste Brevo</h5>
                    </div>
                    <div class="row modal-body" id="modalbodyPackinner">
                        <p>Some text in the modal.</p>

                    </div>

                </div>

            </div>
        </div>
`;

// TODO : Manage callback
export async function exportPersonListtoBrevoMVC(htlmPartId) {

    // *** Variable that keeps the modal object
    let editModal = null;
    //  throw new Error("Cette fonction n'est pas encore disponible");

    try {
        // *** Display main part of the page
        document.querySelector("#" + htlmPartId).innerHTML = editModaleStringBrevo;

        let brevoLists = await getBrevoLists();
        let outpuStr = '';
        outpuStr = `                             
       <form id="formPack" method="get"  href="'.DOL_URL_ROOT.'/custom/candleprod/candleprodindex.php">            
            
       <!-- *** Input to fill the produced PDV qty --> 
            <div class= "mb-3 row">
                <div class="col-12">
                Cette fonction permet de créer une liste dans Brevo ou bien de modifier les mails d'une liste existante.
                </div>
             </div>
            </hr>
        <div class="row">
            <div class="col-4 mb-3">
              <label for="exampleFormControlInput1" class="col-form-label">Saisir le nom de la liste à créer
              </label>
            </div>
            <div class="col-8">
            <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="" value="">
            </div>
          </div>
        </div>

        <div class="row">
            <div class="col-4">
               <label for="exampleFormControlInput1" class="col-form-label">ou choisir une liste existante</label>
        </div>

        <div class="col-8">
                  <button type="button" class="col-8 btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
           Choisir une liste
        </button>
        <ul class="dropdown-menu">`;
        brevoLists.lists.map((brevoList, index) => {
            outpuStr += `<li><a class="dropdown-item" id ="${brevoList.name}"href="#">${brevoList.name}</a></li>`;
        });
        outpuStr += ` </ul>
        </div>
        `;

        outpuStr += `
             <div class="modal-footer">
                   <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                  <input type="hidden" name="action" value= "packgenerateMOPDV"/>
                  <input type="hidden" name="moid" value= ""/>
                   <button type="submit" id="btnSave" class="btn btn-outline-secondary" style="margin-left:3px"  >Envoyer</button>
                  <input type="hidden" id="ConsumedPDIlineNb" value= ""/>            
            </div>  
        </form >
            `;
        // *** Display string
        document.querySelector("#modalbodyPackinner").innerHTML = outpuStr;

        document.querySelector("#btnSave").onclick = async function (event) {
            document.getElementById('formPack').submit();
            console.log("Save clicked");
        };

        editModal = new bootstrap.Modal(document.querySelector("#myModalBrevo"))
        editModal.show({ backdrop: 'static', keyboard: false });


    } catch (error) {
        console.log(`Error: ${error} `);
        //  document.querySelector("#" + htlmPartId).innerHTML = `<div class="alert alert-danger" style = "margin-top:30px" role = "alert" > ${error}</div > `;
    }
}


function getPersonListFromDom() {
    let service = '';
    let elem = document.querySelector('.service-container');

    service = elem.dataset.service;

    return service;
}


async function getPersonList() {

    // TODO : tester la validité des paramètres

    // let wsUrl = `${getAppPath()}/src/selection/brevoViewController/api.php/curentPersonList`;

    let responsefr = await fetch(wsUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (responsefr.ok) {
        // *** Get the data and save in the sessionStorage
        const data = await responsefr.json();
        sessionStorage.setItem("personsSubList", JSON.stringify(data));
        console.log("getPersonforCriteria  await ok ");
        return (data);

    } else {
        console.log(`getPersonforCriteria Error: ${JSON.stringify(responsefr)} `);
        throw new Error("getPersonforCriteria Error message : " + responsefr.status + " " + responsefr.statusText);
    }

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
async function getBrevoLists() {


    const myHeaders = new Headers();
    myHeaders.append("API-key", "BREVO_API_KEY");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    let response = await fetch("https://api.brevo.com/v3/contacts/lists?limit=50&offset=0", requestOptions);
    if (response.ok) {
        // *** Get the data and save in the sessionStorage
        let data = await response.json();
        // console.log("getHostingBooking  await ok ");
        return (data);

    } else {
        console.log(`getBrevoLists Error : ${JSON.stringify(responsefr)}`);
        throw new Error("getBrevoLists Error message : " + responsefr.status + " " + responsefr.statusText);
    }

}
