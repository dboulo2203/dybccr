import { getConfigurationValue } from '../commonServices/configurationService.js';

/**
 * Load a person from the database,
 * the person is saved in the sessionStorage
 * @param { } personId
 * @param {*} callback
 * @returns notice in JSON
 */
export async function getLogin(userName, userPassword) {
  console.log('getLogin Service start');

  sessionStorage.setItem('loggedUSer', '');
  const wsUrl = getConfigurationValue('wsUrlformel') + `login`;

  const responsefr = await fetch(wsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      login: userName,
      password: userPassword,
      entity: '',
      reset: 0,
    }),
  });
  if (responsefr.ok) {
    // *** Get the data and save in the sessionStorage
    const data = await responsefr.json();
    data.success.username = userName;
    delete data.success['message'];
    sessionStorage.setItem('loggedUSer', JSON.stringify(data.success));

    return true;
  } else {
    sessionStorage.setItem('loggedUSer', '');
    return false;
  }
}

/**
 * returns if the user is allowed for the required level
 * @param {*} requiredLevel
 * @returns
 */
export function isCurrentUSerLogged() {
  return true;
  const loggedUserJSON = sessionStorage.getItem('loggedUSer');
  if (loggedUserJSON !== '' && loggedUserJSON !== null) {
    const loggedUser = JSON.parse(loggedUserJSON);
    if (loggedUser && loggedUser.code === 200 && loggedUser.token.length > 0) return true;
    else return false;
  } else {
    return false;
  }
}

/**
 * returns the usertoken
 * @param {*} requiredLevel
 * @returns
 */
export function getUserToken() {
  return '5z7dAN7TM4psDIuAY2yzsa28HaAl856T';
  const loggedUserJSON = sessionStorage.getItem('loggedUSer');

  if (loggedUserJSON) {
    const loggedUser = JSON.parse(loggedUserJSON);
    return loggedUser.token;
  } else {
    return '';
  }
}

export function logout() {
  sessionStorage.removeItem('loggedUSer', '');
}

/**
 *
 * @returns
 */
export function getLoggedUserPseudo() {
  const loggedUserJSON = sessionStorage.getItem('loggedUSer');

  if (loggedUserJSON) {
    const loggedUser = JSON.parse(loggedUserJSON);
    return loggedUser.username;
  } else {
    return '';
  }
}
