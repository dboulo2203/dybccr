import { getAppPath } from '../../shared/commonServices/commonFunctions.js'

export async function getPersonforCriteria(searchCriteria) {

    // TODO : tester la validité des paramètres

    let wsUrl = `${getAppPath()}/src/api/index.php/searchperson/${searchCriteria}`;
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

    let wsUrl = `${getAppPath()}/src/api/index.php/searchpersonbyactivity/${act_id}`;
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
        console.log(`getPersonforCriteria Error: ${JSON.stringify(responsefr)} `);
        throw new Error("getPersonforCriteria Error message : " + responsefr.status + " " + responsefr.statusText);
    }
}


export async function getActivities() {

    // TODO : tester la validité des paramètres

    let wsUrl = `${getAppPath()}/src/api/index.php/activities`;
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
 * Get the current persons list
 * @returns 
 */
export function getList() {
    let personList = null;
    // sessionStorage.setItem("personList", JSON.stringify(data));
    let personListJson = sessionStorage.getItem("personList");
    if (personListJson)
        personList = JSON.parse(personListJson);
    else
        personList = [];

    return personList;

}
/**
 * Add a list of persons of the current list
 * @param {*} newPersons 
 */
export function addList(newPersons) {
    let newPersonList = null;
    let personListJSon = sessionStorage.getItem("personList");
    if (personListJSon) {
        let currentPersonList = JSON.parse(personListJSon);
        newPersonList = currentPersonList.concat(newPersons);
        sessionStorage.setItem("personList", JSON.stringify(newPersonList));
    } else {
        sessionStorage.setItem("personList", JSON.stringify(newPersons));
    }
}
export function getSubList() {
    let personList = null;
    // sessionStorage.setItem("personSubList", JSON.stringify(data));
    let personListJson = sessionStorage.getItem("personsSubList");
    if (personListJson)
        personList = JSON.parse(personListJson);
    else
        personList = [];

    return personList;
}

export function removeSubList(subList) {
    let personList = [];
    let personListModified = [];
    let personListJson = sessionStorage.getItem("personList");
    if (personListJson) {
        personList = JSON.parse(personListJson);
        for (let i = 0; i < subList.length; i++) {
            let compa = subList[i].per_nom;
            let indexPerson = personList.findIndex(pers => pers.per_id === subList[i].per_id); //
            if (indexPerson >= 0) {
                personList.splice(indexPerson, 1);

            }
            console.log("found : " + indexPerson + "</br>");
        }
    }
    sessionStorage.setItem("personList", JSON.stringify(personList));
}
