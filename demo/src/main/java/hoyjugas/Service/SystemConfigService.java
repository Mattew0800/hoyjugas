package hoyjugas.Service;

import hoyjugas.DTO.System.SystemConfigUpdateDTO;
import hoyjugas.Model.SystemConfig;
import hoyjugas.Repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;

    @Transactional
    public SystemConfig updateConfig(SystemConfigUpdateDTO dto) {
        SystemConfig config = systemConfigRepository.findById(1)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Configuración no encontrada"
                ));
        if (dto.getCancellationHoursLimit() != null)
            config.setCancellationHoursLimit(dto.getCancellationHoursLimit());
        if (dto.getReminderHoursBeforeBooking() != null)
            config.setReminderHoursBeforeBooking(dto.getReminderHoursBeforeBooking());
        if (dto.getTermsAndConditions() != null)
            config.setTermsAndConditions(dto.getTermsAndConditions());
        if (dto.getRecurringMonthsAhead() != null)
            config.setRecurringMonthsAhead(dto.getRecurringMonthsAhead());
        if (dto.getRecurringInitialDepositTurns() != null)
            config.setRecurringInitialDepositTurns(dto.getRecurringInitialDepositTurns());
        if (dto.getRecurringInitialDepositFactor() != null)
            config.setRecurringInitialDepositFactor(dto.getRecurringInitialDepositFactor());
        if (dto.getRecurringDepositFactor() != null)
            config.setRecurringDepositFactor(dto.getRecurringDepositFactor());
        if (dto.getMaxRecurringCancellations() != null)
            config.setMaxRecurringCancellations(dto.getMaxRecurringCancellations());
        if (dto.getNormalDepositFactor() != null)
            config.setNormalDepositFactor(dto.getNormalDepositFactor());

        return systemConfigRepository.save(config);
    }

    private SystemConfigUpdateDTO fromEntity(SystemConfig config) {
        SystemConfigUpdateDTO dto = new SystemConfigUpdateDTO();
        dto.setCancellationHoursLimit(config.getCancellationHoursLimit());
        dto.setReminderHoursBeforeBooking(config.getReminderHoursBeforeBooking());
        dto.setTermsAndConditions(config.getTermsAndConditions());
        dto.setRecurringMonthsAhead(config.getRecurringMonthsAhead());
        dto.setRecurringInitialDepositTurns(config.getRecurringInitialDepositTurns());
        dto.setRecurringInitialDepositFactor(config.getRecurringInitialDepositFactor());
        dto.setRecurringDepositFactor(config.getRecurringDepositFactor());
        dto.setMaxRecurringCancellations(config.getMaxRecurringCancellations());
        dto.setNormalDepositFactor(config.getNormalDepositFactor());
        return dto;
    }
}