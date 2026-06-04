package hoyjugas.DTO.Booking;

import hoyjugas.Enum.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class EmployeeBookingRequestDTO {

    @NotNull(message = "El cliente es obligatorio")
    private Long clientId;

    @NotNull(message = "El espacio es obligatorio")
    private Long spaceId;

    @NotNull(message = "La fecha y hora de inicio es obligatoria")
    @Future(message = "El turno debe ser en una fecha futura")
    private LocalDateTime startDatetime;

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;

    @DecimalMin(value = "0.00")
    private BigDecimal depositAmount;

    private String transactionId;

    @NotBlank(message = "El PIN del empleado es obligatorio")
    private String employeePin;

    @NotNull(message = "Debe aceptar los términos")
    @AssertTrue
    private Boolean termsAccepted;

    @NotNull(message = "La cantidad de horas es obligatoria")
    @Min(value = 1, message = "Mínimo 1 hora")
    @Max(value = 4, message = "Máximo 4 horas")
    private Integer slots;
}