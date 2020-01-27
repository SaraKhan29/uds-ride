import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Ride, RideService } from '../services/ride.service';
import { DataService } from '../services/data.service';
import firebase = require('firebase');


@Component({
  selector: 'app-search-results-details',
  templateUrl: './search-results-details.page.html',
  styleUrls: ['./search-results-details.page.scss'],
})
export class SearchResultsDetailsPage implements OnInit {

  private locations: string[] = ['Apple', 'Orange'];
  ride: Ride;

  constructor(
    private dataService: DataService,
    public alertController: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private rideservice: RideService
  ) { }

  ngOnInit() {
    if (this.route.snapshot.data.special) {
      this.ride = this.route.snapshot.data.special;
    }
  }

  goToSearchResults() {
    this.locations[0] = this.ride.data.start_location;
    this.locations[1] = this.ride.data.end_location;
    this.dataService.setData(1, this.locations);
    this.router.navigate(['/tabs/tab2/search-results/1']);
    }

  async bookRide() {
    const alert = await this.alertController.create({
      header: 'Your ride request is on the way',
      message: 'Your ride request has been sent to the driver. We’ll notify you once your ride is confirmed',
      buttons: ['OK']
    });

    await alert.present();

    this.ride.createBookingRequest(this.ride.data.start_location, this.ride.data.end_location);
  }
}
