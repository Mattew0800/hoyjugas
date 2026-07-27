package hoyjugas.Controller;

import hoyjugas.DTO.ComplexSchedule.ComplexScheduleIdRequestDTO;
import hoyjugas.DTO.ComplexSchedule.ComplexScheduleRequestDTO;
import hoyjugas.DTO.ComplexSchedule.ComplexScheduleResponseDTO;
import hoyjugas.DTO.ComplexSchedule.ComplexScheduleUpdateRequestDTO;
import hoyjugas.Service.ComplexScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/complex-schedule")
@RequiredArgsConstructor
public class ComplexScheduleController {

    private final ComplexScheduleService complexScheduleService;

    @GetMapping("/get-all")
    public ResponseEntity<List<ComplexScheduleResponseDTO>> getAll() {
        return ResponseEntity.ok(complexScheduleService.getAll());
    }

    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplexScheduleResponseDTO> save(@Valid @RequestBody ComplexScheduleRequestDTO dto) {
        return ResponseEntity.ok(complexScheduleService.save(dto));
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@Valid @RequestBody ComplexScheduleIdRequestDTO dto) {
        complexScheduleService.deleteComplexSchedule(dto.getId());
        return ResponseEntity.ok(Map.of("message ", "Horario eliminado exitosamente!"));
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplexScheduleResponseDTO> update(@Valid @RequestBody ComplexScheduleUpdateRequestDTO dto) {
        return ResponseEntity.ok(complexScheduleService.updateComplexSchedule(dto.getId(), dto));
    }

}