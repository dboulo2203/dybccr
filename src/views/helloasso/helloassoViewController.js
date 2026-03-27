// *** Component ressources
import {
  getAccessToken, getHelloassoForms, getHelloassoFormOrders,
  parseHelloassoOrder, checkHelloassoOrderForIntegration, checkOrderIntegration
} from './helloassoService.js'
import { headerViewDisplaySelectionjs, addMultipleEnventListener } from '../../shared/commonServices/commonFunctions.js'
/**
 * when called from the url
 * get the parameters and launch the controller
 */
export async function startHelloassoController() {

  // *** Initialisations
  try {
    //   let searchParams = new URLSearchParams(window.location.search);

    headerViewDisplaySelectionjs("menuSection")


    // *** Get url params and launch controller
    //     searchParams = new URLSearchParams(window.location.search);
    //    if (searchParams.has('per_id'))
    displayHelloassoContent("mainActiveSection");

  } catch (error) {
    document.querySelector("#messageSection").innerHTML = `<div class="alert alert-danger" style = "margin-top:30px" role = "alert" > ${error} - ${error.fileName}</br>${error.stack}  </div > `;
  }
}


/**
 * Display 
 * @param {*} htlmPartId 
 * @param {*} searchString : the string to searched in the database 
 */
export async function displayHelloassoContent(htlmPartId, per_id) {

  // *** Display the controller skeleton
  let initString = `
      <div class="row" style="margin-top:100px">
        <div class="col-12">
          <div class="d-flex justify-content-between" style="backgournd-color:">
              <div class="h5" style="color:#d07d29">Intégration HelloAsso
              </div>
            
            </div>
        </div>
      </div>
            <hr/>
            Cette fonction permet de visualiser la liste des personnes inscrites à un formulaire HelloAsso.</br>
            Elle affiche la liste des formulaires trouvés dans HelloAsso. 
            Pour afficher la liste des personnes, Choisir un formulaire dans la liste.</br>
            <hr/>
            <div id='status'></div>

      <div id='resultPart'></div>
      <div id='resultPartPretty'></div>
      </hr>
      <div id='resultPartForm' style = "margin-top:100px"></div>
      <div id='resultPartFormexplain'></div>
    `;
  document.querySelector("#" + htlmPartId).innerHTML = initString;

  try {

    // *** Load data from API
    // let output = '';
    // *** Access token to helloasso
    let accesstoken = await getAccessToken();

    // *** Display the forms list in a select
    let forms = await getHelloassoForms(JSON.parse(accesstoken).access_token);
    let formsListHtml = displayFormsList(forms);
    document.querySelector("#resultPart").innerHTML = formsListHtml;

    // *** Actions
    document.querySelector("#formChoice")
      .addEventListener('click', async (event) => {
        // Check if the clicked element is an <li>
        if (event.target.tagName === 'LI') {
          // *** Get the orders list
          let formType = event.target.getAttribute("slugType");;
          let formOrders = await getHelloassoFormOrders(JSON.parse(accesstoken).access_token, formType, event.target.id)
          // *** Display the oders list
          let formOrdersDisplay = await displayFormOrders(formOrders)

          document.querySelector("#resultPartPretty").innerHTML = displayFormOrdersInTable(formOrders);

          document.querySelector("#resultPartForm").innerHTML = formOrdersDisplay;
          document.querySelector("#resultPartFormexplain").innerHTML = displayFormOrdersFullFormat(formOrders);

        }
      });

  } catch (error) {
    document.querySelector("#messageSection").innerHTML = `</br></br><div class="alert alert-danger" style = "margin-top:30px" role = "alert" > ${error} - ${error.fileName}</br > ${error.stack}  </div > `;
  }
}

/**
 * 
 * @param {*} forms 
 * @returns
 * Manage nb of forms > pageSize 
 */
function displayFormsList(forms) {
  let outputStr = `
    <div class="col-6" style = "margin-right:5px" >
      <div class="dropdown" >
        <a class="btn btn-outline-secondary dropdown-toggle" href="#" role="button" id="activiteList" data-bs-toggle="dropdown" aria-expanded="false">
          Formulaires Helloasso
        </a>

        <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink" id="formChoice">
          `;
  forms.map((form, index) => {
    outputStr += `<li class="dropdown-item" id="${form.formSlug}" slugType="${form.formType}">${form.formType} - ${form.title}</li>`
  });

  outputStr += `</ul>
      </div></div > `;
  return outputStr;
}


/**
 * 
 * @param {*} forms 
 * @returns
 * Manage nb of forms > pageSize 
 * TODO : Payments[0] 
 */
function displayFormOrdersInTable(formOrders) {

  //  let outputStr = `
  //  <div class="h5" style="color:#d07d29">Données préparées
  //               </div>
  //     <div class="col-12" style = "margin-right:5px" >
  //     Nb. commandes : ${formOrders.length}
  //         <ul class="" aria-labelledby="" id="">`;

  let outputStr = `
     <div class="col-12 ">
    <hr/>
     <div class="h6" style="color:#d07d29"> Personnes inscrites par HelloAsso</div>
     </div >
     <div class="col-12 "> ${formOrders.length} résultats dans la liste
    </div >

    <table class="table table-striped">
    <thead>
        <tr>
            <th scope="col">Nom Prénom</th>
            <th scope="col">Persoone</th>
            <th scope="col">Activités</th>
            <th scope="col">Paiement</th>
        </tr>
    </thead>
    <tbody>`;

  formOrders.map((formOrder) => {
    let order = parseHelloassoOrder(formOrder);
    // let integrationCheck = await checkHelloassoOrderForIntegration(order);   
    let activityStr = "";
    if (order.activities && Array.isArray(order.activities))
      order.activities.map((activity) => { activityStr += activity.name + " - " + activity.amount + "€</br>" })

    // let integrationCheck = checkOrderIntegration(order);


    outputStr += `<tr>
       <td>${order.order.formType}</br>${new Date(order.order.date).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })}

       <td> ${order.user.firstName} ${order.user.lastName} </br>${order.user.email}</td>
       <td>${order.mainactivity.form} - ${order.mainactivity.amount}€ </br>
       ${activityStr} </td>
       <td> ${order.payment ? new Date(order.payment.date).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }) + " - " + order.payment.amount + "€ - " + order.payment.state : "Pas de paiement"} </td>
       `;
  })


  // ${
  //     new Date(order.payment.date).toLocaleString("fr-FR", {
  //       day: "numeric",
  //       month: "short",
  //       year: "numeric",
  //       hour: "",
  //       minute: ""
  //     })
  //   }
  outputStr += `</tbody>
    </table>
    `;
  return outputStr;

}
/**
 * 
 * @param {*} forms 
 * @returns
 * Manage nb of forms > pageSize 
 * TODO : Payments[0] 
 */
async function displayFormOrders(formOrders) {

  let outputStr = `
 <div class="h5" style="color:#d07d29" style = "margin-right:5px;margin-top:100px">Cette partie est pour le développeur : Données préparées
              </div>
    <div class="col-12" style = "margin-right:5px" >
    Nb. commandes : ${formOrders.length}
        <ul class="" aria-labelledby="" id="">`;

  formOrders.map(async (formOrder) => {
    let order = parseHelloassoOrder(formOrder);
    // let integrationCheck = await checkHelloassoOrderForIntegration(order);
    // let integrationCheck = await checkOrderIntegration(order);

    outputStr += `<li class="" id="${formOrder.order.id}">
       Commande : ${JSON.stringify(order.order, undefined, 2)} </br>
       User : ${JSON.stringify(order.user, undefined, 2)} </br>
       Main Activity : ${JSON.stringify(order.mainactivity, undefined, 2)} </br>
       Paiement : ${JSON.stringify(order.payment, undefined, 2)} </br>
       Activités: ${JSON.stringify(order.activities, undefined, 2)} </br>
      `;

    // *** Check integration 
    // outputStr += `</br> Integration check : </br> ${JSON.stringify(integrationCheck)} </br> `;
    outputStr += `<hr/></li>`;

  })

  outputStr += `</ul>
      </div>`;

  return outputStr;
}


/**
 * 
 * @param {*} forms 
 * @returns
 * Manage nb of forms > pageSize 
 * TODO : Payments[0] 
 */
function displayFormOrdersFullFormat(formOrders) {
  let outputStr = `
  <div class="h5" style="color:#d07d29">Données brutes
              </div>
    <div class="col-12" style = "margin-right:5px;margin-top:20px" >
  Nb. commandes : ${formOrders.length}
        <ul class="" aria-labelledby="" id="">
          `;
  formOrders.map((formOrder, index) => {
    outputStr += `<li class="" id="${formOrder.order.id}">
         ${formOrder.order.id} : ${JSON.stringify(formOrder)}
    <hr/></li>`
  });

  outputStr += `</ul>
      </div>
 `;

  return outputStr;
}