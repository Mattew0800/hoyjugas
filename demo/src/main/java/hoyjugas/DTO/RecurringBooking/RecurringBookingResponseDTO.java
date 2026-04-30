package hoyjugas.DTO.RecurringBooking;

import hoyjugas.Enum.BookingStatus;
import hoyjugas.Model.Booking;
import hoyjugas.Model.RecurringBooking;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class RecurringBookingResponseDTO {

    private Long id;
    private Long clientId;
    private String clientName;
    private String clientPhone;
    private Long spaceId;
    private String spaceName;
    private String spaceType;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer intervalWeeks;
    private String status;
    private Integer cancellationCount;
    private Boolean isRecurring = true;
    private String recurringLabel;
    private String depositLabel;
    private Integer generatedTotalBookings;
    private Integer pendingBookings;
    private Integer cancelledBookings;

    private List<RecurringBookingSlotDTO> slots = new ArrayList<>();

    public static RecurringBookingResponseDTO fromEntity(
            RecurringBooking recurring,
            List<Booking> bookings
    ) {
        RecurringBookingResponseDTO dto = new RecurringBookingResponseDTO();
        dto.setId(recurring.getId());

        dto.setClientId(recurring.getClient().getId());
        dto.setClientName(recurring.getClient().getName());
        dto.setClientPhone(recurring.getClient().getPhone());

        dto.setSpaceId(recurring.getSpace().getId());
        dto.setSpaceName(recurring.getSpace().getName());
        dto.setSpaceType(recurring.getSpace().getType().name());

        dto.setDayOfWeek(recurring.getDayOfWeek().name());
        dto.setStartTime(recurring.getStartTime());
        dto.setStartDate(recurring.getStartDate());
        dto.setEndDate(recurring.getEndDate());
        dto.setIntervalWeeks(recurring.getIntervalWeeks());
        dto.setStatus(recurring.getStatus().name());
        dto.setCancellationCount(recurring.getCancellationCount());

        String frecuencia = recurring.getIntervalWeeks() == 1 ? "semanal" : "quincenal";
        dto.setRecurringLabel(String.format("Turno fijo %s hasta el %s",
                frecuencia,
                recurring.getEndDate().format(
                        java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")
                )
        ));

        dto.setGeneratedTotalBookings(bookings.size());
        dto.setPendingBookings((int) bookings.stream()
                .filter(b -> !b.getBookingStatus().equals(BookingStatus.CANCELADO))
                .count());
        dto.setCancelledBookings((int) bookings.stream()
                .filter(b -> b.getBookingStatus().equals(BookingStatus.CANCELADO))
                .count());

        return dto;
    }
}