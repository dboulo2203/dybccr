// *** shared services
import { getAppPath } from '../../shared/commonServices/commonFunctions.js';
import { headerViewDisplay } from '../../shared/appServices/headerViewCont.js';
import { footerViewDisplay } from '../../shared/appServices/footerViewCont.js';
import { parseMarkdown, loadFileFetch } from '../../shared/commonServices/markdownService.js';
import { displayAlert } from '../../shared/bootstrapServices/components/components.js';


export async function startDocuPageController() {
  try {

    // *** Display menu
    headerViewDisplay('menuSection');
    const test = getAppPath();
    const mdContent = await loadFileFetch(`${getAppPath()}/README.md`);

    let htmldoc = parseMarkdown(mdContent);

    htmldoc = '<div style="margin-top:60px"></div' + htmldoc;
    document.querySelector('#mainActiveSection').innerHTML = htmldoc;

    footerViewDisplay('#footerSection');
  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert(
      'alert-danger',
      error.message || error
    );
  }
}

// var isChrome = window.chrome;
// if (isChrome)
//   output += 'Chrome';
// else
//   output += 'pas Chrome - ';
// if (window.visualViewport.width <= 576) {
//   output += 'phone';
// } else if (window.visualViewport.width <= 768) {
//   output += 'tablet';
// } else if (window.visualViewport.width <= 992) {
//   output += 'laptop';
// } else { // 1200
//   output += 'desktop';
// }
// if (isChrome && window.visualViewport.width <= 576)
//   throw new Error("Warning navigation on mobiles with Chome in portait mode is not optimised. Prefer either chrome in landscape mode or anoter browser");

// document.querySelector("#footerSection").innerHTML = output + " : " + window.visualViewport.width;

