import { AngularFirestoreCollection, AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Car, CarService } from './car.service';
import firebase = require('firebase');
import { Profile, ProfileService } from './profile.service';
import { StopService, Stop } from './stop.service';
import { Booking, BookingService, BookingData } from './booking.service';

export interface RideData {
    available_seats: number;

    cancelled: boolean;
    car: string;
    current_location: string;

    date: string;
    driver: string;
    bookings: string[];

    start_location: string;
    start_time: string;

    end_location: string;
    end_time: string;
    note: string;
}

export class Ride {
    public data: RideData;
    public driver: Profile;
    public car: Car;
    public bookings: Booking[];
    public availableSeats: number;

    public startStop: Stop;
    public endStop: Stop;

    public id: string;
    public loading = true;

    private driverSubscription: Subscription;
    private carSubscription: Subscription;
    private bookingSubscription: Subscription;
    private startStopSubscription: Subscription;
    private endStopSubscription: Subscription;

    constructor(
        id: string,
        data: RideData,
        private rideService: RideService,
        private profileService: ProfileService,
        private carService: CarService,
        private stopService: StopService,
        private bookingService: BookingService
    ) {
        this.id = id;
        this.data = data;

        this.rideService.getRideUpdates(this.id).subscribe((ride: RideData) => {
            this.data = ride;
            this.updateProperties();
        });

        this.updateProperties();
    }

    private updateProperties() {
        this.driver = this.profileService.getProfile(this.data.driver);
        if (this.driverSubscription) {
            this.driverSubscription.unsubscribe();
        }
        this.driverSubscription = this.profileService.getProfileUpdates(this.data.driver).subscribe(profile => {
            this.driver = profile;
            this.updateLoading();
        });

        this.car = this.carService.getCar(this.data.car);
        if (this.carSubscription) {
            this.carSubscription.unsubscribe();
        }
        this.carSubscription = this.carService.getCarUpdates(this.id).subscribe(car => {
            this.car = car;
            this.updateLoading();
        });

        this.startStop = this.stopService.getStop(this.data.start_location);
        if (this.startStopSubscription) {
            this.startStopSubscription.unsubscribe();
        }
        this.startStopSubscription = this.stopService.getStopUpdates(this.data.start_location).subscribe(stop => {
            this.startStop = stop;
            this.updateLoading();
        });

        this.endStop = this.stopService.getStop(this.data.end_location);
        if (this.endStopSubscription) {
            this.endStopSubscription.unsubscribe();
        }
        this.endStopSubscription = this.stopService.getStopUpdates(this.data.end_location).subscribe(stop => {
            this.endStop = stop;
            this.updateLoading();
        });

        this.bookings = this.data.bookings.length ? this.bookingService.getBookings(this.data.bookings) : [];
        this.availableSeats = this.data.available_seats - this.bookings.filter(
            booking => booking.status === 'accepted'
        ).length;
        if (this.bookingSubscription) {
            this.bookingSubscription.unsubscribe();
        }
        this.bookingSubscription = this.bookingService.getBookingsUpdates(this.data.bookings).subscribe(bookings => {
            this.bookings = bookings.sort(this.bookingService.sortBookings);
            this.availableSeats = this.data.available_seats - this.bookings.filter(
                booking => booking.status === 'accepted'
            ).length;
            this.updateLoading();
        });

        this.updateLoading();
    }

    private updateLoading() {
        this.loading = this.startStop === undefined
            || this.endStop === undefined
            || this.car === undefined
            || this.driver === undefined
            || this.bookings === undefined;
    }

    public async createBookingRequest(startLocation: string, endLocation: string) {
        const myBooking = this.getMyBooking();
        if (myBooking) {
            if (myBooking.status === 'canceled') {
                myBooking.reset();
            } else {
                return false;
            }
        } else {
            const bookingId = await this.bookingService.createBooking(startLocation, endLocation);
            this.data.bookings.push(bookingId);
            this.rideService.updateRide(this.data, this.id);
        }
        return true;
    }

    public getMyBooking() {
        return this.bookings.find(
            booking => booking.passenger.id === firebase.auth().currentUser.uid
        );
    }

    public getAcceptedBookings() {
        return this.bookings.filter(
            booking => booking.status === 'accepted'
        );
    }

    public getRequests() {
        return this.bookings.filter(
            booking => booking.status === 'request'
        );
    }
}

@Injectable({
   providedIn: 'root'
})
export class RideService {
    private rideCollection: AngularFirestoreCollection<RideData>;

    private rideUpdates: Observable<Ride[]>;
    private rides: Ride[] = [];

    constructor(
        db: AngularFirestore,
        private profileService: ProfileService,
        private carService: CarService,
        private stopService: StopService,
        private bookingService: BookingService
    ) {
        this.rideCollection = db.collection<RideData>('rides');

        this.rideUpdates = this.rideCollection.snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return new Ride(id, data, this, this.profileService, this.carService, this.stopService, this.bookingService);
                });
            })
        );

        this.rideUpdates.subscribe(res => {
            this.rides = res;
        });
    }

    // TODO check where this method is used this method
    initRide(): RideData {
        return {
            available_seats: 1,
            cancelled: false,
            car: '',
            current_location: '',
            date: '',
            driver: '',
            end_location: '',
            end_time: '',
            bookings: [],
            start_location: '',
            start_time: '',
            note: '',
        };
    }

    getAllRides(): Ride[] {
        return this.rides;
    }

    getAllRideUpdates() {
        return this.rideUpdates;
    }

    getMyOfferedRides(): Ride[] {
        return this.rides.filter(ride => ride.data.driver === firebase.auth().currentUser.uid);
    }

    getMyOfferedRideUpdates(): Observable<Ride[]> {
        return this.rideUpdates.pipe(
            map(
                rides => rides.filter(ride => ride.data.driver === firebase.auth().currentUser.uid)
            )
        );
    }

    getMyBookedRides(): Ride[] {
        return this.rides.filter(
            ride => ride.bookings.some(
                booking => booking.passenger.id === firebase.auth().currentUser.uid
            )
        );
    }

    getMyBookedRideUpdates(): Observable<Ride[]> {
        return this.rideUpdates.pipe(
            map(
                rides => rides.filter(
                    ride => ride.bookings.some(
                        booking => booking.passenger.id === firebase.auth().currentUser.uid
                    )
                )
            )
        );
    }

    getRide(id: string): Ride {
        return this.rides.find(ride => ride.id === id);
    }

    getRideUpdates(id: string) {
        return this.rideCollection.doc(id).valueChanges();
    }

    updateRide(ride: RideData, id: string) {
        return this.rideCollection.doc(id).update(ride);
    }

    addRide(ride: RideData) {
        return this.rideCollection.add(ride);
    }

    removeRide(id: string) {
        return this.rideCollection.doc(id).delete();
    }
}
