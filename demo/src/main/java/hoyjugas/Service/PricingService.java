package hoyjugas.Service;

import hoyjugas.Enum.DayType;
import hoyjugas.Model.Space;
import hoyjugas.Model.SpacePricing;
import hoyjugas.Model.SpaceSchedule;
import hoyjugas.Repository.HolidayRepository;
import hoyjugas.Repository.SpacePricingRepository;
import hoyjugas.Repository.SpaceScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PricingService {

    private final SpacePricingRepository spacePricingRepository;
    private final HolidayRepository holidayRepository;
    private final SpaceScheduleRepository spaceScheduleRepository;

    public BigDecimal getPriceForSlot(Space space, LocalDateTime datetime) {
        LocalDate date = datetime.toLocalDate();
        DayOfWeek day = datetime.getDayOfWeek();
        boolean isHoliday = holidayRepository.existsByDate(date);
        if (isHoliday) {
            Optional<SpacePricing> holidayPricing = spacePricingRepository
                    .findPriceForSlot(space.getId(), DayType.FERIADO, datetime.toLocalTime());
            if (holidayPricing.isPresent()) {
                return holidayPricing.get().getPrice();
            }
        }
        DayType specificDay = resolveSpecificDayType(day);
        DayType generalDay = resolveDayType(day);
        DayType groupDay = resolveGroupDay(day);
        return spacePricingRepository
                .findPriceForSlot(space.getId(), specificDay, datetime.toLocalTime())
                .or(() -> spacePricingRepository.findPriceForSlot(space.getId(), generalDay, datetime.toLocalTime()))
                .or(() -> spacePricingRepository.findPriceForSlot(space.getId(), groupDay, datetime.toLocalTime()))
                .map(SpacePricing::getPrice)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "No hay precio configurado para ese horario"
                ));
    }

    public void validatePricingCoversSchedule(Long spaceId, DayType dayType) {
        List<SpaceSchedule> schedules = spaceScheduleRepository
                .findAllBySpaceIdAndDayType(spaceId, dayType);
        if (schedules.isEmpty()) return;
        List<SpacePricing> pricings = spacePricingRepository
                .findBySpaceIdAndDayTypeOrderByStartTime(spaceId, dayType);
        if (pricings.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debe configurar al menos un precio para " + dayType);
        }
        for (SpaceSchedule schedule : schedules) {
            validatePricingForSchedule(pricings, schedule);
        }
    }

    private void validatePricingForSchedule(List<SpacePricing> pricings, SpaceSchedule schedule) {
        LocalTime opening = schedule.getOpeningTime();
        LocalTime closing = schedule.getClosingTime();
        boolean crossesMidnight = !closing.isAfter(opening);
        if (crossesMidnight) {
            validateMidnightCrossing(pricings, opening, closing);
        } else {
            validateNormalSchedule(pricings, opening, closing);
        }
    }

    private void validateNormalSchedule(List<SpacePricing> pricings, LocalTime opening, LocalTime closing) {
        List<SpacePricing> relevantPricings = pricings.stream()
                .filter(p -> p.getStartTime().isBefore(closing) && p.getEndTime().isAfter(opening))
                .sorted(Comparator.comparing(SpacePricing::getStartTime))
                .toList();
        if (relevantPricings.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No hay precios configurados para el horario " + opening + " - " + closing);
        }
        LocalTime firstStart = relevantPricings.get(0).getStartTime();
        if (firstStart.isAfter(opening)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Falta configurar precio desde las " + opening + " hasta las " + firstStart);
        }
        for (int i = 0; i < relevantPricings.size() - 1; i++) {
            LocalTime endCurrent = relevantPricings.get(i).getEndTime();
            LocalTime startNext = relevantPricings.get(i + 1).getStartTime();
            if (endCurrent.isBefore(startNext)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Falta configurar precio entre las " + endCurrent + " y las " + startNext);
            }
        }
        LocalTime lastEnd = relevantPricings.get(relevantPricings.size() - 1).getEndTime();
        if (lastEnd.isBefore(closing)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Falta configurar precio desde las " + lastEnd + " hasta las " + closing);
        }
    }

    private void validateMidnightCrossing(List<SpacePricing> pricings, LocalTime opening, LocalTime closing) {
        List<SpacePricing> eveningPricings = pricings.stream()
                .filter(p -> !p.getStartTime().isBefore(opening))
                .sorted(Comparator.comparing(SpacePricing::getStartTime))
                .toList();
        List<SpacePricing> morningPricings = pricings.stream()
                .filter(p -> p.getEndTime().isBefore(LocalTime.NOON) || p.getEndTime().equals(LocalTime.MIDNIGHT))
                .sorted(Comparator.comparing(SpacePricing::getStartTime))
                .toList();
        if (!eveningPricings.isEmpty()) {
            if (eveningPricings.get(0).getStartTime().isAfter(opening)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Falta configurar precio desde las " + opening + " hasta las " +
                                eveningPricings.get(0).getStartTime());
            }
            LocalTime lastEveningEnd = eveningPricings.get(eveningPricings.size() - 1).getEndTime();
            if (!lastEveningEnd.equals(LocalTime.MIDNIGHT)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Falta configurar precio desde las " + lastEveningEnd + " hasta las 00:00");
            }
        }
        if (!morningPricings.isEmpty()) {
            if (!morningPricings.get(0).getStartTime().equals(LocalTime.MIDNIGHT)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta configurar precio desde las 00:00 hasta las " +  morningPricings.get(0).getStartTime());
            }
            LocalTime lastMorningEnd = morningPricings.get(morningPricings.size() - 1).getEndTime();
            if (!lastMorningEnd.equals(closing)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Falta configurar precio desde las " + lastMorningEnd + " hasta las " + closing);
            }
        }
    }

    public DayType resolveDayType(DayOfWeek day) {
        return switch (day) {
            case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY ->
                    DayType.DIA_DE_SEMANA;
            case SATURDAY ->
                    DayType.SABADO;
            case SUNDAY ->
                    DayType.DOMINGO;
        };
    }

    public DayType resolveSpecificDayType(DayOfWeek day) {
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

    public DayType resolveGroupDay(DayOfWeek day) {
        return switch (day) {
            case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> DayType.DIA_DE_SEMANA;
            case SATURDAY, SUNDAY -> DayType.FIN_DE_SEMANA;
        };
    }
}
