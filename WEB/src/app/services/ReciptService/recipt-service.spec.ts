import { TestBed } from '@angular/core/testing';

import { ReciptService } from './recipt-service';

describe('ReciptService', () => {
  let service: ReciptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReciptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
