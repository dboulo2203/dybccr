import { getConfigurationValue } from '../../commonServices/configurationService.js';

const editModaleString = `
<div class="container">
    
    <div class="modal fade" id="myModalLogin" role="dialog" data-bs-backdrop="static" data-bs-keyboard="false" >
        <div class="modal-dialog modal-xl">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <!-- <button type="button" class="close" data-dismiss="modal">&times;</button> -->
                    <h4 class="modal-title" style="color:#8B2331"></h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="row modal-body" id="modalbodyLOgin">
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

/**
 *
 * @param {*} htlmPartId
 * @param {*} multt_id
 * @param {*} mult_file
 */
export function displayMultimediaModalView(htlmPartId, multt_type, mult_file) {
  // *** Variable that keeps the modal object
  let editModal = null;
  document.querySelector('#' + htlmPartId).innerHTML = editModaleString;
  let output = ` `;

  // document.querySelector("#modalmessage").appendChild(output);

  switch (multt_type) {
    case 'video/mp4':
      output += `<video width="500"  controls controlsList="nodownload" disable-right-click>
                <source src="${mult_file}" type='video/mp4'>              
                Your browser does not support the video tag.
            </video>`;
      break;
    case 'audio/mp3':
      output += ` <audio  controls controlsList="nodownload">
                <source src="${mult_file}" type='audio/mp3'>               
                Your browser does not support the audio tag.
            </audio> `;
      break;
    case 'application/pdf':
      output += `<object type="application/pdf"
                    data="${mult_file}#toolbar=0&navpanes=0&scrollbar=0"
                    width="100%" height="500" style="height: 85vh;" >No Support</object> `;
      break;
    case 'image':
      output += `<img src="${mult_file}" style='width:100%'>`;
      break;
    case 'pdf/file':
      output += `<embed
        src="data:application/pdf;base64,${mult_file}"
        id="displayFile"
        alt="your image"
        width="100%"
        height="500"
        style="height: 85vh;"
        type="application/pdf"
      />`;
      break;
    default:
      output += `Multimedia type non reconnu`;
  }

  try {
    // *** Display main part of the login page as a child of the maindiv
    const TempDiv = document.createElement('div');
    TempDiv.innerHTML = output;
    document.querySelector('#modalmessage').appendChild(TempDiv);

    // *** Actions
    document.querySelector('#myBtnCancel').onclick = function () {
      editModal.hide();
    };
  } catch (error) {
    document.querySelector('#messageSection').innerHTML =
      `< div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert"> ${error}</div > `;
  }

  editModal = new bootstrap.Modal(document.querySelector('#myModalLogin'));
  editModal.show({ backdrop: 'static', keyboard: false });
}
