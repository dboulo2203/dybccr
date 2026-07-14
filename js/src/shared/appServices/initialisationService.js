// import { getAppPath } from '../commonServices/commonFunctions.js';
import { getConfigurationFromJson } from '../commonServices/configurationService.js';
import { setTheme } from '../bootstrapServices/bootstrapTheme.js';
import { getDolibarrStatus, loadCivilitiesTable, loadPaymentTypesTable, loadTypeactivitiesTable, loadTypedomainsTable, loadYearExerciceTable } from '../appWSServices/dolibarrListsServices.js';
import { loadProducts } from '../appWSServices/dolibarrProductServices.js';

/**
 *
 */
export async function launchInitialisation() {
  await getConfigurationFromJson();
  await loadTypeactivitiesTable()
  await loadTypedomainsTable()
  await loadYearExerciceTable()
  await loadCivilitiesTable();
  await loadPaymentTypesTable()
  await (loadProducts())
  await getDolibarrStatus()
  setTheme();
}
