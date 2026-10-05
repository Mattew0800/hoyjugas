import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepPaymentSelection } from './step-payment-selection';

describe('StepPaymentSelection', () => {
  let component: StepPaymentSelection;
  let fixture: ComponentFixture<StepPaymentSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepPaymentSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepPaymentSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
