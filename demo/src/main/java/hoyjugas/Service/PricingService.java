package hoyjugas.Service;

import hoyjugas.DTO.SpacePricing.SpacePricingRequestDTO;
import hoyjugas.DTO.SpaceSchedule.SpaceScheduleRequestDTO;
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
import java.util.*;
import java.util.stream.Collectors;

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

    public void validatePricingCoverage(Long spaceId, List<SpacePricingRequestDTO> incomingPricings) {
        List<SpaceSchedule> schedules = spaceScheduleRepository.findBySpaceId(spaceId);
        if (schedules.isEmpty()) return;
        Map<DayType, List<SpaceSchedule>> schedulesByDayType = schedules.stream()
                .collect(Collectors.groupingBy(SpaceSchedule::getDayType));
        for (Map.Entry<DayType, List<SpaceSchedule>> entry : schedulesByDayType.entrySet()) {
            DayType dayType = entry.getKey();
            List<SpaceSchedule> daySchedules = entry.getValue();
            List<SpacePricing> relevantPricings = incomingPricings.stream()
                    .filter(dto -> dto.getDayType() == dayType)
                    .sorted(Comparator.comparing(SpacePricingRequestDTO::getStartTime))
                    .map(dto -> {
                        SpacePricing p = new SpacePricing();
                        p.setDayType(dto.getDayType());
                        p.setStartTime(dto.getStartTime());
                        p.setEndTime(dto.getEndTime());
                        return p;
                    })
                    .toList();
            if (relevantPricings.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Debe configurar al menos un precio para " + dayType);
            }
            for (SpaceSchedule schedule : daySchedules) {
                validatePricingForSchedule(relevantPricings, schedule, dayType);
            }
        }
    }
    public void validatePricingForDayType(List<SpacePricingRequestDTO> pricings, SpaceScheduleRequestDTO scheduleDto) {
        DayType scheduleDayType = scheduleDto.getDayType();
        List<DayType> possibleDayTypes = getPossibleDayTypes(scheduleDayType);
        SpaceSchedule tempSchedule = new SpaceSchedule();
        tempSchedule.setDayType(scheduleDto.getDayType());
        tempSchedule.setOpeningTime(scheduleDto.getOpeningTime());
        tempSchedule.setClosingTime(scheduleDto.getClosingTime());
        List<String> errors = new ArrayList<>();
        for (DayType dayType : possibleDayTypes) {
            List<SpacePricing> specificPricings = pricings.stream()
                    .filter(dto -> dto.getDayType() == dayType)
                    .sorted(Comparator.comparing(SpacePricingRequestDTO::getStartTime))
                    .map(this::toPricingEntity)
                    .toList();
            if (specificPricings.isEmpty()) {
                specificPricings = pricings.stream()
                        .filter(dto -> dto.getDayType() == scheduleDayType)
                        .sorted(Comparator.comparing(SpacePricingRequestDTO::getStartTime))
                        .map(this::toPricingEntity)
                        .toList();
            }
            if (specificPricings.isEmpty()) {
                errors.add("Falta configurar precio para " + dayType);
                continue;
            }
            try {
                validatePricingForSchedule(specificPricings, tempSchedule, dayType);
            } catch (ResponseStatusException e) {
                errors.add(e.getReason());
            }
        }
        if (!errors.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.join(" | ", errors));
        }
    }

    private List<DayType> getPossibleDayTypes(DayType scheduleDayType) {
        return switch (scheduleDayType) {
            case DIA_DE_SEMANA -> List.of(
                    DayType.LUNES, DayType.MARTES, DayType.MIERCOLES,
                    DayType.JUEVES, DayType.VIERNES);
            case FIN_DE_SEMANA -> List.of(DayType.SABADO, DayType.DOMINGO);
            default -> List.of(scheduleDayType);
        };
    }

    private SpacePricing toPricingEntity(SpacePricingRequestDTO dto) {
        SpacePricing p = new SpacePricing();
        p.setDayType(dto.getDayType());
        p.setStartTime(dto.getStartTime());
        p.setEndTime(dto.getEndTime());
        return p;
    }

    public void validatePricingForSchedule(List<SpacePricing> pricings, SpaceSchedule schedule, DayType dayType) {
        LocalTime opening = schedule.getOpeningTime();
        LocalTime closing = schedule.getClosingTime();
        boolean crossesMidnight = !closing.isAfter(opening);
        if (crossesMidnight) {
            validateMidnightCrossing(pricings, opening, closing, dayType);
        } else {
            validateNormalSchedule(pricings, opening, closing, dayType);
        }
    }

    private void validateNormalSchedule(List<SpacePricing> pricings, LocalTime opening, LocalTime closing, DayType dayType) {
        List<SpacePricing> relevantPricings = pricings.stream()
                .filter(p -> p.getStartTime().isBefore(closing) && p.getEndTime().isAfter(opening))
                .sorted(Comparator.comparing(SpacePricing::getStartTime))
                .toList();
        if (relevantPricings.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No hay precios configurados para el horario " + opening + " - " + closing +  " del día " + dayType);
        }
        if (relevantPricings.get(0).getStartTime().isAfter(opening)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta configurar precio para " + dayType + " desde las " + opening + " hasta las " + relevantPricings.get(0).getStartTime());
        }
        for (int i = 0; i < relevantPricings.size() - 1; i++) {
            LocalTime endCurrent = relevantPricings.get(i).getEndTime();
            LocalTime startNext = relevantPricings.get(i + 1).getStartTime();
            if (endCurrent.isBefore(startNext)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta configurar precio para " + dayType +  " entre las " + endCurrent +  " y las " + startNext);
            }
        }

        LocalTime lastEnd = relevantPricings.get(relevantPricings.size() - 1).getEndTime();
        if (lastEnd.isBefore(closing)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Falta configurar precio para " + dayType +
                            " desde las " + lastEnd +
                            " hasta las " + closing);
        }
    }

    private void validateMidnightCrossing(List<SpacePricing> pricings, LocalTime opening, LocalTime closing, DayType dayType) {
        List<SpacePricing> eveningPricings = pricings.stream()
                .filter(p -> !p.getStartTime().isBefore(opening))
                .sorted(Comparator.comparing(SpacePricing::getStartTime))
                .toList();
        List<SpacePricing> morningPricings = pricings.stream()
                .filter(p -> !p.getEndTime().isAfter(closing) || p.getEndTime().equals(LocalTime.MIDNIGHT))
                .sorted(Comparator.comparing(SpacePricing::getStartTime))
                .toList();
        if (eveningPricings.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Falta configurar precio para " + dayType +
                            " desde las " + opening + " hasta las 00:00");
        }
        if (eveningPricings.get(0).getStartTime().isAfter(opening)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Falta configurar precio para " + dayType +
                            " desde las " + opening +
                            " hasta las " + eveningPricings.get(0).getStartTime());
        }
        if (morningPricings.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Falta configurar precio para " + dayType +
                            " desde las 00:00 hasta las " + closing);
        }

        LocalTime lastMorningEnd = morningPricings.get(morningPricings.size() - 1).getEndTime();
        if (lastMorningEnd.isBefore(closing)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Falta configurar precio para " + dayType +
                            " desde las " + lastMorningEnd +
                            " hasta las " + closing);
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
