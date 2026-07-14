import { getAppPath } from '../commonServices/commonFunctions.js';
import { toogleTheme } from '../bootstrapServices/bootstrapTheme.js';
import { loginViewDisplay } from './loginViewCont.js';
import { getConfigurationValue } from '../commonServices/configurationService.js';
//***
// catalog
//  -> categories
//  -> categoriyContent
//
// basket
//
//  */
// *** Menu string
const leftmenuString = ` 
    <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
       <div class="offcanvas-header">
            <h5 class="offcanvas-title text-danger-emphasis" id="offcanvasExampleLabel" >Zopa V3 JS</h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div> 
        <div class="offcanvas-body">
            <!--     <div>
                    Présentation du menu principal de l'application        
                </div>-->
            <hr/>
           <div id="menuplace"/>
           </div>
    </div>
 `;

// $(function () {
// TODO : Manage callback
// Registre des actions du menu : associe chaque menuItemid à sa fonction
const menuActions = {
  login: () => loginViewDisplay(),
  theme: () => toogleTheme(),
};

export function leftMenuViewDisplay(htlmPartId) {
  // *** Display left menu
  document.querySelector('#' + htlmPartId).innerHTML = leftmenuString;

  const configMenu = getConfigurationValue('leftMenu');
  let output = '';
  configMenu.map((menuItem) => {
    // *** Display menu item
    switch (menuItem.menuItemType) {
      case 'menuitem':
        output += `<div  style="margin-bottom:10px;cursor:pointer" ><span id="${menuItem.menuItemid}" class="fs-6"> ${menuItem.menuItemIcon} ${menuItem.menuItemName} </span></div>`;

        break;
      case 'hr':
        output += '<hr/>';
    }
  });

  document.querySelector('#menuplace').innerHTML = output;

  // configMenu = getConfigurationValue("leftMenu");
  output = '';
  configMenu.map((menuItem) => {
    // *** Display menu item define menu action
    switch (menuItem.menuItemAction) {
      case 'functionCall':
        output += `<div id="${menuItem.menuItemid}" style="margin-bottom:10px;cursor:pointer" ><span class="fs-6"> ${menuItem.menuItemIcon} ${menuItem.menuItemName} </span></div>`;
        document.querySelector(`#${menuItem.menuItemid}`).onclick = function () {
          const action = menuActions[menuItem.menuItemid];
          if (action) {
            action();
          }
        };

        break;
      case 'urlCall':
        document.querySelector(`#${menuItem.menuItemid}`).onclick = function () {
          window.location.href = `${getAppPath()}/${menuItem.menuItemLink}`;
        };

        break;
    }
  });
}
