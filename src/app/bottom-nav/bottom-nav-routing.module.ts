import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BottomNavPage } from './bottom-nav.page';

const routes: Routes = [
  {
    path: '',
    component: BottomNavPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BottomNavPageRoutingModule {}
