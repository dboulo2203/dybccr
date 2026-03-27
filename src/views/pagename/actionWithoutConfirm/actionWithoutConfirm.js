import { displayAlert } from '../../../shared/bootstrapServices/components/components.js';

/**
 * Display the set order to draft confirmation
 * @param {object} order - The order object to set to draft
 */
export async function displayActionWithoutConfirm(params, onSaveCallback) {
  try {
    // *** Code of the action here
    if (onSaveCallback) await onSaveCallback();
  } catch (error) {
    document.querySelector('#messageSection').innerHTML = displayAlert(
      'alert-danger',
      error.message || error
    );
  }
}
