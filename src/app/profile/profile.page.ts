import { Component, OnInit } from '@angular/core';
import { ProfileService, Profile } from '../services/profile.service';
import { NavController, AlertController } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { CarService, Car } from '../services/car.service';
import firebase = require('firebase');
import { checkLoggedIn } from '../util/auto-login';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    private profile: Profile;

    private cars: Car[];

    private user = firebase.auth().currentUser;

    constructor(
        private router: Router,
        public navCtrl: NavController,
        private profileService: ProfileService,
        private carService: CarService,
        private alertCtrl: AlertController
    ) { }

    async ngOnInit() {
        if (!await checkLoggedIn(this.alertCtrl, this.navCtrl)) {
            return;
        }

        this.user = firebase.auth().currentUser;

        this.profile = this.profileService.getProfile(this.user.uid);

        this.profileService.getProfileUpdates(this.user.uid).subscribe(res => {
            this.profile = res;
        });

        this.cars = this.carService.getMyCars();
        this.carService.getMyCarUpdates().subscribe(res => {
            this.cars = res;
        });
    }

    async saveProfile() {
        this.profileService.updateProfile(this.profile, this.user.uid);

        const alert = await this.alertCtrl.create({
            header: 'Profile saved',
            subHeader: 'Your profile has been successfully saved.',
            buttons: ['Okay']
        });

        alert.present();
    }

    async deleteUser() {
        const profileScreen = this;
        const confirmDialog = await this.alertCtrl.create({
            header: 'Confirm account deletion',
            message: 'Do you really want to delete your account? This cannot be undone!',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        return;
                    }
                },
                {
                    text: 'Yes, delete my account',
                    handler: async () => {
                        const alert = await profileScreen.alertCtrl.create({
                            header: 'Account deleted',
                            message: 'Your account has been successfully deleted.',
                            buttons: ['Okay']
                        });

                        profileScreen.navCtrl.navigateRoot('home');

                        for (const car of profileScreen.cars) {
                            try {
                                profileScreen.carService.removeCar(car.id);
                            } catch (err) {
                                alert.setAttribute('header', 'Error while deleting car ' + car.name);
                                alert.setAttribute('message', err);
                                alert.present();
                                return;
                            }
                        }

                        try {
                            await profileScreen.profileService.removeProfile(profileScreen.user.uid);
                        } catch (err) {
                            alert.setAttribute('header', 'Error while deleting profile');
                            alert.setAttribute('message', err);
                            alert.present();
                            return;
                        }

                        try {
                            await profileScreen.user.delete();
                        } catch (err) {
                            alert.setAttribute('header', 'Error while deleting account');
                            alert.setAttribute('message', err);
                            alert.present();
                            return;
                        }

                        alert.present();
                        await alert.onDidDismiss();

                        profileScreen.user.reload();
                    }
                }
            ]
        });
        confirmDialog.present();
    }

    async logOut() {
        await firebase.auth().signOut();

        const alert = await this.alertCtrl.create({
            header: 'Logged out',
            message: 'You have been signed out successfully.',
            buttons: ['OK']
        });
        alert.present();

        await alert.onDidDismiss();

        localStorage.setItem('logged-in', 'false');
        localStorage.removeItem('login-email');
        localStorage.removeItem('login-password');
        this.navCtrl.navigateRoot('home');
    }

    editCar(carObject: Car) {
        const navigationExtras: NavigationExtras = {
            state: {
                creating: false,
                car: carObject
            }
        };
        this.router.navigate(['edit-car'], navigationExtras);
    }

    createCar() {
        const navigationExtras: NavigationExtras = {
            state: {
                creating: true
            }
        };
        this.router.navigate(['edit-car'], navigationExtras);
    }
}
