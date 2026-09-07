import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalSideBar } from './internal-side-bar';

describe('InternalSideBar', () => {
  let component: InternalSideBar;
  let fixture: ComponentFixture<InternalSideBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalSideBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalSideBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
