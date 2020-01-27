import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OfferRideDetailsPageRoutingModule } from './offer-ride-details-routing.module';

import { OfferRideDetailsPage } from './offer-ride-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OfferRideDetailsPageRoutingModule
  ],
  declarations: [OfferRideDetailsPage]
})
export class OfferRideDetailsPageModule {}
