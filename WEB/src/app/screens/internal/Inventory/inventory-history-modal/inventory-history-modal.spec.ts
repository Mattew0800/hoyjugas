import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryHistoryModal } from './inventory-history-modal';

describe('InventoryHistoryModal', () => {
  let component: InventoryHistoryModal;
  let fixture: ComponentFixture<InventoryHistoryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryHistoryModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryHistoryModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
