import { getConfigurationValue } from '../commonServices/configurationService.js';
import { getUserToken } from './dolibarrLoginServices.js';

/**
 * Get the DYBccr module parameters (DYBCCR_DYBWEB_OPEN, DYBCCR_DYBWEB_CLOSE_MESSAGE, ...)
 * @returns {Promise<object>}
 */
export async function getModuleParameters() {
  const wsUrl =
    getConfigurationValue('wsUrlformel') + `dybccrapi/moduleparameters?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    sessionStorage.setItem('moduleParameters', JSON.stringify(data));
    return data;
  } else {
    throw new Error(
      'getModuleParameters Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}
