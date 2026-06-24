package hoyjugas.DTO.System;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class SystemConfigCreateDTO {

    @NotNull
    @Min(0)
    private Integer cancellationHoursLimit;

    @NotNull
    @Min(1)
    @Max(168)
    private Integer reminderHoursBeforeBooking;

    @NotBlank
    private String termsAndConditions;

    @NotNull
    @Min(1)
    @Max(52)
    private Integer recurringMonthsAhead;

    @NotNull
    @Min(1)
    private Integer recurringInitialDepositTurns;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal recurringDepositMultiplier;

    @NotNull
    @Min(1)
    private Integer maxRecurringCancellations;

    @NotNull
    private LocalTime complexOpeningTime;

    @NotNull
    private LocalTime complexClosingTime;
}