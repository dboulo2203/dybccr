import { getFormattedDateISO } from '../../shared/commonServices/commonFunctions.js'
import { displayActionEditPerson } from './actionEditPerson/actionEditPerson.js'
import { displayActionCreateInvoice } from './actionCreateInvoice/actionCreateInvoice.js'
import { displayActionEditInvoice } from './actionEditInvoice/actionEditInvoice.js'
import { displayActionAbandonInvoice } from './actionAbandonInvoice/actionAbandonInvoice.js'
import { displayActionDeletePerson } from './actionDeletePerson/actionDeletePerson.js'
import { displayAlert, getBlocHeaderWithMenu, getPageTitleDisplay, getStandaloneMenu, getStandardFieldDisplay, showLoading } from '../../shared/bootstrapServices/components/components.js'
import { launchInitialisation } from '../../shared/appServices/initialisationService.js'
import { headerViewDisplay } from '../../shared/appServices/headerViewCont.js'
import { footerViewDisplay } from '../../shared/appServices/footerViewCont.js'
import { getConfigurationFromJson, getConfigurationValue } from '../../shared/commonServices/configurationService.js'
import { getCustomer, getCustomerInvoices } from '../../shared/appWSServices/dolibarrCustomerServices.js'
import { getYearExerciceLabel, getvalue } from '../../shared/appWSServices/dolibarrListsServices.js'
import { getFormattedCurrency, dolibarrTimestampToDateInput, getAppPath } from '../../shared/commonServices/commonFunctions.js'
import { isCurrentUSerLogged } from '../../shared/appWSServices/dolibarrLoginServices.js'
import { addMultipleEnventListener } from '../../shared/commonServices/commonFunctions.js'
/**
 * when called from the url
 * get the parameters and launch the controller
 */
export async function startPersonController() {

  try {
    await getConfigurationFromJson();
    headerViewDisplay("menuSection")

    if (!isCurrentUSerLogged()) throw new Error('Veuillez vous authentifier');
    showLoading(true, getConfigurationValue('BrandTitle'));

    await launchInitialisation()

    const searchParams = new URLSearchParams(globalThis.location.search);
    if (searchParams.has('paramid'))
      await displayPersonContent("mainActiveSection", searchParams.get('paramid'));
    else
      throw new Error("Veuillez préciser un id de personne")

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
 * Display the person page skeleton and all blocks
 * @param {*} htlmPartId
 * @param {*} per_id
 */
export async function displayPersonContent(htlmPartId, per_id) {

  const initString = `
    <div class="page-content" style="margin-top:60px">
      ${getPageTitleDisplay("Adhérent", "<i class='bi bi-person'></i>")}
      <div id="personIdentity"></div>
      <div id="personPayments"></div>
      <div id="personSubscriptions"></div>
      <div id="personPurchases"></div>
    </div>
  `;
  document.querySelector("#" + htlmPartId).innerHTML = initString;

  try {
    // *** Get data
    const person = await getCustomer(per_id);

    // *** Display blocs
    displayPersonIdentity("personIdentity", person);
    await displayCustomerInvoices("personPayments", per_id, person);

  } catch (error) {
    document.querySelector("#messageSection").innerHTML = displayAlert('alert-danger', error.message || error);
  }
}

/**
 * Display the identity block
 * @param {*} person
 * @returns {string}
 */
function displayPersonIdentity(htmlPlace, person) {

  let outputStr = `
    ${getBlocHeaderWithMenu("Identité", "<i class='bi bi-person'></i>",
    [
      { id: 'editPerson', label: 'Modifier adhérent', icon: 'bi-pencil', active: true },
      { id: 'deletePerson', label: 'Supprimer adhérent', icon: 'bi-trash', active: true },
    ])}
    <div class="row">
      <div class="col-6">
        ${getStandardFieldDisplay("Civilité", getvalue('typecivilities', 'rowid', person['array_options']?.['options_thi_civility'])?.['label'] ?? '')}
        ${getStandardFieldDisplay("Nom", person['name'])}
        ${getStandardFieldDisplay("Email", person['email'])}
        ${getStandardFieldDisplay("Téléphone", person['phone'])}
      </div>
      <div class="col-6">
        ${getStandardFieldDisplay("Date naissance", person['array_options']?.['options_thi_birthday'] ? getFormattedDateISO(dolibarrTimestampToDateInput(person['array_options']['options_thi_birthday'])) : '')}
        ${getStandardFieldDisplay("Adresse", person['address'])}
        ${getStandardFieldDisplay("Code postal", person['zip'])}
        ${getStandardFieldDisplay("Ville", person['town'])}
      </div>
    </div>
  `;

  document.querySelector("#" + htmlPlace).innerHTML = outputStr;

  // *** Actions
  document.querySelector('#deletePerson').addEventListener('click', async () => {
    const customer = await getCustomer(person['id']);
    await displayActionDeletePerson(customer, () => {
      globalThis.location.href = `${getAppPath()}/views/search`;
    });
  });

  document.querySelector('#editPerson').addEventListener('click', async () => {
    const customer = await getCustomer(person['id']);
    await displayActionEditPerson(customer, async () => {
      const refreshedCustomer = await getCustomer(person['id']);
      displayPersonIdentity("personIdentity", refreshedCustomer);
    });
  });
}

/**
 * Display the invoices block
 * @param {string} htmlPlace
 * @param {string|number} per_id
 * @param {object} customer
 */
async function displayCustomerInvoices(htmlPlace, per_id, customer) {

  const invoices = await getCustomerInvoices(per_id);

  const statusLabel = { 0: 'Brouillon', 1: 'Validée', 2: 'Payée', 3: 'Abandonnée' };

  let items = '';
  if (invoices && invoices.length > 0) {
    invoices.forEach((inv) => {
      const date = inv['date'] ? getFormattedDateISO(new Date(inv['date'] * 1000).toISOString().slice(0, 10)) : '';
      const paidAmount = Number(inv['total_ttc']) - Number(inv['remaintopay'] ?? inv['total_ttc']);
      const statusLabel2 = (statusLabel[inv['status']] ?? inv['status']) +
        (paidAmount > 0 && inv['status'] < 2 ? ` (payé ${getFormattedCurrency(paidAmount)})` : '');

      let lineItems = '';
      if (inv['lines'] && inv['lines'].length > 0) {
        inv['lines'].forEach((line) => {
          lineItems += `
            <div class="row  "> 
            <span class="col-2 "></span>
            <span class="col-1 ">${line['ref'] ?? ''}</span>
              <span class="col-4 ">${line['desc'] ?? ''}</span>
              
              <span class="col-3 ">${getFormattedCurrency(line['subprice'])}</span>
            </div>`;
        });
      }

      items += `
        <li class="list-group-item ">
          <div class="row bg-light bg-gradient" style="padding:5px" >
            <span class="col-3 fw-semibold">${getYearExerciceLabel(inv['array_options']?.['options_inv_culturalseason']) ?? ''}</span>
            
            <span class="col-3 ">${date}</span>
            <span class="col-2 fw-semibold">${getFormattedCurrency(inv['total_ttc'])}</span>
            <span class="col-3 fw-semibold">${statusLabel2}</span>
            <span class="col-1 ">
                    ${getStandaloneMenu([
        { id: `editInvoice-${inv.id}`, label: 'Modifier', icon: 'bi-pencil', active: inv.status < 2 },
        { id: `cancelInvoice-${inv.id}`, label: 'Abandonner', icon: 'bi-trash', active: inv.status < 2 && paidAmount === 0 },])}
            </span >

          </div >
    ${lineItems}
        </li > `;
    });
  } else {
    items = `<li class="list-group-item px-0 text-muted" > Pas de facture pour cette personne</li > `;
  }

  document.querySelector("#" + htmlPlace).innerHTML = `
    <div style = "margin-top:20px" ></div >
      ${getBlocHeaderWithMenu("Factures d'inscription", "<i class='bi bi-receipt'></i>",
    [
      { id: 'addInvoice', label: 'Ajouter facture', icon: 'bi-plus', active: true },
    ])
    }
  <ul class="list-group ">
    ${items}
  </ul>
  `;

  // *** Actions
  document.querySelector('#addInvoice').addEventListener('click', async () => {
    await displayActionCreateInvoice(customer, async () => {
      await displayCustomerInvoices(htmlPlace, per_id, customer);
    });
  });

  addMultipleEnventListener('[id^="editInvoice-"]', async (event) => {
    const invId = event.currentTarget.id.replace('editInvoice-', '');
    const inv = invoices.find((i) => String(i.id) === invId);
    if (!inv) return;
    await displayActionEditInvoice(inv, customer, async () => {
      await displayCustomerInvoices(htmlPlace, per_id, customer);
    });
  });

  addMultipleEnventListener('[id^="cancelInvoice-"]', async (event) => {
    const invId = event.currentTarget.id.replace('cancelInvoice-', '');
    const inv = invoices.find((i) => String(i.id) === invId);
    if (!inv) return;
    await displayActionAbandonInvoice(inv, async () => {
      await displayCustomerInvoices(htmlPlace, per_id, customer);
    });
  });

  return invoices;
}

// /**
//  * Display the subscriptions block
//  * @param {*} person
//  * @returns {string}
//  */
// function displayPersonSubscriptions(person) {

//   let rows = '';
//   if (person['subscriptions'].length > 0) {
//     const sorted = [...person['subscriptions']].sort((a, b) => new Date(b['ins_date_inscription']) - new Date(a['ins_date_inscription']));
//     sorted.forEach((s) => {
//       rows += `< tr >
//         <td>${s['ans_libelle']}</td>
//         <td>${s['act_libelle']}</td>
//         <td>${getFormattedDateISO(s['ins_date_inscription'])}</td>
//         <td>${s['ins_montant']}€</td>
//         <td>${getFormattedDateISO(s['ins_debut'])}</td>
//         <td>${getFormattedDateISO(s['ins_fin'])}</td>
//         <td>${s['reg_montant']}€ - ${s['reg_date']} - ${s['mreg_code']}</td>
//       </tr>`;
//     });
//   } else {
//     rows = `<tr><td colspan="7">Pas d'adhésion pour cette personne</td></tr>`;
//   }

//   return `
//     ${getBlocHeaderWithMenu("Adhésions", "<i class='bi bi-person'></i>", [])}
//     <div style="overflow-x: auto;">
//       <table class="table table-striped">
//         <thead>
//           <tr>
//             <th scope="col" class="fw-semibold">Saison</th>
//             <th scope="col" class="fw-semibold">Adhésion</th>
//             <th scope="col" class="fw-semibold">Date Adhésion</th>
//             <th scope="col" class="fw-semibold">Montant</th>
//             <th scope="col" class="fw-semibold">Date début</th>
//             <th scope="col" class="fw-semibold">Date fin</th>
//             <th scope="col" class="fw-semibold">Règlement</th>
//           </tr>
//         </thead>
//         <tbody>${rows}</tbody>
//       </table>
//     </div>
//   `;
// }

// /**
//  * Display the purchases block
//  * @param {*} person
//  * @returns {string}
//  */
// function displayPersonPurchases(person) {

//   let rows = '';
//   if (person['purchases'].length > 0) {
//     const sorted = [...person['purchases']].sort((a, b) => new Date(b['ins_date_inscription']) - new Date(a['ins_date_inscription']));
//     sorted.forEach((p) => {
//       rows += `<tr>
//         <td>${p['ans_libelle']}</td>
//         <td>${getFormattedDateISO(p['ins_date_inscription'])}</td>
//         <td>${p['act_libelle']}</td>
//         <td>${p['ins_montant']}€</td>
//         <td>${getFormattedDateISO(p['ins_debut'])}</td>
//         <td>${getFormattedDateISO(p['ins_fin'])}</td>
//         <td>${p['reg_montant']}€ - ${p['reg_date']} - ${p['mreg_code']}</td>
//       </tr>`;
//     });
//   } else {
//     rows = `<tr><td colspan="7">Pas d'activité pour cette personne</td></tr>`;
//   }

//   return `
//     ${getBlocHeaderWithMenu("Inscriptions", "<i class='bi bi-person'></i>", [])}
//     <div style="overflow-x: auto;">
//       <table class="table table-striped">
//         <thead>
//           <tr>
//             <th scope="col" class="fw-semibold">Saison</th>
//             <th scope="col" class="fw-semibold">Date inscription</th>
//             <th scope="col" class="fw-semibold">Activité</th>
//             <th scope="col" class="fw-semibold">Montant</th>
//              <th scope="col" class="fw-semibold">Règlement</th>
//           </tr>
//         </thead>
//         <tbody>${rows}</tbody>
//       </table>
//     </div>
//   `;
// }
// //  <th scope="col" class="fw-semibold">Date début</th>
// //   <th scope="col" class="fw-semibold">Date fin</th>
