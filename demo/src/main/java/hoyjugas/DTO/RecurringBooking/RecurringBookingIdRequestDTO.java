package hoyjugas.DTO.RecurringBooking;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RecurringBookingIdRequestDTO {
    @NotNull(message = "El ID del turno fijo es obligatorio")
    private Long recurringBookingId;
}