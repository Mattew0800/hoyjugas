import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReciptService } from './recipt-service';

describe('ReciptService', () => {
  let service: ReciptService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient()
      ]
    });

    service = TestBed.inject(ReciptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
