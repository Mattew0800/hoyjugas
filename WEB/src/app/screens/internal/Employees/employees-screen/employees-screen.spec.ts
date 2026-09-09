import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesScreen } from './employees-screen';

describe('EmployeesScreen', () => {
  let component: EmployeesScreen;
  let fixture: ComponentFixture<EmployeesScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
