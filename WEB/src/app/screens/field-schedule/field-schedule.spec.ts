import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldSchedule } from './field-schedule';

describe('FieldSchedule', () => {
  let component: FieldSchedule;
  let fixture: ComponentFixture<FieldSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldSchedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
