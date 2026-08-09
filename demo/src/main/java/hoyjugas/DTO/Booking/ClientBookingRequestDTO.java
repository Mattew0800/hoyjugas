package hoyjugas.DTO.Booking;

import hoyjugas.Enum.PaymentType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ClientBookingRequestDTO {

    @NotNull(message = "El espacio es obligatorio")
    private Long spaceId;

    @NotNull(message = "La fecha y hora de inicio es obligatoria")
    @Future(message = "El turno debe ser en una fecha futura")
    private LocalDateTime startDatetime;

    @NotNull(message = "Debe aceptar los términos y condiciones")
    @AssertTrue(message = "Debe aceptar los términos y condiciones")
    private Boolean termsAccepted;

    @NotNull(message = "El tipo de pago es obligatorio")
    private PaymentType paymentType;

    @NotNull(message = "La cantidad de horas es obligatoria")
    @Min(value = 1, message = "Mínimo 1 hora")
    @Max(value = 4, message = "Máximo 4 horas")
    private Integer slots;
}