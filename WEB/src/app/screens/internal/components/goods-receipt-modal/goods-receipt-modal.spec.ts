
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { GoodsReceiptModal } from './goods-receipt-modal';

describe('GoodsReceiptModal', () => {
  let component: GoodsReceiptModal;
  let fixture: ComponentFixture<GoodsReceiptModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoodsReceiptModal],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GoodsReceiptModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
