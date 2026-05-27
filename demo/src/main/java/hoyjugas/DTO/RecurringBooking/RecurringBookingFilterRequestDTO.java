package hoyjugas.DTO.RecurringBooking;

import hoyjugas.Enum.RecurringStatus;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Data
public class RecurringBookingFilterRequestDTO {

    private Long clientId;

    private Long spaceId;

    private RecurringStatus status;

    private DayOfWeek dayOfWeek;

    private Long cancelledByEmployeeId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDateFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDateTo;

    private Integer page = 0;

    private Integer size = 20;

    private String sortBy = "startDate";

    private String sortDirection = "desc";
}