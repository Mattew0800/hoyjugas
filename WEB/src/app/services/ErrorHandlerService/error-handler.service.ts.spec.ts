import { TestBed } from '@angular/core/testing';

import { ErrorHandlerServiceTs } from './error-handler.service.ts';

describe('ErrorHandlerServiceTs', () => {
  let service: ErrorHandlerServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorHandlerServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
