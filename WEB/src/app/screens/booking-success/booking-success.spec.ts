import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingSuccess } from './booking-success';

describe('BookingSuccess', () => {
  let component: BookingSuccess;
  let fixture: ComponentFixture<BookingSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingSuccess]
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
