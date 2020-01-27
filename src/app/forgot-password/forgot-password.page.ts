import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss']
})
export class ForgotPasswordPage implements OnInit {
  email = '';

  constructor(public alertController: AlertController) {}

  ngOnInit() {}

  async forgot_password() {
    let header = '';
    let message = '';

    await firebase
      .auth()
      .sendPasswordResetEmail(this.email)
      .then(function() {
        header = 'Password Reset';
        message =
          'An email has been sent to your account to reset your password. Kindly check your email.';
      })
      .catch(function(error) {
        header = error.code;
        message = error.message;
      });

    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Dismiss']
    });

    await alert.present();
  }
}
