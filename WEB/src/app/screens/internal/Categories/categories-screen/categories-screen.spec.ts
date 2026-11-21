
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CategoriesScreen } from './categories-screen';

describe('CategoriesScreen', () => {
  let component: CategoriesScreen;
  let fixture: ComponentFixture<CategoriesScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesScreen],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
