package hoyjugas.DTO.RecurringBooking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CancelRecurringCycleRequestDTO {
    @NotNull(message = "El ID del ciclo es obligatorio")
    private Long recurringId;

    @NotBlank(message = "El motivo de cancelación es obligatorio")
    private String cancellationReason;
}