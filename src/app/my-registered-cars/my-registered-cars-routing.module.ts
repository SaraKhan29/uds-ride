import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyRegisteredCarsPage } from './my-registered-cars.page';

const routes: Routes = [
  {
    path: '',
    component: MyRegisteredCarsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyRegisteredCarsPageRoutingModule {}
