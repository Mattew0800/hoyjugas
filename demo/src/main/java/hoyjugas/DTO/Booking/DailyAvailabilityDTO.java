package hoyjugas.DTO.Booking;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class DailyAvailabilityDTO {
    private LocalDate date;
    private Integer availableSlots;
}