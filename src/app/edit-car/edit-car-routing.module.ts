import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditCarPage } from './edit-car.page';

const routes: Routes = [
  {
    path: '',
    component: EditCarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditcarPageRoutingModule {}
