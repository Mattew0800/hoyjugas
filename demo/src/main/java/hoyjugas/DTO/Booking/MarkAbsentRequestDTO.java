package hoyjugas.DTO.Booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MarkAbsentRequestDTO {
    @NotNull(message = "El id de la reserva es obligatorio")
    private Long bookingId;
    @NotBlank (message = "El PIN es obligatorio")
    private String employeePin;
}