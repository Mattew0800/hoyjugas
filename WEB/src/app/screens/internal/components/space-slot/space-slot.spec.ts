import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceSlot } from './space-slot';

describe('SpaceSlot', () => {
  let component: SpaceSlot;
  let fixture: ComponentFixture<SpaceSlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceSlot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceSlot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
