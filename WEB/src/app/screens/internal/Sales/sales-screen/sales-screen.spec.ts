import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesScreen } from './sales-screen';

describe('SalesScreen', () => {
  let component: SalesScreen;
  let fixture: ComponentFixture<SalesScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
