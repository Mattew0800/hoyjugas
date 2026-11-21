
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ProductModal } from './product-modal';

describe('ProductModal', () => {
  let component: ProductModal;
  let fixture: ComponentFixture<ProductModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductModal],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
