
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryModal } from './categories-modal';

describe('CategoryModal', () => {
  let component: CategoryModal;
  let fixture: ComponentFixture<CategoryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryModal]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
