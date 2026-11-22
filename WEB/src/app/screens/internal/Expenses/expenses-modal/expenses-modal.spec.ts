
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ExpensesModal } from './expenses-modal';

describe('ExpensesModal', () => {
  let component: ExpensesModal;
  let fixture: ComponentFixture<ExpensesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesModal],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
