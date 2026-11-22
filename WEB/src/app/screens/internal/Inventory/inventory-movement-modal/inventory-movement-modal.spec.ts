import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryMovementModal } from './inventory-movement-modal';

describe('InventoryMovementModal', () => {
  let component: InventoryMovementModal;
  let fixture: ComponentFixture<InventoryMovementModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryMovementModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryMovementModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
