import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditCarPage } from './edit-car.page';

describe('EditCarPage', () => {
  let component: EditCarPage;
  let fixture: ComponentFixture<EditCarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCarPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditCarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
