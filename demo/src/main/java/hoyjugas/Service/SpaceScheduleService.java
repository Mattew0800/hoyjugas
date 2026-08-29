package hoyjugas.Service;

import hoyjugas.DTO.SpaceSchedule.SpaceScheduleRequestDTO;
import hoyjugas.DTO.SpaceSchedule.SpaceScheduleResponseDTO;
import hoyjugas.Enum.DayType;
import hoyjugas.Model.Space;
import hoyjugas.Model.SpaceSchedule;
import hoyjugas.Model.SystemConfig;
import hoyjugas.Repository.ComplexScheduleRepository;
import hoyjugas.Repository.SpaceRepository;
import hoyjugas.Repository.SpaceScheduleRepository;
import hoyjugas.Repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SpaceScheduleService {

    private final SpaceScheduleRepository spaceScheduleRepository;
    private final SpaceRepository spaceRepository;
    private final ComplexScheduleRepository complexScheduleRepository;

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
    public SpaceScheduleResponseDTO updateSchedule(Long spaceId, Long scheduleId, SpaceScheduleRequestDTO dto) {
        SpaceSchedule schedule = getScheduleOrThrow(scheduleId, spaceId);
        if (!schedule.getDayType().equals(dto.getDayType()) &&
                spaceScheduleRepository.existsBySpaceIdAndDayType(spaceId, dto.getDayType())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un horario para ese día en este espacio");
        }
        validateSchedule(dto.getOpeningTime(), dto.getClosingTime(), dto.getDayType());
        schedule.setDayType(dto.getDayType());
        schedule.setOpeningTime(dto.getOpeningTime());
        schedule.setClosingTime(dto.getClosingTime());
        return SpaceScheduleResponseDTO.fromEntity(spaceScheduleRepository.save(schedule));
    }

    @Transactional
    public void deleteSchedule(Long spaceId, Long scheduleId) {
        SpaceSchedule schedule = getScheduleOrThrow(scheduleId, spaceId);
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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El horario no pertenece al espacio indicado");
        }
        return schedule;
    }

    private void validateSchedule(LocalTime openingTime, LocalTime closingTime, DayType dayType) {
        if (!openingTime.isBefore(closingTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El horario de apertura debe ser anterior al de cierre");
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
