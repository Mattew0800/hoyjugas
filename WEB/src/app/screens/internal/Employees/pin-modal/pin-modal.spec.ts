import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinModal } from './pin-modal';

describe('PinModal', () => {
  let component: PinModal;
  let fixture: ComponentFixture<PinModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
