package hoyjugas.Service;

import hoyjugas.DTO.ComplexSchedule.ComplexScheduleRequestDTO;
import hoyjugas.DTO.ComplexSchedule.ComplexScheduleResponseDTO;
import hoyjugas.Model.ComplexSchedule;
import hoyjugas.Repository.ComplexScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplexScheduleService {

    private final ComplexScheduleRepository complexScheduleRepository;

    public List<ComplexScheduleResponseDTO> getAll() {
        return complexScheduleRepository.findAll()
                .stream()
                .map(ComplexScheduleResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public ComplexScheduleResponseDTO save(ComplexScheduleRequestDTO dto) {
        validateSchedule(dto.getOpeningTime(), dto.getClosingTime());
        ComplexSchedule schedule = new ComplexSchedule();
        schedule.setDayType(dto.getDayType());
        schedule.setOpeningTime(dto.getOpeningTime());
        schedule.setClosingTime(dto.getClosingTime());
        return ComplexScheduleResponseDTO.fromEntity(complexScheduleRepository.save(schedule));
    }

    private void validateSchedule(LocalTime openingTime, LocalTime closingTime) {
        if (!openingTime.isBefore(closingTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El horario de apertura debe ser anterior al de cierre");
        }
    }

    @Transactional
    public void deleteComplexSchedule(Long id) {
        ComplexSchedule schedule = complexScheduleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Horario no encontrado" ));
        complexScheduleRepository.delete(schedule);
    }

    @Transactional
    public ComplexScheduleResponseDTO updateComplexSchedule(Long id, ComplexScheduleRequestDTO dto) {
        ComplexSchedule schedule=complexScheduleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Horario no encontrado"));
        validateSchedule(dto.getOpeningTime(), dto.getClosingTime());
        schedule.setDayType(dto.getDayType());
        schedule.setOpeningTime(dto.getOpeningTime());
        schedule.setClosingTime(dto.getClosingTime());
        return ComplexScheduleResponseDTO.fromEntity(complexScheduleRepository.save(schedule));
    }
}