// import { getCustomer } from '../../shared/appWSServices/zopaCustomerServices.js';
import { headerViewDisplay } from '../../shared/appServices/headerViewCont.js';
import { launchInitialisation } from '../../shared/appServices/initialisationService.js';
import { getUserToken, isCurrentUSerLogged } from '../../shared/appWSServices/dolibarrLoginServices.js';
import { footerViewDisplay } from '../../shared/appServices/footerViewCont.js';
// import { modalFunctionViewDisplay } from './modalFunctionViewCont.js';
import {
  displayAlert,
  getBlocHeaderWithMenu,
  getEditField,
  getStandardFieldDisplay,
  showLoading,
} from '../../shared/bootstrapServices/components/components.js';
import { getPageTitleDisplay } from '../../shared/bootstrapServices/components/components.js';
// import DropdownSelector from '../../shared/bootstrapServices/components/dropdown-selector-plain.js';
import AutocompleteSelector from '../../shared/bootstrapServices/components/autocomplete-selector-plain.js';
import {
  getConfigurationFromJson,
  getConfigurationValue,
} from '../../shared/commonServices/configurationService.js';
import { displayActionWithConfirm } from './actionWithConfirm/actionWithConfirm.js';
import { displayToast } from '../../shared/bootstrapServices/bootstrapCommon.js';
import { displayActionWithoutConfirm } from './actionWithoutConfirm/actionWithoutConfirm.js';
import { addMultipleEnventListener, getAppPath } from '../../shared/commonServices/commonFunctions.js';

export async function startPagenameController() {
  try {
    // *** Start page - check log
    await getConfigurationFromJson();
    headerViewDisplay('#menuSection');
    if (!isCurrentUSerLogged()) throw new Error('Veuillez vous authentifier');
    showLoading(true);
    await launchInitialisation();
    // *** Get url params and launch controller
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('paramid'))
      await displayPagenameContent('mainActiveSection', searchParams.get('paramid'));
    else throw new Error('Pas de paramid');

    showLoading(false);
    // *** Display footer
    footerViewDisplay('#footerDisplay');
  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert(
      'alert-danger',
      error.message || error
    );
  }
}

async function displayPagenameContent(htmlPlaceId, customerid) {
  // *** Get the data from the web services
  // const pageName = 'Page de test';
  // const iconString = `<i class="bi bi-people"></i>`;
  const params = 'test';
  //  const customer = await getCustomer(customerid);
  const customer = {}
  // *** Build the html string to display in the mainActiveSection
  const htmlContent = `
        <div class="page-content" style="margin-top:60px" >
            ${getPageTitleDisplay('page de test', 'bi-people')}
            <div class="page-body">
                <div id ="blockName1"></div>
                <div id ="blockName2"></div>

            </div>
        </div >
        `;
  // *** display the mainActiveSection
  document.querySelector('#' + htmlPlaceId).innerHTML = htmlContent;

  // *** Display block1
  displayblockname1Content('blockName1', customer);

  // *** Display block2
  displayblockname2Content('blockName2', params);
}

/**
 *
 * @param {*} htmlPlaceid
 * @param {*} params
 */
function displayblockname1Content(htmlPlaceid, params) {
  // *** get data
  const bloclabel = 'Bloc test';
  const blocIcon = `<i class="bi bi-person"></i>`;
  const menuItems = [
    { id: 'editBtn', label: 'Modifier', icon: 'bi-pencil' },
    { id: 'deleteBtn', label: 'Supprimer', icon: 'bi-trash' },
  ];

  // *** Build html string to display in the block
  const htmlContent = `<div class="card shadow-sm  border border-1 component-block" >
        <div class="card-body p-2 mb-4 " >
                ${getBlocHeaderWithMenu(bloclabel, blocIcon, menuItems)}
                <div class="card-title block-bodycontent" id="customerBloc">
                    <!-- example of a block-bodycontent -->
                
                </div>
            </div >
        </div>`;

  // *** Display html string in the document
  document.querySelector('#' + htmlPlaceid).innerHTML = htmlContent;

  const htmlContent2 = `
     <form class="row ">
        ${getStandardFieldDisplay('Name', params.name)}
         ${getStandardFieldDisplay('adresse', params.address)}       
         </br><hr/>

         ${getEditField('Ville', 'townid', '', 'Veuillez saisir la ville', 'saisir la ville')}
       </br>
       <hr/>
        <div id="selector1"></div>
        </br>
        <hr/>
        </br>
        <div class="mb-3">
          <label for="exampleFormControlInput1" class="form-label">Choisir un produitauto</label>
          <div id="autocomplete1"></div>
      </div>
        

        
    </form>
     </br><hr/>
    <div class="col-2">
    <button class="btn btn-secondary" id="testbutton1"> bouton de test </button>
    </div>
      <div class="col-2">
    <button class="btn btn-secondary" id="testbutton2"> bouton de test </button>
    </div>
  
    `;

  // ***
  document.querySelector('#customerBloc').innerHTML = htmlContent2;

  // const selector1 = new DropdownSelector('#selector1', {
  //   apiUrl: 'https://kusala.fr/dolibarr/api/index.php/products',
  //   apiKey: getConfigurationValue(),
  //   placeholder: 'Choisissez un produit (dropdown)',
  // });

  const autocomplete1 = new AutocompleteSelector('#autocomplete1', {
    apiUrl: getConfigurationValue('wsUrlformel'),
    apiKey: getUserToken(),
    placeholder: 'Tapez pour rechercher un produit (autocomplete)...',
  });

  // *** add event handlers
  // *** Add actions - button 1
  function handleActionWithConfirm() {
    displayActionWithConfirm({ data: 1234 }, async () => {
      displayToast(
        'modalSection',
        'Nouvelle commande',
        'Commande cr\u00e9\u00e9e avec succ\u00e8s'
      );
    });
  }
  document.querySelector('#testbutton1').addEventListener('click', handleActionWithConfirm);

  // *** Add actions -button 2
  function handleActionWithoutConfirm() {
    displayActionWithoutConfirm({ data: 1234 }, async () => {
      displayToast(
        'modalSection',
        'Nouvelle commande',
        'Commande cr\u00e9\u00e9e avec succ\u00e8s'
      );
    });
  }
  document.querySelector('#testbutton2').addEventListener('click', handleActionWithoutConfirm);
}

/**
 * Display
 * @param {*} htlmPartId
 * @param {*} searchString : the string to searched in the database
 */
export async function displayblockname2Content(htlmPartId) {
  try {
    // *** Build the html string
    let output = '';

    // *** Display the controller skeleton
    output += `
        <div style="margin-top:60px">
  
            ${getPageTitleDisplay('Search customer', 'bi-person')}
             <div id='componentMessage'></div>
            <div class="col-6">
                <div class="row">  
                    <div class="col-8" style="margin:2px">
                        <input type="text" class="form-control " name="searchString" id="searchString" placeholder="" value=""/>
                    </div>
                    <div class="col-2" style="margin:2px">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" id="myBtnCompute">Chercher</button>
                    </div>
                </div>
            </div>

        </div> 
   
        <div class="col-md-12 main" style="padding:10px" id="resultDisplay">
        </div >
        <div class="col-md-12 main" style="padding:10px" id="footerDisplay">
        </div >`;

    // *** Display skeleton
    document.querySelector('#' + htlmPartId).innerHTML = output;

    // try {

    //***  Actions
    document.querySelector('#searchString').addEventListener('keypress', async function (event) {
      try {
        if (event.keyCode === 13) {
          await getSearch();
        }
      } catch (error) {
        document.querySelector('#messageSection').innerHTML = displayAlert(
          'alert-danger',
          error.message || error
        );
      }
    });

    document.querySelector('#myBtnCompute').onclick = async function () {
      try {
        await getSearch();
      } catch (error) {
        document.querySelector('#messageSection').innerHTML = displayAlert(
          'alert-danger',
          error.message || error
        );
      }
    };
  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert(
      'alert-danger',
      error.message || error
    );
  }
}
/**
 *
 */
async function getSearch() {
  // try {
  // *** Search customers
  //  const searchString = document.querySelector('#searchString').value;
  const searchResults = [];

  // *** Display customers list
  let resultDisplay = '';
  searchResults.map((result) => {
    resultDisplay += `
        <div class="row" >
            <div class="col-3" > 
                <span class="customerLink" customerid="${result.id}" style="cursor: pointer">${result.name}</span>
            </div> 
            <div class="col-3  "> 
                ${result.email}
            </div> 
            <div class="col-6 ">   
                ${result.address}, ${result.zip}, ${result.town}      
            </div>
        </div >
         <hr style="margin-block-start:0.3rem;margin-block-end:0.3rem;margin-top:0px" />`;
  });

  // *** Display the HTML string
  document.querySelector('#resultDisplay').innerHTML = resultDisplay;

  addMultipleEnventListener('.customerLink', function (event) {
    window.location.href =
      `${getAppPath()}/views/manageCustomer/customer?customerID=` +
      event.currentTarget.getAttribute('customerid');
  });
  // } catch (except) {
  //     document.querySelector("#messageSection").innerHTML = `<div class="alert alert-danger" style = "margin-top:30px" role = "alert" > ${error} - ${error.fileName}</br > ${error.stack}  </div > `;
  // }
}
