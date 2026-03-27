import { getcustomerSearch } from '../../shared/appWSServices/dolibarrCustomerServices.js'
import { displayActionCreatePerson } from './actionCreatePerson/actionCreatePerson.js'
import { addMultipleEnventListener, getAppPath } from '../../shared/commonServices/commonFunctions.js'
import { headerViewDisplay } from '../../shared/appServices/headerViewCont.js';
import { footerViewDisplay } from '../../shared/appServices/footerViewCont.js';
import { getConfigurationFromJson, getConfigurationValue } from '../../shared/commonServices/configurationService.js';
import { displayAlert, getBlocHeaderWithMenu, getStandardFieldDisplayWithLink, showLoading } from '../../shared/bootstrapServices/components/components.js';
import { launchInitialisation } from '../../shared/appServices/initialisationService.js';
import { isCurrentUSerLogged } from '../../shared/appWSServices/dolibarrLoginServices.js';
// import '/node_modules/bootstrap'
/**
 * when called from the url
 * get the parameters and launch the controller
 */
export async function startSearchController() {

  try {
    await getConfigurationFromJson();
    headerViewDisplay("menuSection")

    if (!isCurrentUSerLogged()) throw new Error('Veuillez vous authentifier');
    showLoading(true, getConfigurationValue('BrandTitle'));

    await launchInitialisation()
    await displaySearchContent("mainActiveSection");
    footerViewDisplay('#footerDisplay');
    showLoading(false);
  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert(
      'alert-danger',
      error.message || error
    );
  }
}

/**
 * Display search form and results
 * @param {*} htlmPartId
 */
export async function displaySearchContent(htlmPartId) {

  const outpuStr = `
    <div class="page-content" style="margin-top:60px">
      ${getBlocHeaderWithMenu('Recherche adhérents', "<i class='bi bi-person'></i>",
    [
      { id: 'createPerson', label: 'Créer adhérent', icon: 'bi-pencil', active: true }
    ]
  )}
      <div class="col-6">
        <div class="input-group mb-3">
          <select class="form-select flex-grow-0 w-auto" id="searchType">
            <option value="name">Nom</option>
            <option value="email">Email</option>
            <option value="phone">Téléphone</option>
            <option value="address">Adresse</option>
          </select>
          <input type="text" class="form-control" placeholder="" id="searchString" name="searchString" value="">
          <button class="btn btn-outline-secondary" id="buttonSearch">Chercher</button>
        </div>
      </div>
      <div id="resultPart"></div>
    </div>
  `;

  document.querySelector("#" + htlmPartId).innerHTML = outpuStr;

  async function runSearch() {
    const searchString = document.querySelector("#searchString").value;
    const searchType = document.querySelector("#searchType").value;
    const customersList = await getcustomerSearch(searchString, searchType);
    document.querySelector("#resultPart").innerHTML = displayResultList(customersList);
    addMultipleEnventListener('.personLink', function (event) {
      globalThis.location.href =
        `${getAppPath()}/views/person?paramid=` + event.currentTarget.getAttribute('entityid');
    });
  }

  try {
    document.querySelector("#createPerson").addEventListener('click', async () => {
      await displayActionCreatePerson(runSearch);
    });

    document.querySelector("#buttonSearch").onclick = runSearch;

    document.querySelector("#searchString").addEventListener("keypress", async function (event) {
      if (event.keyCode === 13) {
        await runSearch();
      }
    });

  } catch (error) {
    document.querySelector("#messageSection").innerHTML = displayAlert('alert-danger', error.message || error);
  }
}

/**
 * Build the result table HTML
 * @param {*} customersList
 * @returns {string}
 */
function displayResultList(customersList) {
  let outpuStr = `
    <div class="col-12">${customersList.length} résultats dans la liste</div>
    <div style="overflow-x: auto;">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">Nom</th>
            <th scope="col">Email</th>
            <th scope="col">Téléphone</th>
            <th scope="col">Ville</th>
          </tr>
        </thead>
        <tbody>`;

  customersList.forEach((customer) => {
    outpuStr += `<tr>
      <td>${getStandardFieldDisplayWithLink("", customer.name, "personLink", customer.id, true)}</td>
      <td>${getStandardFieldDisplayWithLink("", customer.email, "personLink", customer.id, true)}</td>
      <td>${getStandardFieldDisplayWithLink("", customer.phone, "personLink", customer.id, true)}</td>
      <td>${getStandardFieldDisplayWithLink("", customer.town, "personLink", customer.id, true)}</td>
    </tr>`;
  });

  outpuStr += `</tbody>
      </table>
    </div>`;

  return outpuStr;
}
