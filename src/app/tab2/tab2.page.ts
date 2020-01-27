import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { StopService, Stop } from '../services/stop.service';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page {
  stops1: Stop[];
  stops2: Stop[];
  stop1: Stop;
  stop2: Stop;

  fromCampus = false;

  locations = ['stop1', 'stop2'];

  constructor(
    private router: Router,
    private dataService: DataService,
    private stopService: StopService
  ) {
    this.stops1 = this.stopService.getNearestStops(false);
    this.stops2 = this.stopService.getNearestStops(true);

    this.stopService.getNearestStopUpdates(false).subscribe(stops => this.stops1 = stops);
    this.stopService.getNearestStopUpdates(true).subscribe(stops => this.stops2 = stops);

    console.log(this.stops1);
    console.log(this.stops2);
  }

  goToSearchResults() {
    this.locations[0] = this.stop1.id;
    this.locations[1] = this.stop2.id;
    this.dataService.setData(1, this.locations);
    this.router.navigate(['/tabs/tab2/search-results/1']);
  }

  onSwap() {
    const startStop = this.stop2;
    this.stop2 = this.stop1;
    this.stop1 = startStop;

    this.fromCampus = !this.fromCampus;
  }
}
