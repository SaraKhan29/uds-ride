import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchResultsDetailsPageRoutingModule } from './search-results-details-routing.module';

import { SearchResultsDetailsPage } from './search-results-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchResultsDetailsPageRoutingModule
  ],
  declarations: [SearchResultsDetailsPage]
})
export class SearchResultsDetailsPageModule {}
