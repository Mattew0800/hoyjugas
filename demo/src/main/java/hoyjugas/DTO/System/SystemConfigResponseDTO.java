package hoyjugas.DTO.System;

import hoyjugas.Model.SystemConfig;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class SystemConfigResponseDTO {
    private Integer cancellationHoursLimit;
    private Integer reminderHoursBeforeBooking;
    private String termsAndConditions;
    private Integer recurringInitialDepositTurns;
    private BigDecimal recurringDepositMultiplier;
    private Integer maxRecurringCancellations;
    private String address;
    private String sportsComplexName;
    private Integer recurringMonthsAhead;

    public static SystemConfigResponseDTO fromEntity(SystemConfig config) {
        SystemConfigResponseDTO dto = new SystemConfigResponseDTO();
        dto.setCancellationHoursLimit(config.getCancellationHoursLimit());
        dto.setReminderHoursBeforeBooking(config.getReminderHoursBeforeBooking());
        dto.setTermsAndConditions(config.getTermsAndConditions());
        dto.setRecurringInitialDepositTurns(config.getRecurringInitialDepositTurns());
        dto.setRecurringDepositMultiplier(config.getRecurringDepositMultiplier());
        dto.setMaxRecurringCancellations(config.getMaxRecurringCancellations());
        dto.setAddress(config.getAddress());
        dto.setSportsComplexName(config.getSportsComplexName());
        dto.setRecurringMonthsAhead(config.getRecurringMonthsAhead());
        return dto;
    }
}