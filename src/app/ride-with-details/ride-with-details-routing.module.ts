import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RideWithDetailsPage } from './ride-with-details.page';

const routes: Routes = [
  {
    path: '',
    component: RideWithDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RideWithDetailsPageRoutingModule {}
