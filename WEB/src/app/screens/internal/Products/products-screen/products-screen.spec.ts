import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsScreen } from './products-screen';

describe('ProductsScreen', () => {
  let component: ProductsScreen;
  let fixture: ComponentFixture<ProductsScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
