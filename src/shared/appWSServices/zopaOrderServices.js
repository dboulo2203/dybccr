import { getFormattedDate } from '../commonServices/commonFunctions.js';
import { getConfigurationValue } from '../commonServices/configurationService.js';
import { setInvoiceToZero } from './dolibarrInvoicesServices.js';
import { getUserToken } from './dolibarrLoginServices.js';
import { getProductFromId } from './zopaProductServices.js';

/**
 *
 * @param {*} orderID
 * @returns
 */
export async function getOrder(orderID) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `dklaccueil/fullorders?sortorder=ASC&limit=1&sqlfilters=t.rowid%3D${orderID}&DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    sessionStorage.setItem('order', JSON.stringify(data[0]));
    // console.log("getOrder  await ok ");
    return data[0];
  } else {
    console.log(`getOrder Error : ${JSON.stringify(responsefr)}`);
    throw new Error('getOrder Error message : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}

// export function getOrderTemp(orderID) { }
/**
 * Create a new order
 * @param {*} socid
 * @returns
 */
export async function createNewOrder(socid) {
  const wsUrl = getConfigurationValue('wsUrlformel') + `orders?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      socid: socid,
      date: Math.floor(Date.now() / 1000),
    }),
  });
  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    // sessionStorage.setItem('order', JSON.stringify(data));
    // console.log("getOrder  await ok ");
    return data[0];
  } else {
    console.log(`getOrder Error : ${JSON.stringify(responsefr)}`);
    throw new Error('getOrder Error message : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}

export async function createOrderDeposit(orderID, deposit) {
  const wsUrl = getConfigurationValue('wsUrlformel') + `invoices?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deposit),
  });
  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    return data;
  } else {
    console.log(`createOrderDeposit Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'createOrderDeposit Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}
// export function validateOrderDeposit(depositid, deposit, orderID) {}
// export function createCreditnoteForOrder(order, creditNote) {}

export async function addOrderLine(order, orderline) {
  if (!order.customer.price_level) {
    throw Error('Veuillez sélectionner le niveau de revenu dans la fiche adhérent');
  }

  const product = getProductFromId(orderline.fk_product);

  // *** Check product price
  let price = 0;
  if (product) {
    price = product.multiprices_ttc[parseInt(order.customer.price_level)];
  } else {
    throw Error(
      "ajout d'une ligne de commande : produit non trouvé, veuillez contacter l'administrateur"
    );
  }
  if (price === undefined) price = product[0].multiprices_ttc[1];

  if (price === undefined) {
    throw Error(
      "Le prix du produit n'a pas pu être déterminé - code produit : " + orderline.fk_product
    );
  }

  const wsUrl =
    getConfigurationValue('wsUrlformel') + `orders/${order.id}/lines/?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fk_product: orderline.fk_product,
      ref: product.ref,
      label: product.label,
      array_options: orderline.array_options,
      qty: orderline.qty,
      subprice: price,
    }),
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    // sessionStorage.setItem('customer', JSON.stringify(data));

    // await putCustomerIncomeLevel(customer, customerUpdates.price_level)
    return data;
  } else {
    console.log(`addOrderLine Error: ${JSON.stringify(responsefr)} `);
    throw new Error('addOrderLine Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}

/**
 * Add an array of order lines
 * @param {*} order
 * @param {*} computedOrderlines
 * @returns
 */
export async function addOrderLines(order, computedOrderlines) {
  const results = [];
  for (const orderline of computedOrderlines) {
    const result = await addOrderLine(order, orderline);
    results.push(result);
  }
  return results;
}
// export async function createOrderLineSync(orderid, linesTab, customer) {}
export async function updateOrderLine(orderid, orderLineid, orderline) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `orders/${orderid}/lines/${orderLineid}?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderline),
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    return data;
  } else {
    throw new Error('updateOrderLine Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}

export async function removeOrderLine(order, orderLineid) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `dklaccueil/${order.id}/deleteOrderLine/${orderLineid}?DOLAPIKEY=${getUserToken()}`;

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
    throw new Error('removeOrderLine Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}

/**
 * Validate the order (change status)
 * @param {*} orderid
 * @returns
 */
export async function validateOrder(order) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `orders/${order.id}/validate?DOLAPIKEY=${getUserToken()}`;

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

/**
 * Create an invoice to billed the remaining lines of the order
 * @param {*} order
 * @returns
 */
export async function createFullinvoiceForOrder(order) {
  // *** Prepare data
  const invoiceType = '0';
  const diffentsLinesFiltered = getLinesToBeInvoiced(order);

  if (diffentsLinesFiltered.length === 0) throw new Error('Pas de ligne à facturer');

  const wsUrl = getConfigurationValue('wsUrlformel') + `invoices/?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: invoiceType,
      socid: order.socid,
      lines: diffentsLinesFiltered,
      linkedObjectsIds: {
        commande: {
          12: order.id,
        },
      },
    }),
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    return data;
  } else {
    throw new Error(
      'createFullinvoiceForOrder Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

// *****************************************************************************************
/**
 * Get the lines of the order that has not been invoiced
 * @param {*} orderId
 */
export function getLinesToBeInvoiced(order) {
  // *** Get the lines from the previous  paid invoices
  const previousInvoicesLines = getOrderTotalInvoicesLines(order, true);

  // *** Keep only lines with a line.ref (not the deposit lines)
  const previousInvoicesLinesFiltered = previousInvoicesLines.filter((line) => line.ref);

  // *** compare order lines and previous invoices lines
  const diffentsLines = compareLinesTab(order.lines, previousInvoicesLinesFiltered);

  // *** If there is no difference
  if (diffentsLines.length === 0) {
    throw new Error('Pas de modification à facturer ! ');
  }

  // *** Check lines that has been allready deleted
  diffentsLines.forEach((invoiceLine, invoiceLineindex) => {
    if (invoiceLine.allreadyDeleted !== true) {
      const findPositive = diffentsLines.findIndex(
        (linea) =>
          linea.fk_product === invoiceLine.fk_product &&
          linea.qty === -invoiceLine.qty &&
          parseFloat(linea.total_ttc) === -parseFloat(invoiceLine.total_ttc) &&
          linea.allreadyDeleted !== true
      );
      if (findPositive >= 0 && diffentsLines[findPositive].allreadyDeleted !== true) {
        diffentsLines[findPositive].allreadyDeleted = true;
        diffentsLines[invoiceLineindex].allreadyDeleted = true;
      } else {
        //  diffentsLines[invoiceLineindex].allreadyDeleted = false;
      }
    }
  });

  const diffentsLinesFiltered = diffentsLines.filter((line) => line.allreadyDeleted !== true);

  return diffentsLinesFiltered;
}

/**
 * Create partial invoice for order
 * @param {object} order
 * @param {Array} diffentsLinesFiltered
 * @returns {Promise} invoice id
 */
export async function createPartialinvoiceForOrder(order, diffentsLinesFiltered) {
  const wsUrl = getConfigurationValue('wsUrlformel') + `invoices/?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: '0',
      socid: order.socid,
      lines: diffentsLinesFiltered,
      linkedObjectsIds: {
        commande: {
          12: order.id,
        },
      },
    }),
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    return data;
  } else {
    throw new Error(
      'createPartialinvoiceForOrder Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}
/**
 * returns the differences between 2 tabs of invoice/order lines
 * @param {*} firstLineTab
 * @param {*} secondlineTab
 * @returns Array of order lines
 */
export function compareLinesTab(orderLineTab, invoiceslineTab) {
  let returnTab = [];
  // const notFounddiffenceTab = [];
  // var dup_array = JSON.parse(JSON.stringify(original_array))
  const firstLineTab = JSON.parse(JSON.stringify(orderLineTab)); // [...orderLineTab];
  let secondlineTab = JSON.parse(JSON.stringify(invoiceslineTab)); // [...invoiceslineTab];

  // *** detect credit note lines and their positive line
  secondlineTab.forEach((invoiceLine, invoiceLineindex) => {
    if (invoiceLine.total_ttc < 0) {
      const findPositive = secondlineTab.findIndex(
        (linea) =>
          linea.fk_product === invoiceLine.fk_product &&
          linea.qty === invoiceLine.qty &&
          parseFloat(linea.total_ttc) === -parseFloat(invoiceLine.total_ttc) &&
          !(linea.creditnote || invoiceLine.creditnote === false)
      );
      if (findPositive >= 0) {
        secondlineTab[findPositive].creditnote = true;
        secondlineTab[invoiceLineindex].creditnote = true;
      } else {
        console.log('facture finale : Recherche de lignes supprimées, incohérence ');
      }
    }
  });
  // *** delete creditnote lines
  secondlineTab = secondlineTab.filter((line) => line.creditnote !== true);

  //*** For each line of the 1rst tab, try to find a line in the 2nd tab */
  firstLineTab.forEach((line, index) => {
    const findLineIndex = secondlineTab.findIndex(
      (linea) =>
        linea.fk_product === line.fk_product &&
        linea.qty === line.qty &&
        linea.total_ttc === line.total_ttc &&
        !(linea.found || linea.found === false)
    );
    if (findLineIndex >= 0) {
      secondlineTab[findLineIndex].found = true;
      firstLineTab[index].found = true;
    } else {
      firstLineTab[index].found = false;
    }
  });

  // *** build the lines to be created
  returnTab = returnTab.concat(firstLineTab.filter((line) => line.found === false));

  // *** build the lines to be deleted (credit note)
  const toBeDeleted = secondlineTab.filter((line) => !line.found);
  toBeDeleted.forEach((line) => {
    line.qty = -line.qty;
    line.total_ttc = -line.total_ttc;
  });
  returnTab = returnTab.concat(toBeDeleted);

  return returnTab;
}

/**
 * Payback order and cancel the order
 * create an invoice with the remain to pay
 * @param {*} orderId
 */
export async function createPaybackinvoiceForOrder(order) {
  //*** Check that all the order's invoices are paid or cancelled but not draft or validated
  const invalidInvoices = order.linkedInvoices.filter(
    (invoice) => invoice.statut === '0' || invoice.statut === '1'
  );
  if (invalidInvoices.length > 0) {
    throw new Error(
      'Attention pour annuler une commande,  toutes les factures doivent être payées ou abandonnées '
    );
  }

  // *** Get the lines from the previous  paid invoices
  const previousInvoicesLines = getOrderTotalInvoicesLines(order, false);
  let previousInvoicesLinesFiltered = [...previousInvoicesLines];

  // *** detect deposit lines and their negative line
  //TODO : check if the detection of the deposit lines are enougth
  previousInvoicesLinesFiltered.forEach((invoiceLine, invoiceLineindex) => {
    if (invoiceLine.total_ttc < 0) {
      const findPositive = previousInvoicesLinesFiltered.findIndex(
        (linea) =>
          linea.fk_product === invoiceLine.fk_product &&
          invoiceLine.fk_product === null &&
          linea.qty === invoiceLine.qty &&
          parseFloat(linea.total_ttc) === -parseFloat(invoiceLine.total_ttc) &&
          !(linea.deposit || invoiceLine.deposit === false)
      );
      if (findPositive >= 0) {
        previousInvoicesLinesFiltered[findPositive].deposit = true;
        previousInvoicesLinesFiltered[invoiceLineindex].deposit = true;
      } else {
        console.log({
          code: '600',
          message: 'facture finale : Recherche de lignes supprimées, incohérence ',
        });
      }
    }
  });

  previousInvoicesLinesFiltered = previousInvoicesLinesFiltered.filter(
    (line) => line.deposit !== true
  );

  // ***** remove deleted lines and their positive counterpart
  previousInvoicesLinesFiltered.forEach((invoiceLine, invoiceLineindex) => {
    if (invoiceLine.total_ttc < 0) {
      const findPositive = previousInvoicesLinesFiltered.findIndex(
        (linea) =>
          linea.fk_product === invoiceLine.fk_product &&
          parseInt(linea.qty) === parseInt(-invoiceLine.qty) &&
          parseFloat(linea.total_ttc) === -parseFloat(invoiceLine.total_ttc)
        // && !(linea.deposit || invoiceLine.deposit === false)
      );
      if (findPositive >= 0) {
        previousInvoicesLinesFiltered[findPositive].deleted = true;
        previousInvoicesLinesFiltered[invoiceLineindex].deleted = true;
      } else {
        console.log({
          code: '600',
          message: 'facture finale : Recherche de lignes supprimées, incohérence ',
        });
      }
    }
  });
  previousInvoicesLinesFiltered = previousInvoicesLinesFiltered.filter(
    (line) => line.deleted !== true
  );

  // *** set each invoice line value to negative. Added because we use standard invoice and not credit note
  previousInvoicesLinesFiltered.forEach((invoiceLine) => {
    invoiceLine.qty = -invoiceLine.qty;
  });

  // *** Display message that nothing must be payback but cancel the order
  if (previousInvoicesLinesFiltered.length === 0) {
    throw new Error('Pas de ligne de facture à rembourser !');
    // TODO : cancelOrder(order.id)
  }
  const invoiceType = '0';

  const wsUrl = getConfigurationValue('wsUrlformel') + `invoices/?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: invoiceType,
      socid: order.socid,
      lines: previousInvoicesLinesFiltered,
      linkedObjectsIds: {
        commande: {
          12: order.id,
        },
      },
    }),
  });

  if (responsefr.ok) {
    const data = await responsefr.json();

    // *** reset de la facture de remboursement d'acompte
    if (
      previousInvoicesLinesFiltered.length === 1 &&
      previousInvoicesLinesFiltered[0].ref === null &&
      previousInvoicesLinesFiltered[0].desc.toUpperCase().includes('ACOMPTE')
    ) {
      // console.log("reset de la facture de remboursement d'acompte : " + json.data);
      await setInvoiceToZero(data, order.id);
    }

    // *** Modify order status
    await cancelOrder(order.id);
    // getOrder(order.id)

    return data;
  } else {
    throw new Error(
      'createPaybackinvoiceForOrder Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

// export function orderDeleteMeal(order, orderline, breakStartDateParam, breakEndDateParam) { }

export async function orderDeleteMeal(order, orderline, breakStartDateParam, breakEndDateParam) {
  // The order line dates
  const orderlineStartDate = new Date(
    orderline.array_options.options_lin_datedebut * 1000
  ).setHours(0, 0, 0);
  const orderlineEndDate = new Date(orderline.array_options.options_lin_datefin * 1000).setHours(
    0,
    0,
    0
  );

  // the new dates
  const breakStartDate = new Date(breakStartDateParam).setHours(0, 0, 0);
  const breakEndDate = new Date(breakEndDateParam).setHours(0, 0, 0);

  /** delete meal from the beginning of the meal line => modify startdate and qty */
  if (orderlineStartDate === breakStartDate) {
    const locOrderLine = { ...orderline };

    const newStartDate = new Date(breakEndDateParam);
    newStartDate.setDate(newStartDate.getDate() + 1);

    const diffInDays = Math.floor((orderlineEndDate - newStartDate) / (1000 * 60 * 60 * 24));

    locOrderLine.array_options.options_lin_datedebut = newStartDate / 1000;
    locOrderLine.qty = diffInDays + 1;
    await updateOrderLine(order.id, locOrderLine.id, locOrderLine);
    return;
  }

  /** delete meal to the end of the meal line => modify end date and qty */
  if (orderlineEndDate === breakEndDate) {
    const locOrderLine = { ...orderline };

    const newEndDate = new Date(breakStartDateParam);
    newEndDate.setDate(newEndDate.getDate() - 1);

    const diffInDays = Math.floor((newEndDate - orderlineStartDate) / (1000 * 60 * 60 * 24));

    locOrderLine.array_options.options_lin_datefin = newEndDate / 1000;
    locOrderLine.qty = diffInDays + 1;
    await updateOrderLine(order.id, locOrderLine.id, locOrderLine);
    return;
  }

  /** Delete the meals inside the meal line => modify the line and add a new line */
  if (orderlineEndDate > breakEndDate && orderlineStartDate < breakStartDate) {
    // *** Modify the current line
    const locOrderLine = { ...orderline };
    const newEndDate = new Date(breakStartDateParam);
    newEndDate.setDate(newEndDate.getDate() - 1);

    const diffInDays = Math.floor((newEndDate - orderlineStartDate) / (1000 * 60 * 60 * 24));

    locOrderLine.array_options.options_lin_datefin = newEndDate / 1000;
    locOrderLine.qty = diffInDays + 1;

    /** Create a new line */
    const newStartDate = new Date(breakEndDateParam);
    newStartDate.setDate(newStartDate.getDate() + 1);
    const diffInDays2 = Math.floor((orderlineEndDate - newStartDate) / (1000 * 60 * 60 * 24));

    /** Send to database */
    await updateOrderLineandAddOrderline(order, locOrderLine.id, locOrderLine, {
      fk_product: locOrderLine.fk_product,
      label: locOrderLine.label,
      array_options: {
        options_lin_datedebut: newStartDate / 1000,
        options_lin_datefin: orderlineEndDate / 1000,
        options_lin_room: orderline.array_options.options_lin_room,
        options_lin_intakeplace: orderline.array_options.options_lin_intakeplace,
      },
      qty: diffInDays2 + 1,
    });
  }
}

export async function orderBreakLine(order, orderline, breakDate) {
  // The order line dates
  const orderlineStartDate = new Date(orderline.array_options.options_lin_datedebut * 1000).setHours(
    0,
    0,
    0
  );
  const orderlineEndDate = new Date(orderline.array_options.options_lin_datefin * 1000).setHours(
    0,
    0,
    0
  );

  // the new dates
  // let breakStartDate = new Date(breakDate).setHours(0, 0, 0);

  if (!(orderlineEndDate > breakDate && orderlineStartDate < breakDate)) {
    throw new Error(
      "Erreur sur les dates, la date de séparation doit être à l'intérieur de la plage de dates de la ligne"
    );
  }
  // *** Modify the current line
  const locOrderLine = { ...orderline };
  const newEndDate = new Date(breakDate);

  // *** Compute the line to be modfied
  const diffInDays = Math.floor((newEndDate - orderlineStartDate) / (1000 * 60 * 60 * 24));
  locOrderLine.array_options.options_lin_datefin = newEndDate / 1000;
  locOrderLine.qty = Math.floor(diffInDays) + 1;

  /** Create the new line */
  const newStartDate = new Date(breakDate);
  newStartDate.setDate(newStartDate.getDate() + 1);
  const diffInDays2 = Math.floor((orderlineEndDate - newStartDate) / (1000 * 60 * 60 * 24));

  /** Send to database */
  await updateOrderLineandAddOrderline(order, locOrderLine.id, locOrderLine, {
    fk_product: locOrderLine.fk_product,
    label: locOrderLine.label,
    array_options: {
      options_lin_datedebut: newStartDate / 1000,
      options_lin_datefin: orderlineEndDate / 1000,
      options_lin_room: orderline.array_options.options_lin_room,
      options_lin_intakeplace: orderline.array_options.options_lin_intakeplace,
    },
    qty: diffInDays2 + 1,
  });
}
/**
 *
 * @param {*} order
 * @param {*} orderLineid
 * @param {*} orderline
 * @param {*} addStruct
 * @returns
 */
export async function updateOrderLineandAddOrderline(order, orderLineid, orderline, addStruct) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `orders/${order.id}/lines/${orderLineid}?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderline),
  });

  if (responsefr.ok) {
    // const data = await responsefr.json();
    await addOrderLine(order, addStruct);
    return true;
  } else {
    throw new Error(
      'updateOrderLineandAddOrderline Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

export async function setOrderToDraft(order) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') +
    `orders/${order.id}/settodraft?DOLAPIKEY=${getUserToken()}`;

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

export async function cancelOrder(orderid) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') + `orders/${orderid}/?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      statut: '-1',
    }),
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    return data;
  } else {
    throw new Error('validateOrder Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}

export async function setOrderToClosed(order) {
  const wsUrl =
    getConfigurationValue('wsUrlformel') + `orders/${order.id}/close?DOLAPIKEY=${getUserToken()}`;

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
    console.log(`setOrderToClosed Error: ${JSON.stringify(responsefr)} `);
    throw new Error('setOrderToClosed Error : ' + responsefr.status + ' ' + responsefr.statusText);
  }
}
// export function setOrdersToClosed(orders) { }

export async function generateOrderPdfDocument(order, ordermodel) {
  const pdfName = order.ref + '/' + order.ref + '.pdf';
  const wsUrl =
    getConfigurationValue('wsUrlformel') + `documents/builddoc?DOLAPIKEY=${getUserToken()}`;

  const responsefr = await fetch(wsUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modulepart: 'order',
      original_file: pdfName,
      doctemplate: ordermodel,
      langcode: 'fr_FR',
    }),
  });

  if (responsefr.ok) {
    const data = await responsefr.json();
    // sessionStorage.setItem('customer', JSON.stringify(data));

    return data;
  } else {
    console.log(`generateOrderPdfDocument Error: ${JSON.stringify(responsefr)} `);
    throw new Error(
      'generateOrderPdfDocument Error : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

/**
 * Returns a tab with all the lines of the order invoices
 * @param {*} order
 * @param {*} withValidatedOrders : true if we want the orders with the status "validated"
 */
export function getOrderTotalInvoicesLines(order, withValidatedOrders) {
  let linesArray = [];

  order.linkedInvoices.forEach((invoice) => {
    if (invoice.statut === '2' || (invoice.statut === '1' && withValidatedOrders)) {
      linesArray = linesArray.concat(invoice.lines);
    }
  });
  return linesArray;
}

/**
 *
 * @param {*} order
 * @param {*} fullDescription
 * @returns
 */
export function getevaluateSession(order, fullDescription) {
  // Fulldescription : the function must returns the session and the product list
  let session = '';
  const otherProducts = [];
  order.lines.forEach((orderLine, index) => {
    if (orderLine.ref) {
      if (orderLine.ref.startsWith('STA')) {
        // *** Build a session label with short date and libelle
        // const dateDebut = new Intl.DateTimeFormat('fr-FR', {
        //   year: 'numeric',
        //   month: 'numeric',
        //   day: 'numeric',
        // }).format(orderLine.array_options.options_lin_datedebut * 1000);

        session =
          getFormattedDate(orderLine.array_options.options_lin_datedebut, false) +
          ' - ' +
          orderLine.libelle;
      } else {
        // *** if the product is not a session, keep the products used in the order
        if (
          otherProducts.find((element) => element === orderLine.ref.substring(0, 3)) === undefined
        )
          otherProducts.push(orderLine.ref.substring(0, 3));
      }
    }
  });
  if (fullDescription) return session + ' - ' + otherProducts.join(', ');
  else if (session) return session;
  else return otherProducts.join(', ');
}

/**
 * Get the starting date of the order course
 * @param {*} orderthe order
 * @returns : if a course is foundn returns  the date, otherwise null
 */
export function getevaluateSessionStartDate(order) {
  let sessionStartDate = null;
  // let otherProducts = [];
  order.lines.forEach((orderLine) => {
    if (orderLine.ref) {
      if (orderLine.ref.startsWith('STA')) {
        sessionStartDate = orderLine.array_options.options_lin_datedebut;
      }
    }
  });
  return sessionStartDate;
}

/**
 * Get the ending date of an order course
 * @param {*} order
 * @returns : if a course is foundn returns  the date, otherwise null
 */
export function getevaluateSessionEndDate(order) {
  let sessionStartDate = null;
  // let otherProducts = [];
  order.lines.forEach((orderLine) => {
    if (orderLine.ref) {
      if (orderLine.ref.startsWith('STA')) {
        sessionStartDate = orderLine.array_options.options_lin_datefin;
      }
    }
  });
  return sessionStartDate;
}

/**
 * Get the request for translation
 * @param {*} order
 * @returns : Return the 3 first letters of the label. return '' if no translation
 */
export function getTranslationRequest(order) {
  let translationString = '';
  // let otherProducts = [];
  const translationLine = order.lines.find((line) => line.ref.startsWith('TRA'));
  if (translationLine) translationString = translationLine.product_label.substr(0, 3);

  return translationString;
}
/**
 * Returns true if the invoice is linked with the order
 * @param {*} order
 * @param {*} invoiceId : the invoice to be searched
 * @returns {boolean} :  true if an invoice is in the order
 */
export function getevaluateIsInvoiceInThisOrder(order, invoiceId) {
  let inThisOrder = false;
  order.linkedInvoices.forEach((invoice) => {
    if (invoice.id === invoiceId) {
      inThisOrder = true;
    }
  });
  return inThisOrder;
}
/**
 * Returns true if the invoice is linked with the order
 * @param {*} order
 * @param {*} invoiceId : the invoice to be searched
 * @returns {boolean} :  true if an invoice is in the order
 */
export function getLastInvoiceInThisOrder(order) {
  // const inThisOrder = false;
  /*  order.linkedInvoices.sort((invoice, index) => {
       if (invoice.id === invoiceId) {
         inThisOrder = true;
       }
     });
    */
  const sortedInvoices = JSON.parse(JSON.stringify(order.linkedInvoices));
  sortedInvoices.sort(function (a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    // const aDate = new Date(a * 1000);
    // const bDate = new Date(b * 1000);

    return new Date(b.date) - new Date(a.date);
  });
  if (sortedInvoices.length > 0) return sortedInvoices[sortedInvoices.length - 1];
  else return null;
}

/**
 * Returns true if a booking line is in the order and if a room is set.
 * @param {*} order
 * @returns {boolean} : Returns true if a booking line is in the order and if a room is set.
 */
export function getOrderRoomNotSet(order) {
  let inThisOrder = null;
  if (order !== undefined && order.lines !== undefined) {
    const bookingLine = order.lines.find((line) => line.ref.startsWith('HEB'));
    if (bookingLine !== undefined) {
      if (
        bookingLine.array_options.options_lin_room !== undefined &&
        bookingLine.array_options.options_lin_room !== null
      )
        inThisOrder = true;
      else inThisOrder = false;
    }
  }
  return inThisOrder;
}

/**
 * Order consistancy : HEB is consistant with TAX
 * @param {*} order
 * @returns {boolean}  : return true if a HEB line is in the order and if a taxe line is in the order and if the qty are the same
 */
export function getOrderhostingtaxesconsistancy(order) {
  let inThisOrder = null;
  if (order !== undefined && order.lines !== undefined) {
    const bookingLine = order.lines.find((line) => line.ref.startsWith('HEB'));
    const taxLine = order.lines.find((line) => line.ref.startsWith('TAX'));
    if (bookingLine !== undefined) {
      if (taxLine !== undefined) {
        if (taxLine.qty === bookingLine.qty) {
          if (
            new Date(bookingLine.array_options.options_lin_datedebut).setHours(0, 0, 0) ===
            new Date(taxLine.array_options.options_lin_datedebut).setHours(0, 0, 0) &&
            new Date(bookingLine.array_options.options_lin_datedebut).setHours(0, 0, 0) ===
            new Date(taxLine.array_options.options_lin_datedebut).setHours(0, 0, 0)
          ) {
            inThisOrder = true;
          } else {
            inThisOrder = false;
          }
        } else {
          inThisOrder = false;
        }
      } else {
        inThisOrder = false; // no tax line
      }
    } // No booking line, no computation
  }
  return inThisOrder;
}

/**
 * Order consistancy : HEB, TAX, REP dates are consistant with qty
 * @param {*} order
 * @param {*} invoiceId
 * @todo : finish the function
 */
export function getOrderDatesQtyconsistancy(order) {
  let inThisOrder = null;
  if (order !== undefined && order.lines !== undefined) {
    const bookingLine = order.lines.find((line) => line.ref.startsWith('HEB'));
    if (bookingLine !== undefined) {
      const bookingDaysNumber = Math.round(
        (new Date(bookingLine.array_options.options_lin_datefin * 1000) -
          new Date(bookingLine.array_options.options_lin_datedebut * 1000)) /
        86400000
      );
      if (bookingDaysNumber + 1 === parseInt(bookingLine.qty)) {
        inThisOrder = true;
      } else {
        inThisOrder = false;
        return inThisOrder;
      }
    }
    const taxLine = order.lines.find((line) => line.ref.startsWith('TAX'));
    if (taxLine !== undefined) {
      const bookingDaysNumber = Math.round(
        (new Date(taxLine.array_options.options_lin_datefin * 1000) -
          new Date(taxLine.array_options.options_lin_datedebut * 1000)) /
        86400000
      );
      if (bookingDaysNumber + 1 === parseInt(taxLine.qty)) {
        inThisOrder = true;
      } else {
        inThisOrder = false;
        return inThisOrder;
      }
    }
    const mealLines = order.lines.filter((line) => line.ref.startsWith('REP'));
    if (mealLines !== undefined) {
      let newMeallines = [];
      if (!Array.isArray(mealLines)) {
        newMeallines.push(mealLines);
      } else {
        newMeallines = [...mealLines];
      }

      newMeallines.map((mealLine) => {
        const mealLineDaysNumber = Math.round(
          (new Date(mealLine.array_options.options_lin_datefin * 1000) -
            new Date(mealLine.array_options.options_lin_datedebut * 1000)) /
          86400000
        );
        if (mealLineDaysNumber + 1 === parseInt(mealLine.qty)) {
          inThisOrder = true;
        } else {
          inThisOrder = false;
          return inThisOrder;
        }
      });
    }
    /*   let sessionLine = order.lines.find((line) => line.ref.startsWith('STA'));
          if (sessionLine !== undefined) {
            if (sessionLine.array_options.options_lin_datedebut !== null && sessionLine.array_options.options_lin_datefin !== null) {
              let mealLines = order.lines.filter((mealLine) => mealLine.ref.startwiths("REP"));
              mealLines.map((mealLine) => {
                let startOffsetDays = abs(Math.round((new Date(mealLine.array_options.options_lin_datebebut * 1000) - new Date(sessionLine.array_options.options_lin_datedebut * 1000)) / 86400000));
                if (startOffsetDays > 30) {
                  inThisOrder = false;
                }
              })
                
            } else {
              inThisOrder = false;
            }
          } */
  }
  return inThisOrder;
}

/**
 * Order consistancy : test if REP has a rep type
 * @param {*} order
 * @param {*} invoiceId
 * @todo : finish the function
 */
export function getOrderRepConsistancy(order) {
  let hasNotMealType = false;
  if (order !== undefined && order.lines !== undefined) {
    const mealLines = order.lines.filter((line) => line.ref.startsWith('REP'));
    if (mealLines !== undefined) {
      mealLines.map((mealLine) => {
        if (mealLine.array_options.options_lin_room === null) hasNotMealType = true;
      });
    }
  }

  return hasNotMealType;
}
/**
 * Returns the order total billed
 * @param {*} order
 * @param {*} invoiceId
 * @returns {number} the amount billed for this order
 */
export function getOrderBilledAmount(order) {
  let totalBilled = 0;

  order.linkedInvoices.forEach((invoice) => {
    if (invoice.statut !== '0' && invoice.statut !== '3') {
      // we don't care about draft invoices
      totalBilled += parseFloat(invoice.total_ttc);
    }
  });
  return totalBilled;
}

/**
 * Returns the order total paid
 * @param {*} order
 * @param {*} invoiceId
 * @returns {number} the total paid for this order
 */
export function getOrderPaidAmount(order) {
  let totalPaid = 0;
  order.linkedInvoices.forEach((invoice) => {
    if (invoice.statut === '2') {
      // we don't care about draft invoices
      const usedCreditNoteLine = invoice.lines.filter((line) => line.desc === '(CREDIT_NOTE)');
      if (!usedCreditNoteLine.length > 0) {
        totalPaid += parseFloat(invoice.total_ttc);
      } else {
        totalPaid += invoice.total_ttc - usedCreditNoteLine[0].total_ttc; // *** For invoices with credit note used, we substract  the amount of the line.
      }
    }
  });
  return totalPaid;
}

/*****************************************************************************
/**
* Evaluate global status of an order
 * @param {*} orderParam 
 * @returns {number} status code
 */
export function getevaluateOrderGlobalStatusCode(order) {
  let globalStatus = 0;
  // let order = orderParam;

  // *** get the invoices and sort the invoices by creation date
  let orderLinkedInvoices = order.linkedInvoices;
  orderLinkedInvoices = orderLinkedInvoices.sort((a, b) => a.date_creation - b.date_creation);

  orderLinkedInvoices = orderLinkedInvoices.filter(
    (invoice) => invoice.statut === '2' || invoice.statut === '1'
  );
  // *** Brouillon
  if (order.statut === '0') {
    if (orderLinkedInvoices.length === 0) {
      globalStatus = 1;
    } else {
      globalStatus = 14;
    }

    // *** Commande Validée
  } else if (order.statut === '1') {
    // ** Comande validée sans facture
    if (orderLinkedInvoices.length === 0) {
      globalStatus = 2;
    } else {
      //******* Commande validée avec 1 facture ************************************ */
      // *** Commandee validée avec une facture
      if (orderLinkedInvoices.length === 1) {
        if (orderLinkedInvoices[0].type === '0') {
          if (
            Math.round(parseFloat(order.total_ttc) * 100) / 100 ===
            Math.round(parseFloat(getOrderBilledAmount(order)) * 100) / 100
          ) {
            if (
              Math.round(parseFloat(order.total_ttc) * 100) / 100 ===
              Math.round(parseFloat(getOrderPaidAmount(order)) * 100) / 100
            ) {
              globalStatus = 16;
            } else {
              globalStatus = 17;
            }
          } else {
            globalStatus = 18; // *** Ordered!=invoiced
          }
        } else if (orderLinkedInvoices[0].type === '3') {
          if (
            Math.round(parseFloat(getOrderBilledAmount(order)) * 100) / 100 ===
            Math.round(parseFloat(getOrderPaidAmount(order)) * 100) / 100
          ) {
            globalStatus = 19;
          } else {
            globalStatus = 20;
          }
        } else {
          globalStatus = -1;
        }

        //*** Commande validée avec 2 factures  ********************************************** */
      } else if (orderLinkedInvoices.length === 2) {
        if (orderLinkedInvoices[0].type === '3') {
          //* 1rst is a deposit invoice
          // if (orderLinkedInvoices[1].type === '0') { //* 2nd is standard invoice - cas standard deposit and standard

          // *** acompte et standard, payées
          // if (orderLinkedInvoices[0].statut === '2' && orderLinkedInvoices[1].statut === '2') {
          if (
            Math.round(parseFloat(order.total_ttc) * 100) / 100 ===
            Math.round(parseFloat(getOrderBilledAmount(order)) * 100) / 100
          ) {
            if (
              Math.round(parseFloat(order.total_ttc) * 100) / 100 ===
              Math.round(parseFloat(getOrderPaidAmount(order)) * 100) / 100
            ) {
              globalStatus = 16; // *** Ordered=invoiced = paid
            } else {
              globalStatus = 17; // *** Ordered=invoiced != paid
            }
          } else {
            if (
              Math.round(parseFloat(order.total_ttc) * 100) / 100 <
              Math.round(parseFloat(getOrderBilledAmount(order)) * 100) / 100
            )
              globalStatus = 22;
            else globalStatus = 18; // *** Ordered!=invoiced
          }
        } else if (orderLinkedInvoices[1].type === '2') {
          //* 1rst is standard invoice 2nd is creditnote
          globalStatus = 9;
          //   //TODO Compute payment status

          // ** 1rst is a standard invoice
        } else if (orderLinkedInvoices[0].type === '0') {
          if (
            Math.round(parseFloat(order.total_ttc) * 100) / 100 ===
            Math.round(parseFloat(getOrderBilledAmount(order)) * 100) / 100
          ) {
            if (
              Math.round(parseFloat(order.total_ttc) * 100) / 100 ===
              Math.round(parseFloat(getOrderPaidAmount(order)) * 100) / 100
            ) {
              globalStatus = 16; // *** Ordered=invoiced = paid
            } else {
              globalStatus = 17; // *** Ordered=invoiced != paid
            }
          } else {
            globalStatus = 18; // *** Ordered!=invoiced
          }
        } else {
          globalStatus = -1;
        }

        //*** Commande validée plus de 2 factures  ********************************************** */
      } else if (orderLinkedInvoices.length >= 3) {
        globalStatus = 14;

        if (
          Math.round(parseFloat(order.total_ttc) * 100) / 100 ===
          Math.round(parseFloat(getOrderBilledAmount(order)) * 100) / 100
        ) {
          if (
            Math.round(parseFloat(order.total_ttc) * 100) / 100 ===
            Math.round(parseFloat(getOrderPaidAmount(order)) * 100) / 100
          ) {
            globalStatus = 16; // *** Ordered=invoiced = paid
          } else {
            globalStatus = 17; // *** Ordered=invoiced != paid
          }
        } else {
          globalStatus = 18; // *** Ordered!=invoiced
        }
      } else {
        globalStatus = 99;
      }
    }
    // *** Annulée
  } else if (order.statut === '-1') {
    globalStatus = 10;
  } else if (order.statut === '3') {
    // Traitée
    globalStatus = 13;
  }
  return globalStatus;
}

/**
 * get the status of the order
 * @param {*} order
 * @returns {string} the string to be displayed
 */
export function getevaluateOrderGlobalStatus(order) {
  const globalStatus = getevaluateOrderGlobalStatusCode(order);
  // return (dispatch) => {
  return globalStatus === 0
    ? 'Statut non déterminé, situation non traitée'
    : globalStatus === -1
      ? 'Anomalie'
      : globalStatus === 1
        ? 'Réservation brouillon'
        : globalStatus === 2
          ? 'Inscription validée, sans facture'
          : // : globalStatus === 3
          //   ? "Réservation facturée"
          //   : globalStatus === 4
          //     ? "Réservation réglée"
          globalStatus === 5
            ? 'Réservation réglée, inscription facturée'
            : globalStatus === 6
              ? 'Réservation réglée, inscription réglée'
              : globalStatus === 7
                ? 'Inscription (sans réservation)  réglée'
                : globalStatus === 8
                  ? 'Inscription (sans réservation), facturée'
                  : // : globalStatus === 9
                  //   ? "Réservation cours de modification"
                  globalStatus === 10
                    ? 'Inscription annulée'
                    : globalStatus === 11
                      ? 'Réservation non réglée, inscription réglée'
                      : globalStatus === 12
                        ? 'Réservation non réglée, inscription non réglée'
                        : globalStatus === 13
                          ? 'Inscription clôturée'
                          : globalStatus === 14
                            ? 'Inscription en cours de modification '
                            : // : globalStatus === 15
                            //   ? "Inscription en cours d'annulation"
                            globalStatus === 16
                              ? 'Inscription réglée  '
                              : globalStatus === 17
                                ? 'Inscription à encaisser  '
                                : globalStatus === 18
                                  ? 'Inscription à facturer  '
                                  : globalStatus === 19
                                    ? 'Réservation réglée  '
                                    : globalStatus === 20
                                      ? 'Réservation à encaisser  '
                                      : globalStatus === 21
                                        ? 'Réservation à facturer  '
                                        : globalStatus === 22
                                          ? 'Facturé est supérieur au montant de la commande  '
                                          : globalStatus === 99
                                            ? "Inscription complexe, Analyse impossible, contacter l'administrateur"
                                            : "Analyse impossible, contacter l'administrateur";
}

/*********************************************************************** */
// *** Needs engine   **************************************************/
/**
 * When the user choose a course, we have to prepare the display of the course checkboses,
 * all course participation ...
 * Build the registration data structure
 * @param {*} productTemp the current session
 * @param (*) checkDefaultState : the ckeckboxes default state (true or false).
 * @return :
 */
export function computeChosenCourse(productTemp, checkDefaultState) {
  //
  // setlocalError("");
  const registration = {};
  registration.product = productTemp;

  // *** Compute course days number
  registration.datedebutStr = productTemp.array_options['options_sta_datedebut'];
  registration.datefinStr = productTemp.array_options['options_sta_datefin'];
  registration.datedebut = new Date(registration.datedebutStr * 1000);
  registration.datefin = new Date(registration.datefinStr * 1000);
  if (registration.datedebutStr !== '' && registration.datefinStr !== '') {
    registration.nbJoursStage = Math.floor(
      (registration.datefin.getTime() - registration.datedebut.getTime()) / (1000 * 3600 * 24) +
      1 +
      2
    );
  } else {
    console.log('Dates de stage invalides');
    // setlocalError("Dates de stage invalides");
    return null;
  }

  registration.datedebut = new Date(registration.datedebut.getTime() - 1000 * 3600 * 24);
  registration.datefin = new Date(registration.datefin.getTime() + 1000 * 3600 * 24);

  // *** Compute day's dates
  registration.tabBusyLigneColonne = new Array(registration.nbJoursStage);
  for (let ligne = 0; ligne < registration.nbJoursStage; ++ligne) {
    const datedebutemp = new Date(registration.datedebut);
    registration.tabBusyLigneColonne[ligne] = new Date(
      datedebutemp.setDate(registration.datedebut.getDate() + ligne)
    ).getTime();
  }

  // *** participation
  registration.tabBusyParticipation = new Array(registration.nbJoursStage);
  registration.tabBusyParticipation.fill(true);
  registration.tabBusyParticipation[0] = null;
  registration.tabBusyParticipation[registration.tabBusyParticipation.length - 1] = null;

  // *** petit déjeuners
  registration.veggie = checkDefaultState;

  registration.tabBusyBreakfast = new Array(registration.nbJoursStage);
  registration.tabBusyBreakfast.fill(checkDefaultState);
  registration.tabBusyBreakfast[0] = false;

  // *** déjeuner
  registration.tabBusyLunch = new Array(registration.nbJoursStage);
  registration.tabBusyLunch.fill(checkDefaultState);
  registration.tabBusyLunch[0] = false;
  registration.tabBusyLunch[registration.tabBusyLunch.length - 1] = false;
  // *** diner
  registration.tabBusyDiner = new Array(registration.nbJoursStage);
  registration.tabBusyDiner.fill(checkDefaultState);
  registration.tabBusyDiner[registration.tabBusyDiner.length - 1] = false;

  // *** hosting
  registration.tabBusyHosting = new Array(registration.nbJoursStage);
  registration.tabBusyHosting.fill(checkDefaultState);
  registration.tabBusyHosting[registration.tabBusyHosting.length - 1] = false;

  registration.hostingtype = -1;
  // *** Log registration object
  // console.log(JSON.stringify(registration));

  return registration;
  //
}

/**
 * Compute the registration structure for a session and returns the order lines to be inserted
 * in the order
 * @param {*} registration
 * @version 2
 * @returns : an array of order lines
 */
export function computeRegistrationv2(registration) {
  // *** Check configuration
  if (
    !getConfigurationValue('MMealDay') ||
    !getConfigurationValue('PMealDay') ||
    !getConfigurationValue('SMealDay') ||
    !getConfigurationValue('RefTaxes')
  ) {
    // setlocalError("Configuration manquante, impossible de calculer, veuillez contacter l'administrateur");
    throw new Error('Erreur lors de la lecture de la configuration');
  }

  //** Check input parameters  */
  if (!registration || !registration.product) {
    throw new Error('Veuillez choisir un stage');
  }

  if (!registration.tabBusyParticipation.includes(true)) {
    throw new Error('Veuillez sélectionner au moins un jour de participation au stage');
  }

  if (registration.tabBusyHosting.includes(true) && !registration.hostingType) {
    throw new Error("Si vous demandez des hébergements, il faut choisir un type d'hébergement");
  }

  if (
    (registration.tabBusyBreakfast.includes(true) ||
      registration.tabBusyLunch.includes(true) ||
      registration.tabBusyDiner.includes(true)) &&
    !registration.mealType
  ) {
    throw new Error('Si vous demandez des repas, il faut choisir un régime de repas');
  }

  const computedOrderlines = [];
  let startDate = '';
  let endDate = '';

  let computeddintakeplace;
  if (registration.intakeplace !== null && typeof registration.intakeplace === 'object')
    computeddintakeplace = registration.intakeplace.rowid;
  else computeddintakeplace = '';
  // *** participation  **************************************************
  let startItem = -1;
  registration.tabBusyParticipation.forEach(function (item, index) {
    if (item) {
      if (startItem === -1) {
        startItem = index;
      } else {
        // if (startItem > -1) { //  && index === registration.tabBusyParticipation.length - 1
        //   console.log("Période : " + new Date(registration.tabBusyLigneColonne[startItem]) + " - " + new Date(registration.tabBusyLigneColonne[index - 1]));
        //   startItem = -1;
        //  }
      }
    } else {
      if (startItem > -1) {
        startDate = registration.tabBusyLigneColonne[startItem] / 1000;
        endDate = registration.tabBusyLigneColonne[index - 1] / 1000;
        const newLine = {
          fk_product: registration.product.id,
          array_options: {
            options_lin_datedebut: registration.tabBusyLigneColonne[startItem] / 1000,
            options_lin_datefin: registration.tabBusyLigneColonne[index - 1] / 1000,
            options_lin_room: null,
          },
          qty: index - startItem,
          subprice: registration.product.multiprices_ttc[1],
        };
        computedOrderlines.push(newLine);
        startItem = -1;
      }
    }
  });

  if (startItem > -1) {
    const newLine = {
      fk_product: registration.product.id,
      array_options: {
        options_lin_datedebut: registration.tabBusyLigneColonne[startItem] / 1000,
        options_lin_datefin:
          registration.tabBusyLigneColonne[registration.tabBusyParticipation.length - 1] / 1000,
        options_lin_room: null,
        lin_intakeplace: computeddintakeplace,
      },
      qty: registration.tabBusyParticipation.length - startItem,
      subprice: registration.product.multiprices_ttc[1],
    };
    computedOrderlines.push(newLine);
  }

  // *** Repas **************************************************
  // *** Breakfast
  startItem = -1;
  registration.tabBusyBreakfast.forEach(function (item, index) {
    if (item) {
      if (startItem === -1) {
        startItem = index;
      } else {
        // if (startItem > -1) { //  && index === registration.tabBusyParticipation.length - 1
        //   console.log("Période : " + new Date(registration.tabBusyLigneColonne[startItem]) + " - " + new Date(registration.tabBusyLigneColonne[index - 1]));
        //   startItem = -1;
        //  }
      }
    } else {
      if (startItem > -1) {
        const newLine = {
          fk_product: getConfigurationValue('PMealDay'),
          array_options: {
            options_lin_datedebut: registration.tabBusyLigneColonne[startItem] / 1000,
            options_lin_datefin: registration.tabBusyLigneColonne[index - 1] / 1000,
            options_lin_room: registration.mealType.rowid,
            lin_intakeplace: computeddintakeplace,
            //, "options_lin_mealtype": null
          },
          qty: index - startItem,
          subprice: registration.product.multiprices_ttc[1],
        };
        computedOrderlines.push(newLine);
        startItem = -1;
      }
    }
  });

  if (startItem > -1) {
    const newLine = {
      fk_product: getConfigurationValue('PMealDay'),
      array_options: {
        options_lin_datedebut: registration.tabBusyLigneColonne[startItem] / 1000,
        options_lin_datefin:
          registration.tabBusyLigneColonne[registration.tabBusyParticipation.length - 1] / 1000,
        options_lin_room: registration.mealType.rowid,
        lin_intakeplace: computeddintakeplace,
      },
      qty: registration.tabBusyParticipation.length - startItem,
      subprice: registration.product.multiprices_ttc[1],
    };
    computedOrderlines.push(newLine);
  }

  // *** lunch
  startItem = -1;
  registration.tabBusyLunch.forEach(function (item, index) {
    if (item) {
      if (startItem === -1) {
        startItem = index;
      } else {
        // if (startItem > -1) { //  && index === registration.tabBusyParticipation.length - 1
        //   console.log("Période : " + new Date(registration.tabBusyLigneColonne[startItem]) + " - " + new Date(registration.tabBusyLigneColonne[index - 1]));
        //   startItem = -1;
        //  }
      }
    } else {
      if (startItem > -1) {
        const newLine = {
          fk_product: getConfigurationValue('MMealDay'),
          array_options: {
            options_lin_datedebut: registration.tabBusyLigneColonne[startItem] / 1000,
            options_lin_datefin: registration.tabBusyLigneColonne[index - 1] / 1000,
            options_lin_room: registration.mealType.rowid,
            lin_intakeplace: computeddintakeplace,
          },
          qty: index - startItem,
          subprice: registration.product.multiprices_ttc[1],
        };
        computedOrderlines.push(newLine);
        startItem = -1;
      }
    }
  });

  if (startItem > -1) {
    const newLine = {
      fk_product: getConfigurationValue('MMealDay'),
      array_options: {
        options_lin_datedebut: registration.tabBusyLigneColonne[startItem] / 1000,
        options_lin_datefin:
          registration.tabBusyLigneColonne[registration.tabBusyParticipation.length - 1] / 1000,
        options_lin_room: registration.mealType.rowid,
        lin_intakeplace: computeddintakeplace,
      },
      qty: registration.tabBusyParticipation.length - startItem,
      subprice: registration.product.multiprices_ttc[1],
    };
    computedOrderlines.push(newLine);
  }

  // *** Diner
  startItem = -1;
  registration.tabBusyDiner.forEach(function (item, index) {
    if (item) {
      if (startItem === -1) {
        startItem = index;
      } else {
        // if (startItem > -1) { //  && index === registration.tabBusyParticipation.length - 1
        //   console.log("Période : " + new Date(registration.tabBusyLigneColonne[startItem]) + " - " + new Date(registration.tabBusyLigneColonne[index - 1]));
        //   startItem = -1;
        //  }
      }
    } else {
      if (startItem > -1) {
        const newLine = {
          fk_product: getConfigurationValue('SMealDay'),
          array_options: {
            options_lin_datedebut: registration.tabBusyLigneColonne[startItem] / 1000,
            options_lin_datefin: registration.tabBusyLigneColonne[index - 1] / 1000,
            options_lin_room: registration.mealType.rowid,
            lin_intakeplace: computeddintakeplace,
          },
          qty: index - startItem,
          subprice: registration.product.multiprices_ttc[1],
        };
        computedOrderlines.push(newLine);
        startItem = -1;
      }
    }
  });

  if (startItem > -1) {
    const newLine = {
      fk_product: getConfigurationValue('SMealDay'),
      array_options: {
        options_lin_datedebut: registration.tabBusyLigneColonne[startItem] / 1000,
        options_lin_datefin:
          registration.tabBusyLigneColonne[registration.tabBusyParticipation.length - 1] / 1000,
        options_lin_room: registration.mealType,
        lin_intakeplace: computeddintakeplace,
      },
      qty: registration.tabBusyParticipation.length - startItem,
      subprice: registration.product.multiprices_ttc[1],
    };
    computedOrderlines.push(newLine);
  }

  // *** Hébergement **************************************************
  let startItemHosting = -1;
  registration.tabBusyHosting.forEach(function (item, index) {
    if (item) {
      if (startItemHosting === -1) {
        startItemHosting = index;
      } else {
        // if (startItem > -1) { //  && index === registration.tabBusyParticipation.length - 1
        //   console.log("Période : " + new Date(registration.tabBusyLigneColonne[startItem]) + " - " + new Date(registration.tabBusyLigneColonne[index - 1]));
        //   startItem = -1;
        //  }
        console.log(
          "Hosting : cas de startItemHosting ===-1, nous n'avons pas prévu de traitement, Est-ce une erreur ?"
        );
      }
    } else {
      if (startItemHosting > -1) {
        // *** Insert hosting
        computedOrderlines.push({
          fk_product: registration.hostingType,
          array_options: {
            options_lin_datedebut: registration.tabBusyLigneColonne[startItemHosting] / 1000,
            options_lin_datefin: registration.tabBusyLigneColonne[index - 1] / 1000,
            options_lin_room: null,
            options_roomid: '0',
          },
          qty: index - startItemHosting,
        });

        // *** Insert Taxes
        computedOrderlines.push({
          fk_product: getConfigurationValue('RefTaxes'), // '372',
          array_options: {
            options_lin_datedebut: registration.tabBusyLigneColonne[startItemHosting] / 1000,
            options_lin_datefin: registration.tabBusyLigneColonne[index - 1] / 1000,
            options_lin_room: null,
            options_roomid: '0',
          },
          qty: index - startItemHosting,
        });

        startItemHosting = -1;
      }
    }
  });
  if (startItemHosting > -1) {
    // *** Insert hosting
    computedOrderlines.push({
      fk_product: registration.hostingType,
      array_options: {
        options_lin_datedebut: registration.tabBusyLigneColonne[startItemHosting] / 1000,
        options_lin_datefin:
          registration.tabBusyLigneColonne[registration.tabBusyParticipation.length - 1] / 1000,
      },
      qty: registration.tabBusyParticipation.length - startItemHosting,
    });

    // *** Insert Taxes
    computedOrderlines.push({
      fk_product: getConfigurationValue('RefTaxes'), // '372',
      array_options: {
        options_lin_datedebut: registration.tabBusyLigneColonne[startItemHosting] / 1000,
        options_lin_datefin:
          registration.tabBusyLigneColonne[registration.tabBusyParticipation.length - 1] / 1000,
      },
      qty: registration.tabBusyParticipation.length - startItemHosting,
    });
  }
  // ** Translation language

  if (
    registration.translationlanguage !== null &&
    typeof registration.translationlanguage === 'object'
  ) {
    // *** Insert Taxes
    computedOrderlines.push({
      fk_product: registration.translationlanguage.id, // '372',
      array_options: {
        options_lin_datedebut: startDate,
        options_lin_datefin: endDate,
        options_lin_room: null,
      },
      qty: 1,
    });
  }
  return computedOrderlines;
}

/**
 * Compute the registration structure for a retreat  and retuns the order lines to be inserted in the order
 * @param {*} registration
 * @param {*} checkDefaultState
 * @returns {*} array of order lines
 */
export function computeRetreatRegistration(registration) {
  const computedOrderlines = [];

  const startDate = new Date(registration.startDate);
  const endDate = new Date(registration.endDate);
  const daysNumber = (endDate - startDate) / 86400000 + 1;

  // *** CHeck input parameters
  if (!(startDate instanceof Date || isNaN(startDate.valueOf()))) {
    throw new Error('Date de début de période invalide ');
  }

  if (!(endDate instanceof Date || isNaN(endDate.valueOf()))) {
    throw new Error('Date de fin de période invalide ');
  }

  if (startDate > endDate) {
    throw new Error(
      'Outil Prestation complète retraite : erreur date de début supérieure à la date de fin '
    );
  }
  if ((new Date(endDate) - new Date(startDate)) / 86400000 + 1 > 200)
    throw new Error('La période de retraite ne peut être supérieure à 200 jours ');

  if (
    (registration.breakfast || registration.lunch || registration.diner) &&
    !registration.mealType
  ) {
    throw new Error('Si vous demandez des repas, il faut choisir un régime de repas');
  }

  // *** Check configuration
  if (
    !getConfigurationValue('PMealDay') ||
    !getConfigurationValue('MMealDay') ||
    !getConfigurationValue('SMealDay') ||
    !getConfigurationValue('RefTaxes')
  ) {
    throw new Error('La configuration des repas dans le fichier de configuration est invalide');
  }

  // *** Insert retreat
  const newLine = {
    fk_product: registration.product.id,
    array_options: {
      options_lin_datedebut: startDate,
      options_lin_datefin: endDate,
      options_lin_room: null,
      options_roomid: '0',
    },
    qty: daysNumber,
    subprice: registration.product.multiprices_ttc[1],
  };
  computedOrderlines.push(newLine);

  // *** Insert meals
  if (
    registration.breakfast !== null ||
    registration.lunch !== null ||
    registration.diner !== null
  ) {
    // const mealPMSTypeId = '';
    // const intakeplace = '';
    // the intake place is the same for all mealtypes
    //    if (registration.intakeplacebreakfast === registration.intakeplacelunch && registration.intakeplacelunch === registration.intakeplacediner) {

    /*      if (registration.breakfast && registration.lunch && registration.diner) {
                mealPMSTypeId = getConfigurationValue('PMSMealDay')
        
              } else if (registration.breakfast && registration.lunch && !registration.diner) {
                mealPMSTypeId = getConfigurationValue('PMMealDay');
        
              } else if (registration.breakfast && !registration.lunch && registration.diner) {
                mealPMSTypeId = getConfigurationValue('PSMealDay');
        
              } else if (!registration.breakfast && registration.lunch && registration.diner) {
                mealPMSTypeId = getConfigurationValue('MSMealDay');
        
              } else if (registration.breakfast && !registration.lunch && !registration.diner) {
                mealPMSTypeId = getConfigurationValue('PMealDay');
        
              } else if (!registration.breakfast && registration.lunch && !registration.diner) {
                mealPMSTypeId = getConfigurationValue('MMealDay');
              } else if (!registration.breakfast && !registration.lunch && registration.diner) {
                mealPMSTypeId = getConfigurationValue('SMealDay');
              }
               computedOrderlines.push({
                "fk_product": mealPMSTypeId, // 371',
                "array_options": {
                  "options_lin_datedebut": startDate,
                  "options_lin_datefin": endDate,
                  "options_lin_room": registration.mealType.rowid,
                  "options_lin_intakeplace": registration.intakeplacediner,
                  // "options_lin_mealtype": registration.mealType
                },
                "qty": daysNumber
              });
         */
    //   } else {
    if (registration.breakfast !== null) {
      computedOrderlines.push({
        fk_product: getConfigurationValue('PMealDay'), // 371',
        array_options: {
          options_lin_datedebut: startDate,
          options_lin_datefin: endDate,
          options_lin_room: registration.mealType.rowid,
          options_lin_intakeplace: registration.intakeplace,
          // "options_lin_mealtype": registration.mealType
        },
        qty: daysNumber,
      });
    }

    if (registration.lunch !== null) {
      computedOrderlines.push({
        fk_product: getConfigurationValue('MMealDay'), // 371',
        array_options: {
          options_lin_datedebut: startDate,
          options_lin_datefin: endDate,
          options_lin_room: registration.mealType.rowid,
          options_lin_intakeplace: registration.intakeplace,
          //"options_lin_mealtype": registration.mealType
        },
        qty: daysNumber,
      });
    }

    if (registration.diner !== null) {
      computedOrderlines.push({
        fk_product: getConfigurationValue('SMealDay'), // 371',
        array_options: {
          options_lin_datedebut: startDate,
          options_lin_datefin: endDate,
          options_lin_room: registration.mealType.rowid,
          options_roomid: '0',
          options_lin_intakeplace: registration.intakeplace,
          // "options_lin_mealtype": registration.mealType
        },
        qty: daysNumber,
      });
    }
    //}
  }

  // *** Insert hosting
  if (registration.hostingType !== null) {
    computedOrderlines.push({
      fk_product: registration.hostingType.id,
      array_options: {
        options_lin_datedebut: startDate,
        options_lin_datefin: endDate,
        options_lin_room: null,
        options_roomid: '0',
      },
      qty: daysNumber,
    });

    // *** Insert Taxes
    computedOrderlines.push({
      fk_product: getConfigurationValue('RefTaxes'),
      array_options: {
        options_lin_datedebut: startDate,
        options_lin_datefin: endDate,
        options_lin_room: null,
        options_roomid: '0',
      },
      qty: daysNumber,
    });
  }

  return computedOrderlines;
}
