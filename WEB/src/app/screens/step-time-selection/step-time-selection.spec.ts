import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepTimeSelection } from './step-time-selection';

describe('StepTimeSelection', () => {
  let component: StepTimeSelection;
  let fixture: ComponentFixture<StepTimeSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepTimeSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepTimeSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
