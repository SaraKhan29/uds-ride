import { DataResolverService } from './resolver/data-resolver.service';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'email-verification',
    loadChildren: () => import('./email-verification/email-verification.module').then( m => m.EmailVerificationPageModule)
  },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
  {
    path: 'search-results',
    loadChildren: () => import('./search-results/search-results.module').then( m => m.SearchResultsPageModule)
  },
  {
    path: 'tabs/tab2/search-results/:id',
    resolve: {
      special: DataResolverService
    },
    loadChildren: () => import('./search-results/search-results.module').then( m => m.SearchResultsPageModule)
  },
  {
    path: 'search-results-details',
    loadChildren: () => import('./search-results-details/search-results-details.module').then( m => m.SearchResultsDetailsPageModule)
  },
  {
    path: 'search-results-details/:id',
    resolve: {
      special: DataResolverService
    },
    loadChildren: () => import('./search-results-details/search-results-details.module').then( m => m.SearchResultsDetailsPageModule)
  },
  {
    path: 'account-verification',
    loadChildren: () => import('./account-verification/account-verification.module').then( m => m.AccountVerificationPageModule)
  },
  {
    path: 'my-rides-success',
    loadChildren: () => import('./my-rides-success/my-rides-success.module').then( m => m.MyRidesSuccessPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'edit-car',
    loadChildren: () => import('./edit-car/edit-car.module').then( m => m.EditCarPageModule)
  },
  {
    path: 'create-ride/:id',
    resolve: {
      special: DataResolverService
    },
    loadChildren: () => import('./create-ride/create-ride.module').then( m => m.CreateRidePageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'offer-ride-details/:id',
    resolve: {
      special: DataResolverService
    },
    loadChildren: () => import('./offer-ride-details/offer-ride-details.module').then( m => m.OfferRideDetailsPageModule)
  },

  {
    path: 'ride-with-details/:id',
    resolve: {
      special: DataResolverService
    },
    loadChildren: () => import('./ride-with-details/ride-with-details.module').then( m => m.RideWithDetailsPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
