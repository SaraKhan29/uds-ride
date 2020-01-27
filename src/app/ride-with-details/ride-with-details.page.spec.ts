import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RideWithDetailsPage } from './ride-with-details.page';

describe('RideWithDetailsPage', () => {
  let component: RideWithDetailsPage;
  let fixture: ComponentFixture<RideWithDetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RideWithDetailsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RideWithDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
