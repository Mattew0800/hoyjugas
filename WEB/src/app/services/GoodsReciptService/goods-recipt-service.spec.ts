import { TestBed } from '@angular/core/testing';

import { GoodsReciptService } from './goods-recipt-service';

describe('GoodsReciptService', () => {
  let service: GoodsReciptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoodsReciptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
