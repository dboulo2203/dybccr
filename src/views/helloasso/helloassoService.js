import { getAppPath } from '../../shared/commonServices/commonFunctions.js'
// import { getPersonforCriteria } from '../shared/searchService.js'

export async function getAccessToken() {

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("Cookie", "__cf_bm=kWM_c5GMpZ70C1i6lomZfL6xl49S5RcMduZ3_AC11mM-1757683808-1.0.1.1-3oGsDnfXVKH5AjhDqaTgTmN3ovyQtiGEJsgwOZT38UFyJ3TZkw6NqdblVlGcIvJHL9ZVx3.9_yXdM0EzIQhCMZAT4WHhqVw1LZmIdNQIC0M");

    const urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "client_credentials");
    urlencoded.append("client_id", "24064197e198437f92759cc82c4d9f04");
    urlencoded.append("client_secret", "DvhBYv6E83nPV5piEmRGNxm93jL9A2R4");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    };

    // fetch("https://api.helloasso.com/oauth2/token", requestOptions)
    //     .then((response) => response.text())
    //     .then((result) => console.log(result))
    //     .catch((error) => console.error(error));

    // TODO : tester la validité des paramètres


    let responsefr = await fetch("https://api.helloasso.com/oauth2/token", requestOptions);

    if (responsefr.ok) {
        // *** Get the data and save in the sessionStorage
        const data = await responsefr.text();
        sessionStorage.setItem("accesstoken", JSON.stringify(data));
        console.log("getAccessToken  await ok ");
        return (data);

    } else {
        console.log(`getAccessToken Error: ${JSON.stringify(responsefr)
            } `);
        throw new Error("getAccessToken Error message : " + responsefr.status + " " + responsefr.statusText);
    }
}


/**
 * 
 * @param {*} access_token 
 * @returns 
 * 
 * TODO : manage number of forms (check that totalCount is < pageSize         "pageSize": 20, "totalCount": 68,)
 */
export async function getHelloassoForms(access_token) {

    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", "Bearer " + access_token);
    myHeaders.append("Cookie", "__cf_bm=ADvA2X_xRbnoWE8uOMWUZaIRxz8VtwSKv5IXUXFMmrw-1757689769-1.0.1.1-p8UXbythXR6wqLwq0a0Nt0tfnLjPHsO7CZ0Txg1_pKaig0H5n1RjlFj1c85LwK07hp8z69SprhpoCCcMRfHxv8V_Nf2VELUwYYwYkI4qyUo");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    let responsefr = await fetch("https://api.helloasso.com/v5/organizations/cercle-celtique-de-rennes/forms?states=public&pageSize=100", requestOptions);

    if (responsefr.ok) {
        // *** Get the data and save in the sessionStorage
        const data = await responsefr.json();
        sessionStorage.setItem("forms", JSON.stringify(data.data));
        console.log("getHelloassoForms  await ok ");
        return (data.data);

    } else {
        console.log(`getHelloassoForms Error: ${JSON.stringify(responsefr)
            } `);
        throw new Error("getHelloassoForms Error message : " + responsefr.status + " " + responsefr.statusText);
    }
}



/**
 * 
 * @param {*} access_token 
 * @returns 
 * 
 * TODO : manage number of forms (check that totalCount is < pageSize         "pageSize": 20, "totalCount": 68,)
 */
export async function getHelloassoFormOrders(access_token, formType, formSlug) {

    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", "Bearer " + access_token);
    myHeaders.append("Cookie", "__cf_bm=ADvA2X_xRbnoWE8uOMWUZaIRxz8VtwSKv5IXUXFMmrw-1757689769-1.0.1.1-p8UXbythXR6wqLwq0a0Nt0tfnLjPHsO7CZ0Txg1_pKaig0H5n1RjlFj1c85LwK07hp8z69SprhpoCCcMRfHxv8V_Nf2VELUwYYwYkI4qyUo");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    let responsefr = await fetch(`https://api.helloasso.com/v5/organizations/cercle-celtique-de-rennes/forms/${formType}/${formSlug}/items?withCount=true&withDetails=true`, requestOptions);

    if (responsefr.ok) {
        // *** Get the data and save in the sessionStorage
        const data = await responsefr.json();
        sessionStorage.setItem("orders", JSON.stringify(data.data));
        console.log("getHelloassoFormOrders  await ok ");
        return (data.data);

    } else {
        console.log(`getHelloassoFormOrders Error: ${JSON.stringify(responsefr)
            } `);
        throw new Error("getHelloassoFormOrders Error message : " + responsefr.status + " " + responsefr.statusText);
    }
}

/**
 * 
 * @param {*} formOrder 
 * @returns 
 */
export function parseHelloassoOrder(formOrder) {
    let order = {};
    if (formOrder.order.formType == "Membership") {
        order.order = {
            "id": formOrder.order.id,
            "date": formOrder.order.date,
            "formType": formOrder.order.formType
        }
        if (Array.isArray(formOrder.payments)) {
            order.payment = {
                "date": formOrder.payments[0].date,
                "amount": formOrder.payments[0].amount / 100,
                "state": formOrder.payments[0].state,
                "cashOutState": formOrder.payments[0].cashOutState
            };
        } else {
            if (order.payment) {
                order.payment = {
                    "date": formOrder.payments.date,
                    "amount": formOrder.payments.amount / 100,
                    "state": formOrder.payments.state,
                    "cashOutState": formOrder.payments.cashOutState
                };
            }
        }
        order.mainactivity = {
            "date": formOrder.order.date,
            "amount": formOrder.amount / 100,
            "form": formOrder.order.formSlug

        };
        order.user = {
            "email": formOrder.payer.email,
            "firstName": formOrder.payer.firstName,
            "lastName": formOrder.payer.lastName
        }
        // order.options = formOrder.options;
        order.activities = [];
        if (formOrder.options && Array.isArray(formOrder.options)) {
            formOrder.options.map((option, index) => {
                order.activities.push({
                    "code": option.name.substring(0, option.name.indexOf(' ')),
                    "amount": option.amount / 100,
                    "optionId": option.optionId,
                    "name": option.name
                });

            });
        }

    } else if (formOrder.order.formType == "Event") {
        order.order = {
            "id": formOrder.order.id,
            "date": formOrder.order.date,
            "formType": formOrder.order.formType
        }
        if (formOrder.payments) {
            if (Array.isArray(formOrder.payments)) {
                order.payment = {
                    "date": formOrder.payments[0].date,
                    "amount": formOrder.payments[0].amount / 100,
                    "state": formOrder.payments[0].state,
                    "cashOutState": formOrder.payments[0].cashOutState
                };
            } else {
                order.payment = {
                    "date": formOrder.payments.date,
                    "amount": formOrder.payments.amount / 100,
                    "state": formOrder.payments.state,
                    "cashOutState": formOrder.payments.cashOutState
                };
            }
            // } else {
            // order.payment = {
            //     "date": null,
            //     "amount": 0,
            //     "state": null,
            //     "cashOutState": null

            // };
        }
        order.user = {
            "email": formOrder.payer.email,
            "firstName": formOrder.payer.firstName,
            "lastName": formOrder.payer.lastName
        }
        order.mainactivity = {
            "date": formOrder.order.date,
            "amount": formOrder.amount / 100,
            "form": formOrder.order.formSlug
        };



    } else {
        order.order = { "formType": "Unknowned formType" }
    }

    //     outputStr += `<li class="" id="${formOrder.order.id}">
    //   Adhésion : ${formOrder.order.formName} </br>
    //   Adhérent : ${formOrder.payer.email} - ${formOrder.payer.firstName} ${formOrder.payer.lastName} </br>
    //   Commande :  ${formOrder.order.id} - ${formOrder.order.date} </br>
    //   Paiement : ${(formOrder.payments) ? formOrder.payments[0].date - formOrder.payments[0].amount / 100 - formOrder.payments[0].state + "</br>" : "No payment"}

    //   Activités : ${(formOrder.options) ? formOrder.options.map((optionThis, index) => optionThis.name + " - " + optionThis.amount / 100 + "€") + "</br>" : " Pas d'activité"}
    //   <hr/></li>`
    // } else if (formOrder.order.formType == "Event") {
    //     outputStr += `<li class="" id="${formOrder.order.id}">
    //   Event : ${formOrder.order.formName}</br>
    //   Adhérent : ${formOrder.payer.email} - ${formOrder.payer.firstName} ${formOrder.payer.lastName} </br>
    //   Commande :  ${formOrder.order.id} - ${formOrder.order.date} </br>
    //   Paiement : ${(formOrder.payments) ? formOrder.payments[0].amount - + "</br>" : "No payment</br>"}

    //   Activités : ${(formOrder.options) ? formOrder.options.map((optionThis, index) => optionThis.name + " - " + optionThis.amount / 100 + "€") + "</br>" : " Pas d'activité"}
    //   <hr/></li>`


    return order;
}


export async function checkHelloassoOrderForIntegration(order) {

    let messages = ""

    // *** Chech user in database
    let user = await getPersonforCriteriaV2(order.user.email);
    if (!user)
        // let user = " User existant";
        messages += "User : user not found" + "</br>";
    else
        messages += "User : " + JSON.stringify(user) + "</br>";

    /*** Chack subscription code */
    let activityData = await getActivityByCode(order.mainactivity.form);
    messages += "Mainactivity :" + JSON.stringify(activityData) + "</br>";


    /*** Check activity code */
    if (order.activities && Array.isArray(order.activities)) {
        for (let i = 0; i < order.activities.length; ++i) {
            let activityData = await getActivityByCode(order.activities[i].code);
            messages += "Activity :" + JSON.stringify(activityData) + "</br>";
        }
    }
    // order.activities.map(async (activity) => {

    //     let activityData = await getActivityByCode(activity.code);
    //     if (!activityData)
    //         // let user = " User existant";
    //         messages += "Activity Data not found" + "</br>";
    //     else
    //         messages += "Activity :" + JSON.stringify(activityData) + "</br>";

    // })

    return messages;

}

export async function getPersonforCriteriaV2(searchCriteria) {

    // TODO : tester la validité des paramètres

    let wsUrl = `${getAppPath()}/src/api/index.php/personbymail/${searchCriteria}`;
    let responsefr = await fetch(wsUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (responsefr.ok) {
        // *** Get the data and save in the sessionStorage
        const data = await responsefr.json();
        sessionStorage.setItem("personsSubList", JSON.stringify(data));
        console.log("getPersonforCriteria  await ok ");
        return (data);

    } else {
        console.log(`getPersonforCriteria Error: ${JSON.stringify(responsefr)
            } `);
        throw new Error("getPersonforCriteria Error message : " + responsefr.status + " " + responsefr.statusText);
    }
}


export async function getActivityByCode(act_key) {

    // TODO : tester la validité des paramètres

    let wsUrl = `${getAppPath()}/src/api/index.php/activitybycode/${act_key}`;
    let responsefr = await fetch(wsUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (responsefr.ok) {
        // *** Get the data and save in the sessionStorage
        const data = await responsefr.json();
        sessionStorage.setItem("activity", JSON.stringify(data));
        console.log("getActivityByCode  await ok ");
        return (data);

    } else {
        console.log(`getActivityByCode Error: ${JSON.stringify(responsefr)
            } `);
        throw new Error("getActivityByCode Error message : " + responsefr.status + " " + responsefr.statusText);
    }
}

export async function checkOrderIntegration(order) {

    // TODO : tester la validité des paramètres
    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let raw1 = JSON.stringify(order);
        const raw = JSON.stringify({
            "order": {
                "id": 146214707,
                "date": "2025-09-05T19:44:29.6691174+02:00",
                "formType": "Membership"
            },
            "user": {
                "email": "bonnierepatrick@yahoo.fr",
                "firstName": "Christine",
                "lastName": "Bonnière"
            },
            "mainactivity": {
                "date": "2025-09-05T19:44:29.6691174+02:00",
                "amount": 38,
                "form": "adhesions-et-inscriptions-au-cercle-celtique-de-rennes-saison-2025-2026"
            },
            "payment": {
                "date": "2025-09-05T19:44:29.6691174+02:00",
                "amount": 79,
                "state": "Authorized",
                "cashOutState": "Transfered"
            },
            "activities": [
                {
                    "code": "D01",
                    "amount": 41,
                    "optionId": 17567651,
                    "name": "D01 - Danse bretonne"
                }
            ]
        });
        console.log(raw);
        console.log(raw1);
        let wsUrl = `${getAppPath()}/src/api/index.php/checkorderintegration`;
        let responsefr = await fetch(wsUrl, {
            method: "POST",
            headers: myHeaders,
            body: raw1,
            redirect: "follow"
        }
        );
        if (responsefr.ok) {
            // *** Get the data and save in the sessionStorage
            const data = await responsefr.json();
            sessionStorage.setItem("checkOrderIntegration", JSON.stringify(data));
            console.log("checkOrderIntegration  await ok ");
            return (data);

        } else {
            console.log(`checkOrderIntegration Error: ${JSON.stringify(responsefr)
                } `);
            throw new Error("checkOrderIntegration Error message : " + responsefr.status + " " + responsefr.statusText);
        }

    } catch (error) {
        console.log("error checkOrderIntegration" + error)
    }
}

