
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';

import { SalesScreen } from './sales-screen';

import { ProductService } from '../../../../services/ProductService/product-service';
import { UserService } from '../../../../services/UserService/user-service';
import { SaleService } from '../../../../services/SaleService/sale-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

import { ProductListModel } from '../../models/product.model';

describe('SalesScreen', () => {
  let component: SalesScreen;
  let fixture: ComponentFixture<SalesScreen>;

  let productService: jasmine.SpyObj<ProductService>;
  let userService: jasmine.SpyObj<UserService>;
  let saleService: jasmine.SpyObj<SaleService>;
  let errorHandler: jasmine.SpyObj<ErrorHandlerService>;

  beforeEach(async () => {
    productService = jasmine.createSpyObj<ProductService>(
      'ProductService',
      ['getAllProducts']
    );

    userService = jasmine.createSpyObj<UserService>(
      'UserService',
      ['getClients']
    );

    saleService = jasmine.createSpyObj<SaleService>(
      'SaleService',
      ['createSale']
    );

    errorHandler = jasmine.createSpyObj<ErrorHandlerService>(
      'ErrorHandlerService',
      ['getMessage']
    );

    productService.getAllProducts.and.returnValue(
      of({
        content: [],
        last: true,
        totalPages: 0,
        totalElements: 0
      } as any)
    );

    userService.getClients.and.returnValue(of([]));

    errorHandler.getMessage.and.returnValue(
      'Error al registrar la venta.'
    );

    await TestBed.configureTestingModule({
      imports: [SalesScreen],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),

        { provide: ProductService, useValue: productService },
        { provide: UserService, useValue: userService },
        { provide: SaleService, useValue: saleService },
        { provide: ErrorHandlerService, useValue: errorHandler }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function createProduct(
    id: number,
    name: string,
    stock: number
  ): ProductListModel {
    return {
      id,
      name,
      stock,
      salePrice: 1000
    } as ProductListModel;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send only one request when confirmSale is called twice while submitting', () => {
    const saleSubject = new Subject<any>();

    saleService.createSale.and.returnValue(saleSubject);

    const product = createProduct(1, 'Producto de prueba', 5);

    component.cart = [
      {
        product,
        quantity: 1
      }
    ];

    component.employeePin = '1234';

    component.confirmSale();
    component.confirmSale();

    expect(component.submitting).toBeTrue();
    expect(saleService.createSale).toHaveBeenCalledTimes(1);

    saleSubject.complete();
  });

  it('should release submitting and preserve the sale error during product refresh', () => {
    const saleSubject = new Subject<any>();

    saleService.createSale.and.returnValue(saleSubject);
    errorHandler.getMessage.and.returnValue('PIN inválido.');

    const product = createProduct(1, 'Producto de prueba', 5);

    component.cart = [
      {
        product,
        quantity: 1
      }
    ];

    component.employeePin = '0000';

    component.confirmSale();

    expect(component.submitting).toBeTrue();

    saleSubject.error({ status: 400 });

    expect(component.submitting).toBeFalse();
    expect(component.errorMessage).toBe('PIN inválido.');
    expect(productService.getAllProducts).toHaveBeenCalledTimes(2);
  });

  it('should update cart quantities and remove products without stock after catalog refresh', () => {
    const productWithUpdatedStock = createProduct(
      1,
      'Producto con stock actualizado',
      3
    );

    const productWithoutStock = createProduct(
      2,
      'Producto sin stock',
      0
    );

    component.cart = [
      {
        product: createProduct(
          1,
          'Producto con stock actualizado',
          10
        ),
        quantity: 5
      },
      {
        product: createProduct(
          2,
          'Producto sin stock',
          4
        ),
        quantity: 2
      }
    ];

    productService.getAllProducts.and.returnValue(
      of({
        content: [
          productWithUpdatedStock,
          productWithoutStock
        ],
        last: true,
        totalPages: 1,
        totalElements: 2
      } as any)
    );

    component.loadProducts();

    expect(component.cart.length).toBe(1);
    expect(component.cart[0].product.id).toBe(1);
    expect(component.cart[0].quantity).toBe(3);
    expect(component.cart[0].product.stock).toBe(3);

    expect(component.errorMessage).toContain(
      'La cantidad de Producto con stock actualizado se ajustó a 3'
    );

    expect(component.errorMessage).toContain(
      'Producto sin stock fue retirado del carrito'
    );
  });
});
