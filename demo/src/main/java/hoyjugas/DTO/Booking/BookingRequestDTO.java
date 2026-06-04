package hoyjugas.DTO.Booking;

import hoyjugas.Enum.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BookingRequestDTO {
    @NotNull(message = "El cliente es obligatorio")
    private Long clientId;

    @NotNull(message = "El espacio es obligatorio")
    private Long spaceId;

    @NotNull(message = "La fecha y hora de inicio es obligatoria")
    @Future(message = "El turno debe ser en una fecha futura")
    private LocalDateTime startDatetime;

    @NotNull(message = "Debe aceptar los términos y condiciones")
    @AssertTrue(message = "Debe aceptar los términos y condiciones")
    private Boolean termsAccepted;

    @NotNull(message = "El monto de la seña es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
    private BigDecimal depositAmount;

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;

    private String transactionId;

    @NotNull(message = "La cantidad de horas es obligatoria")
    @Min(value = 1, message = "Mínimo 1 hora")
    @Max(value = 4, message = "Máximo 4 horas")  // configurable por admin
    private Integer slots;

    private String employeePin;

}
