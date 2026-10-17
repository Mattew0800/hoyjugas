import { TestBed } from '@angular/core/testing';

import { ComplexScheduleService } from './complex-schedule-service';

describe('ComplexScheduleService', () => {
  let service: ComplexScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComplexScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
