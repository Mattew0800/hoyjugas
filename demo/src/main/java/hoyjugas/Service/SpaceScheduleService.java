package hoyjugas.Service;

import hoyjugas.DTO.SpaceSchedule.SpaceScheduleRequestDTO;
import hoyjugas.DTO.SpaceSchedule.SpaceScheduleResponseDTO;
import hoyjugas.Model.Space;
import hoyjugas.Model.SpaceSchedule;
import hoyjugas.Repository.SpaceRepository;
import hoyjugas.Repository.SpaceScheduleRepository;
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

    @Transactional
    public SpaceScheduleResponseDTO addSchedule(Long spaceId, SpaceScheduleRequestDTO dto) {
        Space space = spaceRepository.findByIdAndIsActiveTrue(spaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));
        if (spaceScheduleRepository.existsBySpaceIdAndDayType(spaceId, dto.getDayType())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un horario para ese día en este espacio");
        }

        validateSchedule(dto.getOpeningTime(), dto.getClosingTime());

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

        validateSchedule(dto.getOpeningTime(), dto.getClosingTime());

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

    private void validateSchedule(LocalTime openingTime, LocalTime closingTime) {
        if (!openingTime.isBefore(closingTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El horario de apertura debe ser anterior al de cierre");
        }
    }
}
