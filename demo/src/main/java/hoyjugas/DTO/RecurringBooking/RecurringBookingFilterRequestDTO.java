package hoyjugas.DTO.RecurringBooking;

import hoyjugas.Enum.DayType;
import hoyjugas.Enum.PaymentStatus;
import hoyjugas.Enum.PaymentType;
import hoyjugas.Enum.RecurringStatus;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@Data
public class RecurringBookingFilterRequestDTO {

    private Long clientId;

    private Long spaceId;

    private RecurringStatus status;

    private DayType dayOfWeek;

    private Long cancelledByEmployeeId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDateFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDateTo;

    private Integer page = 0;

    private Integer size = 20;

    private String sortBy = "startDate";

    private PaymentType paymentType;

    private PaymentStatus paymentStatus;

    private String sortDirection = "desc";
}