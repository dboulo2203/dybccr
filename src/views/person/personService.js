// import { getAppPath } from '../../shared/commonServices/commonFunctions.js'

// export async function getPerson(pers_id) {

//     // TODO : tester la validité des paramètres

//     let wsUrl = `${getAppPath()}/api/index.php/person/${pers_id}`;
//     let responsefr = await fetch(wsUrl, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//         }
//     });
//     if (responsefr.ok) {
//         // *** Get the data and save in the sessionStorage
//         const data = await responsefr.json();
//         sessionStorage.setItem("person", JSON.stringify(data));
//         console.log("getPerson  await ok ");
//         return (data);

//     } else {
//         console.log(`getPerson Error: ${JSON.stringify(responsefr)
//             } `);
//         throw new Error("getPerson Error message : " + responsefr.status + " " + responsefr.statusText);
//     }
// }



/**
 * Update a person in the database
 * @param {string|number} per_id
 * @param {object} data - Fields to update
 * @returns {object} Updated person data
 */
export async function updatePerson(per_id, data) {

    const wsUrl = `${getAppPath()}/api/index.php/person/${per_id}`;
    const responsefr = await fetch(wsUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (responsefr.ok) {
        return await responsefr.json();
    } else {
        throw new Error('updatePerson Error: ' + responsefr.status + ' ' + responsefr.statusText);
    }
}

export async function getActivities() {

    // TODO : tester la validité des paramètres

    let wsUrl = `${getAppPath()}/api/index.php/activities`;
    let responsefr = await fetch(wsUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (responsefr.ok) {
        // *** Get the data and save in the sessionStorage
        const data = await responsefr.json();
        sessionStorage.setItem("activities", JSON.stringify(data));
        console.log("getPersonforCriteria  await ok ");
        return (data);

    } else {
        console.log(`getPersonforCriteria Error: ${JSON.stringify(responsefr)} `);
        throw new Error("getPersonforCriteria Error message : " + responsefr.status + " " + responsefr.statusText);
    }
}


/**
 * Convert a unix timestamp (seconds) to a date string yyyy-mm-dd for input[type=date]
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Date string in yyyy-mm-dd format
 */
function timestampToDateInput(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toISOString().split('T')[0];
}

/**
 * Return the string of the currency
 * @param {*} value
 * @returns String
 */
export function getFormattedCurrency(value) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(parseFloat(value));
}

/**
 * Return the string of the currency
 * @param {*} value
 * @returns String
 */
export function getFormattednumber(value) {
    return new Intl.NumberFormat('en-EN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(parseFloat(value));
}