package hoyjugas.DTO.Booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CancelBookingRequestDTO {
    @NotBlank(message = "El motivo de cancelación es obligatorio")
    @Size(max = 255, message = "El motivo no puede superar los 255 caracteres")
    private String cancellationReason;

    @NotNull(message = "El ID del turno es obligatorio")
    private Long bookingId;
}
