package hoyjugas.DTO.RecurringBooking;

import hoyjugas.Enum.DayType;
import hoyjugas.Enum.RecurringStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class RecurringBookingDetailDTO {
    private Long recurringBookingId;
    private String clientName;
    private String clientEmail;
    private String spaceName;
    private String spaceType;
    private DayType dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer intervalWeeks;
    private Integer cancellationCount;
    private RecurringStatus status;
    private String cancelledByName;
    private LocalDateTime cancelledAt;
}