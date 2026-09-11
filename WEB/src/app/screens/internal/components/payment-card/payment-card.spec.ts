import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCard } from './payment-card';

describe('PaymentCard', () => {
  let component: PaymentCard;
  let fixture: ComponentFixture<PaymentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
