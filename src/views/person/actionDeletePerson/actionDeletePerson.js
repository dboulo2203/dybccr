import { confirmAction } from '../../../shared/bootstrapServices/components/confirm-action.js';
import { displayAlert } from '../../../shared/bootstrapServices/components/components.js';
import { removeCustomer, getCustomerInvoices } from '../../../shared/appWSServices/dolibarrCustomerServices.js';

/**
 * Ask confirmation then delete the person
 * @param {object} customer - Dolibarr thirdparty object
 * @param {Function} onDeleteCallback - Called after successful deletion
 */
export async function displayActionDeletePerson(customer, onDeleteCallback) {
  try {
    const invoices = await getCustomerInvoices(customer['id']);
    if (invoices && invoices.length > 0) {
      throw new Error("Un adhérent ayant des factures ne peut être supprimé");
    }

    const confirmed = await confirmAction(
      `Supprimer l'adhérent ${customer['name']} ? Cette action est irréversible.`,
      'Supprimer adhérent',
      { confirmLabel: 'Supprimer', confirmClass: 'btn-danger', icon: 'bi-trash' }
    );
    if (!confirmed) return;

    await removeCustomer(customer['id']);
    if (onDeleteCallback) await onDeleteCallback();

  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert('alert-danger', error.message || error);
  }
}
