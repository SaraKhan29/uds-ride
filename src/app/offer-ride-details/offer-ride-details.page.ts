import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { RideService, Ride } from '../services/ride.service'; import {Car, CarService } from '../services/car.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { Booking } from '../services/booking.service';


@Component({
  selector: 'app-offer-ride-details',
  templateUrl: './offer-ride-details.page.html',
  styleUrls: ['./offer-ride-details.page.scss'],
})
export class OfferRideDetailsPage implements OnInit {

  ride: Ride;

  constructor(
    public alertController: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private rideService: RideService,
    public navCtrl: NavController,
    private dataService: DataService ) { }

// load the ride when loading the page. edit/delete the ride and save changes.
// editing changes may trigger calls to ride_requests and notification

  ngOnInit() {
    if (this.route.snapshot.data.special) {
      this.ride = this.route.snapshot.data.special;
    }
  }

  async cancelRide() {

    const offerRideScreen = this;
    const confirmDialog = await this.alertController.create({
        header: 'Confirm cancellation',
        message: 'Do you really want to cancel the ride?',
        buttons: [
            {
                text: 'No',
                role: 'cancel',
                handler: () => {
                    return;
                }
            },
            {
                text: 'Yes',
                handler: async () => {
                    offerRideScreen.rideService.removeRide(offerRideScreen.ride.id);

                    const alert = await offerRideScreen.alertController.create({
                        header: 'Ride cancelled',
                        message: 'This ride was successfully cancelled.',
                        buttons: ['Okay']
                    });
                    alert.present();
                    await alert.onDidDismiss();
                    console.log('Ride was deleted');
                    offerRideScreen.navCtrl.back();
                }
            }
        ]
    });
    confirmDialog.present();
  }

  routeToCreateRide(ride) {
    this.dataService.setData('', ride);
    this.router.navigateByUrl('/create-ride/');
  }

  openChat() {
    this.dataService.setData('chat', this.ride);
    this.navCtrl.navigateForward('chat');
  }

  async acceptBooking(booking: Booking) {
    const confirmDialog = await this.alertController.create({
      header: 'Confirm passenger',
      message: 'Do you really want to accept this booking?',
      buttons: [
        {
            text: 'No',
            role: 'cancel'
        },
        {
            text: 'Yes',
            handler: async () => {
              await booking.accept();
            }
        }
      ]
    });
    confirmDialog.present();
  }

  async rejectBooking(booking: Booking) {
    const confirmDialog = await this.alertController.create({
      header: 'Confirm rejection',
      message: 'Do you really want to reject this booking?',
      buttons: [
        {
            text: 'No',
            role: 'cancel'
        },
        {
            text: 'Yes',
            handler: async () => {
              await booking.reject();
            }
        }
      ]
    });
    confirmDialog.present();
  }
}
