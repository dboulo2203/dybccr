import { getConfigurationValue } from '../commonServices/configurationService.js';
import { getUserToken } from './dolibarrLoginServices.js';

/**
 * Return the List content (json string)
 * @returns
 */
export function getList(listName) {
  const frBase = sessionStorage.getItem(listName);
  if (frBase) return JSON.parse(frBase);
  else return null;
}

/**
 *
 * @param {*} listName
 * @param {*} entityID
 * @param {*} entityName
 * @param {*} selectValue
 * @returns
 */
export function getSelectFromDatabaseList(listName, entityID, entityName, selectValue) {
  let outpuStr = ``;
  getList(listName).map((listentity) => {
    if (selectValue && selectValue === listentity[entityID])
      outpuStr += `<option value="${listentity[entityID]}" selected>${listentity[entityName]}</option>`;
    else outpuStr += `<option value="${listentity[entityID]}">${listentity[entityName]}</option>`;
  });
  return outpuStr;
}

/**
 *
 * @param {*} listName
 * @param {*} entityID
 * @param {*} entityName
 * @param {*} selectValue
 * @returns
 */
export function getSelectFromDatabaseListDropdown(listName, entityID, entityName, selectValue) {
  let outpuStr = ``;
  // if (addZeroOption)
  //     outpuStr += `<li><a class="dropdown-item ${listName}_item" selectedId="0" selectedName=""> --- </a> </li>`;

  getList(listName).map((listentity) => {
    //  let test1 = entityID.valueOf();
    // let test = listentity[entityID];
    if (selectValue === listentity[entityID])
      outpuStr += `<li ><a  class="dropdown-item ${listName}_item active" selectedId="${listentity[entityID]}" selectedName="${listentity[entityName]}">${listentity[entityName]}</a></li>`;
    else
      outpuStr += `<li><a class="dropdown-item ${listName}_item" selectedId="${listentity[entityID]}" selectedName="${listentity[entityName]}">${listentity[entityName]}</a></li>`;
  });

  // outpuStr += `<li><a class="dropdown-item ${listName}_item" selectedId="${listentity[entityID]}" selectedName="${listentity[entityName]}">${listentity[entityName]}</a></li>`;
  // });
  return outpuStr;
}

/**
 * Get a value from a table
 * @param {*} listName  tablename
 * @param {*} fieldName field name
 * @param {*} searchValue searched value
 * @returns String found value
 */
export function getvalue(listName, fieldName, searchValue) {
  const base = getList(listName);
  if (!base) return null;

  const objFound = base.find((o) => o[fieldName] === searchValue);
  return objFound || null;
}

// export function getSelectFromDatabaseList(listName, selectID, entityID, entityName) {
//     let outpuStr = `
//       <div class="col" style="margin:2px">
//       <select class="form-select form-select-sm"  aria-label="Default select example" id="${selectID}">`;
//     getList(listName).map((listentity, index) => {
//         outpuStr += `<option value="${listentity[entityID]}">${listentity[entityName]}</option>`;
//     });
//     outpuStr += `
//         </select> </div>`;
//     return outpuStr;
// }

/**
 * Load Year exercice dictionary table into sessionStorage
 * @returns {Promise<boolean>}
 */
export async function loadYearExerciceTable() {
  const frBase = sessionStorage.getItem('yearexercice');
  const base = JSON.parse(frBase);
  if (base) return true;

  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `dybccrapi/yearexercices?DOLAPIKEY=${getUserToken()}&sortorder=ASC&limit=100&active=1`;
  const responsefr = await fetch(wsUrl);

  if (responsefr.ok) {
    const data = await responsefr.json();
    sessionStorage.setItem('yearexercice', JSON.stringify(data));
    return true;
  } else {
    throw new Error(
      'loadYearExerciceTable Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}


/**
 * Load Year exercice dictionary table into sessionStorage
 * @returns {Promise<boolean>}
 */
export async function loadTypeactivitiesTable() {
  const frBase = sessionStorage.getItem('typeactivities');
  const base = JSON.parse(frBase);
  if (base) return true;

  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `dybccrapi/typeactivities?DOLAPIKEY=${getUserToken()}&sortorder=ASC&limit=100&active=1`;
  const responsefr = await fetch(wsUrl);

  if (responsefr.ok) {
    const data = await responsefr.json();
    sessionStorage.setItem('typeactivities', JSON.stringify(data));
    return true;
  } else {
    throw new Error(
      'loadYearExerciceTable Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}



/**
 * Load Year exercice dictionary table into sessionStorage
 * @returns {Promise<boolean>}
 */
export async function loadTypedomainsTable() {
  const frBase = sessionStorage.getItem('typedomains');
  const base = JSON.parse(frBase);
  if (base) return true;

  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `dybccrapi/typedomains?DOLAPIKEY=${getUserToken()}&sortorder=ASC&limit=100&active=1`;
  const responsefr = await fetch(wsUrl);

  if (responsefr.ok) {
    const data = await responsefr.json();
    sessionStorage.setItem('typedomains', JSON.stringify(data));
    return true;
  } else {
    throw new Error(
      'loadYearExerciceTable Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}
// DybccrTypeActiv
// DybccrTypeActivities	GET / api / index.php / dybccrtypeactivities	index() + get($id)
// DybccrTypeDomains	GET / api / index.php / dybccrtypedomains	index() + get($id)
// DybccrYearExercices	GET / api / index.php / dybccryearexercices	index() + get($id)

/**
 * Get the label of a Year exercice entry by its id
 * @param {string|number} id
 * @returns {string}
 */
export function getYearExerciceLabel(id) {
  const base = getList('yearexercice');
  if (!base) return id ?? '';
  const found = base.find((o) => String(o['rowid']) === String(id));
  return found?.['label'] ?? id ?? '';
}

export async function getDolibarrStatus() {
  const wsUrl = getConfigurationValue('wsUrlformel') + `status?DOLAPIKEY=${getUserToken()}`;
  const responsefr = await fetch(wsUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (responsefr.ok) {

    const retour = await responsefr.json();
    sessionStorage.setItem('dolibarrStatus', JSON.stringify(retour));

    return retour;
  } else {
    throw new Error('getDolibarrStatus Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}

// export function getDolibarrStatus() { }
export function getConfiguration() { }

export async function loadCivilitiesTable() {
  const frBase = sessionStorage.getItem('typecivilities');
  const base = JSON.parse(frBase);
  if (base) return true;

  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `setup/dictionary/civilities?DOLAPIKEY=${getUserToken()}&sortorder=ASC&limit=100&active=1`;
  //let params = `&sortorder=ASC&limit=100&active=1`;
  const responsefr = await fetch(wsUrl);

  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    sessionStorage.setItem('typecivilities', JSON.stringify(data));
    return true;
  } else {
    console.log(`getCustomerCivilitiesTable Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'getCustomerCivilitiesTable Error message : ' +
      responsefr.status +
      ' ' +
      responsefr.statusText
    );
  }
}


// export function getCustomerCivilityLabel(civility_id) {}

// /**
//  *
//  * @returns
//  */
// export async function loadPublipostageTable() {
//   // *** Check if the table already exists in the sessionStorage
//   const frBase = sessionStorage.getItem('publipostages');
//   const base = JSON.parse(frBase);
//   if (base) return true;

//   const wsUrl =
//     getConfigurationValue('wsUrlformel') +
//     `dklaccueil/dictionary/publipostagetypes?sortfield=code&sortorder=ASC&limit=100&DOLAPIKEY=${getUserToken()}`;
//   //let params = `&sortorder=ASC&limit=100&active=1`;
//   const responsefr = await fetch(wsUrl);

//   if (responsefr.ok) {
//     // *** Get the data and save in the sessionStorage
//     const data = await responsefr.json();
//     sessionStorage.setItem('publipostages', JSON.stringify(data));
//     return true;
//   } else {
//     console.log(`getPublipostageTable Error : ${JSON.stringify(responsefr)}`);
//     throw new Error(
//       'getPublipostageTable Error message : ' + responsefr.status + ' ' + responsefr.statusText
//     );
//   }
// }

// /**
//  *
//  * @returns
//  */
// export async function loadIncomeLevelsTable() {
//   // *** Check if the table already exists in the sessionStorage
//   const frBase = sessionStorage.getItem('incomeLevels');
//   const base = JSON.parse(frBase);
//   if (base) return true;

//   const wsUrl =
//     getConfigurationValue('wsUrlformel') +
//     `dklaccueil/dictionary/incomeleveltypes?sortfield=code&sortorder=ASC&limit=100&active=1&DOLAPIKEY=${getUserToken()}`;
//   //let params = `&sortorder=ASC&limit=100&active=1`;
//   const responsefr = await fetch(wsUrl);

//   if (responsefr.ok) {
//     // *** Get the data and save in the sessionStorage
//     const data = await responsefr.json();
//     sessionStorage.setItem('incomeLevels', JSON.stringify(data));
//     return true;
//   } else {
//     console.log(`getIncomesLevelTable Error : ${JSON.stringify(responsefr)}`);
//     throw new Error(
//       'getIncomesLevelTable Error message : ' + responsefr.status + ' ' + responsefr.statusText
//     );
//   }
// }

/**
 *
 * @returns
 */
export async function loadPaymentTypesTable() {
  // *** Check if the table already exists in the sessionStorage
  const frBase = sessionStorage.getItem('paymenttypes');
  const base = JSON.parse(frBase);
  if (base) return true;

  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `setup/dictionary/payment_types?sortfield=code&sortorder=ASC&limit=100&active=1&DOLAPIKEY=${getUserToken()}`;
  //let params = `&sortorder=ASC&limit=100&active=1`;
  const responsefr = await fetch(wsUrl);

  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    sessionStorage.setItem('paymenttypes', JSON.stringify(data));
    return true;
  } else {
    console.log(`getPaymentTypes Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'getPaymentTypes Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

export function getPaymentTypes() {
  const paymentTypesJson = sessionStorage.getItem('paymenttypes');
  return JSON.parse(paymentTypesJson);
}

export async function loadCountriesTable() {
  // *** Check if the table already exists in the sessionStorage
  const frBase = sessionStorage.getItem('countries');
  const base = JSON.parse(frBase);
  if (base) return true;

  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `setup/dictionary/countries?sortfield=label&sortorder=ASC&sqlfilters=(active:=:1)&DOLAPIKEY=${getUserToken()}`;
  //let params = `&sortorder=ASC&limit=100&active=1`;
  const responsefr = await fetch(wsUrl);

  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    sessionStorage.setItem('countries', JSON.stringify(data));
    return true;
  } else {
    console.log(`loadCountriesTable Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'loadCountriesTable Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

export async function loadUsersTable() {
  // *** Check if the table already exists in the sessionStorage
  const frBase = sessionStorage.getItem('users');
  const base = JSON.parse(frBase);
  if (base) return true;

  const wsUrl = getConfigurationValue('wsUrlformel') + `users/?DOLAPIKEY=${getUserToken()}`;
  const params = `&sortorder=ASC&limit=100&active=1`;
  const responsefr = await fetch(wsUrl + params);

  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    sessionStorage.setItem('users', JSON.stringify(data));
    return true;
  } else {
    console.log(`loadUsersFromAPI Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'loadUsersFromAPI Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

/**
 * Return the user login
 * @param {} searchedid  : id of the user
 * @returns  {String}
 */
export function getUserLoginFromId(searchedid) {
  const basejson = sessionStorage.getItem('users');
  const base = JSON.parse(basejson);

  const objFound = base.find((o) => o['id'] === searchedid);
  return objFound?.login || null;

  // let foundIndex = Object.keys(base).indexOf(id);
  // let valeur = null;
  // if (foundIndex >= 0) valeur = Object.values(base)[foundIndex].login;

  // return valeur;
}
export function getintakeplaces() { }

export function getmealTypesDirect() { }
export function getmealTypes() { }

// /**
//  *
//  * @returns
//  */
// export async function getintakeplacesTypes() {
//     // TODO : à replacer ddans un service globallists
//     // console.log("intakePlaces Service start");

//     // is intakeplaces already loaded
//     let frBase = sessionStorage.getItem("intakePlaces");
//     let base = JSON.parse(frBase);
//     if (base)
//         return true;

//     var wsUrl = getConfigurationValue("wsUrlformel") + `dklaccueil/dictionary/intakeplaces?DOLAPIKEY=${getUserToken()}`;
//     let params = `&sortorder=ASC&limit=100&active=1`;
//     let responsefr = await fetch(wsUrl + params);

//     if (responsefr.ok) {
//         // *** Get the data and save in the sessionStorage
//         const data = await responsefr.json();
//         sessionStorage.setItem("intakePlaces", JSON.stringify(data));

//         return true;
//         return (data);

//     } else {
//         console.log(`intakePlaces Error : ${JSON.stringify(responsefr)}`);
//         throw new Error("getProdintakePlacesucts Error message : " + responsefr.status + " " + responsefr.statusText);
//     }
// }

// /**
//  *
//  * @returns
//  */
// export async function loadintakeplacesTable() {
//   // *** Check if the table already exists in the sessionStorage
//   const frBase = sessionStorage.getItem('intakeplaces');
//   const base = JSON.parse(frBase);
//   if (base) return true;

//   const wsUrl =
//     getConfigurationValue('wsUrlformel') +
//     `dklaccueil/dictionary/intakeplaces?DOLAPIKEY=${getUserToken()}`;
//   const params = `&active=1`;
//   const responsefr = await fetch(wsUrl + params);

//   if (responsefr.ok) {
//     // *** Get the data and save in the sessionStorage
//     const data = await responsefr.json();
//     sessionStorage.setItem('intakeplaces', JSON.stringify(data));

//     return data;
//   } else {
//     throw new Error(
//       'loadintakeplacesTable Error message : ' + responsefr.status + ' ' + responsefr.statusText
//     );
//   }
// }

// /**
//  *
//  * @returns
//  */
// export async function loadMealsTable() {
//   // *** Check if the table already exists in the sessionStorage
//   const frBase = sessionStorage.getItem('mealtypes');
//   const base = JSON.parse(frBase);
//   if (base) return true;

//   //  console.log("getMealTypesFromAPI Service start");
//   const wsUrl =
//     getConfigurationValue('wsUrlformel') +
//     `dklaccueil/dictionary/mealtypes?DOLAPIKEY=${getUserToken()}`;
//   const params = `&sortorder=ASC&limit=100&active=1`;
//   const responsefr = await fetch(wsUrl + params);

//   if (responsefr.ok) {
//     // *** Get the data and save in the sessionStorage
//     const data = await responsefr.json();
//     sessionStorage.setItem('mealtypes', JSON.stringify(data));

//     // console.log('getMealTypesFromAPI  ok ');
//     return data;
//   } else {
//     console.log(`getMealTypesFromAPI Error : ${JSON.stringify(responsefr)}`);
//     throw new Error(
//       'getMealTypesFromAPI Error message : ' + responsefr.status + ' ' + responsefr.statusText
//     );
//   }
// }

// /**
//  *
//  * @returns
//  */
// export async function TableIncomeLevelsTable() {

//   // *** Check if the table already exists in the sessionStorage
//   const frBase = sessionStorage.getItem('mealtypes');
//   const base = JSON.parse(frBase);
//   if (base) return true;

//   const wsUrl =
//     getConfigurationValue('wsUrlformel') +
//     `dklaccueil/dictionary/incomeleveltypes?sortfield=code&sortorder=ASC&limit=100&active=1&DOLAPIKEY=${getUserToken()}`;
//   let params = `&sortorder=ASC&limit=100&active=1`;
//   let responsefr = await fetch(wsUrl + params);

//   if (responsefr.ok) {
//     // *** Get the data and save in the sessionStorage
//     const data = await responsefr.json();
//     sessionStorage.setItem('intakePlaces', JSON.stringify(data));

//     //  console.log("getIncomeLevelsTypesFromAPI  ok ");
//     return data;
//   } else {
//     console.log(`getIncomeLevelsTypesFromAPI Error : ${JSON.stringify(responsefr)}`);
//     throw new Error(
//       'getIncomeLevelsTypesFromAPI Error message : ' +
//       responsefr.status +
//       ' ' +
//       responsefr.statusText
//     );
//   }
// }

// /**
//  *
//  * @returns
//  */
// export async function loadPublipostageTable() {
//     // TODO : à replacer ddans un service globallistsdictionary/?sortorder=ASC&limit=100&active=1
//     // console.log("getPublipostageTypesFromAPI Service start");
//     var wsUrl = getConfigurationValue("wsUrlformel") + `dklaccueil/dictionary/publipostagetypes?sortfield=code&sortorder=ASC&limit=100&active=1&DOLAPIKEY=${getUserToken()}`;
//     let params = `&sortorder=ASC&limit=100&active=1`;
//     let responsefr = await fetch(wsUrl + params);

//     if (responsefr.ok) {
//         // *** Get the data and save in the sessionStorage
//         const data = await responsefr.json();
//         sessionStorage.setItem("publipostageTypes", JSON.stringify(data));

//         // console.log("getPublipostageTypesFromAPI  ok ");
//         return (data);

//     } else {
//         console.log(`getPublipostageTypesFromAPI Error : ${JSON.stringify(responsefr)}`);
//         throw new Error("getPublipostageTypesFromAPI Error message : " + responsefr.status + " " + responsefr.statusText);
//     }
// }

// getCustomerCivilitiesTable
// setup/dictionary/civilities?sortfield=code&sortorder=ASC&limit=100&active=1

// getCountriesTable
// setup/dictionary/countries?sortfield=label&sortorder=ASC&sqlfilters=(active:=:1)
