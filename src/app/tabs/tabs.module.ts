import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs-routing.module';
import { IonicSelectableModule } from 'ionic-selectable';

import { TabsPage } from './tabs.page';

@NgModule({
  imports:
    [
      IonicModule,
      CommonModule,
      FormsModule,
      TabsPageRoutingModule,
      IonicSelectableModule
    ],
  declarations:
    [
      TabsPage
    ]
})
export class TabsPageModule {}
