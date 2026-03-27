// import { getAppPath } from '../../shared/commonServices/commonFunctions.js'


// /**
//  * Get the persons enrolled in a dyb activity
//  * @param {*} act_id
//  * @returns
//  */
// export async function getPersonsforActivity(act_id) {

//     // TODO : tester la validité des paramètres

//     let wsUrl = `${getAppPath()}/api/index.php/searchpersonbyactivity/${act_id}`;
//     let responsefr = await fetch(wsUrl, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//         }
//     });
//     if (responsefr.ok) {
//         // *** Get the data and save in the sessionStorage
//         const data = await responsefr.json();
//         sessionStorage.setItem("personsSubList", JSON.stringify(data));
//         console.log("getPersonsforActivity  await ok ");
//         return (data);

//     } else {
//         console.log(`getPersonsforActivity Error: ${JSON.stringify(responsefr)} `);
//         throw new Error("getPersonsforActivity Error message : " + responsefr.status + " " + responsefr.statusText);
//     }
// }

// /**
//  * Get the activities list
//  * @returns
//  */
// export async function getActivities() {

//     // TODO : tester la validité des paramètres

//     let wsUrl = `${getAppPath()}/api/index.php/activities`;
//     let responsefr = await fetch(wsUrl, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//         }
//     });
//     if (responsefr.ok) {
//         // *** Get the data and save in the sessionStorage
//         const data = await responsefr.json();
//         sessionStorage.setItem("activities", JSON.stringify(data));
//         console.log("getActivities  await ok ");
//         return (data);

//     } else {
//         console.log(`getActivities Error: ${JSON.stringify(responsefr)} `);
//         throw new Error("getActivities Error message : " + responsefr.status + " " + responsefr.statusText);
//     }
// }

// /**
//  * Get the activity data
//  * @param {*} act_id
//  * @returns
//  */
// export async function getActivity(act_id) {

//     // TODO : tester la validité des paramètres

//     let wsUrl = `${getAppPath()}/api/index.php/activities/` + act_id;
//     let responsefr = await fetch(wsUrl, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//         }
//     });
//     if (responsefr.ok) {
//         // *** Get the data and save in the sessionStorage
//         const data = await responsefr.json();
//         sessionStorage.setItem("activity", JSON.stringify(data));
//         console.log("getActivity  await ok ");
//         return (data);

//     } else {
//         console.log(`getActivity Error: ${JSON.stringify(responsefr)} `);
//         throw new Error("getActivity Error message : " + responsefr.status + " " + responsefr.statusText);
//     }
// }

// /**
//  * Get the users enrolled in a course in the MOOC
//  * @param {*} act_id
//  * @returns
//  */
// export async function getMoocPersonsforActivity(act_id) {

//     const myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
//     myHeaders.append("Cookie", "MoodleSession=e5ec50b873d57ab29b2ce9bf1c901478");

//     const urlencoded = new URLSearchParams();
//     urlencoded.append("wstoken", "8833c1c25621abe82528858eec7ecd2b");
//     urlencoded.append("wsfunction", "core_enrol_get_enrolled_users");
//     urlencoded.append("moodlewsrestformat", "json");
//     urlencoded.append("courseid", act_id);

//     const requestOptions = {
//         method: "POST",
//         headers: myHeaders,
//         body: urlencoded,
//         redirect: "follow"
//     };

//     let responsefr = await fetch("https://mooc.ccrennes.bzh/webservice/rest/server.php", requestOptions);

//     if (responsefr.ok) {
//         // *** Get the data and save in the sessionStorage
//         const data = await responsefr.json();
//         sessionStorage.setItem("moccPersons", JSON.stringify(data));
//         // console.log("getPersonforCriteria  await ok ");
//         return (data);

//     } else {
//         console.log(`getMoocPersonsforActivity Error: ${JSON.stringify(responsefr)} `);
//         throw new Error("getMoocPersonsforActivity Error message : " + responsefr.status + " " + responsefr.statusText);
//     }

// }
