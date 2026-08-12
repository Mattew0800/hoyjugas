import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalBookingModal } from './internal-booking-modal';

describe('InternalBookingModal', () => {
  let component: InternalBookingModal;
  let fixture: ComponentFixture<InternalBookingModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalBookingModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalBookingModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
