import { getConfigurationValue } from '../../commonServices/configurationService.js';

/**
 *
 * @param {*} blocName
 * @param {*} blocIcon
 * @returns
 */
export function getPageTitleDisplay(blocName, blocIcon) {
  let iconString;
  if (!blocIcon || (blocIcon && blocIcon.length === 0)) iconString = ``;
  else iconString = `<i class="bi ${blocIcon}"></i>`;

  return `        
            <div class="d-flex  justify-content-between" style="margin-top:0px" >
                <span class="fs-4 text-danger-emphasis"  >${iconString} ${blocName}</span>
            </div>
            <hr style="margin-block-start:0.3rem;margin-block-end:0.3rem;margin-top:0px" />
                `;
}

/**
 * Bloc header with configurable dropdown menu
 * @param {string} blocLabel - label displayed in the header
 * @param {string} blocIcon - HTML string for the icon (ex: `<i class="bi bi-person"></i>`)
 * @param {Array} menuItems - array of menu items: [{id, label, icon}]
 *   - id: identifier used to attach event listeners
 *   - label: text displayed in the menu
 *   - icon: (optional) bootstrap icon class (ex: "bi-pencil")
 * @returns {string} HTML string
 *
 * Usage:
 *   let menuItems = [
 *       { id: "editBtn", label: "Modifier", icon: "bi-pencil" },
 *       { id: "deleteBtn", label: "Supprimer", icon: "bi-trash" }
 *   ];
 *   let header = getBlocHeaderWithMenu("Mon bloc", `<i class="bi bi-person"></i>`, menuItems);
 */
export function getBlocHeaderWithMenu(blocLabel, blocIcon = '', menuItems = []) {
  let menuHtml = '';
  if (menuItems.length > 0) {
    const menuItemsHtml = menuItems
      .map((item) => {
        if (item.active) {
          const iconHtml = item.icon ? `<i class="bi ${item.icon}"></i> ` : '';
          return `<li><a class="dropdown-item" href="#" id="${item.id}">${iconHtml}${item.label}</a></li>`;
        }
      })
      .join('');

    menuHtml = `
                    <div class="dropdown">
                        <a href="#" data-bs-toggle="dropdown" aria-expanded="false" class="text-secondary"><i class="bi bi-three-dots-vertical"></i></a>
                        <ul class="dropdown-menu" style="padding:10px">
                            ${menuItemsHtml}
                        </ul>
                    </div>`;
  }

  return `
        <div class="card-title block-title">
            <div class="d-flex justify-content-between">
                <span class="fs-5 text-danger-emphasis block-label text-nowrap" >${blocIcon} ${blocLabel}</span>
                <div class="col-8 flex float-right text-end bloc-menu" style="cursor: pointer">
                    ${menuHtml}
                </div>
            </div>
            <hr style="margin-block-start:0.3rem;margin-block-end:0.3rem;margin-top:0px" />
        </div>`;
}

/**
 * Standalone dropdown menu with three-dots-vertical icon
 * @param {Array} menuItems - array of menu items: [{id, label, icon, active}]
 * @returns {string} HTML string
 */
export function getStandaloneMenu(menuItems = []) {
  const menuItemsHtml = menuItems
    .map((item) => {
      if (item.active) {
        const iconHtml = item.icon ? `<i class="bi ${item.icon}"></i> ` : '';
        return `<li><a class="dropdown-item" href="#" id="${item.id}">${iconHtml}${item.label}</a></li>`;
      }
    })
    .join('');

  return `
    <div class="dropdown d-inline-block">
        <a href="#" data-bs-toggle="dropdown" aria-expanded="false" class="text-secondary"><i class="bi bi-three-dots-vertical"></i></a>
        <ul class="dropdown-menu" style="padding:10px">
            ${menuItemsHtml}
        </ul>
    </div>`;
}

/**
 *
 * @param {*} fieldName
 * @param {*} fieldValue
 */
export function getStandardFieldDisplay(fieldName, fieldValue) {
  if (fieldValue !== null && fieldValue !== '')
    return `<div class=""  > <span class="fw-light" >${fieldName}</span> : ${fieldValue}</div>`;
  else return `<div class="" > <span class="fw-light" >${fieldName}</span> : </div > `;
}
//
/**
 *
 * @param {*} fieldName : the name of the field
 * @param {*} fieldValue : the content of the field
 * @param {*} fieldlink : the link we use
 * @param {*} entityid : the link to ...
 * @param {any}  forClass : true if we must tag the class otherwise we tag the id
 * @returns
 */
export function getStandardFieldDisplayWithLink(
  fieldName,
  fieldValue,
  fieldlink,
  entityid,
  forClass = false
) {
  const displayValue = fieldValue === null ? '' : fieldValue;
  let linkSpan = '';
  if (forClass)
    linkSpan = `<span class="text-danger-emphasis ${fieldlink}" style="cursor: pointer" entityid="${entityid}" id="${fieldlink}" onpointerenter="this.setAttribute('style', 'cursor: pointer;color: rgb(159, 158, 158); border-bottom: 0.1em solid rgb(159, 158, 158)')" onpointerleave="this.setAttribute('style', 'color: text-danger-emphasis;')">${displayValue}</span>`;
  else
    linkSpan = `<span class="text-danger-emphasis" style="cursor: pointer" entityid="${entityid}" id="${fieldlink}" onpointerenter="this.setAttribute('style', 'cursor: pointer;color: rgb(159, 158, 158); border-bottom: 0.1em solid rgb(159, 158, 158)')" onpointerleave="this.setAttribute('style', 'color: text-danger-emphasis;')">${displayValue}</span>`;
  if (fieldName !== '')
    return `<div class=""><span class="fw-light" style="cursor:pointer">${fieldName}</span> : ${linkSpan}</div>`;
  else return `<div class="">${linkSpan}</div>`;
}

/**
 *
 * @param {*} fieldName
 * @param {*} fieldid
 * @param {*} fieldvalue
 * @param {*} fieldMessage
 * @param {*} fieldPlaceHolder
 * @returns
 */
export function getEditField(
  fieldName,
  fieldid,
  fieldvalue,
  fieldMessage = '',
  fieldPlaceHolder = ''
) {
  return `<div class="form-group row ">
            <label class="fw-light col-sm-2 " for="${fieldid}">${fieldName}</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="${fieldid}" aria-describedby="emailHelp" id="${fieldid}" 
                placeholder="${fieldPlaceHolder}" value="${fieldvalue}" >
                    <small id="emailHelp" class="form-text text-muted">${fieldMessage}</small>
            </div>
          </div>`;
}

/**
 *
 * @param {*} fieldName
 * @param {*} fieldid
 * @param {*} fieldvalue
 * @param {*} fieldMessage
 * @param {*} fieldPlaceHolder
 * @returns
 */
export function getEditFieldDate(
  fieldName,
  fieldid,
  fieldvalue,
  fieldMessage = '',
  fieldPlaceHolder = ''
) {
  return `<div class="form-group row">
        <label class="fw-light col-sm-2" for="${fieldid}">${fieldName}</label>
        <div class="col-sm-10">
            <input type="Date" class="form-control" id="${fieldid}" aria-describedby="emailHelp" value="${fieldvalue}" placeholder="${fieldPlaceHolder}">
                <small id="emailHelp" class="form-text text-muted">${fieldMessage}</small>
        </div>
    </div>`;
}

/**
 *
 * @param {*} fieldName
 * @param {*} fieldid
 * @param {*} fieldvalue
 * @param {*} fieldMessage
 * @param {*} fieldPlaceHolder
 * @returns
 */
export function getEditFieldnumber(
  fieldName,
  fieldid,
  fieldvalue,
  fieldMessage = '',
  fieldPlaceHolder = ''
) {
  return `<div class="form-group row">
        <label class="fw-light col-sm-2" for="${fieldid}">${fieldName}</label>
        <div class="col-sm-10">
            <input type="number" class="form-control" id="${fieldid}" aria-describedby="emailHelp"
              placeholder="${fieldPlaceHolder}" value="${fieldvalue}">
                <small id="emailHelp" class="form-text text-muted">${fieldMessage}</small>
        </div>
    </div>`;
}

/**
 * Show/hide the loading indicator
 * @param {*} show
 */
export function showLoading(show, title) {
  const loader = document.getElementById('loadingSection');
  if (show)
    loader.innerHTML = `
         <nav class="navbar fixed-top bg-body-tertiary" style="border-bottom:solid 0.1rem #C0C0C0; padding:5px">
              <div class="container-fluid">
                  <div class="navbar-brand text-danger-emphasis"  id="mainNav">Dhagpo - Zopa</div>
                  <div class="d-flex">
                  <a class="btn" style="margin-left:3px;cursor:pointer"  data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample"><i class="bi bi-three-dots-vertical"></i></a >
  
                  </div>
              </div>
          </nav>
  <div class="alert alert-light" role="alert" style="margin-top:60px" id="loadingIndicator">
  <div class=" d-flex align-items-center gap-2 my-3">
    <div class=" spinner-border spinner-border-sm text-secondary" role="status"></div>
    <span>${title} - Chargement des données...</span>
  </div>
</div>`;
  else loader.innerHTML = ``;
}

export function displayAlert(alertType, message) {
  return `<div class="alert ${alertType} alert-dismissible fade show" style="margin-top:60px" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
}
