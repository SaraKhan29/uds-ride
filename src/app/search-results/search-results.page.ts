import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController, AlertController } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { RideService, RideData, Ride } from '../services/ride.service';
import { CarService, Car } from '../services/car.service';
import { ProfileService, Profile } from '../services/profile.service';
import firebase = require('firebase');
import { checkLoggedIn } from '../util/auto-login';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.page.html',
  styleUrls: ['./search-results.page.scss'],
})
export class SearchResultsPage implements OnInit {

    private rides: Ride[];

    public searchResults: Ride[] = [];

    private startLocation: string;
    private endLocation: string;

    private locations: string[];

    private user: string;

  constructor(
    public toastController: ToastController,
    private router: Router,
    public navCtrl: NavController,
    private rideService: RideService,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private dataService: DataService
      ) {}

  async ngOnInit() {
    if (!await checkLoggedIn(this.alertCtrl, this.navCtrl)) {
        return;
    }

    if (this.route.snapshot.data.special) {
      this.locations = this.route.snapshot.data.special;
      this.startLocation = this.locations[0];
      this.endLocation = this.locations[1];
      console.log('search locations', this.locations);
    }

    this.user = firebase.auth().currentUser.uid;

    this.rides = this.rideService.getAllRides();

    this.rideService.getAllRideUpdates().subscribe(
      rides => {
        this.rides = rides;
        this.searchResults = this.rides.filter(
          ride => ride.data.start_location === this.startLocation
            && ride.data.end_location === this.endLocation
            && ride.data.driver !== firebase.auth().currentUser.uid
        );
      }
    );

    this.searchResults = this.rides.filter(
      ride => ride.data.start_location === this.startLocation
        && ride.data.end_location === this.endLocation
        && ride.data.driver !== firebase.auth().currentUser.uid
    );
  }

  goToDetails(ride: Ride) {
    this.dataService.setData(42, ride);
    this.navCtrl.navigateForward('/search-results-details/42');
  }

    async presentToast() {
      const toast = await this.toastController.create({
        message: 'Your settings have been saved.',
        duration: 2000
      });
      toast.present();
    }

    async presentToastWithOptions() {
      const toast = await this.toastController.create({
        header: '3 Rides Found',
        position: 'bottom',
        color: 'success',
        duration: 2000,
        buttons: [
        {
            text: 'Done',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      toast.present();
    }

    async assigndata() {

    }

     async getCar(): Promise<string> {
        return 'Hello';
    }

}
