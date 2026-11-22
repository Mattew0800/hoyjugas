
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SuppliersModal } from './suppliers-modal';

describe('SuppliersModal', () => {
  let component: SuppliersModal;
  let fixture: ComponentFixture<SuppliersModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliersModal],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuppliersModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
