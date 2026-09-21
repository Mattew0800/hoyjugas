package hoyjugas.DTO.Booking;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AvailabilitySummaryDTO {
    private List<DailyAvailabilityDTO> days;
    private Integer totalAvailable;
}