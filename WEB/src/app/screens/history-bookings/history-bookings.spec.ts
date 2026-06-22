import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryBookings } from './history-bookings';

describe('HistoryBookings', () => {
  let component: HistoryBookings;
  let fixture: ComponentFixture<HistoryBookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryBookings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryBookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
