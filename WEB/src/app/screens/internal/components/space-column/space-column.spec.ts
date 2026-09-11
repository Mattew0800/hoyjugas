import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceColumn } from './space-column';

describe('SpaceColumn', () => {
  let component: SpaceColumn;
  let fixture: ComponentFixture<SpaceColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceColumn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceColumn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
