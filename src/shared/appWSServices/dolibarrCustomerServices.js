import { getConfigurationValue } from '../commonServices/configurationService.js';
import { getUserToken } from './dolibarrLoginServices.js';

/**
 *
 * @param {*} customerID
 * @returns
 */
export async function getCustomer(customerID) {

  const wsUrl =
    getConfigurationValue('wsUrlformel') + `thirdparties/${customerID}?DOLAPIKEY=${getUserToken()}`;
  const params = ``;
  const responsefr = await fetch(wsUrl + params, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      sortfield: 'name',
      limit: 500,
    },
  });
  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    sessionStorage.setItem('customer', JSON.stringify(data));
    return data;
  } else {
    console.log(`getCustomer Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'getCustomer Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}



/**
 * Create new customer
 * @param {string} customerName - Lastname firstname other-information
 * @param {string} civility - civility id
 * @returns {Promise<object>} - the created customer object
 */
export async function createNewCustomer(customerName, customercivility, customerbirthday, customerEmail, customerphone,
  customeraddress, customerzip, customertown
) {

  const wsUrl =
    getConfigurationValue('wsUrlformel') + `thirdparties?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: customerName,
      client: '1',
      email: customerEmail,
      phone: customerphone,
      address: customeraddress,
      zip: customerzip,
      town: customertown,
      array_options: {
        options_thi_civility: customercivility,
        options_thi_birthday: customerbirthday,
      },
    }),
  });

  if (responsefr.ok) {
    const customerId = await responsefr.json();
    return customerId;
  } else {
    throw new Error('createNewCustomer Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}


/**
 *
 * @param {*} customer : current customer
 * @param {*} customerUpdates : modifications to be savec
 * @returns
 */
export async function putCustomerUpdate(customer, customerUpdates) {
  if (!customerUpdates.name) {
    throw Error('Veuillez saisir les nom prénom');
  }
  // *** Validation email
  if (customerUpdates.email && customerUpdates.email.length > 0) {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(customerUpdates.email)) {
      throw Error('email invalide');
    }
  }

  // *** Check civility
  if (!customerUpdates.civility) {
    throw Error('Veuillez saisir votre la civilité');
  }

  // TODO : check the email validity
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `thirdparties/${customer.id}?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: customerUpdates.phone,
      name: customerUpdates.name,
      address: customerUpdates.address,
      zip: customerUpdates.zip,
      town: customerUpdates.town,
      email: customerUpdates.email,
      country_id: customerUpdates.country_id,
      array_options: {
        options_thi_civility: customerUpdates.civility,
        options_thi_birthday: customerUpdates.birthday,
      },
    }),
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    sessionStorage.setItem('customer', JSON.stringify(data));

    // await putCustomerIncomeLevel(customer, customerUpdates.price_level);
    // return data;
  } else {
    console.log(`putCustomerUpdate Error: ${JSON.stringify(responsefr)} `);
    throw new Error('putCustomerUpdate Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}


/**
 *
 * @param {*} customerID
 * @returns
 */
export async function removeCustomer(customerID) {

  const wsUrl =
    getConfigurationValue('wsUrlformel') + `thirdparties/${customerID}?DOLAPIKEY=${getUserToken()}`;
  const params = ``;
  const responsefr = await fetch(wsUrl + params, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    // sessionStorage.setItem('customer', JSON.stringify(data));
    return data;
  } else {
    console.log(`getCustomer Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'getCustomer Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

/**
 *
 * @param {*} customerID
 * @returns
 */
export async function getCustomerOrders(customerID) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `dklaccueil/fullorders?thirdparty_ids=${customerID}&DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // ***no order for this customer
  if (responsefr.ok === false) if (responsefr.status === '404') return null;

  if (responsefr.status === 404) return null;

  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    if (responsefr.status === '404') return null;
    const data = responsefr.json();

    sessionStorage.setItem('customerOrders', JSON.stringify(data));
    // console.log("getCustomerOrders  await ok ");
    return data;
  } else {
    console.log(`getCustomerOrders Error: ${JSON.stringify(responsefr)} `);
    throw new Error(
      'getCustomerOrders Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

/**
 *
 * @param {*} customerID
 * @returns
 */
export async function getCustomerInvoices(customerID) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `invoices?thirdparty_ids=${customerID}&DOLAPIKEY=${getUserToken()}&sortfield=datec&sortorder=DESC
`;

  const responsefr = await fetch(wsUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // params: JSON.stringify({
    //     sortfield: "datec",
    //     sortorder: "DESC",
    //     limit: "500"
    // })
    // // params: {
    // // }
    // ,
  });
  if (responsefr.status === 404) return null;

  // ***no order for this customer
  if (responsefr.ok === false) if (responsefr.status === '404') return null;

  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    if (responsefr.status === '404') return null;
    const data = responsefr.json();
    sessionStorage.setItem('customerInvoices', JSON.stringify(data));
    // console.log("getCustomerOrders  await ok ");
    return data;
  } else {
    console.log(`getCustomerOrders Error: ${JSON.stringify(responsefr)} `);
    throw new Error(
      'getCustomerOrders Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

// /**
//  * 
//  * @param {*} customerOrders 
//  * @returns 
//  */
// export function evaluateCustomerSubscriptionStatus(customerOrders) {
//   let computedSubscription = {
//     subscriptionStatus: false,
//     subscriptionLabel: '',
//     subscriptionLevel: '',
//     startSubscriptionDate: '',
//     endSubscriptionDate: '',
//     orderID: -1,
//   };
//   // let customerOrders = store.getState().customerReducer.orders;
//   customerOrders?.forEach((order) => {
//     // if (order.statut === '1' || order.statut === '3' || order.id === currentOrderId) {
//     if (order.statut === '1' || order.statut === '3') {
//       order.lines.forEach((orderLine) => {
//         if (orderLine.ref) {
//           if (orderLine.ref.startsWith('ADH_')) {
//             if (
//               new Date(orderLine.array_options.options_lin_datefin).getTime() >
//               Date.now() / 1000
//             ) {
//               computedSubscription = {
//                 subscriptionStatus: true,
//                 subscriptionLevel: orderLine.ref,
//                 subscriptionLabel: orderLine.libelle,
//                 startSubscriptionDate: orderLine.array_options.options_lin_datedebut,
//                 endSubscriptionDate: orderLine.array_options.options_lin_datefin,
//                 orderId: order.id,
//               };
//             }
//           }
//         }
//       });
//     }
//   });
//   return computedSubscription;
// }

/**
 *
 * @param {*} searchString
 * @param {*} searchType
 * @returns
 */
export async function getcustomerSearch(searchString, searchType) {
  searchString = searchString.replace("'", "\\'");
  let searchStringBuild = '';
  switch (searchType) {
    case 'name':
      searchStringBuild = '(t.nom:like:%27%25' + searchString + '%25%27) ';
      break;
    case 'email':
      searchStringBuild = '(t.email:like:%27%25' + searchString + '%25%27)';
      break;
    case 'address':
      searchStringBuild =
        '(t.town:like:%27%25' +
        searchString +
        '%25%27)' +
        ' OR ' +
        ' (t.address:like:%27%25' +
        searchString +
        '%25%27)' +
        ' OR ' +
        '(t.zip:like:%27%25' +
        searchString +
        '%25%27)';
      break;
    case 'phone':
      searchStringBuild = '(t.phone:like:%27%25' + searchString + '%25%27) ';
      break;
    default:
      searchStringBuild = 't.nom like%27%25' + searchString + '%25%27 ';
  }

  const wsUrl = getConfigurationValue('wsUrlformel');
  const params = `thirdparties?sqlfilters=${searchStringBuild}&DOLAPIKEY=${getUserToken()}&sortfield=t.nom&sortorder=ASC`;

  const responseWS = await fetch(wsUrl + params);

  if (responseWS.ok) {
    return responseWS.json();
  } else if (responseWS.status === 404) {
    return [];
  } else {
    throw new Error(
      'getcustomerSearch Error message : ' + responseWS.status + ' ' + responseWS.statusText
    );
  }
}


/**
 * Update customer income level
 * @param {*} customer
 * @param {*} incomeLevel
 * @returns
 */
export async function putCustomerIncomeLevel(customer, incomeLevel) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `thirdparties/${customer.id}/setpricelevel?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceLevel: incomeLevel,
    }),
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    return data;
  } else {
    throw new Error('validateOrder Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}

// /**
//  *
//  *
//  */
// /**
//  * Evaluate if the customer already has a meal for a date,  use the orders of the customer, loaded in memory
//  * @param {*} starttestDate
//  * @param {*} endtestdate
//  * @param {*} currentOrderId
//  * @param {*} product
//  * @returns
//  */
// export function evaluateCustomerMealForADate(starttestDate, endtestdate, currentOrderId, product, customerOrders) {
//   let customerMealForDate = {
//     mealForDate: false,
//     ref: null,
//     libelle: null,
//     options_lin_datedebut: null,
//     fk_commande: null,
//     orderref: null,
//   };

//   //const customerOrders = orders;
//   customerOrders.forEach((order, index) => {
//     if (order.statut === '1' || order.statut === '3' || order.id === currentOrderId) {
//       order.lines.forEach((orderLine, index) => {
//         if (orderLine.ref) {
//           if (orderLine.ref.startsWith('REP')) {
//             if (
//               product &&
//               product.ref.substring(0, product.ref.lastIndexOf('_')) ===
//               orderLine.product_ref.substring(0, orderLine.product_ref.lastIndexOf('_'))
//             ) {
//               const starttobeTestedDate = new Date(starttestDate).setHours(0, 0, 0);
//               // starttobeTestedDate
//               const endtobeTestedDate = new Date(endtestdate).setHours(0, 0, 0);
//               //  endtobeTestedDate.setHours(0, 0, 0);
//               const startDate = new Date(
//                 orderLine.array_options.options_lin_datedebut * 1000
//               ).setHours(0, 0, 0);
//               //  startDate.setHours(0, 0, 0);
//               const endDate = new Date(orderLine.array_options.options_lin_datefin * 1000).setHours(
//                 0,
//                 0,
//                 0
//               );
//               // endDate.setHours(0, 0, 0);

//               if (
//                 (starttobeTestedDate >= startDate && starttobeTestedDate <= endDate) ||
//                 (endtobeTestedDate >= startDate && endtobeTestedDate <= endDate) ||
//                 (startDate >= starttobeTestedDate && startDate <= endtobeTestedDate) ||
//                 (endDate >= endtobeTestedDate >= starttobeTestedDate &&
//                   endDate <= endtobeTestedDate)
//               ) {
//                 customerMealForDate = {
//                   mealForDate: true,
//                   ref: orderLine.ref,
//                   libelle: orderLine.libelle,
//                   options_lin_datedebut: orderLine.array_options.options_lin_datedebut,
//                   fk_commande: order.id,
//                   orderref: order.ref,
//                 };
//               }
//               // }
//             }
//           }
//         }
//       });
//     }
//   });
//   return customerMealForDate;
// }

// /**
//  * Evaluate if the customer already has a hostingBooking for a date
//  * use the orders of the customer, loaded in memory
//  * @param {*} testStartDate
//  * @param {*} testEndDate
//  * @param {*} currentOrderId
//  * @returns : a data structure with data describing the hosting
//  */
// export function evaluateHostingForADate(testStartDate, testEndDate, currentOrderId, customerOrders) {
//   // return (dispatch) => {

//   let customerHostingForDate = {
//     hostingForDate: false,
//     ref: null,
//     libelle: null,
//     options_lin_datedebut: null,
//     fk_commande: null,
//     orderref: null,
//   };

//   // const customerOrders = store.getState().customerReducer.orders;
//   customerOrders.forEach((order, index) => {
//     if (order.statut === '1' || order.statut === '3' || order.id === currentOrderId) {
//       let heblines = order.lines.filter((orderLine) => orderLine.ref.startsWith('HEB'));
//       heblines.forEach((orderLine, index) => {
//         const dateStartToTest = moment(testStartDate);
//         const dateEndToTest = moment(testEndDate);
//         const datestart = moment(orderLine.array_options.options_lin_datedebut * 1000);
//         const dateend = moment(orderLine.array_options.options_lin_datefin * 1000);
//         if (
//           (dateStartToTest.isSameOrAfter(datestart, 'day') &&
//             dateStartToTest.isSameOrBefore(dateend, 'day')) ||
//           (dateEndToTest.isSameOrAfter(datestart, 'day') &&
//             dateEndToTest.isSameOrBefore(dateend, 'day'))
//         ) {
//           customerHostingForDate = {
//             hostingForDate: true,
//             ref: orderLine.ref,
//             libelle: orderLine.libelle,
//             options_lin_datedebut: orderLine.array_options.options_lin_datedebut,
//             fk_commande: order.id,
//             orderref: order.ref,
//           };
//         }
//       });
//     }
//   });
//   return customerHostingForDate;
// }


