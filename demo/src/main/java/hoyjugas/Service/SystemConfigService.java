package hoyjugas.Service;

import hoyjugas.DTO.System.SystemConfigCreateDTO;
import hoyjugas.DTO.System.SystemConfigScheduleResponseDTO;
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
                        HttpStatus.NOT_FOUND,
                        "Configuración no encontrada"
                ));
        updateEntity(config, dto);
        return systemConfigRepository.save(config);
    }

    @Transactional
    public SystemConfig createConfig(SystemConfigCreateDTO dto) {
        SystemConfig config = toEntity(dto);
        return systemConfigRepository.save(config);
    }


    private SystemConfig toEntity(SystemConfigCreateDTO dto) {
        SystemConfig config = new SystemConfig();

        config.setCancellationHoursLimit(dto.getCancellationHoursLimit());
        config.setReminderHoursBeforeBooking(dto.getReminderHoursBeforeBooking());
        config.setTermsAndConditions(dto.getTermsAndConditions());
        config.setRecurringMonthsAhead(dto.getRecurringMonthsAhead());
        config.setRecurringInitialDepositTurns(dto.getRecurringInitialDepositTurns());
        config.setMaxRecurringCancellations(dto.getMaxRecurringCancellations());
        config.setRecurringDepositMultiplier(dto.getRecurringDepositMultiplier());
        config.setComplexOpeningTime(dto.getComplexOpeningTime());
        config.setComplexClosingTime(dto.getComplexClosingTime());
        return config;
    }

    private void updateEntity(SystemConfig config, SystemConfigUpdateDTO dto) {
        config.setCancellationHoursLimit(dto.getCancellationHoursLimit());
        config.setReminderHoursBeforeBooking(dto.getReminderHoursBeforeBooking());
        config.setTermsAndConditions(dto.getTermsAndConditions());
        config.setRecurringMonthsAhead(dto.getRecurringMonthsAhead());
        config.setRecurringInitialDepositTurns(dto.getRecurringInitialDepositTurns());
        config.setMaxRecurringCancellations(dto.getMaxRecurringCancellations());
        config.setRecurringDepositMultiplier(dto.getRecurringDepositMultiplier());
        config.setComplexClosingTime(dto.getComplexClosingTime());
        config.setComplexOpeningTime(dto.getComplexOpeningTime());
    }

    
}