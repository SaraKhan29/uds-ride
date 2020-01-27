import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Car, CarService } from '../services/car.service';
import firebase = require('firebase');
import { checkLoggedIn } from '../util/auto-login';

@Component({
    selector: 'app-edit-car',
    templateUrl: './edit-car.page.html',
    styleUrls: ['./edit-car.page.scss'],
})
export class EditCarPage implements OnInit {
    private creating = true;
    private car: Car;
    private loading = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private navCtrl: NavController,
        private carService: CarService,
        private alertCtrl: AlertController
    ) {
        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.creating = this.router.getCurrentNavigation().extras.state.creating;
                if (!this.creating) {
                    this.car = this.router.getCurrentNavigation().extras.state.car;
                }
            }
            this.loading = false;
        });
    }

    async ngOnInit() {
        if (!await checkLoggedIn(this.alertCtrl, this.navCtrl)) {
            return;
        }

        if (this.car === undefined) {
            this.car = {
                name: '',
                brand: '',
                model: '',
                seats: 2,
                childseat: false,
                wheelchair: false,
                color: 'black',
                owner: firebase.auth().currentUser.uid
            };
        }
    }

    async saveCar() {
        if (this.creating) {
            this.carService.addCar(this.car);
        } else {
            this.carService.updateCar(this.car);
        }

        const alert = await this.alertCtrl.create({
            header: 'Car saved',
            message: `This car has been successfully ${this.creating ? 'created' : 'saved'}.`,
            buttons: ['Okay']
        });
        await alert.present();
        await alert.onDidDismiss();

        this.navCtrl.navigateBack('tabs/profile');
    }

    async deleteCar() {
        if (this.creating) {
            return;
        }

        const carScreen = this;
        const confirmDialog = await this.alertCtrl.create({
            header: 'Confirm deletion',
            message: 'Do you really want to delete this car?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        return;
                    }
                },
                {
                    text: 'Delete',
                    handler: async () => {
                        carScreen.carService.removeCar(carScreen.car.id);

                        const alert = await carScreen.alertCtrl.create({
                            header: 'Car deleted',
                            message: 'This car has been successfully deleted.',
                            buttons: ['Okay']
                        });
                        alert.present();
                        await alert.onDidDismiss();

                        carScreen.navCtrl.back();
                    }
                }
            ]
        });
        confirmDialog.present();
    }
}
