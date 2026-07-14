/**
 * Get a json string array (yeshe backend format) and convert to an array
 * @param {*} jsonString
 * @returns
 */
export function getArrayFromjson(jsonString) {
  const newArray = [];
  let index = 0;
  let endLoop = false;
  if (jsonString) {
    do {
      if (jsonString[index]) {
        newArray.push(jsonString[index]);
      } else {
        endLoop = true;
      }
      ++index;
    } while (!endLoop);
  }
  return newArray;
}

// /**
//  * NOt used
//  * @param {*} n
//  * @returns
//  */
// const secondsToMidnight = (n) => {
//   return (24 - n.getHours() - 1) * 60 * 60 + (60 - n.getMinutes() - 1) * 60 + (60 - n.getSeconds());
// };

/**
 *
 * @returns Get current app path http://host/app
 */
export function getAppPath() {
  const path = location.pathname;
  const viewsIndex = path.indexOf('/views/');
  if (viewsIndex >= 0) {
    return window.location.origin + path.substring(0, viewsIndex);
  }
  return window.location.origin;
}

// /**
//  *
//  * @returns Get current app path http://host/app
//  * @deprecated
//  */
// export function getAppPathRemote() {
//   let appName = '';
//   const path = location.pathname.split('/');
//   if (path[0] === '') appName = path[1];
//   else appName = path[0];

//   return window.location.protocol + '//' + window.location.hostname + '/';
// }
/**
 * Add an event listened  to  a list of HTML document (by class name)
 * @param {*} elementClass  : the .XXXX class identifier of the element list
 * @param {*} functionOfEvent  = the function used when the event is fired
 */
export function addMultipleEnventListener(elementClass, functionOfEvent) {
  const cbox = document.querySelectorAll(elementClass);
  for (let i = 0; i < cbox.length; i++) {
    cbox[i].addEventListener('click', functionOfEvent);
  }
}

/**
 * Re route the page demending on
 * @param {} link
 * @param {*} withctrl
 */
export function getLinkWithctrl(link, withctrl) {
  if (withctrl) window.open(link, '_blank');
  else window.location.href = link;
}

// /**
//  * Retunrs a link to a class of entity
//  * @param {*} buttonType
//  * @param {*} entityName
//  * @param {*} searId
//  * @param {*} withUnderline allow to display an underline
//  * @returns
//  */
// export function getEntityLinkClass(buttonType, entityName, searId, withUnderline = true) {
//   if (!withUnderline === false)
//     return `<span class="text-danger-emphasis ${buttonType}" style="cursor:pointer"  searid="${searId}"
//   onpointerenter="this.setAttribute('style', 'cursor:pointer;color: rgb(159, 158, 158); border-bottom: 0.1em solid  rgb(159, 158, 158)')"
//   onpointerleave="this.setAttribute('style', 'color:text-danger-emphasis')">
//         ${entityName === null ? '' : entityName}
//     </span>`;
//   else
//     return `<span class="text-danger-emphasis ${buttonType}" style="cursor:pointer"  searid="${searId}"
//   onpointerenter="this.setAttribute('style', 'cursor:pointer;color: rgb(159, 158, 158); border-bottom: 0.1em solid  rgb(159, 158, 158)')"
//   onpointerleave="this.setAttribute('style', 'color:text-danger-emphasis')">
//         ${entityName === null ? '' : entityName}
//     </span>`;
// }

// /**
//  * Retunrs a link to an entity
//  * @param { } buttonType
//  * @param {*} entityName
//  * @param {*} withUnderline  allow to display an underline
//  * @returns
//  */
// export function getEntityLink(buttonType, entityName, withUnderline = true) {
//   if (!withUnderline === false)
//     return `<span class="text-danger-emphasis" style="cursor: pointer"
//     id="${buttonType}" onpointerenter="this.setAttribute('style', 'cursor: pointer;color: rgb(159, 158, 158); border-bottom: 0.1em solid rgb(159, 158, 158)')"
//     onpointerleave="this.setAttribute('style', 'color: text-danger-emphasis;')">
//         ${entityName === null ? '' : entityName}
//     </span>`;
//   else
//     return `<span class="text-danger-emphasis" style="cursor: pointer"
//     id="${buttonType}" onpointerenter="this.setAttribute(color:rgb(159, 158, 158); border-bottom: 0.1em solid rgb(159, 158, 158);cursor: pointer')"
//      onpointerleave="this.setAttribute('style', 'color: text-danger-emphasis;'))">
//         ${entityName === null ? '' : entityName}
//     </span>`;
// }

// /**
//  * Retunrs a link to a class of entity
//  * @param {*} buttonType
//  * @param {*} entityName
//  * @param {*} searId
//  * @param {*} withUnderline allow to display an underline
//  * @returns
//  */
// export function getEntityLinkClassV1(buttonType, entityName, searId, withUnderline = true) {
//   if (!withUnderline === false)
//     return `<span style="cursor:pointer; border-bottom: 0.1em solid #dddbdbff" class="${buttonType}" searid="${searId}"
//   onpointerenter="this.setAttribute('style', 'cursor:pointer;color: #8B2331;border-bottom: 0.1em solid #8B2331')"
//   onpointerleave="this.setAttribute('style', 'color: bs-body-color;border-bottom: 0.1em solid #dddbdbff')">
//         ${entityName === null ? '' : entityName}
//     </span>`;
//   else
//     return `<span style="cursor:pointer" class="${buttonType}" searid="${searId}"
//   onpointerenter="this.setAttribute('style', 'cursor:pointer;color: #8B2331;border-bottom: 0.1em solid #8B2331')"
//   onpointerleave="this.setAttribute('style', 'color: bs-body-color')">
//         ${entityName === null ? '' : entityName}
//     </span>`;
// }
// /**
//  * Retunrs a link to an entity
//  * @param { } buttonType
//  * @param {*} entityName
//  * @param {*} withUnderline  allow to display an underline
//  * @returns
//  */
// export function getEntityLinkV1(buttonType, entityName, withUnderline = true) {
//   if (!withUnderline === false)
//     return `<span style="cursor: pointer; border-bottom: 0.1em solid #dddbdbff"
//     id="${buttonType}" onpointerenter="this.setAttribute('style', 'color: #8B2331;border-bottom: 0.1em solid #8B2331;cursor:pointer')"
//     onpointerleave="this.setAttribute('style', 'color: bs-body-color;border-bottom: 0.1em solid #dddbdbff')">
//         ${entityName === null ? '' : entityName}
//     </span>`;
//   else
//     return `<span style="cursor: pointer"
//     id="${buttonType}" onpointerenter="this.setAttribute('style', 'color: #8B2331;cursor:pointer')" onpointerleave="this.setAttribute('style', 'color: bs-body-color')">
//         ${entityName === null ? '' : entityName}
//     </span>`;
// }

export function encodeHTML(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

/**
 * Find tibetan characters in a string and enclose the string in a <span>
 * @param {} text
 * @returns
 */
export function findTibetanChars(text) {
  const tibetanRegex = /[\u0F00-\u0FFF]+/g;
  // const output = '';
  if (typeof text !== 'string') {
    throw new TypeError('Input must be a string');
  }
  const matches = text.match(tibetanRegex);

  if (Array.isArray(matches)) {
    matches.forEach((matche) => {
      text = text.replace(matche, "<span class='tibetanChars'>" + matche + '</span>');
    });
  } else {
    text = text.replace(matches, "<span class='tibetanChars'>" + matches + '</span>');
  }
  return text; // Return empty array if no matches
}

/**
 * Return the string of the date
 * @param {*} thisDate : Dolibarr date
 * @param {*} withHour : true if HH:MM must be generated
 * @returns String
 */
export function getFormattedDate(thisDate, withHour = true) {
  if (withHour)
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(thisDate * 1000);
  else
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(thisDate * 1000);
}


/**
 * Return the string of the date
 * @param {*} thisDate : Dolibarr date
 * @param {*} withHour : true if HH:MM must be generated
 * @returns String
 */
export function getFormattedDateISO(dateParam) {
  // const tabParam = [];
  // let tabParam = dateParam.split('-');
  return dateParam.split("-").reverse().join("-");
}
/**
 * Convert a unix timestamp (seconds) to a date string yyyy-mm-dd for input[type=date]
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Date string in yyyy-mm-dd format
 */
function timestampToDateInput(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
}

/**
 * Return the string of the date
 * @param {*} thisDate : Dolibarr date
 * @param {*} withHour : true if HH:MM must be generated
 * @returns String
 */
/**
 * Convert a Dolibarr Unix timestamp (seconds) to a YYYY-MM-DD string in local timezone
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string}
 */
export function dolibarrTimestampToDateInput(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getFormattedDateISOV2(thisDate) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(thisDate * 1000);
}
/**
 * Return the string of the currency
 * @param {*} value
 * @returns String
 */
export function getFormattedCurrency(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(parseFloat(value));
}

/**
 * Return the string of the currency
 * @param {*} value
 * @returns String
 */
export function getFormattednumber(value) {
  return new Intl.NumberFormat('en-EN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(parseFloat(value));
}
