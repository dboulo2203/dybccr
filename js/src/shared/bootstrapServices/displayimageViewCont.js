// const loginContainer = `<div id="modalPlace"></div>`;
const editModaleString = `
<div class="container">
    
    <div class="modal fade" id="myModalLogin" role="dialog" data-bs-backdrop="static" data-bs-keyboard="false" >
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <!-- <button type="button" class="close" data-dismiss="modal">&times;</button> -->
                    <h4 class="modal-title" style="color:#8B2331"></h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="row modal-body" id="modalbodyLogin">
                    <div id="modalmessage"></div>
                 
                    <div class="row">

                     </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" id="myBtnCancel">Close</button>
                 </div>
            </div>
        </div>
    </div>
</div>`;

export function displayimageViewDisplay(htlmPartId, imagePathCurrent) {
  // *** Variable that keeps the modal object
  let editModal = null;
  // document.querySelector("#" + htlmPartId).appendChild(editModaleString);
  document.querySelector('#' + htlmPartId).innerHTML = editModaleString;
  const output = ` <img src = '${imagePathCurrent}' style = "width:100%;cursor:pointer" class="imgsearch"/> `;

  // document.querySelector("#modalmessage").appendChild(output);

  try {
    // *** Display main part of the login page as a child of the maindiv
    const TempDiv = document.createElement('div');
    TempDiv.innerHTML = output;
    document.querySelector('#modalmessage').appendChild(TempDiv);

    // *** Actions
    document.querySelector('#myBtnCancel').onclick = function () {
      console.log('annule clicked');
      editModal.hide();
    };
  } catch (error) {
    document.querySelector('#messageSection').innerHTML =
      `<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert" > ${error}</div > `;
  }

  editModal = new bootstrap.Modal(document.querySelector('#myModalLogin'));
  editModal.show({ backdrop: 'static', keyboard: false });
}
