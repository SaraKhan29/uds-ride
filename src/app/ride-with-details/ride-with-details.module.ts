import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RideWithDetailsPageRoutingModule } from './ride-with-details-routing.module';

import { RideWithDetailsPage } from './ride-with-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RideWithDetailsPageRoutingModule
  ],
  declarations: [RideWithDetailsPage]
})
export class RideWithDetailsPageModule {}
