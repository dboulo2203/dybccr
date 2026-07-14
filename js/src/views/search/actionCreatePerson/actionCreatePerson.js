import { getEditField, getEditFieldDate, displayAlert } from '../../../shared/bootstrapServices/components/components.js';
import { getSelectFromDatabaseList } from '../../../shared/appWSServices/dolibarrListsServices.js';
import { createNewCustomer, getcustomerSearch } from '../../../shared/appWSServices/dolibarrCustomerServices.js';
import { getAppPath } from '../../../shared/commonServices/commonFunctions.js';

/**
 * Display the create person modal
 * @param {Function} onSaveCallback - Called after successful creation
 */
export async function displayActionCreatePerson(onSaveCallback) {

  const modalId = 'createPersonModal-' + Math.random().toString(36).substring(2, 9);
  const civilityOptions = getSelectFromDatabaseList('typecivilities', 'rowid', 'label', '');

  const modalHtml = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title fs-5 text-danger-emphasis">
              <i class="bi bi-person-plus me-2"></i>Créer un adhérent
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
              ${getEditField('Nom *', `${modalId}-name`, '', 'Saisir nom prénom, séparés par un espace. Remplacer tout autre espace par un -')}
              ${getEditField('Email *', `${modalId}-email`, '')}
              ${getEditField('Téléphone', `${modalId}-phone`, '')}
              ${getEditFieldDate('Date de naissance', `${modalId}-birthday`, '')}
              ${getEditField('Adresse', `${modalId}-address`, '')}
              ${getEditField('Code postal', `${modalId}-zip`, '')}
              ${getEditField('Ville', `${modalId}-town`, '')}
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="${modalId}-cancel">Annuler</button>
            <button type="button" class="btn btn-primary" id="${modalId}-save">
              <i class="bi bi-floppy me-1"></i>Créer
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

    // Validate name format: exactly one space between two non-space sequences
    const nameInput = document.getElementById(`${modalId}-name`);
    nameInput.addEventListener('input', () => {
      const v = nameInput.value;
      const valid = v.length === 0 || /^\S+ \S+$/.test(v);
      nameInput.classList.toggle('is-invalid', !valid);
    });

    // Validate email format
    const emailInput = document.getElementById(`${modalId}-email`);
    emailInput.addEventListener('input', () => {
      const v = emailInput.value;
      const valid = v.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      emailInput.classList.toggle('is-invalid', !valid);
    });

    document.getElementById(`${modalId}-save`).addEventListener('click', async () => {
      try {
        const name = document.getElementById(`${modalId}-name`).value.trim();
        const email = document.getElementById(`${modalId}-email`).value.trim();
        const civility = document.getElementById(`${modalId}-civility`).value;
        const phone = document.getElementById(`${modalId}-phone`).value.trim();
        const address = document.getElementById(`${modalId}-address`).value.trim();
        const zip = document.getElementById(`${modalId}-zip`).value.trim();
        const town = document.getElementById(`${modalId}-town`).value.trim();
        const birthdayValue = document.getElementById(`${modalId}-birthday`).value;
        const birthday = birthdayValue ? Math.floor(new Date(birthdayValue).getTime() / 1000) : '';

        if (!name) throw new Error('Le nom est obligatoire');
        if (!/^\S+ \S+$/.test(name)) throw new Error('Le nom doit contenir un prénom et un nom séparés par un espace');
        if (!email) throw new Error("L'email est obligatoire");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("L'email n'est pas valide");

        const existing = await getcustomerSearch(email, 'email');
        if (existing.length > 0) throw new Error(`L'email ${email} est déjà utilisé par un adhérent existant`);

        const newId = await createNewCustomer(name, civility, birthday, email, phone, address, zip, town);
        cleanup(true);
        globalThis.location.href = `${getAppPath()}/views/person?paramid=${Number(newId)}`;

      } catch (error) {
        document.getElementById(`${modalId}-alert`).innerHTML = displayAlert('alert-danger', error.message || error);
      }
    });

    modal.show();
  });
}
