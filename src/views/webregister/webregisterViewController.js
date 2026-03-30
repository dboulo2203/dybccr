import { addMultipleEnventListener, getAppPath, getFormattedCurrency } from '../../shared/commonServices/commonFunctions.js'
import { headerViewDisplay } from '../../shared/appServices/headerViewCont.js';
import { footerViewDisplay } from '../../shared/appServices/footerViewCont.js';
import { getConfigurationFromJson } from '../../shared/commonServices/configurationService.js';
import { displayAlert, getBlocHeaderWithMenu, getPageTitleDisplay, getEditField, getEditFieldDate } from '../../shared/bootstrapServices/components/components.js';
import { launchInitialisation } from '../../shared/appServices/initialisationService.js';
import { getSelectFromDatabaseList } from '../../shared/appWSServices/dolibarrListsServices.js';
import { loadProducts, getAllActiveProducts, getSubscriptionActiveProducts } from '../../shared/appWSServices/dolibarrProductServices.js';
import { loadFileFetch, parseMarkdown } from '../../shared/commonServices/markdownService.js';
import { displayActionSendRegistration } from './actionSendRegistration/actionSendRegistration.js';
// import '/node_modules/bootstrap'
/**
 * when called from the url
 * get the parameters and launch the controller
 */
export async function startWebregisterController() {

  try {
    await getConfigurationFromJson();
    //  headerViewDisplay("menuSection")
    await launchInitialisation()
    await displayWebregisterContent("mainActiveSection");
    footerViewDisplay('#footerDisplay');

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
export async function displayWebregisterContent(htlmPartId) {

  const outpuStr = `
    
    <div class="page-content" style="margin-top:20px; margin-bottom:50px">
      <div class="fs-3 text-center">Inscription en ligne aux activités du CCR
  </div>
  <hr/>
<p class="text-start">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum..</p>
      <div id="identitypart"></div>
    </div>

        <div id="membershippart"></div>
    </div>

        <div id="activitypart"></div>
    </div>

           <div id="invoicepart"></div>
    </div>

       <div id="paymentpart"></div>
    </div>

        <div id="cgvpart"></div>
    </div>
  </div>

  `;

  document.querySelector("#" + htlmPartId).innerHTML = outpuStr;


  displayIdentitypartBloc("identitypart");
  displaymembershippartBloc("membershippart");
  await displayactivitypartBloc("activitypart");
  displayinvoicepartBloc("invoicepart");
  displaypaymentpartBloc("paymentpart");
  attachActivitySummaryListeners();
  attachPaymentListeners();
  await displaycgvpartBloc("cgvpart");

}

function displayIdentitypartBloc(htmlpart) {
  const civilityOptions = getSelectFromDatabaseList('typecivilities', 'rowid', 'label', '');

  const outputStr = `
    ${getBlocHeaderWithMenu('Indiquez-nous votre identité', "<i class='bi bi-person'></i>")}
    <div class="p-3">
      <form id="identityForm">
        <div class="row">
          <div class="col-12 col-md-6">
              <div class="form-group row mb-2">
                <label class="fw-light col-4 col-sm-3">Civilité</label>
                <div class="col-8 col-sm-9">
                  <select class="form-select" id="identity-civility">
                    ${civilityOptions}
                  </select>
                </div>
              </div>
              ${getEditField('Nom', 'identity-firstname', '')}
              ${getEditField('Prénom', 'identity-lastname', '')}
              ${getEditField('Email', 'identity-email', '')}
              <div class="row mb-2">
                <div class="col-sm-10 offset-sm-2">
                  <div class="invalid-feedback d-block" id="identity-email-error"></div>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              ${getEditField('Téléphone', 'identity-phone', '')}
              ${getEditField('Adresse', 'identity-address', '')}
              ${getEditField('Code postal', 'identity-zip', '')}
              ${getEditField('Ville', 'identity-town', '')}
              ${getEditFieldDate('Date de naissance', 'identity-birthday', '')}

            </div>
          </div>
        </form>
    </div>`;

  document.querySelector("#" + htmlpart).innerHTML = outputStr;

  // Real-time name validation
  const lastnameInput = document.getElementById('identity-lastname');
  lastnameInput.addEventListener('input', () => {
    const v = nameInput.value;
    const valid = v.length === 0 || /^\S+ \S+$/.test(v);
    nameInput.classList.toggle('is-invalid', !valid);
    document.getElementById('identity-name-error').textContent = valid ? '' : 'Le nom doit contenir un prénom et un nom séparés par un espace';
  });

  const firstnameInput = document.getElementById('identity-firstname');
  firstnameInput.addEventListener('input', () => {
    const v = nameInput.value;
    const valid = v.length === 0 || /^\S+ \S+$/.test(v);
    nameInput.classList.toggle('is-invalid', !valid);
    document.getElementById('identity-name-error').textContent = valid ? '' : 'Le nom doit contenir un prénom et un nom séparés par un espace';
  });

  // Real-time email validation
  const emailInput = document.getElementById('identity-email');
  emailInput.addEventListener('input', () => {
    const v = emailInput.value;
    const valid = v.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    emailInput.classList.toggle('is-invalid', !valid);
    document.getElementById('identity-email-error').textContent = valid ? '' : "L'email n'est pas valide";
  });
}


function displaymembershippartBloc(htmlpart) {
  const subscriptions = getSubscriptionActiveProducts();

  const radioRows = subscriptions.map((p) => `
    <div class="col-12 col-md-6">
      <div class="d-flex align-items-center mb-2">
        <input class="form-check-input me-2" type="radio" name="membership-type" id="membership-${p['id']}" value="${p['id']}">
        <label class="form-check-label flex-grow-1" for="membership-${p['id']}">${p['label']}</label>
        <span class="ms-3 text-nowrap">${getFormattedCurrency(p['price'])}</span>
      </div>
    </div>`).join('');

  const outputStr = `
    ${getBlocHeaderWithMenu("Souhaitez-vous adhérer à l'association ?", "<i class='bi bi-person-check'></i>")}
    <div class="p-3">
      ${subscriptions.length === 0
      ? '<p class="text-muted">Aucun type d\'adhésion disponible.</p>'
      : `<div class="row">${radioRows}</div>`}
    </div>`;

  document.querySelector("#" + htmlpart).innerHTML = outputStr;

  document.querySelectorAll('[name="membership-type"]').forEach((radio) => {
    radio.addEventListener('change', refreshActivitySummary);
  });
}


async function displayactivitypartBloc(htmlpart) {
  // await loadProducts();
  const activities = getAllActiveProducts().filter(
    (p) => p['array_options']?.['options_type_activite'] === '1'
  );

  const checkboxRows = activities.map((p) => `
    <div class="col-12 col-md-6">
      <div class="d-flex align-items-center mb-2">
        <input class="form-check-input me-2" type="checkbox" id="activity-${p['id']}" value="${p['id']}">
        <label class="form-check-label flex-grow-1" for="activity-${p['id']}">${p['label']}</label>
        <span class="ms-3 text-nowrap">${getFormattedCurrency(p['price'])}</span>
      </div>
    </div>`).join('');

  const outputStr = `
    ${getBlocHeaderWithMenu('Quelles activités vous intéressent-elles ?', "<i class='bi bi-activity'></i>")}
    <div class="p-3">
      ${activities.length === 0
      ? '<p class="text-muted">Aucune activité disponible.</p>'
      : `<div class="row">${checkboxRows}</div>`}
    </div>`;

  document.querySelector("#" + htmlpart).innerHTML = outputStr;
}



function refreshActivitySummary() {
  const allProducts = getAllActiveProducts();
  const subscriptionProducts = getSubscriptionActiveProducts();

  // Activités cochées
  const checkedActivities = [...document.querySelectorAll('[id^="activity-"]:checked')];
  const selectedActivities = checkedActivities.map((cb) => allProducts.find((p) => p['id'] === cb.value)).filter(Boolean);

  // Adhésion sélectionnée
  const membershipRadio = document.querySelector('[name="membership-type"]:checked');
  const selectedMembership = membershipRadio
    ? subscriptionProducts.find((p) => p['id'] === membershipRadio.value)
    : null;

  const selected = [...(selectedMembership ? [selectedMembership] : []), ...selectedActivities];

  let html = '';
  if (selected.length === 0) {
    html = '<p class="text-muted small">Aucune activité sélectionnée.</p>';
  } else {
    const rows = selected.map((p) => `
      <tr>
        <td>${p['ref']}</td>
        <td>${p['label']}</td>
        <td class="text-end">${getFormattedCurrency(p['price'])}</td>
      </tr>`).join('');
    const total = selected.reduce((sum, p) => sum + Number.parseFloat(p['price'] ?? 0), 0);
    html = `
      <div style="overflow-x:auto">
        <table class="table table-sm mb-1">
          <thead>
            <tr>
              <th>Code</th>
              <th>Activité</th>
              <th class="text-end">Montant</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr class="fw-semibold">
              <td colspan="2">Total</td>
              <td class="text-end">${getFormattedCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>`;
  }
  document.getElementById('activity-summary').innerHTML = html;
}

function attachPaymentListeners() {
  const panels = [
    'paymentHelloAsso', 'paymentSortir', 'paymentCheque',
    'paymentVirement', 'paymentEspeces', 'paymentChequeVacances',
  ];
  panels.forEach((panelId) => {
    document.querySelector(`#${panelId} button[id^="btnSend"]`)
      ?.addEventListener('click', () => displayActionSendRegistration(panelId));
  });
}

function attachActivitySummaryListeners() {
  document.querySelectorAll('[id^="activity-"]').forEach((cb) => {
    cb.addEventListener('change', refreshActivitySummary);
  });
  refreshActivitySummary();
}




function displayinvoicepartBloc(htmlpart) {
  const outputStr = `
    ${getBlocHeaderWithMenu('Votre inscription', "<i class='bi bi-receipt'></i>")}
    <div class="p-3">
      <div id="activity-summary"></div>
      <div class="mt-3">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="cgv-check">
          <label class="form-check-label" for="cgv-check">
            Veuillez valider les conditions de vente situées ci-dessous
          </label>
          <div class="invalid-feedback d-block" id="cgv-error"></div>
        </div>
      </div>
    </div>`;
  document.querySelector("#" + htmlpart).innerHTML = outputStr;

  document.getElementById('cgv-check').addEventListener('change', validateRegistration);
}

function validateRegistration() {
  const errors = [];

  // Vérification identité
  const firstname = document.getElementById('identity-firstname')?.value.trim();
  const lastname = document.getElementById('identity-lastname')?.value.trim();
  const email = document.getElementById('identity-email')?.value.trim();

  if (!firstname) errors.push('Le prénom est requis.');
  if (!lastname) errors.push('Le nom est requis.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Un email valide est requis.");

  // Vérification au moins une ligne dans le résumé
  const hasMembership = !!document.querySelector('[name="membership-type"]:checked');
  const hasActivity = document.querySelectorAll('[id^="activity-"]:checked').length > 0;
  if (!hasMembership && !hasActivity) errors.push("Veuillez sélectionner au moins une adhésion ou une activité.");

  const cgvCheck = document.getElementById('cgv-check');
  const cgvError = document.getElementById('cgv-error');

  if (cgvCheck.checked && errors.length > 0) {
    cgvCheck.checked = false;
    cgvError.textContent = errors.join(' ');
  } else {
    cgvError.textContent = '';
  }

  const cgvValid = cgvCheck.checked && errors.length === 0;
  document.getElementById('payment-blocked-msg').style.display = cgvValid ? 'none' : '';
  document.querySelectorAll('#paymentAccordion .accordion-button').forEach((btn) => {
    btn.disabled = !cgvValid;
  });
}


function displaypaymentpartBloc(htmlpart) {
  const outputStr = `
    ${getBlocHeaderWithMenu('Comment pensez-vous régler ?', "<i class='bi bi-credit-card'></i>")}
    <div class="p-3">
      <div id="payment-blocked-msg" class="alert alert-warning">
        <i class="bi bi-lock me-2"></i>Veuillez valider les conditions de vente pour accéder aux modes de paiement.
      </div>
      <div class="accordion" id="paymentAccordion">

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" disabled type="button" data-bs-toggle="collapse" data-bs-target="#paymentHelloAsso">
              <i class="bi bi-lightning-charge me-2"></i>Je règle immédiatement la totalité par HelloAsso
            </button>
          </h2>
          <div id="paymentHelloAsso" class="accordion-collapse collapse" data-bs-parent="#paymentAccordion">
            <div class="accordion-body">
              <p class="text-muted">Lorsque vous cliquerez sur 'Envoyer' votre inscription sera transmise au cercle celtique et vous serez redirigé vers la plateforme HelloAsso pour effectuer votre paiement en ligne.</p>
              <button type="button" class="btn btn-secondary" id="btnSendHelloAsso">
                <i class="bi bi-send me-2"></i>Envoyer
              </button>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" disabled type="button" data-bs-toggle="collapse" data-bs-target="#paymentSortir">
              <i class="bi bi-ticket-perforated me-2"></i>Je veux utiliser le dispositif sortir
            </button>
          </h2>
          <div id="paymentSortir" class="accordion-collapse collapse" data-bs-parent="#paymentAccordion">
            <div class="accordion-body">
              <p class="text-muted">Lorsque vous cliquerez sur 'Envoyer' votre inscription sera transmise au cercle celtique, vous devrez ensuite passer à l'accueil du cercle pour y faire enregistrer votre paiement par le dispositif Sortir. Il 
              vous sera alors indiqué la somme restante.</p>
              <button type="button" class="btn btn-secondary" id="btnSendSortir">
                <i class="bi bi-send me-2"></i>Envoyer
              </button>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" disabled type="button" data-bs-toggle="collapse" data-bs-target="#paymentCheque">
              <i class="bi bi-bank me-2"></i>Je règle par chèque
            </button>
          </h2>
          <div id="paymentCheque" class="accordion-collapse collapse" data-bs-parent="#paymentAccordion">
            <div class="accordion-body">
              <p class="text-muted">Lorsque vous cliquerez sur 'Envoyer' votre inscription sera transmise au cercle celtique. Vous devrez ensuite préparer  un chèque d'un montant de xxx€.
               Chèque à l'ordre de CCR, à remettre à l'accueil ou à envoyer par courrier.</p>
              <button type="button" class="btn btn-secondary" id="btnSendCheque">
                <i class="bi bi-send me-2"></i>Envoyer
              </button>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" disabled type="button" data-bs-toggle="collapse" data-bs-target="#paymentVirement">
              <i class="bi bi-arrow-left-right me-2"></i>Je règle par virement
            </button>
          </h2>
          <div id="paymentVirement" class="accordion-collapse collapse" data-bs-parent="#paymentAccordion">
            <div class="accordion-body">
              <p class="text-muted">Lorsque vous cliquerez sur 'Envoyer' votre inscription sera transmise au cercle celtique. Vous trouverez ci-dessous les coordonnées bancaires à utiliser.
            .</p>
              <button type="button" class="btn btn-secondary" id="btnSendVirement">
                <i class="bi bi-send me-2"></i>Envoyer
              </button>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" disabled type="button" data-bs-toggle="collapse" data-bs-target="#paymentEspeces">
              <i class="bi bi-cash me-2"></i>Je règle en espèces
            </button>
          </h2>
          <div id="paymentEspeces" class="accordion-collapse collapse" data-bs-parent="#paymentAccordion">
            <div class="accordion-body">
              <p class="text-muted">Lorsque vous cliquerez sur 'Envoyer' votre inscription sera transmise au cercle celtique. Vous devrez ensuite vous présenter à l'accueil du cercle pour y effectuer votre règlement en espèces.</p>
              <button type="button" class="btn btn-secondary" id="btnSendEspeces">
                <i class="bi bi-send me-2"></i>Envoyer
              </button>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" disabled type="button" data-bs-toggle="collapse" data-bs-target="#paymentChequeVacances">
              <i class="bi bi-sun me-2"></i>Je règle en chèque vacances
            </button>
          </h2>
          <div id="paymentChequeVacances" class="accordion-collapse collapse" data-bs-parent="#paymentAccordion">
            <div class="accordion-body">
              <p class="text-muted">Lorsque vous cliquerez sur 'Envoyer' votre inscription sera transmise au cercle celtique. Vous devrez ensuite vous présenter à l'accueil du cercle pour y remettre vos chèques vacances.</p>
              <button type="button" class="btn btn-secondary" id="btnSendChequeVacances">
                <i class="bi bi-send me-2"></i>Envoyer
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>`;

  document.querySelector("#" + htmlpart).innerHTML = outputStr;
}

async function displaycgvpartBloc(htmlpart) {
  const filePath = `${getAppPath()}/public/conditions-de-vente.md`;
  let content = '';
  try {
    const mdText = await loadFileFetch(filePath);
    content = parseMarkdown(mdText);
  } catch {
    content = '<p class="text-muted">Les conditions de vente ne sont pas disponibles.</p>';
  }

  const outputStr = `
    ${getBlocHeaderWithMenu('Conditions de vente', "<i class='bi bi-file-text'></i>")}
    <div class="p-3">
      ${content}
    </div>`;

  document.querySelector("#" + htmlpart).innerHTML = outputStr;
}
