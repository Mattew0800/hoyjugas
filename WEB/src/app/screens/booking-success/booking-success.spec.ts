import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { BookingSuccess } from './booking-success';

describe('BookingSuccess', () => {
  let component: BookingSuccess;
  let fixture: ComponentFixture<BookingSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingSuccess],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingSuccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
