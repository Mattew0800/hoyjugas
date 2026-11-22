
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { InventoryModal } from './inventory-modal';
import { InventoryItemModel } from '../../models/inventory.model';

describe('InventoryModal', () => {
  let component: InventoryModal;
  let fixture: ComponentFixture<InventoryModal>;
  let item: InventoryItemModel;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryModal],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

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

    fixture = TestBed.createComponent(InventoryModal);
    fixture.componentRef.setInput('item', item);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
