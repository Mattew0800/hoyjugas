
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { InventoryHistoryModal } from './inventory-history-modal';

import { InventoryItemModel } from '../../models/inventory.model';

import { InventoryService } from '../../../../services/InventoryService/inventory-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

describe('InventoryHistoryModal', () => {
  let component: InventoryHistoryModal;
  let fixture: ComponentFixture<InventoryHistoryModal>;

  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;

  let item: InventoryItemModel;

  beforeEach(async () => {
    inventoryServiceSpy = jasmine.createSpyObj(
      'InventoryService',
      ['getMovementsByItem']
    );

    errorHandlerSpy = jasmine.createSpyObj(
      'ErrorHandlerService',
      ['getMessage']
    );

    inventoryServiceSpy.getMovementsByItem.and.returnValue(of([]));

    item = {
      id: 1,
      name: 'Pelotas de fútbol',
      quantity: 20,
      minimumQuantity: 5,
      lowStock: false,
      description: 'Pelotas para entrenamiento',
      categoryName: 'Deportes',
      isActive: true
    };

    await TestBed.configureTestingModule({
      imports: [InventoryHistoryModal],
      providers: [
        {
          provide: InventoryService,
          useValue: inventoryServiceSpy
        },
        {
          provide: ErrorHandlerService,
          useValue: errorHandlerSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryHistoryModal);

    fixture.componentRef.setInput('item', item);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
