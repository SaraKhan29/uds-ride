import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyRidesSuccessPage } from './my-rides-success.page';

const routes: Routes = [
  {
    path: '',
    component: MyRidesSuccessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyRidesSuccessPageRoutingModule {}
