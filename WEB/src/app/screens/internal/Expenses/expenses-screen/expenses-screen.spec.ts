
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ExpensesScreen } from './expenses-screen';

describe('ExpensesScreen', () => {
  let component: ExpensesScreen;
  let fixture: ComponentFixture<ExpensesScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesScreen],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
