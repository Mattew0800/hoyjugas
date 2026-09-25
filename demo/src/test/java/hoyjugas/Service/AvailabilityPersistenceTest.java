package hoyjugas.Service;

import hoyjugas.DTO.SpacePricing.SpacePricingRequestDTO;
import hoyjugas.DTO.SpaceSchedule.SpaceScheduleRequestDTO;
import hoyjugas.Enum.BookingStatus;
import hoyjugas.Enum.DayType;
import hoyjugas.Enum.Role;
import hoyjugas.Model.*;
import hoyjugas.Repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:availability;NON_KEYWORDS=USER;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.sql.init.mode=never",
        "spring.jpa.hibernate.ddl-auto=create-drop"
}, showSql = false)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({SpaceScheduleService.class, PricingService.class})
class AvailabilityPersistenceTest {
    @Autowired EntityManager em;
    @Autowired BookingRepository bookings;
    @Autowired SpacePricingRepository pricings;
    @Autowired SpaceScheduleRepository schedules;
    @Autowired SpaceScheduleService service;
    private Space space;

    @BeforeEach
    void setUp() {
        space = new Space();
        space.setName("Test court");
        space.setType("Football");
        space.setSlotDuration(60);
        space.setDepositValue(BigDecimal.ZERO);
        em.persist(space);
    }

    @Test
    void rangeQueriesIncludeOverlapsAndExcludeTouchingCancelledAndOtherSpaceBookings() {
        User client = new User();
        client.setName("Test client");
        client.setEmail("client@example.test");
        client.setPassword("test-password");
        client.setPhone("1234567890");
        client.setRole(Role.USER);
        em.persist(client);
        LocalDateTime start = LocalDate.of(2026, 1, 5).atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        Booking spanning = booking(client, start.minusHours(2), end.plusHours(2));
        Booking entering = booking(client, start.minusHours(1), start.plusHours(1));
        Booking inside = booking(client, start.plusHours(2), start.plusHours(3));
        booking(client, start.minusHours(2), start);
        booking(client, end, end.plusHours(1));
        Booking cancelled = booking(client, start.plusHours(4), start.plusHours(5));
        cancelled.setBookingStatus(BookingStatus.CANCELADO);
        Space other = new Space();
        other.setName("Other court");
        other.setType("Football");
        other.setSlotDuration(60);
        other.setDepositValue(BigDecimal.ZERO);
        em.persist(other);
        Booking otherBooking = booking(client, start.plusHours(6), start.plusHours(7));
        otherBooking.setSpace(other);
        em.flush();
        assertThat(bookings.findBySpaceAndDateRange(space.getId(), start, end, BookingStatus.CANCELADO))
                .containsExactlyInAnyOrder(spanning, entering, inside);
        assertThat(bookings.findBySpaceIdInAndDateRange(List.of(space.getId()), start, end, BookingStatus.CANCELADO))
                .containsExactlyInAnyOrder(spanning, entering, inside);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void replacementAndDeletionRemoveLegacyAndLinkedPricingWithoutDeletingOtherSchedules(boolean replace) {
        SpaceSchedule target = schedule(DayType.FIN_DE_SEMANA, "08:00", "10:00");
        SpaceSchedule other = schedule(DayType.FIN_DE_SEMANA, "12:00", "14:00");
        pricing(target, DayType.FIN_DE_SEMANA, "08:00", "10:00");
        pricing(null, DayType.SABADO, "08:00", "10:00");
        pricing(null, DayType.DOMINGO, "08:00", "10:00");
        pricing(null, DayType.FIN_DE_SEMANA, "08:00", "10:00");
        SpacePricing otherLinked = pricing(other, DayType.FIN_DE_SEMANA, "12:00", "14:00");
        SpacePricing otherLegacy = pricing(null, DayType.SABADO, "12:00", "14:00");
        SpacePricing otherDay = pricing(null, DayType.LUNES, "08:00", "10:00");
        em.flush();
        em.clear();
        // Exercise replacement with the parent pricing collection already initialized.
        SpaceSchedule loaded = schedules.findById(target.getId()).orElseThrow();
        loaded.getPricings().size();
        loaded.getSpace().getPricings().size();
        if (replace) {
            var dto = request(DayType.LUNES, "09:00", "11:00");
            SpacePricingRequestDTO price = new SpacePricingRequestDTO();
            price.setDayType(DayType.LUNES);
            price.setStartTime(dto.getOpeningTime());
            price.setEndTime(dto.getClosingTime());
            price.setPrice(BigDecimal.TEN);
            service.updateScheduleWithPricing(space.getId(), target.getId(), dto, List.of(price));
        } else {
            service.deleteSchedule(space.getId(), target.getId());
        }
        em.flush();
        em.clear();
        List<SpacePricing> remaining = pricings.findBySpaceId(space.getId());
        assertThat(remaining).hasSize(replace ? 4 : 3);
        assertThat(remaining).extracting(SpacePricing::getId)
                .contains(otherLinked.getId(), otherLegacy.getId(), otherDay.getId());
        if (replace) {
            SpacePricing replacement = remaining.stream()
                    .filter(p -> p.getSchedule() != null && p.getSchedule().getId().equals(target.getId()))
                    .findFirst().orElseThrow();
            assertThat(replacement.getDayType()).isEqualTo(DayType.LUNES);
            assertThat(replacement.getStartTime()).isEqualTo(LocalTime.of(9, 0));
            assertThat(replacement.getEndTime()).isEqualTo(LocalTime.of(11, 0));
            assertThat(replacement.getSchedule().getDayType()).isEqualTo(DayType.LUNES);
        } else {
            assertThat(schedules.existsById(target.getId())).isFalse();
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"day", "opening", "closing"})
    void scheduleOnlyChangesWithLinkedPricingAreRejectedBeforeMutation(String field) {
        SpaceSchedule schedule = schedule(DayType.LUNES, "08:00", "10:00");
        pricing(schedule, DayType.LUNES, "08:00", "10:00");
        em.flush();
        var dto = request(DayType.LUNES, "08:00", "10:00");
        switch (field) {
            case "day" -> dto.setDayType(DayType.MARTES);
            case "opening" -> dto.setOpeningTime(LocalTime.of(9, 0));
            case "closing" -> dto.setClosingTime(LocalTime.of(11, 0));
            default -> throw new AssertionError(field);
        }
        assertThatThrownBy(() -> service.updateSchedule(space.getId(), schedule.getId(), dto))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
        assertThat(schedule.getDayType()).isEqualTo(DayType.LUNES);
        assertThat(schedule.getOpeningTime()).isEqualTo(LocalTime.of(8, 0));
        assertThat(schedule.getClosingTime()).isEqualTo(LocalTime.of(10, 0));
    }

    @Test
    void unchangedScheduleWithPricingAndChangedScheduleWithoutPricingRemainAllowed() {
        SpaceSchedule linked = schedule(DayType.LUNES, "08:00", "10:00");
        pricing(linked, DayType.LUNES, "08:00", "10:00");
        service.updateSchedule(space.getId(), linked.getId(), request(DayType.LUNES, "08:00", "10:00"));
        SpaceSchedule unlinked = schedule(DayType.MARTES, "08:00", "10:00");
        service.updateSchedule(space.getId(), unlinked.getId(), request(DayType.MIERCOLES, "09:00", "11:00"));
        em.flush();
        em.clear();
        assertThat(pricings.existsByScheduleId(linked.getId())).isTrue();
        assertThat(schedules.findById(unlinked.getId()).orElseThrow().getDayType()).isEqualTo(DayType.MIERCOLES);
    }

    private SpaceSchedule schedule(DayType day, String start, String end) {
        SpaceSchedule schedule = new SpaceSchedule();
        schedule.setSpace(space);
        schedule.setDayType(day);
        schedule.setOpeningTime(LocalTime.parse(start));
        schedule.setClosingTime(LocalTime.parse(end));
        em.persist(schedule);
        return schedule;
    }

    private SpacePricing pricing(SpaceSchedule schedule, DayType day, String start, String end) {
        SpacePricing pricing = new SpacePricing();
        pricing.setSpace(space);
        pricing.setSchedule(schedule);
        pricing.setDayType(day);
        pricing.setStartTime(LocalTime.parse(start));
        pricing.setEndTime(LocalTime.parse(end));
        pricing.setPrice(BigDecimal.ONE);
        em.persist(pricing);
        return pricing;
    }

    private SpaceScheduleRequestDTO request(DayType day, String start, String end) {
        var dto = new SpaceScheduleRequestDTO();
        dto.setDayType(day);
        dto.setOpeningTime(LocalTime.parse(start));
        dto.setClosingTime(LocalTime.parse(end));
        return dto;
    }

    private Booking booking(User client, LocalDateTime start, LocalDateTime end) {
        Booking booking = new Booking();
        booking.setClient(client);
        booking.setSpace(space);
        booking.setStartDatetime(start);
        booking.setEndDatetime(end);
        booking.setTotalAmount(BigDecimal.TEN);
        em.persist(booking);
        return booking;
    }
}
