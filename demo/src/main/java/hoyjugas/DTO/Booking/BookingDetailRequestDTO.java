package hoyjugas.DTO.Booking;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingDetailRequestDTO {
    @NotNull(message = "El ID del turno es obligatorio")
    private Long bookingId;
}