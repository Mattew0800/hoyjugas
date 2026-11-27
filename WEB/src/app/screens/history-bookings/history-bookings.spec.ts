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

  it('should send cancelled bookings to history and not upcoming', () => {
    component.bookings = [
      {
        id: 1,
        bookingNumber: 'B1',
        clientName: 'Test',
        clientPhone: '123',
        spaceName: 'Cancha 1',
        startDatetime: '2026-09-16T10:00:00',
        endDatetime: '2026-09-16T11:00:00',
        status: 'CANCELADO',
        paymentStatus: 'PAGADO',
        totalAmount: 1000,
        remainingAmount: 0,
        paymentCollectedByName: 'Admin'
      },
      {
        id: 2,
        bookingNumber: 'B2',
        clientName: 'Test',
        clientPhone: '123',
        spaceName: 'Cancha 2',
        startDatetime: '2026-09-18T10:00:00',
        endDatetime: '2026-09-18T11:00:00',
        status: 'CONFIRMADO',
        paymentStatus: 'PAGADO',
        totalAmount: 1000,
        remainingAmount: 0,
        paymentCollectedByName: 'Admin'
      }
    ];

    component.activeTab = 'upcoming';

    expect(component.filteredBookings.map((booking) => booking.id)).toEqual([2]);

    component.activeTab = 'past';

    expect(component.filteredBookings.map((booking) => booking.id)).toEqual([1]);
    expect(component.getPaymentText(component.bookings[0])).toBe('Cancelado');
  });
});
