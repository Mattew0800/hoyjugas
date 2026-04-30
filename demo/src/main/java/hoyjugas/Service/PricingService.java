package hoyjugas.Service;

import hoyjugas.Enum.DayType;
import hoyjugas.Model.Space;
import hoyjugas.Model.SpacePricing;
import hoyjugas.Repository.HolidayRepository;
import hoyjugas.Repository.SpacePricingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PricingService {

    private final SpacePricingRepository spacePricingRepository;
    private final HolidayRepository holidayRepository;

    public BigDecimal getPriceForSlot(Space space, LocalDateTime datetime) {
        LocalDate date = datetime.toLocalDate();
        DayOfWeek day = datetime.getDayOfWeek();
        boolean isHoliday = holidayRepository.existsByDate(date);
        DayType specificDay = resolveDayType(day);
        DayType groupDay = (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY)
                ? DayType.FIN_DE_SEMANA
                : DayType.DIA_DE_SEMANA;

        if (isHoliday) {
            Optional<SpacePricing> holidayPricing = spacePricingRepository
                    .findPriceForSlot(space.getId(), DayType.FERIADO, datetime.toLocalTime());
            if (holidayPricing.isPresent()) {
                return holidayPricing.get().getPrice();
            }
        }

        return spacePricingRepository
                .findPriceForSlot(space.getId(), specificDay, datetime.toLocalTime())
                .or(() -> spacePricingRepository.findPriceForSlot(space.getId(), groupDay, datetime.toLocalTime()))
                .map(SpacePricing::getPrice)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "No hay precio configurado para ese horario"
                ));
    }

    public DayType resolveDayType(DayOfWeek day) {
        return switch (day) {
            case MONDAY -> DayType.LUNES;
            case TUESDAY -> DayType.MARTES;
            case WEDNESDAY -> DayType.MIERCOLES;
            case THURSDAY -> DayType.JUEVES;
            case FRIDAY -> DayType.VIERNES;
            case SATURDAY -> DayType.SABADO;
            case SUNDAY -> DayType.DOMINGO;
        };
    }
}
