import { TestBed } from '@angular/core/testing';

import { EmployeeSrevice } from './employee-srevice';

describe('EmployeeSrevice', () => {
  let service: EmployeeSrevice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeSrevice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
