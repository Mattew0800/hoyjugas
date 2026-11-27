
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SuppliersScreen } from './suppliers-screen';

describe('SuppliersScreen', () => {
  let component: SuppliersScreen;
  let fixture: ComponentFixture<SuppliersScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliersScreen],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuppliersScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
