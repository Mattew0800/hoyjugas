import { TestBed } from '@angular/core/testing';

import { ProductServiceTs } from './product-service.ts';

describe('ProductServiceTs', () => {
  let service: ProductServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
