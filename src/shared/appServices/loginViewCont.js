import {
  getLoggedUserPseudo,
  getLogin,
  isCurrentUSerLogged,
  logout,
} from '../appWSServices/dolibarrLoginServices.js';
import { displayAlert } from '../bootstrapServices/components/components.js';
import { getAppPath } from '../commonServices/commonFunctions.js';

const editModaleString = `
<div class="container">
    <div class="modal fade" id="myModalLogin" role="dialog" data-bs-backdrop="static"
            data-bs-keyboard="false" >
        <div class="modal-dialog">

            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <!-- <button type="button" class="close" data-dismiss="modal">&times;</button> -->
                    <h5 class="modal-title text-danger-emphasis" >Login</h5>
                           <button type="button" id="myBtnCancel" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>

                </div>
                <div class="row modal-body" id="modalbodyLogin">
                    <p>Some text in the modal.</p>

                </div>
                <div class="modal-footer" id="modalfooter">
                     <button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogin">Valider</button>
                </div>
            </div>

        </div>
    </div>
</div>`;

// TODO : Manage callback
export async function loginViewDisplay() {
  // *** Variable that keeps the modal object
  // let editModal = null;

  try {
    // *** Display main part of the page
    const container = document.createElement('div');
    container.innerHTML = editModaleString;
    document.body.appendChild(container);

    if (isCurrentUSerLogged()) {
      document.querySelector('#modalbodyLogin').innerHTML = `
        <div id="modalmessage"></div>
        <div class="row" id="loggout">
        Vous êtes authenfifié avec le login ${getLoggedUserPseudo()}. 
             </div>
        </div>
            `;
      document.querySelector('#modalfooter').innerHTML =
        `<button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogout">Logout</button>`;

      document.querySelector('#btnLogout').onclick = async function () {
        logout();
        window.location.href = `${getAppPath()}/views/search/`;
      };
    } else {
      document.querySelector('#modalbodyLogin').innerHTML = `
        <div id="modalmessage"></div>
        <div class="row">
            <label for="userEmailInput" class="form-label col-2">Nom </label>
            <div class="col" style="margin:2px">
                <input type="text" class="form-control  col-sm-10 " name="userEmailInput" id="userEmailInput" placeholder=""
                    value=""/> 
            </div>
        </div>
        <div class="row">
            <label for="userPasswordInput" class="form-label col-2">Password </label>
            <div class="col" style="margin:2px">
                <input type="password" class="form-control  col-sm-10 " name="userPasswordInput" id="userPasswordInput" placeholder=""
                    value=""/>
            </div>
        </div>
            `;
      document.querySelector('#modalfooter').innerHTML =
        `<button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogin">Login</button>`;

      $('#modalbodyLogin').on('keydown', async function (event) {
        if (event.keyCode === 13) {
          const userEmail = document.querySelector('#userEmailInput').value;
          const userPassword = document.querySelector('#userPasswordInput').value;

          // try {
          const retour = await getLogin(userEmail, userPassword);

          if (!retour)
            document.querySelector('#modalmessage').innerHTML =
              `<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert">Nom, password invalides</div> `;
          else
            document.querySelector('#modalmessage').innerHTML =
              `<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert">Bienvenue ${retour.user_pseudo}</div> `;
        }
      });

      document.querySelector('#btnLogin').onclick = async function () {
        const userEmail = document.querySelector('#userEmailInput').value;
        const userPassword = document.querySelector('#userPasswordInput').value;

        const retour = await getLogin(userEmail, userPassword);

        if (!retour)
          document.querySelector('#modalmessage').innerHTML =
            `<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert" >Nom, password invalides</div> `;
        else window.location.href = `${getAppPath()}/views/search`;
      };
    }
    // *** Actions
    document.querySelector('#myBtnCancel').onclick = function () {
      window.location.href = `${getAppPath()}/views/mainpage`;
    };

    // *** Display modal
    const loginModal = new bootstrap.Modal(document.querySelector('#myModalLogin'));
    loginModal.show();
  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert('danger', error);
  }
}
