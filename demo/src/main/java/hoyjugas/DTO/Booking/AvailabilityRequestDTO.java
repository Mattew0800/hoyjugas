package hoyjugas.DTO.Booking;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AvailabilityRequestDTO {
    @NotNull
    private Long spaceId;

    @NotNull
    @FutureOrPresent
    private LocalDate date;
}
