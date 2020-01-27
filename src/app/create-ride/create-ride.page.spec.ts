import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateRidePage } from './create-ride.page';

describe('CreateRidePage', () => {
  let component: CreateRidePage;
  let fixture: ComponentFixture<CreateRidePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateRidePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRidePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
