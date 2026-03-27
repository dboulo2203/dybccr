/**
 * Load the translation files in the sessionStorage
 * Load fr and en languages
 *
 * TODO : the function can load translations from languages
 */
export async function loadTranslations() {
  // *** Load french language
  const responsefr = await fetch(`../../shared/assets/locales/fr/translation.json`);
  const datafr = await responsefr.json();
  if (responsefr.ok) {
    sessionStorage.setItem('frTranslation', JSON.stringify(datafr));
    //  console.log("LoadTranslations fr  ok ");
  } else {
    console.log(`loadTranslations fr Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'loadTranslations fr Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }

  // *** Load english language
  const responseen = await fetch(`../../shared/assets/locales/en/translation.json`);
  const dataen = await responseen.json();

  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    sessionStorage.setItem('enTranslation', JSON.stringify(dataen));
    //  console.log("LoadTranslations en  ok ");
  } else {
    console.log(`LoadTranslations en Error : ${JSON.stringify(responsefr)}`);
    throw new Error(
      'LoadTranslations en Error message : ' + responsefr.status + ' ' + responsefr.statusText
    );
  }
}

/**
 * Get the main language set in the browser
 * Some browser return the language with 4chararcter (en-US)
 * @returns
 */
export function getCurrentLanguage() {
  let browserLanguage = window.navigator.userLanguage || window.navigator.language;
  if (browserLanguage.length > 2) browserLanguage = browserLanguage.substring(0, 2);
  return browserLanguage;
}

/**
 * Translate a string in the current browser language
 * @param {} wordToTranslate
 * @returns
 */
export function getTranslation(wordToTranslate) {
  // *** Get the database according to the current language in the browser
  const frBase = sessionStorage.getItem(getCurrentLanguage() + 'Translation');
  const base = JSON.parse(frBase);

  if (!base) return 'Translation base invalid';
  const foundIndex = Object.keys(base).indexOf(wordToTranslate);

  let valeur = '';
  if (foundIndex >= 0) valeur = Object.values(base)[foundIndex];
  else valeur = '!! Translation not found !! ';

  return valeur;
}
