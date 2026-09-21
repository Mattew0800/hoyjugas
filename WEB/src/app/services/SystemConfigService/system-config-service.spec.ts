import { TestBed } from '@angular/core/testing';

import { SystemConfigService } from './system-config-service';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SystemConfigService', () => {
  let service: SystemConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SystemConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
