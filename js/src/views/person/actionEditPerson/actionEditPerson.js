import { getEditField, getEditFieldDate, displayAlert } from '../../../shared/bootstrapServices/components/components.js';
import { dolibarrTimestampToDateInput } from '../../../shared/commonServices/commonFunctions.js';
import { putCustomerUpdate } from '../../../shared/appWSServices/dolibarrCustomerServices.js';
import { getSelectFromDatabaseList } from '../../../shared/appWSServices/dolibarrListsServices.js';

/**
 * Display the edit person modal
 * @param {object} customer - The customer data object (Dolibarr thirdparty)
 * @param {Function} onSaveCallback - Called after successful save to refresh the view
 */
export async function displayActionEditPerson(customer, onSaveCallback) {

  const modalId = 'editPersonModal-' + Math.random().toString(36).substring(2, 9);
  const currentCivility = customer['array_options']?.['options_thi_civility'] ?? '';

  const civilityOptions = getSelectFromDatabaseList('typecivilities', 'rowid', 'label', currentCivility);

  const modalHtml = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title fs-5 text-danger-emphasis">
              <i class="bi bi-pencil me-2"></i>Modifier adhérent
            </span>
            <button type="button" class="btn-close" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="${modalId}-alert"></div>
            <form>
              <div class="form-group row mb-2">
                <label class="fw-light col-sm-2">Civilité</label>
                <div class="col-sm-10">
                  <select class="form-select" id="${modalId}-civility">
                    ${civilityOptions}
                  </select>
                </div>
              </div>
              ${getEditField('Nom', `${modalId}-name`, customer['name'] ?? '')}
              <div class="form-group row mb-2">
                <label class="fw-light col-sm-2">Email</label>
                <div class="col-sm-10">
                  <input type="text" class="form-control" value="${customer['email'] ?? ''}" disabled>
                </div>
              </div>
              ${getEditField('Téléphone', `${modalId}-phone`, customer['phone'] ?? '')}
              ${getEditField('Adresse', `${modalId}-address`, customer['address'] ?? '')}
              ${getEditField('Code postal', `${modalId}-zip`, customer['zip'] ?? '')}
              ${getEditField('Ville', `${modalId}-town`, customer['town'] ?? '')}
              ${getEditFieldDate('Date de naissance', `${modalId}-birthday`, dolibarrTimestampToDateInput(customer['array_options']?.['options_thi_birthday']))}
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="${modalId}-cancel">Annuler</button>
            <button type="button" class="btn btn-primary" id="${modalId}-save">
              <i class="bi bi-floppy me-1"></i>Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>`;

  return new Promise((resolve) => {
    const container = document.createElement('div');
    container.innerHTML = modalHtml;
    document.body.appendChild(container);

    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);

    const cleanup = (result) => {
      modal.hide();
      modalElement.addEventListener('hidden.bs.modal', () => container.remove(), { once: true });
      resolve(result);
    };

    modalElement.querySelector('.btn-close').addEventListener('click', () => cleanup(false));
    document.getElementById(`${modalId}-cancel`).addEventListener('click', () => cleanup(false));

    document.getElementById(`${modalId}-save`).addEventListener('click', async () => {
      try {
        const updatedData = {
          name: document.getElementById(`${modalId}-name`).value,
          phone: document.getElementById(`${modalId}-phone`).value,
          address: document.getElementById(`${modalId}-address`).value,
          zip: document.getElementById(`${modalId}-zip`).value,
          town: document.getElementById(`${modalId}-town`).value,
          civility: document.getElementById(`${modalId}-civility`).value,
          birthday: document.getElementById(`${modalId}-birthday`).value ? Math.floor(new Date(document.getElementById(`${modalId}-birthday`).value).getTime() / 1000) : '',
        };

        await putCustomerUpdate(customer, updatedData);
        cleanup(true);
        if (onSaveCallback) await onSaveCallback();

      } catch (error) {
        document.getElementById(`${modalId}-alert`).innerHTML = displayAlert('alert-danger', error.message || error);
      }
    });

    modal.show();
  });
}
