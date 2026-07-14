import { confirmAction } from '../../../shared/bootstrapServices/components/confirm-action.js';
import { displayAlert } from '../../../shared/bootstrapServices/components/components.js';
import { cancelInvoice } from '../../../shared/appWSServices/dolibarrInvoicesServices.js';

/**
 * Ask confirmation then abandon the invoice
 * @param {object} invoice
 * @param {Function} onSaveCallback
 */
export async function displayActionAbandonInvoice(invoice, onSaveCallback) {
  try {
    const confirmed = await confirmAction(
      `Abandonner la facture ${invoice['ref']} ?`,
      'Abandonner la facture',
      { confirmLabel: 'Abandonner', confirmClass: 'btn-danger' }
    );
    if (!confirmed) return;

    await cancelInvoice(invoice);
    if (onSaveCallback) await onSaveCallback();
  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert('alert-danger', error.message || error);
  }
}
