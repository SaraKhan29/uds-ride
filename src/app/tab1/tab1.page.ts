import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { IonSlides, NavController } from '@ionic/angular';
import { Ride, RideService, RideData } from '../services/ride.service';
import { Router, NavigationExtras } from '@angular/router';
import { Car, CarService } from '../services/car.service';
import { DataService } from '../services/data.service';
import firebase = require('firebase');

const db = firebase.firestore();

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  @ViewChild('slides', { static: true }) slider: IonSlides;
  segment = 0;

  myCars: Car[];
  offeredRides: Ride[] = [];
  bookedRides: Ride[] = [];

  loading = true;

  choice = 'offer ride';

  cars: Car[];
  temp: [];
   constructor(
    public alertController: AlertController,
    public navControl: NavController,
    private router: Router,
    private rideService: RideService,
    private carService: CarService,
    private dataService: DataService
  ) { }

  async segmentChanged(ev: any) {
    await this.slider.slideTo(this.segment);
  }

  async slideChanged() {
    this.segment = await this.slider.getActiveIndex();
  }

  ngOnInit() {
    this.myCars = this.carService.getMyCars();

    this.carService.getMyCarUpdates().subscribe(res => {
      this.myCars = res;
    });

    this.offeredRides = this.rideService.getMyOfferedRides();

    this.rideService.getMyOfferedRideUpdates().subscribe(res => {
      this.offeredRides = res;
    });

    this.bookedRides = this.rideService.getMyBookedRides();
    this.rideService.getMyBookedRideUpdates().subscribe(res => {
      this.bookedRides = res;
    });

    this.loading = false;
  }

  createCar() {
    const navigationExtras: NavigationExtras = {
      state: {
        creating: true
      }
    };
    this.router.navigate(['edit-car'], navigationExtras);
  }

  routeToDetails(ride) {
    this.dataService.setData(42, ride);
    this.router.navigateByUrl('/offer-ride-details/42');
  }

  routeToRideWithDetails(selride: Ride) {
    this.dataService.setData(43, selride);
    this.router.navigate(['/ride-with-details/43']);
  }

  async getBookedRides() {
    const docsRef = db.collection('bookedrides');
    const querySnapshot = await docsRef.where('uid', '==', firebase.auth().currentUser.uid).get();

    querySnapshot.forEach(async doc => {
      const rideId = doc.data().rideid;
      console.log('x is', rideId);

      this.bookedRides.push(this.rideService.getRide(rideId));
    });
  }
}
