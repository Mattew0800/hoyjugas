import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceListItem } from './space-list-item';

describe('SpaceListItem', () => {
  let component: SpaceListItem;
  let fixture: ComponentFixture<SpaceListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceListItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
