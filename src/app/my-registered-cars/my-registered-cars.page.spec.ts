import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyRegisteredCarsPage } from './my-registered-cars.page';

describe('MyRegisteredCarsPage', () => {
  let component: MyRegisteredCarsPage;
  let fixture: ComponentFixture<MyRegisteredCarsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyRegisteredCarsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRegisteredCarsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
