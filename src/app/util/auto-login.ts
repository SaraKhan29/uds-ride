import { AlertController, NavController } from '@ionic/angular';
import firebase = require('firebase');

export async function tryAutoLogin(
  alertCtrl: AlertController
): Promise<boolean> {
  const loggedIn = localStorage.getItem('logged-in');

  if (loggedIn == null) {
    localStorage.setItem('logged-in', 'false');
    return false;
  }

  if (loggedIn !== 'true') {
    return false;
  }

  const loginEmail = localStorage.getItem('login-email');
  if (loginEmail === null) {
    localStorage.setItem('logged-in', 'false');
    return false;
  }

  const loginPassword = localStorage.getItem('login-password');
  if (loginPassword === null) {
    localStorage.setItem('logged-in', 'false');
    return false;
  }

  try {
    await firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword);
  } catch (err) {
    const alert = await alertCtrl.create({
      header: 'Error while logging in',
      message: err.message,
      buttons: ['Okay']
    });
    alert.present();
    await alert.onDidDismiss();
    return false;
  }

  return true;
}

export async function checkLoggedIn(
  alertCtrl: AlertController,
  navCtrl: NavController
): Promise<boolean> {
  if (firebase.auth().currentUser === null) {
    const autoLoginSuccess = await tryAutoLogin(alertCtrl);
    if (!autoLoginSuccess) {
      navCtrl.navigateRoot('home');
      return false;
    }
  }
  return true;
}
