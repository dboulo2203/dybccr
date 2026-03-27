import { getConfigurationValue } from '../commonServices/configurationService.js';

/**
 * Display the footer part of the application
 * @param {*} htlmPartId
 */
export function footerViewDisplay(htlmPartId) {
  const dolibarrUrl = getConfigurationValue('wsUrlformel');

  let statusBadge;
  const raw = sessionStorage.getItem('dolibarrStatus');
  if (raw) {
    const status = JSON.parse(raw);
    const version = status?.success?.dolibarr_version ?? status?.version ?? status?.success?.module_version ?? '?';
    if (status?.success?.code === 200) {
      statusBadge = `<span class=" ">OK v${version}</span>`;
    } else {
      statusBadge = `<span class=" ">Statut inconnu</span>`;
    }
  } else {
    statusBadge = `<span class="badge bg-danger">Indisponible</span>`;
  }

  const footerString = `
    <div id="footerPart" style="margin-top:40px">
        <hr style="color:grey"></hr>
        <div class="d-flex justify-content-center" style="">
            <small>${getConfigurationValue('version')}</small>
        </div>
        <div class="d-flex justify-content-center gap-2 mt-1">
            <small class="text-muted">${dolibarrUrl}</small>
            ${statusBadge}
        </div>
        <hr style="color:grey"></hr>
    </div>
        `;

  document.querySelector(htlmPartId).innerHTML = footerString;
}
