import { TestBed } from '@angular/core/testing';

import { RecurringBookingService } from './recurring-booking-service';

describe('RecurringBookingService', () => {
  let service: RecurringBookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecurringBookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
