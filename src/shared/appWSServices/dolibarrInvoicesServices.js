import { getConfigurationValue } from '../commonServices/configurationService.js';
import { getUserToken } from './dolibarrLoginServices.js';

/**
 * Create a new invoice for a thirdparty with lines
 * @param {string|number} thirdpartyId
 * @param {Array} lines - [{fk_product, desc, qty, subprice}]
 * @returns {Promise<object>} Created invoice
 */
export async function createInvoice(thirdpartyId, lines, invoiceOptions = {}) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') + `invoices?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      socid: Number(thirdpartyId),
      array_options: {
        options_inv_culturalseason: invoiceOptions.culturalseason ?? '',
      }
      ,
      lines: lines.map((line) => ({
        fk_product: line.fk_product,
        desc: line.desc,
        qty: line.qty,
        subprice: line.subprice
      })),
    }),
  });

  if (responsefr.ok) {
    let data = await responsefr.json();
    return data
  } else {
    throw new Error('createInvoice Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}

export async function getInvoice(invoiceID) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') + `invoices/${invoiceID}?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    sessionStorage.setItem('invoice', JSON.stringify(data));
    return data;
  } else {
    // console.log(`getInvoice Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'getInvoice Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

// export function getInvoiceLines(invoiceID) { }

/**
 * Validate the invoice  (change status)
 * @param {*} orderid
 * @returns
 */
export async function validateInvoice(invoice) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `invoices/${invoice.id}/validate?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idwarehouse: 0 }),
  });

  if (responsefr.ok) {
    return true // await responsefr.json();
  } else {
    throw new Error('validateInvoice Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}

/**
 * cancelInvoice the invoice  (change status)
 * @param {*} orderid
 * @returns
 */
export async function cancelInvoice(invoice) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `dklaccueil/${invoice.id}/setinvoicetocancelled?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    return data;
  } else {
    throw new Error('cancelInvoice Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}

// export function setToDraftInvoice(invoiceid) { }

/**
 * cancelInvoice the invoice  (change status)
 * @param {*} orderid
 * @returns
 */
export async function setToDraftInvoice(invoice) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `invoices/${invoice.id}/settodraft?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    return data;
  } else {
    throw new Error('validateOrder Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}
// export function getCustomerFixedAmountDiscounts(customerId) { }

/**
 * Get the fixed amount discount of a customer
 * @param {string} customerId
 * @returns {Promise<Array>} List of available fixed amount discounts
 */
export async function getCustomerFixedAmountDiscounts(customerId) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `thirdparties/${customerId}/fixedamountdiscounts?filter=available&DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    return data;
  } else if (responsefr.status === 404) {
    // *** 404 means no discounts found
    return [];
  } else {
    throw new Error(
      'getCustomerFixedAmountDiscounts Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

/**
 *
 * @param {*} invoice
 * @param {*} paymentType
 * @param {*} paymentAmount
 * @param {*} paymentIssuer
 * @param {*} arrayOfAmounts
 * @returns
 */
export async function createInvoicePayment(
  invoice,
  paymentType,
  paymentAmount,
  paymentIssuer,
  arrayOfAmounts
) {
  const arrayAmounts =
    arrayOfAmounts === null
      ? {
        [invoice.id]: { amount: paymentAmount, multicurrency_amount: '' },
      }
      : arrayOfAmounts;

  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `invoices/paymentsdistributed/?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      arrayofamounts: arrayAmounts,
      datepaye: Math.floor(Date.now() / 1000),
      paymentid: paymentType.id,
      closepaidinvoices: 'yes',
      accountid: 1,
      num_paiement: '',
      // comment: "test comment",
      chqemetteur: paymentIssuer,
      // "chqbank" => $fullinvoice->payments[0]->payme_bankname,
      fk_paiement: paymentType.id,
      accepthigherpayment: true,
    }),
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    return data;
  } else {
    throw new Error(
      'createInvoicePayment Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

/**
 * Get invoices containing a given product for a given year exercice
 * @param {string|number} productId
 * @param {string|number} yearId
 * @returns {Promise<Array>}
 */
export async function getAttendeesByProductAndYear(productId, yearId) {
  const filter = `(t.array_options.options_inv_culturalseason:=:${yearId})`;
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `invoices?DOLAPIKEY=${getUserToken()}&limit=5000&sqlfilters=${encodeURIComponent(filter)}`;

  const responsefr = await fetch(wsUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (responsefr.ok) {
    const invoices = await responsefr.json();
    return invoices.filter((inv) =>
      inv['lines']?.some((line) => String(line['fk_product']) === String(productId))
    );
  } else if (responsefr.status === 404) {
    return [];
  }
  throw new Error(
    'getAttendeesByProductAndYear Error : ' + responsefr.status + ' ' + responsefr.statusText
  );
}

export async function getPaymentLink(invoice) {
  return `/dolibarr/custom/helloassopay/public/start.php?ref=${invoice.id}`;
}

export async function getInvoicePayments(invoiceID) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `invoices/${invoiceID}/payments?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    sessionStorage.setItem('invoice', JSON.stringify(data));
    return data;
  } else {
    console.log(`getInvoice Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'getInvoice Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

/**
 * Use fixed amount discount in an invoice
 * @param {string} invoiceid
 * @param {string} discountId
 */
export async function putUseFixedAmountDiscount(invoiceid, discountId) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `invoices/${invoiceid}/usediscount/${discountId}?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    return data;
  } else {
    throw new Error(
      'putUseFixedAmountDiscount Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

export async function generateInvoicePdfDocument(invoice) {
  const pdfName = invoice.ref + '/' + invoice.ref + '.pdf';
  const wsUrl =
    getConfigurationValue('wsUrlformel') + `documents/builddoc?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modulepart: 'invoice',
      original_file: pdfName,
      doctemplate: 'crabe',
      langcode: 'fr_FR',
    }),
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    return data;
  } else {
    throw new Error(
      'generateInvoicePdfDocument Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

/**
 * Update invoice header fields (e.g. array_options)
 * @param {string|number} invoiceId
 * @param {object} data
 */
export async function updateInvoiceHeader(invoiceId, data) {
  const wsUrl = getConfigurationValue('wsUrlformel') + `invoices/${invoiceId}?DOLAPIKEY=${getUserToken()}`;
  const responsefr = await fetch(wsUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (responsefr.ok) return await responsefr.json();
  throw new Error('updateInvoiceHeader Error : ' + responsefr.status + ' ' + responsefr.statusText);
}

/**
 * Add a line to an existing invoice
 * @param {string|number} invoiceId
 * @param {{fk_product, desc, qty, subprice}} line
 */
export async function addInvoiceLine(invoiceId, line) {
  const wsUrl = getConfigurationValue('wsUrlformel') + `invoices/${invoiceId}/lines?DOLAPIKEY=${getUserToken()}`;
  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fk_product: line.fk_product, desc: line.desc, qty: line.qty, subprice: line.subprice }),
  });
  if (responsefr.ok) return await responsefr.json();
  throw new Error('addInvoiceLine Error : ' + responsefr.status + ' ' + responsefr.statusText);
}

/**
 * Delete a line from an invoice
 * @param {string|number} invoiceId
 * @param {string|number} lineId
 */
export async function deleteInvoiceLine(invoiceId, lineId) {
  const wsUrl = getConfigurationValue('wsUrlformel') + `invoices/${invoiceId}/lines/${lineId}?DOLAPIKEY=${getUserToken()}`;
  const responsefr = await fetch(wsUrl, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (responsefr.ok) return true;
  throw new Error('deleteInvoiceLine Error : ' + responsefr.status + ' ' + responsefr.statusText);
}

// export function createCreditnoteForInvoice(invoice, creditNote) { }

// export function markAsCreditAvailable(invoiceid) { }

/**
 * Set a credit note invoice to 0. Used for credit note for deposit when we are cancelling the order
 * @param {*} invoiceID
 */
export async function setInvoiceToZero(invoiceID) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') + `invoices/${invoiceID}?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    const invoice = data;
    const invoiceline = {};
    invoiceline.total_ttc = 0;
    invoiceline.total_ht = 0;
    invoiceline.subprice = 0;

    invoiceline.total_ttc = 0;
    invoiceline.subprice = 0;
    invoiceline.total_ht = 0;
    invoiceline.desc = invoice.lines[0].desc;
    invoiceline.description = invoice.lines[0].description;
    invoiceline.description = invoice.lines[0].description;
    invoiceline.qty = invoice.lines[0].qty;

    //
    const wsUrl =
      getConfigurationValue('wsUrlformel') +
      `invoices/${invoice.id}/${invoice.lines[0].id}lines/?DOLAPIKEY=${getUserToken()}`;

    const responsefr = await fetch(wsUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceline),
    });
    if (responsefr.ok) {
      const data = await responsefr.json();
      return data;
    } else {
      throw new Error(
        'generateInvoicePdfDocument Error : ' + responsefr.status + ' ' + responsefr.statusText
      );
    }

    // return data;
  } else {
    throw new Error(
      'generateInvoicePdfDocument Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

// export function sendPaymentRequest(requestData) { }

/**
 * Get invoices for a given product id and year id
 * @param {string|number} productId
 * @param {string|number} yearId
 * @param {string} sortfield - default 'f.datef'
 * @param {string} sortorder - default 'ASC'
 * @returns {Promise<Array>}
 */
export async function getInvoicesForProductAndYear(productId, yearId, sortfield = 'f.datef', sortorder = 'ASC') {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `dybccrapi/invoicesforproductandyear?product_id=${encodeURIComponent(productId)}&year_id=${encodeURIComponent(yearId)}&sortfield=${encodeURIComponent(sortfield)}&sortorder=${encodeURIComponent(sortorder)}&DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (responsefr.ok) {
    return await responsefr.json();
  } else if (responsefr.status === 404) {
    return [];
  }
  throw new Error('getInvoicesForProductAndYear Error : ' + responsefr.status + ' ' + responsefr.statusText);
}
