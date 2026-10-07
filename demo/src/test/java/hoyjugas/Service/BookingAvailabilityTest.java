package hoyjugas.Service;

import hoyjugas.Enum.BookingStatus;
import hoyjugas.Enum.DayType;
import hoyjugas.Model.Booking;
import hoyjugas.Model.Space;
import hoyjugas.Model.SpaceSchedule;
import hoyjugas.Repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.MockedStatic;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class BookingAvailabilityTest {
    private final BookingRepository bookings = mock(BookingRepository.class);
    private final SpaceRepository spaces = mock(SpaceRepository.class);
    private final SpaceScheduleRepository schedules = mock(SpaceScheduleRepository.class);
    private final PricingService pricing = new PricingService(mock(SpacePricingRepository.class),
            mock(HolidayRepository.class), schedules);
    private final BookingService service = new BookingService(mock(BookingNotificationRepository.class),
            mock(SystemConfigRepository.class), bookings, spaces, mock(UserRepository.class), pricing,
            schedules, mock(PaymentRepository.class), mock(ComplexScheduleRepository.class));
    private final Space space = new Space();
    private final LocalDate today = LocalDate.of(2026, 1, 5);
    private MockedStatic<LocalDate> dates;
    private MockedStatic<LocalDateTime> times;

    @BeforeEach
    void setUp() {
        LocalDateTime now = today.atTime(10, 0);
        dates = mockStatic(LocalDate.class, CALLS_REAL_METHODS);
        times = mockStatic(LocalDateTime.class, CALLS_REAL_METHODS);
        dates.when(LocalDate::now).thenReturn(today);
        times.when(LocalDateTime::now).thenReturn(now);
        space.setId(1L);
        space.setSlotDuration(60);
        when(spaces.findByIsActiveTrue()).thenReturn(List.of(space));
        when(spaces.findAllByIsActiveTrue()).thenReturn(List.of(space));
    }

    @AfterEach
    void tearDown() {
        times.close();
        dates.close();
    }

    @ParameterizedTest
    @ValueSource(strings = {"09:59:59", "10:00", "10:30", "11:00", "12:30"})
    void bothCountersOnlyIncludeCompleteSlotsStartingInTheFuture(String time) {
        times.when(LocalDateTime::now).thenAnswer(call -> today.atTime(LocalTime.parse(time)));
        configure(schedule(DayType.DIA_DE_SEMANA, "08:00", "12:30"));
        int expected = switch (time) {
            case "09:59:59" -> 2;
            case "10:00", "10:30" -> 1;
            default -> 0;
        };
        assertThat(service.countAvailableSlotsToday()).isEqualTo(expected);
        var summary = service.getAvailabilityNext30Days();
        assertThat(summary.getDays().getFirst().getAvailableSlots()).isEqualTo(expected);
        assertThat(summary.getDays().get(1).getAvailableSlots()).isEqualTo(4);
    }

    @Test
    void aSlotEndingExactlyAtClosingIsIncluded() {
        configure(schedule(DayType.DIA_DE_SEMANA, "11:00", "12:00"));
        assertThat(service.countAvailableSlotsToday()).isEqualTo(1);
        assertThat(service.getAvailabilityNext30Days().getDays().getFirst().getAvailableSlots()).isEqualTo(1);
    }

    @ParameterizedTest
    @ValueSource(ints = {5, 6})
    void weekendsFallBackToGroupButSpecificSchedulesTakePrecedence(int offset) {
        LocalDate weekend = today.plusDays(offset);
        dates.when(LocalDate::now).thenReturn(weekend);
        times.when(LocalDateTime::now).thenAnswer(call -> weekend.atTime(10, 0));
        SpaceSchedule group = schedule(DayType.FIN_DE_SEMANA, "11:00", "13:00");
        configure(group);
        assertThat(service.countAvailableSlotsToday()).isEqualTo(2);
        assertThat(service.getAvailabilityNext30Days().getDays().getFirst().getAvailableSlots()).isEqualTo(2);

        SpaceSchedule specific = schedule(pricing.resolveSpecificDayType(weekend.getDayOfWeek()), "12:00", "13:00");
        configure(group, specific);
        assertThat(service.countAvailableSlotsToday()).isEqualTo(1);
        assertThat(service.getAvailabilityNext30Days().getDays().getFirst().getAvailableSlots()).isEqualTo(1);
    }

    @Test
    void finalReportedOvernightScheduleIncludesBookingsStartingOnTheFollowingDate() {
        configure(schedule(DayType.DIA_DE_SEMANA, "22:00", "02:30"));
        Booking booking = booking(today.plusDays(30).atStartOfDay(), today.plusDays(30).atTime(1, 0));
        when(bookings.findBySpaceIdInAndDateRange(anyList(), any(), any(), eq(BookingStatus.CANCELADO)))
                .thenAnswer(call -> booking.getStartDatetime().isBefore(call.getArgument(2))
                        ? List.of(booking) : List.of());
        var summary = service.getAvailabilityNext30Days();
        assertThat(summary.getDays()).hasSize(30);
        assertThat(summary.getDays().getLast().getAvailableSlots()).isEqualTo(3);
        assertThat(summary.getDays().get(1).getAvailableSlots()).isEqualTo(4);
        verify(bookings).findBySpaceIdInAndDateRange(List.of(1L), today.atStartOfDay(),
                today.plusDays(31).atStartOfDay(), BookingStatus.CANCELADO);
    }

    @Test
    void todayOvernightCounterUsesFullIntervalAndStrictOverlap() {
        configure(schedule(DayType.DIA_DE_SEMANA, "22:00", "02:30"));
        List<Booking> occupied = List.of(
                booking(today.minusDays(1).atTime(23, 0), today.atTime(23, 0)),
                booking(today.plusDays(1).atStartOfDay(), today.plusDays(1).atTime(1, 0)));
        when(bookings.findBySpaceAndDateRange(eq(1L), any(), any(), eq(BookingStatus.CANCELADO)))
                .thenReturn(occupied);
        assertThat(service.countAvailableSlotsToday()).isEqualTo(2);
        verify(bookings).findBySpaceAndDateRange(1L, today.atStartOfDay(), today.plusDays(1).atTime(2, 30),
                BookingStatus.CANCELADO);
    }

    private void configure(SpaceSchedule... configured) {
        List<SpaceSchedule> all = List.of(configured);
        when(schedules.findBySpaceIdIn(List.of(1L))).thenReturn(all);
        when(schedules.findAllBySpaceIdAndDayType(eq(1L), any()))
                .thenAnswer(call -> all.stream().filter(s -> s.getDayType() == call.getArgument(1)).toList());
    }

    private SpaceSchedule schedule(DayType day, String opening, String closing) {
        SpaceSchedule schedule = new SpaceSchedule();
        schedule.setSpace(space);
        schedule.setDayType(day);
        schedule.setOpeningTime(LocalTime.parse(opening));
        schedule.setClosingTime(LocalTime.parse(closing));
        return schedule;
    }

    private Booking booking(LocalDateTime start, LocalDateTime end) {
        Booking booking = new Booking();
        booking.setSpace(space);
        booking.setStartDatetime(start);
        booking.setEndDatetime(end);
        return booking;
    }
}
