package hoyjugas.DTO.RecurringBooking;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RecurringBookingDetailRequestDTO {
    @NotNull(message = "El id del turno fijo es obligatorio")
    private Long recurringBookingId;
}