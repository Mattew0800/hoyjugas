import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesScreen } from './expenses-screen';

describe('ExpensesScreen', () => {
  let component: ExpensesScreen;
  let fixture: ComponentFixture<ExpensesScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
