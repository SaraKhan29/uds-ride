import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { Ride, RideService } from '../services/ride.service';

@Component({
  selector: 'app-ride-with-details',
  templateUrl: './ride-with-details.page.html',
  styleUrls: ['./ride-with-details.page.scss'],
})
export class RideWithDetailsPage implements OnInit {

  ride: Ride;

  constructor(
    public alertController: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    public navControl: NavController,
    private rideservice: RideService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    if (this.route.snapshot.data.special) {
      this.ride = this.route.snapshot.data.special;
    }
  }
  async cancelBooking() {
    const alert = await this.alertController.create({
      header: 'Confirm Cancellation',
      message: 'Are you sure to cancel your booking?',
      buttons: [
        {
          text: 'Dismiss',
          handler: () => {
            return;
          }
        },
        {
          text: 'Cancel Booking',
          handler: async () => {
            await this.ride.getMyBooking().cancel();
            this.navControl.back();
          }
        }
      ]
    });

    await alert.present();
  }

  async resetBooking() {
    this.ride.getMyBooking().reset();
  }

  openChat() {
    this.dataService.setData('chat', this.ride);
    this.navControl.navigateForward('chat');
  }
}
