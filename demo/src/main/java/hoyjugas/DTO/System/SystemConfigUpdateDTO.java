package hoyjugas.DTO.System;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SystemConfigUpdateDTO {

    @Min(value = 0, message = "El límite de horas debe ser mayor o igual a 0")
    private Integer cancellationHoursLimit;

    @Min(value = 1, message = "Las horas de anticipación del recordatorio deben ser al menos 1")
    @Max(value = 168, message = "No puede superar una semana")
    private Integer reminderHoursBeforeBooking;

    private String termsAndConditions;

    @Min(value = 1, message = "La cantidad inicial de turnos debe ser al menos 1")
    private Integer recurringInitialDepositTurns;

    @DecimalMin(value = "1.00", message = "El multiplicador debe ser al menos 1.00")
    private BigDecimal recurringDepositMultiplier;

    @Min(value = 1, message = "Debe permitir al menos una cancelación")
    private Integer maxRecurringCancellations;

    @Size(max = 255, message = "La dirección no puede superar los 255 caracteres")
    private String address;

    @Size(max = 100, message = "El nombre del complejo no puede superar los 100 caracteres")
    private String sportsComplexName;

    @DecimalMin(value = "0.00", message = "El porcentaje de seña no puede ser negativo")
    @DecimalMax(value = "1.00", message = "El porcentaje de seña no puede ser mayor a 1")
    private BigDecimal normalDepositFactor;//dsps sacar
}