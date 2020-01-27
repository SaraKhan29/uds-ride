import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { RideData, RideService, Ride } from '../services/ride.service';
import firebase = require('firebase');
import { checkLoggedIn } from '../util/auto-login';
import { Car, CarService } from '../services/car.service';
import { StopService, Stop } from '../services/stop.service';
import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-create-ride',
  templateUrl: './create-ride.page.html',
  styleUrls: ['./create-ride.page.scss']
})

export class CreateRidePage implements OnInit {
  public rideData: RideData;
  public selectedCar: Car;
  public cars: Car[];

  public creating = true;
  public loading = true;

  public user = firebase.auth().currentUser;

  public startLocation: Stop;
  public endLocation: Stop;

  public outsideStops: Stop[];
  public campusStops: Stop[];

  private errorMsg: string;

  private rideId: string;
  public date = new Date().toISOString();

  public fromCampus = false;

  constructor(
    private route: ActivatedRoute,
    public navCtrl: NavController,
    private rideService: RideService,
    private carService: CarService,
    private stopService: StopService,
    private alertController: AlertController
  ) {
    if (this.route.snapshot.data.special) {
      const ride = this.route.snapshot.data.special;
      if (ride && ride instanceof Ride) {
        this.rideId = ride.id;
        this.rideData = ride.data;
        this.selectedCar = ride.car;
        this.startLocation = ride.startStop;
        this.endLocation = ride.endStop;

        this.creating = false;
        this.loading = false;
      }
    }
  }

  validInput(ride: RideData) {
    let errorMsg = '';
    if (ride.date === '' ||
        ride.start_location === '' ||
        ride.start_location === undefined ||
        ride.end_location === '' ||
        ride.end_location === undefined ||
        ride.start_time === '' ||
        ride.end_time === '') {
      errorMsg = 'Input is missing.';
    }
    return errorMsg;
  }
  async ngOnInit() {
    if (!(await checkLoggedIn(this.alertController, this.navCtrl))) {
      console.log('cannot login');
      console.log('This ride:' + JSON.stringify(this.rideData));
      return;
    }
    // initialize empty ride, logged_in user and his cars.
    this.outsideStops = this.stopService.getNearestStops(false);
    this.stopService.getNearestStopUpdates(false).subscribe(stops => this.outsideStops = stops);

    this.campusStops = this.stopService.getNearestStops(true);
    this.stopService.getNearestStopUpdates(true).subscribe(stops => this.campusStops = stops);

    this.cars = this.carService.getMyCars();
    this.carService.getMyCarUpdates().subscribe(res => {
      this.cars = res;
      if (this.selectedCar === undefined) {
        this.selectedCar = this.cars[0];
        this.rideData.car = this.cars[0].id;
      }
    });

    if (this.rideData === undefined) {
      this.user = firebase.auth().currentUser;
      this.rideData = this.rideService.initRide();

      if (this.cars.length) {
        this.selectedCar = this.cars[0];
        this.rideData.car = this.cars[0].id;
      }

      console.log('Ride is in place');
    }
    console.log('logged_in');
  }

  updateSelectedCar() {
    this.selectedCar = this.carService.getCar(this.rideData.car);
  }

  async saveRide() {
    this.rideData.driver = firebase.auth().currentUser.uid;
    this.rideData.start_location = this.startLocation === undefined ? undefined : this.startLocation.id;
    this.rideData.end_location = this.endLocation === undefined ? undefined : this.endLocation.id;

    this.errorMsg = this.validInput(this.rideData);
    if (this.errorMsg !== '') {

      const alert = await this.alertController.create({
        header: 'Input not complete',
        message: this.errorMsg,
        buttons: ['OK']
      });
      await alert.present();
      await alert.onDidDismiss();
      return;
    } else {
      if (this.creating) {
        this.rideService.addRide(this.rideData);
    } else {
        this.rideData.car = this.selectedCar.id;
        this.rideService.updateRide(this.rideData, this.rideId);
    }
      const alert = await this.alertController.create({
      header: 'Ride saved',
      message: `This ride has been successfully ${this.creating ? 'created' : 'saved'}.`,
      buttons: ['Okay']
     });

      await alert.present();
      await alert.onDidDismiss();

      this.navCtrl.back();
    }
  }

  onSwap() {
    console.log(this.startLocation, this.endLocation);

    const startLocation = this.endLocation;
    this.endLocation = this.startLocation;
    this.startLocation = startLocation;

    this.fromCampus = !this.fromCampus;
  }
}
