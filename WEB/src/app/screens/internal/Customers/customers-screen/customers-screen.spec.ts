import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersScreen } from './customers-screen';

describe('CustomersScreen', () => {
  let component: CustomersScreen;
  let fixture: ComponentFixture<CustomersScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersScreen]
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
