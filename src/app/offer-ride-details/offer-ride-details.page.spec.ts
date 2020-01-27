import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OfferRideDetailsPage } from './offer-ride-details.page';

describe('OfferRideDetailsPage', () => {
  let component: OfferRideDetailsPage;
  let fixture: ComponentFixture<OfferRideDetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfferRideDetailsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OfferRideDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
