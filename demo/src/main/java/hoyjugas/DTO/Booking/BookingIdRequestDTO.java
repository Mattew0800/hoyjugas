package hoyjugas.DTO.Booking;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingIdRequestDTO {
    @NotNull(message = "El id de la reserva es obligatorio")
    private Long id;
}
