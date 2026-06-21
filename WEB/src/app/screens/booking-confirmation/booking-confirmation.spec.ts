import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingConfirmation } from './booking-confirmation';

describe('BookingConfirmation', () => {
  let component: BookingConfirmation;
  let fixture: ComponentFixture<BookingConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingConfirmation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
