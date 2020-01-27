import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateRidePage } from './create-ride.page';

const routes: Routes = [
  {
    path: '',
    component: CreateRidePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateRidePageRoutingModule {}
