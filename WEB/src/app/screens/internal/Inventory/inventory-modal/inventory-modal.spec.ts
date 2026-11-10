import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryModal } from './inventory-modal';

describe('InventoryModal', () => {
  let component: InventoryModal;
  let fixture: ComponentFixture<InventoryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
