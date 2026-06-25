import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldColumn } from './field-column';

describe('FieldColumn', () => {
  let component: FieldColumn;
  let fixture: ComponentFixture<FieldColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldColumn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldColumn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
