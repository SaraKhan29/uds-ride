import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ProfileService, Profile } from './profile.service';
import { StopService, Stop } from './stop.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase = require('firebase');

type BookingStatus = 'request' | 'accepted' | 'rejected' | 'canceled';

export interface BookingData {
    user: string;

    start_location: string;
    end_location: string;

    status: BookingStatus;
}

export class Booking {
    public loading = true;

    public passenger: Profile;
    public startStop: Stop;
    public endStop: Stop;
    public status: BookingStatus;

    private passengerSubscription: Subscription;
    private startStopSubscription: Subscription;
    private endStopSubscription: Subscription;

    constructor(
        public id: string,
        public data: BookingData,
        private bookingService: BookingService,
        private profileService: ProfileService,
        private stopService: StopService
    ) {
        this.status = this.data.status;

        this.bookingService.getBookingUpdates(this.id).subscribe((booking: BookingData) => {
            this.data = booking;
            this.status = this.data.status;
            this.updateProperties();
        });

        this.updateProperties();
    }

    private updateProperties() {
        this.passenger = this.profileService.getProfile(this.data.user);
        if (this.passengerSubscription) {
            this.passengerSubscription.unsubscribe();
        }
        this.passengerSubscription = this.profileService.getProfileUpdates(this.data.user).subscribe(profile => {
            this.passenger = profile;
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

        this.updateLoading();
    }

    private updateLoading() {
        this.loading = this.passenger === undefined
            || this.startStop === undefined
            || this.endStop === undefined;
    }

    public async cancel() {
        this.status = 'canceled';
        this.data.status = 'canceled';
        await this.bookingService.updateBooking(this.data, this.id);
    }

    public async accept() {
        this.status = 'accepted';
        this.data.status = 'accepted';
        await this.bookingService.updateBooking(this.data, this.id);
    }

    public async reject() {
        this.status = 'rejected';
        this.data.status = 'rejected';
        await this.bookingService.updateBooking(this.data, this.id);
    }

    public async reset() {
        this.status = 'request';
        this.data.status = 'request';
        await this.bookingService.updateBooking(this.data, this.id);
    }
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private bookingCollection: AngularFirestoreCollection<BookingData>;

    private bookingUpdates: Observable<Booking[]>;
    private bookings: Booking[] = [];

    constructor(
        db: AngularFirestore,
        private profileService: ProfileService,
        private stopService: StopService
    ) {
        this.bookingCollection = db.collection<BookingData>('bookings');

        this.bookingUpdates = this.bookingCollection.snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return new Booking(id, data, this, this.profileService, this.stopService);
                });
            })
        );

        this.bookingUpdates.subscribe(res => {
            this.bookings = res;
        });
    }

    getBooking(id: string) {
        return this.bookings.find(booking => booking.id === id);
    }

    getBookingUpdates(id: string) {
        return this.bookingCollection.doc(id).valueChanges();
    }

    getBookings(ids: string[]) {
        return this.bookings.filter(booking => ids.includes(booking.id));
    }

    getBookingsUpdates(ids: string[]) {
        return this.bookingUpdates.pipe(map(
            bookings => bookings.filter(booking => ids.includes(booking.id))
        ));
    }

    async createBooking(startLocation: string, endLocation: string) {
        const bookingDoc = await this.bookingCollection.add({
            user: firebase.auth().currentUser.uid,
            start_location: startLocation,
            end_location: endLocation,
            status: 'request'
        });
        return bookingDoc.id;
    }

    updateBooking(ride: BookingData, id: string) {
        return this.bookingCollection.doc(id).update(ride);
    }

    sortBookings(bookingA: Booking, bookingB: Booking) {
        function status2num(status: BookingStatus) {
            switch (status) {
                case 'accepted':
                    return 0;
                case 'request':
                    return 1;
                case 'rejected':
                    return 2;
                case 'canceled':
                    return 3;
            }
        }

        return status2num(bookingA.status) - status2num(bookingB.status);
    }
}
