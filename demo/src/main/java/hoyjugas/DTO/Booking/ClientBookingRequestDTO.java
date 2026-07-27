package hoyjugas.DTO.Booking;

import hoyjugas.Enum.PaymentMethod;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ClientBookingRequestDTO {

    @NotNull(message = "El espacio es obligatorio")
    private Long spaceId;

    @NotNull(message = "La fecha y hora de inicio es obligatoria")
    @Future(message = "El turno debe ser en una fecha futura")
    private LocalDateTime startDatetime;

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Debe aceptar los términos y condiciones")
    @AssertTrue(message = "Debe aceptar los términos y condiciones")
    private Boolean termsAccepted;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
    private BigDecimal depositAmount;
}