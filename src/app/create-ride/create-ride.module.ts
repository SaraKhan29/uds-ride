import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateRidePageRoutingModule } from './create-ride-routing.module';

import { CreateRidePage } from './create-ride.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateRidePageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [CreateRidePage]
})
export class CreateRidePageModule {}
