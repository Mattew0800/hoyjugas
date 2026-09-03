import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDateModal } from './select-date-modal';

describe('SelectDateModal', () => {
  let component: SelectDateModal;
  let fixture: ComponentFixture<SelectDateModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectDateModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectDateModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
