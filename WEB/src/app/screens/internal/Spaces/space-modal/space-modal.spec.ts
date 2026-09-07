import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceModal } from './space-modal';

describe('SpaceModal', () => {
  let component: SpaceModal;
  let fixture: ComponentFixture<SpaceModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
