import { getInvoicesForProductAndYear } from '../../shared/appWSServices/dolibarrInvoicesServices.js'
import { getAppPath, addMultipleEnventListener } from '../../shared/commonServices/commonFunctions.js'
import { displayAlert, getBlocHeaderWithMenu, getStandardFieldDisplayWithLink, showLoading } from '../../shared/bootstrapServices/components/components.js'
import { getConfigurationFromJson, getConfigurationValue } from '../../shared/commonServices/configurationService.js'
import { launchInitialisation } from '../../shared/appServices/initialisationService.js'
import { headerViewDisplay } from '../../shared/appServices/headerViewCont.js'
import { footerViewDisplay } from '../../shared/appServices/footerViewCont.js'
import { loadProducts, getAllActiveProducts } from '../../shared/appWSServices/zopaProductServices.js'
import { getList } from '../../shared/appWSServices/dolibarrListsServices.js'
import { isCurrentUSerLogged } from '../../shared/appWSServices/dolibarrLoginServices.js'

/**
 * when called from the url
 * get the parameters and launch the controller
 */
export async function startCourseController() {

  try {
    await getConfigurationFromJson();
    headerViewDisplay("menuSection")

    if (!isCurrentUSerLogged()) throw new Error('Veuillez vous authentifier');
    showLoading(true, getConfigurationValue('BrandTitle'));

    await launchInitialisation()

    await displayCourseContent("mainActiveSection");
    footerViewDisplay('#footerDisplay');
    showLoading(false)

  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert(
      'alert-danger',
      error.message || error
    );
  }
}

/**
 * Display the course page : activity selector and result blocks
 * @param {*} htlmPartId
 */
export async function displayCourseContent(htlmPartId) {

  const activities = getAllActiveProducts()
    .filter((p) => p['array_options']?.['options_type_activite'] === '1')
    .sort((a, b) => (a['label'] ?? '').localeCompare(b['label'] ?? '', 'fr'));

  const activityItems = activities.map((p) =>
    `<li class="dropdown-item" id="${p['id']}" data-ref="${p['ref']}">${p['label']}</li>`
  ).join('');

  const yearList = (getList('yearexercice') ?? []).slice().sort((a, b) => (b['label'] ?? '').localeCompare(a['label'] ?? '', 'fr'));
  const yearOptions = yearList.map((y) => `<option value="${y['rowid']}">${y['label']}</option>`).join('');

  const outpuStr = `
    <div class="page-content" style="margin-top:60px">
      ${getBlocHeaderWithMenu('Activités', "<i class='bi bi-list-ul'></i>")}
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="dropdown">
          <a class="btn btn-outline-secondary dropdown-toggle" href="#" role="button" id="activiteList" data-bs-toggle="dropdown" aria-expanded="false">
            Choisir une activité
          </a>
          <ul class="dropdown-menu" aria-labelledby="activiteList" id="activityChoice">
            ${activityItems}
          </ul>
        </div>
        <select class="form-select w-auto" id="yearExerciceSelect">
          ${yearOptions}
        </select>
      </div>
      <div id="resultBloc"></div>
      <div id="resultMoocBloc"></div>
    </div>
  `;

  document.querySelector("#" + htlmPartId).innerHTML = outpuStr;

  const runSearch = async () => {
    const btn = document.getElementById('activiteList');
    const productId = btn.dataset.selectedId;
    const yearId = document.getElementById('yearExerciceSelect').value;
    if (!productId) return;
    await displayCourseattendesBloc("resultBloc", productId, yearId);
  };

  document.querySelector("#activityChoice").addEventListener('click', async (event) => {
    if (event.target.tagName === 'LI') {
      const btn = document.getElementById('activiteList');
      btn.textContent = event.target.textContent;
      btn.dataset.selectedId = event.target.id;
      btn.dataset.selectedRef = event.target.dataset.ref;
      await runSearch();
    }
  });

  document.getElementById('yearExerciceSelect').addEventListener('change', runSearch);
}


async function displayCourseattendesBloc(htmlPlace, productRef, yearLabel) {
  const invoices = await getInvoicesForProductAndYear(productRef, yearLabel);

  let rows = '';
  invoices.forEach((inv) => {
    rows += `<tr>
      <td>${getStandardFieldDisplayWithLink("", inv['thirdparty_name'] ?? inv['thirdparty_id'], "personLink", inv['thirdparty_id'], "true")}</td>
      <td>${inv['thirdparty_email'] ?? ''}</td>
      <td>${inv['thirdparty_phone'] ?? ''}</td>
      <td>${inv['ref'] ?? ''}</td>
    </tr>`;
  });

  const outpuStr = `
    <div style="margin-top:20px">
      ${getBlocHeaderWithMenu("Personnes inscrites à l'atelier", "", [])}
      <div class="col-12">${invoices.length} résultat(s)</div>
      <div style="overflow-x: auto;">
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Nom</th>
              <th scope="col">Email</th>
              <th scope="col">Téléphone</th>
              <th scope="col">Facture</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;

  document.querySelector("#" + htmlPlace).innerHTML = outpuStr;

  addMultipleEnventListener('.personLink', function (event) {
    globalThis.location.href =
      `${getAppPath()}/views/person?paramid=` + event.currentTarget.getAttribute('entityid');
  });
}



// /**
//  * Display the list of persons enrolled in the activity
//  * @param {*} htmlPlace
//  * @param {*} personsList
//  */
// function displayPersonsResultBloc(htmlPlace, personsList) {

//   let rows = '';
//   personsList.map((person) => {
//     rows += `<tr>
//       <td>${getStandardFieldDisplayWithLink("", person.per_nom + " " + person.per_prenom, "personLink", person.per_id, "true")}</td>
//       <td>${person.per_email}</td>
//       <td>${person.per_tel}</td>
//       <td>${person.inscrptCOncat}</td>
//       <td>${person.moccData ? person.moccData : 'pas Mooc'}</td>
//     </tr>`;
//   });

//   const outpuStr = `
//     <div style="margin-top:20px">
//       ${getBlocHeaderWithMenu("Personnes inscrites à l'atelier", "", [])}
//       <div class="col-12">${personsList.length} résultats dans la liste</div>
//       <div style="overflow-x: auto;">
//         <table class="table table-striped">
//           <thead>
//             <tr>
//               <th scope="col">Nom Prénom</th>
//               <th scope="col">Email</th>
//               <th scope="col">Téléphone</th>
//               <th scope="col">Activités</th>
//               <th scope="col">MOOC</th>
//             </tr>
//           </thead>
//           <tbody>${rows}</tbody>
//         </table>
//       </div>
//     </div>
//   `;

//   document.querySelector("#" + htmlPlace).innerHTML = outpuStr;

//   addMultipleEnventListener('.personLink', function (event) {
//     globalThis.location.href =
//       `${getAppPath()}/views/person?paramid=` + event.currentTarget.getAttribute('entityid');
//   });
// }

// /**
//  * Display persons present in MOOC but not in DYB
//  * @param {*} htmlPlace
//  * @param {*} moocPersonsList
//  */
// function displayMoocResultBloc(htmlPlace, moocPersonsList) {

//   let content = '';

//   if (moocPersonsList.length > 0) {
//     let rows = '';
//     moocPersonsList.map((moocPerson) => {
//       if (moocPerson.id > -1) {
//         rows += `<tr>
//           <td>${moocPerson.firstname} ${moocPerson.lastname}</td>
//           <td>${moocPerson.email}</td>
//           <td>${getMoocPersonroleDescription(moocPerson)}</td>
//         </tr>`;
//       }
//     });

//     content = `
//       <div style="overflow-x: auto;">
//         <table class="table table-striped">
//           <thead>
//             <tr>
//               <th scope="col">Nom Prénom</th>
//               <th scope="col">Email</th>
//               <th scope="col">Rôle</th>
//             </tr>
//           </thead>
//           <tbody>${rows}</tbody>
//         </table>
//       </div>
//     `;
//   } else {
//     content = `<div class="col-12">Cet atelier n'est pas disponible dans le MOOC.</div>`;
//   }

//   document.querySelector("#" + htmlPlace).innerHTML = `
//     ${getBlocHeaderWithMenu("Personnes présentes dans le MOOC et absentes de DYB", "<i class='bi bi-person'></i>")}
//     ${content}
//   `;
// }

// /**
//  * Build a string of MOOC roles for a person
//  * @param {*} moocPerson
//  * @returns {string}
//  */
// function getMoocPersonroleDescription(moocPerson) {
//   return moocPerson.roles.map((role) => role.shortname).join(', ');
// }

// /**
//  * Add MOOC data to the persons list (marks matched MOOC persons as processed)
//  * @param {*} personsList
//  * @param {*} moocPersonsList
//  * @returns {Array}
//  */
// function addMoocDataToPersonlist(personsList, moocPersonsList) {

//   const personListBis = structuredClone(personsList);
//   if (moocPersonsList.length > 0) {
//     personListBis.map((person) => {
//       const findMoocPersonindex = moocPersonsList.findIndex((moocPerson) => moocPerson.email === person.per_email);
//       if (findMoocPersonindex > -1) {
//         person.moccData = moocPersonsList[findMoocPersonindex].email;
//         moocPersonsList[findMoocPersonindex].id = -1;
//       }
//     });
//   }

//   return personListBis;
// }
