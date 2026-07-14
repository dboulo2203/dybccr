import { getConfigurationValue } from '../../../shared/commonServices/configurationService.js';
import { displayAlert } from '../../../shared/bootstrapServices/components/components.js';
import { displayToast } from '../../../shared/bootstrapServices/bootstrapCommon.js';
import { getAllActiveProducts, getSubscriptionActiveProducts } from '../../../shared/appWSServices/dolibarrProductServices.js';
import { displayActionGetPaymentLink } from '../actionGetPaymentLink/actionGetPaymentLink.js';
import { validateInvoice } from '../../../shared/appWSServices/dolibarrInvoicesServices.js';
import {getUserToken} from '../../../shared/appWSServices/dolibarrLoginServices.js';

// const WEBUSER_API_KEY = '32o00aKUJW60Yi48hIBP2JnvbEbcf3Va';

const PAYMENT_MODES = {
  paymentHelloAsso: { code: 'CB',    label: 'HelloAsso' },
  paymentCheque:    { code: 'CHQ',   label: 'Chèque' },
  paymentAutre:     { code: 'AUTRE', label: 'Moyen de paiement complexe' },
};

function buildThirdpartyName(lastname, firstname) {
  const clean = (s) => s.trim().replace(/\s+/g, '-');
  return `${clean(lastname)} ${clean(firstname)}`;
}

function getFormData() {
  return {
    firstname: document.getElementById('identity-firstname')?.value.trim() ?? '',
    lastname:  document.getElementById('identity-lastname')?.value.trim() ?? '',
    email:     document.getElementById('identity-email')?.value.trim() ?? '',
    phone:     document.getElementById('identity-phone')?.value.trim() ?? '',
    address:   document.getElementById('identity-address')?.value.trim() ?? '',
    zip:       document.getElementById('identity-zip')?.value.trim() ?? '',
    town:      document.getElementById('identity-town')?.value.trim() ?? '',
    civility:  document.getElementById('identity-civility')?.value ?? '',
    birthday:  document.getElementById('identity-birthday')?.value ?? '',
  };
}

export function getSelectedLines() {
  const allProducts = getAllActiveProducts();
  const subscriptionProducts = getSubscriptionActiveProducts();
  const lines = [];

  const membershipRadio = document.querySelector('[name="membership-type"]:checked');
  if (membershipRadio) {
    const p = subscriptionProducts.find((p) => p['id'] === membershipRadio.value);
    if (p) lines.push({ fk_product: p['id'], desc: p['label'], subprice: p['price'] });
  }

  document.querySelectorAll('[id^="activity-"]:checked').forEach((cb) => {
    const p = allProducts.find((p) => p['id'] === cb.value);
    if (p) lines.push({ fk_product: p['id'], desc: p['label'], subprice: p['price'] });
  });

  return lines;
}

async function searchThirdpartyByEmail(email) {
  const wsUrl = getConfigurationValue('wsUrlformel');
  // const filter = encodeURIComponent(`(t.email:=:'${email}')`);
  const filter = `(t.email:=:'${email}')`;

  const response = await fetch(`${wsUrl}thirdparties?sqlfilters=${filter}&DOLAPIKEY=${getUserToken()}`);
  if (response.ok) return await response.json();
  if (response.status === 404) return [];
  throw new Error('Recherche tiers : ' + response.status + ' ' + response.statusText);
}

async function createThirdparty(formData) {
  const wsUrl = getConfigurationValue('wsUrlformel');
  const response = await fetch(`${wsUrl}thirdparties?DOLAPIKEY=${getUserToken()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: buildThirdpartyName(formData.lastname, formData.firstname),
      client: '1',
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      zip: formData.zip,
      town: formData.town,
      array_options: {
        options_thi_civility: formData.civility,
        options_thi_birthday: formData.birthday,
      },
    }),
  });
  if (response.ok) return await response.json();
  throw new Error('Création du tiers : ' + response.status + ' ' + response.statusText);
}

async function getThirdpartyInvoicesForSeason(thirdpartyId, season) {
  const wsUrl = getConfigurationValue('wsUrlformel');
  // *** array_options.xxx is not a real SQL column, Dolibarr rejects it in sqlfilters.
  // *** Filter only on fk_soc (a real column) and filter the season client-side below.
  const filter = `(t.fk_soc:=:${thirdpartyId})`;

  const response = await fetch(
    `${wsUrl}invoices?sqlfilters=${encodeURIComponent(filter)}&DOLAPIKEY=${getUserToken()}`
  );
  if (response.ok) {
    const invoices = await response.json();
    return invoices.filter(
      (invoice) => Number(invoice['array_options']?.['options_inv_culturalseason']) === Number(season)
    );
  }
  if (response.status === 404) return [];
  throw new Error('Recherche des inscriptions existantes : ' + response.status + ' ' + response.statusText);
}

/**
 * Check if the given lines (activities/membership) are already invoiced for the
 * thirdparty matching this email, for the current cultural season.
 * @param {string} email
 * @param {Array<{fk_product, desc}>} lines
 * @returns {Promise<string[]>} labels of the lines already registered
 */
export async function checkAlreadyRegisteredActivities(email, lines) {
  if (!email || lines.length === 0) return [];

  const thirdparties = await searchThirdpartyByEmail(email);
  if (thirdparties.length === 0) return [];

  const season = Number(getConfigurationValue('culturalSeason'));
  const invoices = await getThirdpartyInvoicesForSeason(thirdparties[0]['id'], season);

  return lines
    .filter((line) =>
      invoices.some((invoice) =>
        invoice.lines?.some((invoiceLine) => String(invoiceLine['fk_product']) === String(line.fk_product))
      )
    )
    .map((line) => line.desc);
}

async function createInvoice(thirdpartyId, lines, paymentMode) {
  const wsUrl = getConfigurationValue('wsUrlformel');
  const response = await fetch(`${wsUrl}invoices?DOLAPIKEY=${getUserToken()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      socid: Number(thirdpartyId),
      mode_reglement_code: paymentMode.code,
      array_options: {
        options_inv_culturalseason: Number(getConfigurationValue('culturalSeason')),
      },
      lines: lines.map((line) => ({
        fk_product: Number(line.fk_product),
        desc: line.desc,
        qty: 1,
        subprice: Number(line.subprice),
      })),
    }),
  });
  if (response.ok) { 
    return await response.json();
  }    
  throw new Error('Création de la facture : ' + response.status + ' ' + response.statusText);
}

/**
 * Main action : called when a "Envoyer" button is clicked
 * @param {string} paymentPanelId - accordion panel id (e.g. 'paymentHelloAsso')
 */
export async function displayActionSendRegistration(paymentPanelId) {
  const paymentMode = PAYMENT_MODES[paymentPanelId];
  const formData = getFormData();
  const lines = getSelectedLines();

  const btn = document.querySelector(`#${paymentPanelId} button[id^="btnSend"]`);
  const messageSection = document.querySelector('#messageSection');
  const messageSendSection = document.querySelector(`#${paymentPanelId} #messageSectionSend`);

  try {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Envoi en cours...`;

    // 1. Recherche du tiers par email
    const results = await searchThirdpartyByEmail(formData.email);
    let thirdpartyId;

    if (results.length > 0) {
      thirdpartyId = results[0]['id'];
    } else {
      thirdpartyId = await createThirdparty(formData);
    }

    // 2. Création de la facture
    const invoiceId = await createInvoice(thirdpartyId, lines, paymentMode);

    displayToast('messageSection', 'Inscription', 'Votre demande a bien été enregistrée. Votre référence est : '+ invoiceId);
    messageSendSection.innerHTML=`Votre inscription est bien envoyée, conservez la référence : ${invoiceId}`;

    btn.innerHTML = `<i class="bi bi-check-circle me-2"></i>Envoyé`;
    

    if (paymentPanelId === 'paymentHelloAsso') {
      await validateInvoice({ id: invoiceId });
      const payBtn = document.createElement('button');
      payBtn.type = 'button';
      payBtn.className = 'btn btn-success ms-2';
      payBtn.innerHTML = `<i class="bi bi-credit-card me-2"></i>Payer par HelloAsso`;
      payBtn.addEventListener('click', async () => {
        const link = await displayActionGetPaymentLink({ id: invoiceId });
        if (link) window.open(link, '_blank');
      });
      btn.after(payBtn);
    }

  } catch (error) {
    messageSection.innerHTML = displayAlert('alert-danger', error.message || String(error));
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-send me-2"></i>Envoyer`;
  }
}
