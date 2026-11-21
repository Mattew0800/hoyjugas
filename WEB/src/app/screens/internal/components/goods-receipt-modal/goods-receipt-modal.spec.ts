import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsReciptModal } from './goods-receipt-modal';

describe('GoodsReciptModal', () => {
  let component: GoodsReciptModal;
  let fixture: ComponentFixture<GoodsReciptModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoodsReciptModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodsReciptModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
