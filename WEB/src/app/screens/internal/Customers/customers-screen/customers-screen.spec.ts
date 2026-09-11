import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { CustomersScreen } from './customers-screen';
import { UserService } from '../../../../services/UserService/user-service';

describe('CustomersScreen', () => {

  let component: CustomersScreen;
  let fixture: ComponentFixture<CustomersScreen>;

  const userServiceMock = {
    getClients: jasmine.createSpy('getClients')
      .and.returnValue(of([]))
  };

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [
        CustomersScreen
      ],

      providers: [
        {
          provide: UserService,
          useValue: userServiceMock
        }
      ]
    })
      .overrideComponent(CustomersScreen, {
        set: {
          imports: [FormsModule],
          template: ''
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomersScreen);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
