package hoyjugas.Service;

import hoyjugas.DTO.SpacePricing.SpacePricingRequestDTO;
import hoyjugas.DTO.SpaceSchedule.SpaceScheduleRequestDTO;
import hoyjugas.DTO.SpaceSchedule.SpaceScheduleResponseDTO;
import hoyjugas.Enum.DayType;
import hoyjugas.Model.Space;
import hoyjugas.Model.SpacePricing;
import hoyjugas.Model.SpaceSchedule;
import hoyjugas.Model.SystemConfig;
import hoyjugas.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SpaceScheduleService {

    private final SpaceScheduleRepository spaceScheduleRepository;
    private final SpaceRepository spaceRepository;
    private final ComplexScheduleRepository complexScheduleRepository;
    private final PricingService pricingService;
    private final SpacePricingRepository spacePricingRepository;

    @Transactional
    public SpaceScheduleResponseDTO addSchedule(Long spaceId, SpaceScheduleRequestDTO dto) {
        Space space = spaceRepository.findByIdAndIsActiveTrue(spaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));
        validateSchedule(dto.getOpeningTime(), dto.getClosingTime(), dto.getDayType());
        List<SpaceSchedule> existingSchedules = spaceScheduleRepository
                .findAllBySpaceIdAndDayType(spaceId, dto.getDayType());
        for (SpaceSchedule existing : existingSchedules) {
            if (schedulesOverlap(
                    dto.getOpeningTime(), dto.getClosingTime(),
                    existing.getOpeningTime(), existing.getClosingTime())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        String.format("El horario %s - %s se superpone con el existente %s - %s",
                                dto.getOpeningTime(), dto.getClosingTime(),
                                existing.getOpeningTime(), existing.getClosingTime()));
            }
        }
        SpaceSchedule schedule = new SpaceSchedule();
        schedule.setSpace(space);
        schedule.setDayType(dto.getDayType());
        schedule.setOpeningTime(dto.getOpeningTime());
        schedule.setClosingTime(dto.getClosingTime());
        return SpaceScheduleResponseDTO.fromEntity(spaceScheduleRepository.save(schedule));
    }

    @Transactional
    public SpaceScheduleResponseDTO addScheduleWithPricing(Long spaceId,SpaceScheduleRequestDTO scheduleDto, List<SpacePricingRequestDTO> pricings) {
        Space space = spaceRepository.findByIdAndIsActiveTrue(spaceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Espacio no encontrado"));
        validateSchedule(scheduleDto.getOpeningTime(), scheduleDto.getClosingTime(), scheduleDto.getDayType());
        List<SpaceSchedule> existingSchedules = spaceScheduleRepository
                .findAllBySpaceIdAndDayType(spaceId, scheduleDto.getDayType());
        for (SpaceSchedule existing : existingSchedules) {
            if (schedulesOverlap(
                    scheduleDto.getOpeningTime(), scheduleDto.getClosingTime(),
                    existing.getOpeningTime(), existing.getClosingTime())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        String.format("El horario %s - %s se superpone con el existente %s - %s",
                                scheduleDto.getOpeningTime(), scheduleDto.getClosingTime(),
                                existing.getOpeningTime(), existing.getClosingTime()));
            }
        }
        pricingService.validatePricingForDayType(pricings, scheduleDto);
        SpaceSchedule schedule = new SpaceSchedule();
        schedule.setSpace(space);
        schedule.setDayType(scheduleDto.getDayType());
        schedule.setOpeningTime(scheduleDto.getOpeningTime());
        schedule.setClosingTime(scheduleDto.getClosingTime());
        SpaceSchedule saved = spaceScheduleRepository.save(schedule);
        setPricings(space, saved, pricings);
        return SpaceScheduleResponseDTO.fromEntity(saved);
    }

    @Transactional
    void setPricings(Space space, SpaceSchedule schedule, List<SpacePricingRequestDTO> pricings) {
        List<SpacePricing> pricingEntities = pricings.stream()
                .map(p -> {
                    SpacePricing pricing = new SpacePricing();
                    pricing.setSpace(space);
                    pricing.setSchedule(schedule);
                    pricing.setDayType(p.getDayType());
                    pricing.setStartTime(p.getStartTime());
                    pricing.setEndTime(p.getEndTime());
                    pricing.setPrice(p.getPrice());
                    return pricing;
                })
                .toList();
        spacePricingRepository.saveAll(pricingEntities);
    }

    @Transactional
    public SpaceScheduleResponseDTO updateScheduleWithPricing(Long spaceId, Long scheduleId,SpaceScheduleRequestDTO scheduleDto, List<SpacePricingRequestDTO> pricings) {
        SpaceSchedule oldSchedule = getScheduleOrThrow(scheduleId, spaceId);
        pricingService.validatePricingForDayType(pricings, scheduleDto);
        SpaceScheduleResponseDTO updatedSchedule = updateSchedule(spaceId, scheduleId, scheduleDto);
        spacePricingRepository.deleteByScheduleId(scheduleId);
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Espacio no encontrado"));
        setPricings(space, oldSchedule, pricings);
        return updatedSchedule;
    }

    private void deletePricingsForDayTypeCoverage(Long spaceId, DayType dayType) {
        List<DayType> dayTypesToDelete = getPossibleDayTypes(dayType);
        if (!dayTypesToDelete.contains(dayType)) {
            dayTypesToDelete = new ArrayList<>(dayTypesToDelete);
            dayTypesToDelete.add(dayType);
        }
        spacePricingRepository.deleteBySpaceIdAndDayTypeIn(spaceId, dayTypesToDelete);
    }

    private List<DayType> getPossibleDayTypes(DayType scheduleDayType) {
        return switch (scheduleDayType) {
            case DIA_DE_SEMANA -> new ArrayList<>(List.of(
                    DayType.LUNES, DayType.MARTES, DayType.MIERCOLES,
                    DayType.JUEVES, DayType.VIERNES));
            case FIN_DE_SEMANA -> new ArrayList<>(List.of(DayType.SABADO, DayType.DOMINGO));
            default -> new ArrayList<>(List.of(scheduleDayType));
        };
    }

    public SpaceSchedule buildTempSchedule(SpaceScheduleRequestDTO dto) {
        SpaceSchedule temp = new SpaceSchedule();
        temp.setDayType(dto.getDayType());
        temp.setOpeningTime(dto.getOpeningTime());
        temp.setClosingTime(dto.getClosingTime());
        return temp;
    }

    private List<SpacePricing> buildPricingEntities(List<SpacePricingRequestDTO> pricings) {
        return pricings.stream()
                .map(dto -> {
                    SpacePricing p = new SpacePricing();
                    p.setDayType(dto.getDayType());
                    p.setStartTime(dto.getStartTime());
                    p.setEndTime(dto.getEndTime());
                    return p;
                })
                .toList();
    }

    @Transactional
    public SpaceScheduleResponseDTO updateSchedule(Long spaceId, Long scheduleId, SpaceScheduleRequestDTO dto) {
        SpaceSchedule schedule = getScheduleOrThrow(scheduleId, spaceId);
        validateSchedule(dto.getOpeningTime(), dto.getClosingTime(), dto.getDayType());
        List<SpaceSchedule> existingSchedules = spaceScheduleRepository
                .findAllBySpaceIdAndDayType(spaceId, dto.getDayType());
        for (SpaceSchedule existing : existingSchedules) {
            if (existing.getId().equals(scheduleId)) {
                continue;
            }
            if (schedulesOverlap(dto.getOpeningTime(), dto.getClosingTime(), existing.getOpeningTime(), existing.getClosingTime())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        String.format("El horario %s - %s se superpone con el existente %s - %s",
                                dto.getOpeningTime(), dto.getClosingTime(),
                                existing.getOpeningTime(), existing.getClosingTime()));
            }
        }
        schedule.setDayType(dto.getDayType());
        schedule.setOpeningTime(dto.getOpeningTime());
        schedule.setClosingTime(dto.getClosingTime());
        SpaceSchedule saved = spaceScheduleRepository.save(schedule);
        return SpaceScheduleResponseDTO.fromEntity(saved);
    }

    @Transactional
    public void deleteSchedule(Long spaceId, Long scheduleId) {
        SpaceSchedule schedule = getScheduleOrThrow(scheduleId, spaceId);
        spacePricingRepository.deleteByScheduleId(scheduleId);
        spaceScheduleRepository.delete(schedule);
    }

    public List<SpaceScheduleResponseDTO> getSchedulesBySpace(Long spaceId) {
        if (!spaceRepository.existsById(spaceId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado");
        }
        return spaceScheduleRepository.findBySpaceId(spaceId)
                .stream()
                .map(SpaceScheduleResponseDTO::fromEntity)
                .toList();
    }

    private SpaceSchedule getScheduleOrThrow(Long scheduleId, Long spaceId) {
        SpaceSchedule schedule = spaceScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horario no encontrado"));
        if (!schedule.getSpace().getId().equals(spaceId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El horario no pertenece al espacio indicado");
        }
        return schedule;
    }

    private void validateSchedule(LocalTime openingTime, LocalTime closingTime, DayType dayType) {
        if (!openingTime.isBefore(closingTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El horario de apertura debe ser anterior al de cierre");
        }
        complexScheduleRepository.findByDayType(dayType).ifPresent(complexSchedule -> {
            if (openingTime.isBefore(complexSchedule.getOpeningTime())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        String.format("El horario de apertura no puede ser antes de las %s",
                                complexSchedule.getOpeningTime()));
            }
            if (closingTime.isAfter(complexSchedule.getClosingTime())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        String.format("El horario de cierre no puede ser después de las %s",
                                complexSchedule.getClosingTime()));
            }
        });
    }

    private boolean schedulesOverlap(LocalTime newOpen, LocalTime newClose, LocalTime existOpen, LocalTime existClose) {
        boolean newCrosses = !newClose.isAfter(newOpen);
        boolean existCrosses = !existClose.isAfter(existOpen);
        if (!newCrosses && !existCrosses) {
            return newOpen.isBefore(existClose) && existOpen.isBefore(newClose);
        }
        if (newCrosses && existCrosses) {
            return true;
        }
        if (newCrosses) {
            return existOpen.isBefore(newClose) || existClose.isAfter(newOpen);
        }
        return newOpen.isBefore(existClose) || newClose.isAfter(existOpen);
    }
}
