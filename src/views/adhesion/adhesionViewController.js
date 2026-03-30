import { getInvoicesForProductAndYear } from '../../shared/appWSServices/dolibarrInvoicesServices.js'
import { getAppPath, addMultipleEnventListener } from '../../shared/commonServices/commonFunctions.js'
import { displayAlert, getBlocHeaderWithMenu, getStandardFieldDisplayWithLink, showLoading } from '../../shared/bootstrapServices/components/components.js'
import { getConfigurationFromJson, getConfigurationValue } from '../../shared/commonServices/configurationService.js'
import { launchInitialisation } from '../../shared/appServices/initialisationService.js'
import { headerViewDisplay } from '../../shared/appServices/headerViewCont.js'
import { footerViewDisplay } from '../../shared/appServices/footerViewCont.js'
import { getSubscriptionActiveProducts } from '../../shared/appWSServices/dolibarrProductServices.js'
import { getList } from '../../shared/appWSServices/dolibarrListsServices.js'
import { isCurrentUSerLogged } from '../../shared/appWSServices/dolibarrLoginServices.js'

/**
 * when called from the url
 * get the parameters and launch the controller
 */
export async function startAdhesionController() {

  // try {
  await getConfigurationFromJson();
  headerViewDisplay("menuSection")

  if (!isCurrentUSerLogged()) throw new Error('Veuillez vous authentifier');
  showLoading(true, getConfigurationValue('BrandTitle'));

  await launchInitialisation()

  await displayAdhesionContent("mainActiveSection");
  footerViewDisplay('#footerDisplay');
  showLoading(false)

  // } catch (error) {
  // document.querySelector('#messageSection').innerHTML = displayAlert(
  //   'alert-danger',
  //   error.message || error
  // );
  // }
}

/**
 * Display the adhesion page : year selector and result block
 * @param {*} htlmPartId
 */
export async function displayAdhesionContent(htlmPartId) {

  const yearList = (getList('yearexercice') ?? []).slice().sort((a, b) => (b['label'] ?? '').localeCompare(a['label'] ?? '', 'fr'));
  const yearOptions = yearList.map((y) => `<option value="${y['rowid']}">${y['label']}</option>`).join('');

  const outpuStr = `
    <div class="page-content" style="margin-top:60px">
      ${getBlocHeaderWithMenu('Adhesions', "<i class='bi bi-person-check'></i>")}
      <div class="d-flex align-items-center gap-3 mb-3">
        <select class="form-select w-auto" id="yearExerciceSelect">
          ${yearOptions}
        </select>
      </div>
      <div id="resultBloc"></div>
    </div>
  `;

  document.querySelector("#" + htlmPartId).innerHTML = outpuStr;

  const runSearch = async () => {
    const yearId = document.getElementById('yearExerciceSelect').value;
    await displayAdhesionBloc("resultBloc", yearId);
  };

  document.getElementById('yearExerciceSelect').addEventListener('change', runSearch);

  await runSearch();
}


function buildCsvFromInvoices(invoices) {
  const header = ['Nom', 'Email', 'Telephone', 'Facture'].join(';');
  const rows = invoices.map((inv) => [
    inv['thirdparty_name'] ?? inv['thirdparty_id'] ?? '',
    inv['thirdparty_email'] ?? '',
    inv['thirdparty_phone'] ?? '',
    inv['ref'] ?? '',
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';'));
  return [header, ...rows].join('\n');
}

async function displayAdhesionBloc(htmlPlace, yearId) {
  const adhProducts = getSubscriptionActiveProducts();

  const results = await Promise.all(
    adhProducts.map((p) => getInvoicesForProductAndYear(p['id'], yearId))
  );
  const invoices = results
    .flat()
    .filter((inv, index, self) => self.findIndex((i) => i['id'] === inv['id']) === index)
    .sort((a, b) => (a['thirdparty_name'] ?? '').localeCompare(b['thirdparty_name'] ?? '', 'fr'));

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
      ${getBlocHeaderWithMenu("Adherents", "", [
    { id: "exportBtn", label: "Exporter", icon: "bi-download", active: true }
  ])}
      <div class="col-12">${invoices.length} resultat(s)</div>
      <div style="overflow-x: auto;">
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Nom</th>
              <th scope="col">Email</th>
              <th scope="col">Telephone</th>
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

  document.getElementById('exportBtn')?.addEventListener('click', (event) => {
    event.preventDefault();
    const csv = buildCsvFromInvoices(invoices);
    navigator.clipboard.writeText(csv).then(() => {
      document.querySelector('#messageSection').innerHTML = displayAlert('alert-success', 'Liste copiee dans le presse-papier');
    });
  });
}
