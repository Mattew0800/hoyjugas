
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SaleService } from './sale-service';

describe('SaleService', () => {
  let service: SaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
