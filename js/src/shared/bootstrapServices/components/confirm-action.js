/**
 * confirmAction - Confirmation dialog component
 * Displays a Bootstrap modal asking the user to confirm or cancel an action.
 * Returns a Promise that resolves to true (confirmed) or false (cancelled).
 *
 * Usage:
 *   import { confirmAction } from '../shared/bootstrapServices/components/confirm-action.js';
 *
 *   // Basic usage
 *   const confirmed = await confirmAction('Voulez-vous supprimer cet enregistrement ?');
 *   if (confirmed) { ... }
 *
 *   // With custom title
 *   const confirmed = await confirmAction('Cette action est irréversible.', 'Suppression');
 *
 *   // With all options
 *   const confirmed = await confirmAction('Confirmer la validation ?', 'Validation', {
 *       confirmLabel: 'Valider',
 *       cancelLabel: 'Annuler',
 *       confirmClass: 'btn-success',
 *       icon: 'bi-check-circle'
 *   });
 *
 * @param {string} message - The confirmation message to display
 * @param {string} [title='Confirmation'] - The modal title
 * @param {Object} [options] - Optional configuration
 * @param {string} [options.confirmLabel='Confirmer'] - Label for the confirm button
 * @param {string} [options.cancelLabel='Annuler'] - Label for the cancel button
 * @param {string} [options.confirmClass='btn-danger'] - Bootstrap class for the confirm button
 * @param {string} [options.icon='bi-exclamation-triangle'] - Bootstrap icon class for the title
 * @returns {Promise<boolean>} true if confirmed, false if cancelled
 */
export function confirmAction(message, title = 'Confirmation', options = {}) {
  const {
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    confirmClass = 'btn-secondary',
    icon = 'bi-exclamation-triangle',
  } = options;

  const modalId = 'confirmActionModal-' + Math.random().toString(36).substr(2, 9);

  const modalHtml = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title fs-5 text-danger-emphasis">
              <i class="bi ${icon} me-2"></i>${title}
            </span>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">${message}</p>
          </div>
          <div class="modal-footer">
            <!-- <button type="button" class="btn btn-secondary" id="${modalId}-cancel" data-bs-dismiss="modal">${cancelLabel}</button>
            -->
            <button type="button" class="btn ${confirmClass}" id="${modalId}-confirm">${confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>`;

  return new Promise((resolve) => {
    // Insert modal into DOM
    const container = document.createElement('div');
    container.innerHTML = modalHtml;
    document.body.appendChild(container);

    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);

    const cleanup = () => {
      modal.hide();
      modalElement.addEventListener(
        'hidden.bs.modal',
        () => {
          container.remove();
        },
        { once: true }
      );
    };

    // Confirm button
    document.getElementById(`${modalId}-confirm`).addEventListener('click', () => {
      cleanup();
      resolve(true);
    });

    // Cancel button or close via X / backdrop
    // document.getElementById(`${modalId}-cancel`).addEventListener('click', () => {
    //   cleanup();
    //   resolve(false);
    // });

    modalElement.querySelector('.btn-close').addEventListener('click', () => {
      cleanup();
      resolve(false);
    });

    modal.show();
  });
}
