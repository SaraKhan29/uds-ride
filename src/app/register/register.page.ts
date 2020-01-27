import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import * as firebase from 'firebase';
import * as generate_password from 'generate-password';
import { Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {
  email = '';

  constructor(
    public alertController: AlertController,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    firebase.auth().onAuthStateChanged(function(user) {
      console.log('authn state changed.');
      if (user) {
        console.log('signed_in user: ' + JSON.stringify(user));
        // User is signed in.
        const displayName = user.displayName;
        const email = user.email;
        const emailVerified = user.emailVerified;
        const photoURL = user.photoURL;
        const isAnonymous = user.isAnonymous;
        const uid = user.uid;
        const providerData = user.providerData;
        if (!emailVerified) {
          console.log('email not verified yet.');
          // can send an email but donot
        }
      } else {
        console.log('user not signed in');
        // User is signed out.
      }
    });
  }

  // register function
  async register() {
    let header = '';
    let message = '';
    let created = false;

    let userCredentials: firebase.auth.UserCredential;

    await firebase
      .auth()
      .createUserWithEmailAndPassword(this.email, '123456')
      .then(data => {
        userCredentials = data;
        console.log('created_user: ' + JSON.stringify(data));
        // sending email verification
        created = true;
      })
      .catch(function(error) {
        header = error.code;
        message = error.message;
      });

    if (created) {
      // create a user profile here.
      this.profileService.addProfile(
        {
          id: userCredentials.user.uid,
          first_name: 'First name',
          last_name: 'Last name',
          phone: 'Phone number'
        },
        firebase.auth().currentUser.uid
      );

      await firebase
        .auth()
        .sendPasswordResetEmail(firebase.auth().currentUser.email)
        .then(function() {
          header = 'Verify Email';
          message =
            'An email has been sent to your account for account verification. Kindly check your email.';
        })
        .catch(function(error) {
          header = error.code;
          message = error.message;
        });
    }

    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Dismiss']
    });

    await alert.present();
  }

  async termsConditions() {
    const alert = await this.alertController.create({
      header: 'Terms and Conditions',
      message:
        'Saarland University regards the protection of personal data as an essential part of its digitalization strategy. Ensuring that individuals have the right to decide on the disclosure and processing of their personal data is of utmost priority to the university. This privacy notice refers to the websites that Saarland University is responsible for. If the scope of data processing on a Saarland University website goes beyond the procedures described here, this will be stated explicitly on the relevant website.',
      buttons: ['Dismiss']
    });

    await alert.present();
  }

  async dataPolicy() {
    const alert = await this.alertController.create({
      header: 'Privacy notice for Saarland University websites',
      message:
        'Saarland University regards the protection of personal data as an essential part of its digitalization strategy. Ensuring that individuals have the right to decide on the disclosure and processing of their personal data is of utmost priority to the university. This privacy notice refers to the websites that Saarland University is responsible for. If the scope of data processing on a Saarland University website goes beyond the procedures described here, this will be stated explicitly on the relevant website.',
      buttons: ['Dismiss']
    });

    await alert.present();
  }

  async acceptedEmails() {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'The accepted emails in order to avail this facility are',
      message:
        '@stud.uni-saarland.de @uni-saarland.de @mpi-inf.mpg.de @another.email.example @another.email.example @another.email.example @another.email.example',
      buttons: ['OK']
    });

    await alert.present();
  }
}
