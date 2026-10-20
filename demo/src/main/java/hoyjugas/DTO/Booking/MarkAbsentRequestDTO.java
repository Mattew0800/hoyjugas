package hoyjugas.DTO.Booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MarkAbsentRequestDTO {
    @NotNull
    private Long bookingId;
    @NotBlank
    private String employeePin;
}