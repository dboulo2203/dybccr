import { fetchOrders } from '../appWSServices/zopaBusinesslistsService.js';
import { getConfigurationValue } from '../commonServices/configurationService.js';
import { getUserToken } from './dolibarrLoginServices.js';

/**
 * Load the products from the database
 * the products list is saved in the sessionStorage
 */
export async function loadProducts() {
  const frBase = sessionStorage.getItem('products');
  const base = JSON.parse(frBase);
  if (base) return true;

  const wsUrl =
    getConfigurationValue('wsUrlformel') + `products?DOLAPIKEY=${getUserToken()}&limit=5000`;
  const params = ``;
  const responsefr = await fetch(wsUrl + params);

  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    sessionStorage.setItem('products', JSON.stringify(data));
    return data;
  } else {
    console.log(`getProducts Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'getProducts Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

/**
 *
 * @returns
 */
export function getAllProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products;
}

/**
 *
 * @returns
 */
export function getAllActiveProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => product.status === '1');
}

/**
 *
 * @returns
 */
export function getResourceProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => product.ref.startsWith('RES') && product.status === '1');
}

/**
 *
 * @returns
 */
export function getTranslationProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => product.ref.startsWith('TRA') && product.status === '1');
}

/**
 *
 * @returns
 */
export function getHostingProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => product.ref.startsWith('HEB'));
}

/**
 *
 * @returns
 */
export function getHostingActiveProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => product.ref.startsWith('HEB') && product.status === '1');
}
/**
 *
 * @returns
 */
export function getMealProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => product.ref.startsWith('REP'));
}
/**
 *
 * @returns
 */
export function getMealActiveProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => product.ref.startsWith('REP') && product.status === '1');
}

/**
 *
 * @returns
 */
export function getSubscriptionProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => product.ref.startsWith('ADH'));
}

/**
 *
 * @returns
 */
export function getSubscriptionActiveProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => ((product.array_options?.options_type_activite === '3') && (product.status === '1')));
}
/**
 * Get products with status_buy = 1 (purchasable)
 * @returns {Array}
 */
export function getToBuyProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => product.status_buy === '1');
}

/**
 *
 */
export function getRestaurantProducts() { }

/**
 *
 * @returns
 */
export function getSessionFuturProducts() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() - 1);

  return products.filter(
    (product) =>
      product.ref.startsWith('STA') &&
      product.status === '1' &&
      new Date(product.array_options.options_sta_datefin * 1000).setHours(0, 0, 0, 0) >=
      tomorrow.setHours(0, 0, 0, 0)
  );
}
/**
 *
 * @returns
 */
export function getSessionProductswithoutFilter() {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => product.ref.startsWith('TRA'));
}
/**
 *
 * @param {*} ref
 * @returns
 */
export function getProductFromRef(ref) {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  return products.filter((product) => product.ref === ref);
}
/**
 *
 * @param {*} id
 * @returns
 */
export function getProductFromId(id) {
  const productsJson = sessionStorage.getItem('products');
  const products = JSON.parse(productsJson);

  const filteredProduct = products.filter((product) => product.id === id);
  if (filteredProduct.length > 0) return filteredProduct[0];
  else return [];
}

// Récupérer les détails d'un produit par son ID
export async function fetchProductDetails(productId) {
  try {
    const apiUrl = `${getConfigurationValue('wsUrlformel')}products/${productId}?DOLAPIKEY=${getUserToken()}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const product = await response.json();
    return product;
  } catch (error) {
    console.error('Erreur lors du chargement des détails du produit:', error);
    throw error;
  }
}

// Récupérer la liste des commandes inscrites à un stage/produit
export async function fetchRegisteredPersons(productId) {
  try {
    const apiUrl = `${getConfigurationValue('wsUrlformel')}dklaccueil/${productId}/registered?DOLAPIKEY=${getUserToken()}`;
    const response = await fetch(apiUrl);

    // L'API retourne 404 quand aucun résultat n'est trouvé
    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();

    // ** Build the orders id list
    const resultTab = data.map((element) => element.fk_commande).join(',');

    // *** Get the orders data
    const dataEnd = fetchOrders('', 'commandeorderidslist', 0, null, null, resultTab);

    return dataEnd || [];
  } catch (error) {
    console.error('Erreur fetchRegisteredPersons :', error);
    throw error;
  }
}
