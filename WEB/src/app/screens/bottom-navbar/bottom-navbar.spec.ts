import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavbar } from './bottom-navbar';

describe('BottomNavbar', () => {
  let component: BottomNavbar;
  let fixture: ComponentFixture<BottomNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
