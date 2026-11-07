import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesScreen } from './categories-screen';

describe('CategoriesScreen', () => {
  let component: CategoriesScreen;
  let fixture: ComponentFixture<CategoriesScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
