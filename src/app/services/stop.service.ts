import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import LatLon from 'geodesy/latlon-ellipsoidal-vincenty.js';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { humanizeDistanceStringMetric } from '@opentripplanner/humanize-distance';

export class StopData {
    name: string;
    id: string;
    campus: boolean;
    neighboringStops: string[];

    latitude: number;
    longitude: number;
}

export class Stop {
    public nameWithDistance: string;
    public name: string;
    public id: string;
    public campus: boolean;

    constructor(private data: StopData, private service: StopService) {
        this.nameWithDistance = this.data.name;
        this.name = this.data.name;
        this.id = this.data.id;
        this.campus = this.data.campus;
    }

    getLocation(): LatLon {
        return new LatLon(this.data.latitude, this.data.longitude);
    }

    getDistanceTo(location: LatLon) {
        return location.distanceTo(this.getLocation());
    }

    getDistanceToCurrentLocation() {
        return this.getDistanceTo(this.service.getCurrentLocation());
    }

    updateDistanceToCurrentLocation() {
        const distance = humanizeDistanceStringMetric(this.getDistanceToCurrentLocation());
        this.nameWithDistance = `${ this.data.name } (${ distance })`;
    }

    isAtCampus(): boolean {
        return this.data.campus;
    }
}

@Injectable({
    providedIn: 'root'
})
export class StopService {
    private stops: Stop[] = [];
    private stopsSubject = new Subject<Stop[]>();
    private stopUpdates = this.stopsSubject.asObservable();

    private currentLatitude = undefined;
    private currentLongitude = undefined;

    private defaultLatitude = 49.25474;
    private defaultLongitude = 7.04067;

    constructor(
        private http: HttpClient,
        private geolocation: Geolocation
    ) {
        this.stopUpdates.subscribe(
            stops => this.stops = stops
        );

        this.http.get('../../assets/stops.json').pipe(map(
            data => {
                if (!(data instanceof Array)) {
                    return [];
                }

                return data.map(
                    (stop: StopData) => new Stop(stop, this)
                );
            }
        )).subscribe(
            stops => this.stopsSubject.next(stops)
        );

        this.geolocation.watchPosition().subscribe((data) => {
            if (data.coords) {
                this.currentLatitude = data.coords.latitude;
                this.currentLongitude = data.coords.longitude;

                for (const stop of this.stops) {
                    stop.updateDistanceToCurrentLocation();
                }

                this.stopsSubject.next(this.stops);
            }
        });
    }

    public getStop(id: string) {
        return this.stops.find(stop => stop.id === id);
    }

    public getStopUpdates(id: string) {
        return this.stopUpdates.pipe(map(
            stops => stops.find(stop => stop.id === id)
        ));
    }

    public getAllStops(campus: boolean = false): Stop[] {
        return this.stops.filter(stop => stop.isAtCampus() === campus);
    }

    public getAllStopUpdates(campus: boolean = false): Observable<Stop[]> {
        return this.stopUpdates.pipe(map(
            stops => {
                return stops.filter(stop => stop.isAtCampus() === campus);
            }
        ));
    }

    public getNearestStops(campus: boolean = false) {
        const location = this.getCurrentLocation();
        return this.getAllStops(campus).sort(
            (aStop, bStop) => aStop.getDistanceTo(location) - bStop.getDistanceTo(location)
        );
    }

    public getNearestStopUpdates(campus: boolean = false) {
        return this.getAllStopUpdates(campus).pipe(map(
            stops => {
                const location = this.getCurrentLocation();
                return stops.sort(
                    (aStop, bStop) => aStop.getDistanceTo(location) - bStop.getDistanceTo(location)
                );
            }
        ));
    }

    public getCurrentLocation(): LatLon {
        if (this.currentLatitude === undefined || this.currentLongitude === undefined) {
            return new LatLon(this.defaultLatitude, this.defaultLongitude);
        }

        return new LatLon(this.currentLatitude, this.currentLongitude);
    }
}
