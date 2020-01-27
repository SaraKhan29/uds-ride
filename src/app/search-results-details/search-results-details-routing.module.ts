import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchResultsDetailsPage } from './search-results-details.page';

const routes: Routes = [
  {
    path: '',
    component: SearchResultsDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchResultsDetailsPageRoutingModule {}
