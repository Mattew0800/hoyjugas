
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { InventoryScreen } from './inventory-screen';

describe('InventoryScreen', () => {
  let component: InventoryScreen;
  let fixture: ComponentFixture<InventoryScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryScreen],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
