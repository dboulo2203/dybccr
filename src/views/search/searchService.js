import { getAppPath } from '../../shared/commonServices/commonFunctions.js'

export async function getPersonforCriteria(searchCriteria) {

    // TODO : tester la validité des paramètres

    let wsUrl = `${getAppPath()}/api/index.php/searchperson/${searchCriteria}`;
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


export async function getPersonforActivity(act_id) {

    // TODO : tester la validité des paramètres

    let wsUrl = `${getAppPath()}/api/index.php/searchpersonbyactivity/${act_id}`;
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
        console.log("getPersonforActivity  await ok ");
        return (data);

    } else {
        console.log(`getPersonforActivity Error: ${JSON.stringify(responsefr)} `);
        throw new Error("getPersonforActivity Error message : " + responsefr.status + " " + responsefr.statusText);
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
        console.log("getActivities  await ok ");
        return (data);

    } else {
        console.log(`getActivities Error: ${JSON.stringify(responsefr)} `);
        throw new Error("getActivities Error message : " + responsefr.status + " " + responsefr.statusText);
    }
}