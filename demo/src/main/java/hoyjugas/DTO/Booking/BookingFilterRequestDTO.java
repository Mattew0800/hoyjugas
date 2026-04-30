package hoyjugas.DTO.Booking;

import hoyjugas.Enum.BookingStatus;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;

@Data
public class BookingFilterRequestDTO {
    private Long clientId;
    private Long spaceId;
    private BookingStatus status;
    private Long employeeId;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime dateFrom;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime dateTo;
}