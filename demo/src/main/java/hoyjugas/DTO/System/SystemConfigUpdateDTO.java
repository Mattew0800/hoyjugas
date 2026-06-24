package hoyjugas.DTO.System;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class SystemConfigUpdateDTO {

    @Min(value = 0, message = "El límite de horas debe ser mayor o igual a 0")
    private Integer cancellationHoursLimit;

    @Min(value = 1, message = "Las horas de anticipación del recordatorio deben ser al menos 1")
    @Max(value = 168, message = "No puede superar una semana")
    private Integer reminderHoursBeforeBooking;

    private String termsAndConditions;

    @Min(value = 1)
    @Max(value = 52)
    private Integer recurringMonthsAhead;

    @Min(value = 1)
    private Integer recurringInitialDepositTurns;

    @DecimalMin("1.00")
    private BigDecimal recurringDepositMultiplier;

    @Min(value = 1)
    private Integer maxRecurringCancellations;

}