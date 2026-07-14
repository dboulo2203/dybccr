import { getPaymentLink } from '../../../shared/appWSServices/dolibarrInvoicesServices.js';
import { displayAlert } from '../../../shared/bootstrapServices/components/components.js';

/**
 * Copy the payment link to clipboard
 * @param {object} invoice - The invoice object
 */
export async function displayActionGetPaymentLink(invoice) {
  try {
    const link =
      window.location.protocol + '//' + window.location.hostname + (await getPaymentLink(invoice));
    await navigator.clipboard.writeText(link);
    return link;
  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert(
      'alert-danger',
      error.message
    );
    return null;
  }
}
