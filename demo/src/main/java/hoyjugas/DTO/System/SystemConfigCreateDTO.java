package hoyjugas.DTO.System;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

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
    @DecimalMin("0.01")
    @DecimalMax("1.00")
    private BigDecimal recurringInitialDepositFactor;

    @NotNull
    @DecimalMin("0.01")
    @DecimalMax("1.00")
    private BigDecimal recurringDepositFactor;

    @NotNull
    @Min(1)
    private Integer maxRecurringCancellations;

    @NotNull
    @DecimalMin("0.01")
    @DecimalMax("1.00")
    private BigDecimal minimumDepositPercentage;

    @NotNull
    @DecimalMin("0.01")
    @DecimalMax("1.00")
    private BigDecimal normalDepositFactor;
}