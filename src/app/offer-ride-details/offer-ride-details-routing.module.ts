import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OfferRideDetailsPage } from './offer-ride-details.page';

const routes: Routes = [
  {
    path: '',
    component: OfferRideDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OfferRideDetailsPageRoutingModule {}
