import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyRidesSuccessPage } from './my-rides-success.page';

describe('MyRidesSuccessPage', () => {
  let component: MyRidesSuccessPage;
  let fixture: ComponentFixture<MyRidesSuccessPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyRidesSuccessPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRidesSuccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
