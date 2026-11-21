import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesModal } from './expenses-modal';

describe('ExpensesModal', () => {
  let component: ExpensesModal;
  let fixture: ComponentFixture<ExpensesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
