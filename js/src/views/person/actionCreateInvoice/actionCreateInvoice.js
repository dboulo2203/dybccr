import { createInvoice } from '../../../shared/appWSServices/dolibarrInvoicesServices.js';

/**
 * Create an empty draft invoice (today's date, no lines) for the customer.
 * The user finishes configuring it afterwards via "Modifier" (season, lines, payments, validation).
 * @param {object} customer - Dolibarr thirdparty object
 * @param {Function} onSaveCallback - Called after successful save
 */
export async function displayActionCreateInvoice(customer, onSaveCallback) {
  if (!confirm(`Créer une facture brouillon vide pour ${customer.name} ?`)) {
    return false;
  }

  await createInvoice(customer.id, []);
  if (onSaveCallback) await onSaveCallback();
  return true;
}
