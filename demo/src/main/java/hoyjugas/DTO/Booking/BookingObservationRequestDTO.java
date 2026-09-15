package hoyjugas.DTO.Booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BookingObservationRequestDTO {
    @NotNull(message = "El ID del turno es obligatorio")
    private Long bookingId;

    @NotBlank(message = "La observación no puede estar vacía")
    @Size(max = 1000, message = "La observación no puede superar 1000 caracteres")
    private String content;
}
