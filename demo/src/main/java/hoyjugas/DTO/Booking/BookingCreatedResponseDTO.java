package hoyjugas.DTO.Booking;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class BookingCreatedResponseDTO {
    private BookingResponseDTO booking;
    private String mpUrl;
}