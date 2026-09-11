import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpacesScreen } from './spaces-screen';

describe('SpacesScreen', () => {
  let component: SpacesScreen;
  let fixture: ComponentFixture<SpacesScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpacesScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpacesScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
