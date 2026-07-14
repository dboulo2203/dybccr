// *** Shared ressources
import { getConfigurationValue } from '../commonServices/configurationService.js';
// import { getTranslation } from '../commonServices/translationService.js';

import { leftMenuViewDisplay } from './leftMenuViewCont.js';

// TODO : Manage callback
export function headerViewDisplay(htlmPartId) {
  const menuString = `
      <div id="menuPart">
          <nav class="navbar fixed-top bg-body-tertiary" style="border-bottom:solid 0.1rem #C0C0C0; padding:5px">
              <div class="container-fluid">
                  <div class="navbar-brand text-danger-emphasis"  id="mainNav">${getConfigurationValue('BrandTitle')}</div>
                  <div class="d-flex">
                  <a class="btn" style="margin-left:3px;cursor:pointer"  data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample"><i class="bi bi-three-dots-vertical"></i></a >
  
                  </div>
              </div>
          </nav>
        </div>
      <div id="leftMenu">
      </div>
 `;

    // <div id="menuPart">
    //     <nav class="navbar fixed-top bg-body-tertiary" style="border-bottom:solid 0.1rem #C0C0C0; padding:5px">
    //         <div class="container-fluid">
    //             <div class="navbar-brand text-danger-emphasis"  id="mainNav">${getConfigurationValue('BrandTitle')}</div>
    //             <div class="d-flex">
    //             <a class="btn" style="margin-left:3px;cursor:pointer"  data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample"><i class="bi bi-three-dots-vertical"></i></a >

    //             </div>
    //         </div>
    //     </nav>
    //   </div>
    // <div id="leftMenu">
    // </div>
  // *** Display the navbar
  document.querySelector("#"+ htlmPartId).innerHTML = menuString;

  // *** Add the off canvas menu
  leftMenuViewDisplay('leftMenu');
}
