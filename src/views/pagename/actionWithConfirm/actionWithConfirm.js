// import { validateOrder } from '../../../shared/appWSServices/zopaOrderServices.js';
import { confirmAction } from '../../../shared/bootstrapServices/components/confirm-action.js';
import { displayAlert } from '../../../shared/bootstrapServices/components/components.js';

/**
 * Display the validate order confirmation
 * @param {object} order - The order object to validate
 */
export async function displayActionWithConfirm(params, onSaveCallback) {
  try {
    const confirmed = await confirmAction(
      'Confirmer la cr\u00e9ation d\u0027une nouvelle commande pour cet adh\u00e9rent ?',
      'Nouvelle commande',
      {
        confirmLabel: 'Cr\u00e9er',
        confirmClass: 'btn-success',
        icon: 'bi-cart-plus',
      }
    );

    if (confirmed) {
      // *** action code here
      if (onSaveCallback) await onSaveCallback();
    }
  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert(
      'alert-danger',
      error.message
    );
  }
}
