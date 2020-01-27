import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BottomNavPageRoutingModule } from './bottom-nav-routing.module';
import { Routes, RouterModule } from '@angular/router';

import { BottomNavPage } from './bottom-nav.page';

const routes: Routes = [
  {
    path: 'bottom-nav',
    component: BottomNavPage,
    children: [
      {
        path: 'my-rides',
        children: [
          {
            path: '',
            loadChildren: '../my-rides/my-rides.module#MyRidesPageModule'
          }
        ]
      },
      {
        path: 'search-ride',
        children: [
          {
            path: '',
            loadChildren:
              '../search-ride/search-ride.module#SearchRidePageModule'
          }
        ]
      },
      // {
      //   path: 'tab3',
      //   children: [
      //     {
      //       path: '',
      //       loadChildren: '../tab3/tab3.module#Tab3PageModule'
      //     }
      //   ]
      // },
      {
        path: '',
        redirectTo: '/bottom-nav/search-ride',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/bottom-nav/search-ride',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, BottomNavPageRoutingModule],
  declarations: [BottomNavPage]
})
export class BottomNavPageModule {}
