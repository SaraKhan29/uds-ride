import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyRidesSuccessPageRoutingModule } from './my-rides-success-routing.module';

import { MyRidesSuccessPage } from './my-rides-success.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyRidesSuccessPageRoutingModule
  ],
  declarations: [MyRidesSuccessPage]
})
export class MyRidesSuccessPageModule {}
