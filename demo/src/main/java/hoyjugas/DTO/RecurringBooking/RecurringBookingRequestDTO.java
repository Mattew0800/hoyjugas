package hoyjugas.DTO.RecurringBooking;

import hoyjugas.Enum.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@Data
public class RecurringBookingRequestDTO {

    @NotNull(message = "El cliente es obligatorio")
    private Long clientId;

    @NotNull(message = "El espacio es obligatorio")
    private Long spaceId;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @Future(message = "La fecha de inicio debe ser futura")
    private LocalDate startDate;

    @NotNull(message = "El horario es obligatorio")
    private LocalTime startTime;

    private Integer intervalWeeks = 1;

    private LocalDate endDate;

    @Min(value = 1, message = "Mínimo 1 slot")
    private Integer slots = 1;

    @NotNull(message = "Debe aceptar los términos y condiciones")
    @AssertTrue(message = "Debe aceptar los términos y condiciones")
    private Boolean termsAccepted;

    @NotNull(message = "El monto de la seña es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
    private BigDecimal depositAmount;

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;

    private String transactionId;

    private String employeePin;

    @AssertTrue(message = "La fecha de fin debe ser posterior a la de inicio")
    public boolean isEndDateValid() {
        return endDate == null || endDate.isAfter(startDate);
    }
}
