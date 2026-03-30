import AutocompleteSelector from '../../../shared/bootstrapServices/components/autocomplete-selector-plain.js';
import { displayAlert } from '../../../shared/bootstrapServices/components/components.js';
import { loadProducts, getAllActiveProducts } from '../../../shared/appWSServices/dolibarrProductServices.js';
import { createInvoice, validateInvoice, createInvoicePayment } from '../../../shared/appWSServices/dolibarrInvoicesServices.js';
import { getFormattedCurrency } from '../../../shared/commonServices/commonFunctions.js';
import { getSelectFromDatabaseList, getPaymentTypes } from '../../../shared/appWSServices/dolibarrListsServices.js';

/**
 * Display the create invoice modal
 * @param {object} customer - Dolibarr thirdparty object
 * @param {Function} onSaveCallback - Called after successful save
 */
export async function displayActionCreateInvoice(customer, onSaveCallback) {

  const modalId = 'createInvoiceModal-' + Math.random().toString(36).substring(2, 9);

  const modalHtml = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title fs-5">
              <i class="bi bi-receipt me-2"></i>Créer une facture — ${customer['name']}
            </span>
            <button type="button" class="btn-close" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="${modalId}-alert"></div>
            <div class="mb-3 col-6">
              <label class="fw-light mb-1 ">Saison culturelle</label>
              <select class="form-select" id="${modalId}-culturalseason" required>
                <option value="">—</option>
                ${getSelectFromDatabaseList('yearexercice', 'rowid', 'label', null)}
              </select>
            </div>
            <div class="mb-3">
              <label class="fw-light mb-1">Ajouter un produit</label>
              <div id="${modalId}-autocomplete"></div>
            </div>
            <div id="${modalId}-lines">
              <p class="text-muted small">Aucun produit ajouté.</p>
            </div>
            <div class="text-end fw-semibold fs-5 mt-2 border-top pt-2">
              Total : <span id="${modalId}-total">0,00 €</span>
            </div>
            <div class="border-top mt-3 pt-2">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-semibold">Paiements</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" id="${modalId}-add-payment">
                  <i class="bi bi-plus"></i> Ajouter
                </button>
              </div>
              <div id="${modalId}-payments"><p class="text-muted small">Aucun paiement.</p></div>
              <div class="text-end small text-muted mt-1">
                Reste à payer : <span id="${modalId}-remaining">0,00 €</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="${modalId}-cancel">Annuler</button>
            <button type="button" class="btn btn-primary" id="${modalId}-save">
              <i class="bi bi-floppy me-1"></i>Sauver
            </button>
          </div>
        </div>
      </div>
    </div>`;

  // await loadProducts();
  const products = getAllActiveProducts().map((p) => ({
    ...p,
    display: ` ${p.label}`,
  }));

  return new Promise((resolve) => {
    const container = document.createElement('div');
    container.innerHTML = modalHtml;
    document.body.appendChild(container);

    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);
    const lines = [];
    const payments = [];

    const cleanup = (result) => {
      modal.hide();
      modalElement.addEventListener('hidden.bs.modal', () => container.remove(), { once: true });
      resolve(result);
    };

    const computeInvoiceTotal = () => lines.reduce((s, l) => s + l.qty * l.subprice, 0);
    const computePaid = () => payments.reduce((s, p) => s + p.amount, 0);

    const updateTotal = () => {
      document.getElementById(`${modalId}-total`).textContent = getFormattedCurrency(computeInvoiceTotal());
      document.getElementById(`${modalId}-remaining`).textContent = getFormattedCurrency(computeInvoiceTotal() - computePaid());
    };

    const renderPayments = () => {
      const allTypes = getPaymentTypes() || [];
      const container = document.getElementById(`${modalId}-payments`);
      if (payments.length === 0) {
        container.innerHTML = '<p class="text-muted small">Aucun paiement.</p>';
        return;
      }
      const typeOptions = (selectedId) => allTypes.map((t) =>
        `<option value="${t.id}" ${String(t.id) === String(selectedId) ? 'selected' : ''}>${t.code}</option>`
      ).join('');

      let html = '<div class="d-flex flex-column gap-2">';
      payments.forEach((p, i) => {
        html += `<div class="d-flex gap-2 align-items-center">
          <select class="form-select form-select-sm" style="width:110px" id="${modalId}-ptype-${i}">${typeOptions(p.type?.id)}</select>
          <input type="number" class="form-control form-control-sm" style="width:120px" id="${modalId}-pamount-${i}" value="${p.amount}" min="0" step="0.01">
          <button type="button" class="btn btn-sm btn-outline-danger" id="${modalId}-pdel-${i}"><i class="bi bi-trash"></i></button>
        </div>`;
      });
      html += '</div>';
      container.innerHTML = html;

      payments.forEach((p, i) => {
        document.getElementById(`${modalId}-ptype-${i}`).addEventListener('change', (e) => {
          p.type = allTypes.find((t) => String(t.id) === e.target.value) || allTypes[0];
        });
        document.getElementById(`${modalId}-pamount-${i}`).addEventListener('input', (e) => {
          p.amount = Number.parseFloat(e.target.value) || 0;
          document.getElementById(`${modalId}-remaining`).textContent = getFormattedCurrency(computeInvoiceTotal() - computePaid());
        });
        document.getElementById(`${modalId}-pdel-${i}`).addEventListener('click', () => {
          payments.splice(i, 1);
          renderPayments();
          document.getElementById(`${modalId}-remaining`).textContent = getFormattedCurrency(computeInvoiceTotal() - computePaid());
        });
      });
    };

    const renderLines = () => {
      const linesContainer = document.getElementById(`${modalId}-lines`);
      if (lines.length === 0) {
        linesContainer.innerHTML = '<p class="text-muted small">Aucun produit ajouté.</p>';
        return;
      }

      let html = `<div style="overflow-x: auto;"><table class="table table-sm align-middle">
        <thead><tr>
          <th class="fw-semibold">Produit</th>
          <th class="fw-semibold" style="width:90px">Qté</th>
          <th class="fw-semibold" style="width:110px">Prix unit.</th>
          <th class="fw-semibold" style="width:110px" class="text-end">Sous-total</th>
          <th class="fw-semibold" style="width:40px"></th>
        </tr></thead><tbody>`;

      lines.forEach((line, i) => {
        html += `<tr>
          <td>${line.desc}</td>
          <td><input type="number" class="form-control form-control-sm" id="${modalId}-qty-${i}" value="${line.qty}" min="1" step="1"></td>
          <td><input type="number" class="form-control form-control-sm" id="${modalId}-price-${i}" value="${line.subprice}" step="0.01"></td>
          <td class="text-end" id="${modalId}-sub-${i}">${getFormattedCurrency(line.qty * line.subprice)}</td>
          <td><button type="button" class="btn btn-sm btn-outline-danger" id="${modalId}-del-${i}"><i class="bi bi-trash"></i></button></td>
        </tr>`;
      });

      html += '</tbody></table></div>';
      linesContainer.innerHTML = html;

      lines.forEach((line, i) => {
        document.getElementById(`${modalId}-qty-${i}`).addEventListener('input', (e) => {
          line.qty = Number.parseFloat(e.target.value) || 0;
          document.getElementById(`${modalId}-sub-${i}`).textContent = getFormattedCurrency(line.qty * line.subprice);
          updateTotal();
        });
        document.getElementById(`${modalId}-price-${i}`).addEventListener('input', (e) => {
          line.subprice = Number.parseFloat(e.target.value) || 0;
          document.getElementById(`${modalId}-sub-${i}`).textContent = getFormattedCurrency(line.qty * line.subprice);
          updateTotal();
        });
        document.getElementById(`${modalId}-del-${i}`).addEventListener('click', () => {
          lines.splice(i, 1);
          renderLines();
          updateTotal();
        });
      });
    };

    const autocomplete = new AutocompleteSelector(`#${modalId}-autocomplete`, {
      labelField: 'display',
      valueField: 'id',
      placeholder: 'Rechercher un produit...',
      onChange: (value, item) => {
        if (!item) return;
        lines.push({
          fk_product: item.id,
          desc: item.display,
          qty: 1,
          subprice: Number.parseFloat(item.price) || Number.parseFloat(item.price_ttc) || 0,
        });
        renderLines();
        updateTotal();
        autocomplete.clear();
      },
    });
    autocomplete.setItems(products);

    modalElement.querySelector('.btn-close').addEventListener('click', () => cleanup(false));
    document.getElementById(`${modalId}-cancel`).addEventListener('click', () => cleanup(false));

    document.getElementById(`${modalId}-add-payment`).addEventListener('click', () => {
      const allTypes = getPaymentTypes() || [];
      if (allTypes.length === 0) return;
      const remaining = Math.max(computeInvoiceTotal() - computePaid(), 0);
      payments.push({ type: allTypes[0], amount: remaining });
      renderPayments();
      document.getElementById(`${modalId}-remaining`).textContent = getFormattedCurrency(computeInvoiceTotal() - computePaid());
    });

    document.getElementById(`${modalId}-save`).addEventListener('click', async () => {
      try {
        const culturalseason = document.getElementById(`${modalId}-culturalseason`).value;
        if (!culturalseason) throw new Error('Veuillez choisir une saison culturelle');
        if (lines.length === 0) throw new Error('Veuillez ajouter au moins un produit');
        if (computePaid() > computeInvoiceTotal()) throw new Error('Le total des paiements dépasse le montant de la facture');
        const invoiceId = await createInvoice(customer.id, lines, { culturalseason });
        await validateInvoice({ id: invoiceId });
        for (const payment of payments) {
          if (payment.amount > 0) {
            await createInvoicePayment({ id: invoiceId }, payment.type, payment.amount, '', null);
          }
        }
        cleanup(true);
        if (onSaveCallback) await onSaveCallback();
      } catch (error) {
        document.getElementById(`${modalId}-alert`).innerHTML = displayAlert('alert-danger', error.message || error);
      }
    });

    modal.show();
  });
}
