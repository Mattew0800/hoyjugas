package hoyjugas.DTO.Booking;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class RescheduleBookingRequestDTO {

    @NotNull(message = "El ID del turno original es obligatorio")
    private Long originalBookingId;

    @NotNull(message = "El espacio es obligatorio")
    private Long spaceId;

    @NotNull(message = "La fecha y hora es obligatoria")
    @Future
    private LocalDateTime startDatetime;

    @NotNull(message = "Debe aceptar los términos y condiciones")
    @AssertTrue
    private Boolean termsAccepted;

    private String employeePin;
    private String cancellationReason;
}