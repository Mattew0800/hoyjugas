import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSelection } from './payment-selection';

describe('PaymentSelection', () => {
  let component: PaymentSelection;
  let fixture: ComponentFixture<PaymentSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
