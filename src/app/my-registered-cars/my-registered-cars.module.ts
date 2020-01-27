import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyRegisteredCarsPageRoutingModule } from './my-registered-cars-routing.module';

import { MyRegisteredCarsPage } from './my-registered-cars.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyRegisteredCarsPageRoutingModule
  ],
  declarations: [MyRegisteredCarsPage]
})
export class MyRegisteredCarsPageModule {}
