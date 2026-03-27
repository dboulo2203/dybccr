import { getConfigurationValue } from '../commonServices/configurationService.js';
import { getUserToken } from './dolibarrLoginServices.js';

export async function fetchOrders(
  searchString,
  searchType,
  userID,
  startDate,
  endDate,
  orderIdsList
) {
  try {
    let apiUrl = `${getConfigurationValue('wsUrlformel')}dklaccueil/fullorders?DOLAPIKEY=${getUserToken()}`;
    apiUrl += '&sqlfilters=t.rowid in (' + orderIdsList + ')';
    const response = await fetch(apiUrl);

    // L'API retourne 404 quand aucun résultat n'est trouvé
    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();

    // let resultTab = data.map(element => element.fk_commande).join(',');

    // fetchOrders("", 'commandeorderidslist', 0, null, null, resultTab);
    return data || [];
  } catch (error) {
    console.error('Erreur fetchorders:', error);
    throw error;
  }
}
