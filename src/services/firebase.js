import firebase from 'firebase/app';
import get from 'lodash.get';
import { setAccessToken, isAccessTokenValid } from './github';
require('firebase/auth');

export function initFirebase() {
  const config = {
    apiKey: 'AIzaSyAdWAnFs34BotZKhRJ0VFJq7O0wDpwnQrY',
    authDomain: 'did-i-backport.firebaseapp.com',
    databaseURL: 'https://did-i-backport.firebaseio.com',
    projectId: 'did-i-backport',
    storageBucket: 'did-i-backport.appspot.com',
    messagingSenderId: '756066915864'
  };
  firebase.initializeApp(config);

  // set accessToken if a new is received
  return getAccessTokenFromRedirectResult().then(accessToken => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
  });
}

function getAccessTokenFromRedirectResult() {
  return firebase
    .auth()
    .getRedirectResult()
    .then(res => get(res, 'credential.accessToken'));
}

export function onAuthChangeState(authStateChangeCallback) {
  // listen for auth updates
  firebase.auth().onAuthStateChanged(() => {
    isAccessTokenValid()
      .then(isValid =>
        authStateChangeCallback(isValid ? firebase.auth().currentUser : null)
      )
      .catch(e => console.error('Could not verify accessToken', e));
  });
}

export function login() {
  const provider = new firebase.auth.GithubAuthProvider();
  provider.addScope('repo');

  return firebase.auth().signInWithRedirect(provider);
}
