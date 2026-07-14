//*** Application initialisation**************************** */
export async function getConfigurationFromJson() {
  const wsUrl = `../../shared/assets/configuration.json`;
  const responsefr = await fetch(wsUrl);
  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    sessionStorage.setItem('configuration', JSON.stringify(data));

    // console.log("getLogin  await ok ");
    return true;
    // return data;
  } else {
    console.log(`getConfigurationFromJson Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'getConfigurationFromJson Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

// export function getwsUrlformel() {
//     return getConfigurationValue("wsUrlformel")
// }

// export function getimagePath() {
//     return getConfigurationValue("imagePath")
// }

export function getConfigurationValue(configValueName) {
  // *** Get the database according to the current language in the browser
  const frBase = sessionStorage.getItem('configuration');
  const base = JSON.parse(frBase);

  const foundIndex = Object.keys(base).indexOf(configValueName);

  if (foundIndex >= 0) return Object.values(base)[foundIndex];
  else throw new Error('configuration value not found ' + configValueName);
}
