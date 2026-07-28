package hoyjugas.Controller;

import hoyjugas.DTO.Space.*;
import hoyjugas.DTO.SpacePricing.SpacePricingDeleteRequestDTO;
import hoyjugas.DTO.SpacePricing.SpacePricingParentRequestDTO;
import hoyjugas.DTO.SpacePricing.SpacePricingUpdateRequestDTO;
import hoyjugas.DTO.SpaceSchedule.SpaceScheduleDeleteRequestDTO;
import hoyjugas.DTO.SpaceSchedule.SpaceScheduleParentRequestDTO;
import hoyjugas.DTO.SpaceSchedule.SpaceScheduleResponseDTO;
import hoyjugas.DTO.SpaceSchedule.SpaceScheduleUpdateRequestDTO;
import hoyjugas.Service.SpaceScheduleService;
import hoyjugas.Service.SpaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;
    private final SpaceScheduleService spaceScheduleService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaceResponseDTO> createSpace(@Valid @RequestBody SpaceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(spaceService.createSpace(dto));
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaceResponseDTO> updateSpace(@Valid @RequestBody SpaceUpdateRequestDTO dto) {
        return ResponseEntity.ok(spaceService.updateSpace(dto.getSpaceId(), dto));
    }

    @PutMapping("/toggle-status")//revisar si vale la pena hacer endpoint por endpoint o simplemente usar el update y dependiendo lo que llega lo updateo
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleStatus(@Valid @RequestBody SpaceStatusRequestDTO dto) {
        spaceService.toggleSpaceStatus(dto.getSpaceId(), dto.getIsActive());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/detail")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaceResponseDTO> getSpace(@Valid @RequestBody SpaceDetailRequestDTO dto) {
        return ResponseEntity.ok(spaceService.getSpaceById(dto.getSpaceId()));
    }

    @PostMapping("/get-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SpaceListDTO>> getAllSpaces() {
        return ResponseEntity.ok(spaceService.getAllSpacesIncludingInactive());
    }

    @PostMapping("/pricing/add")//para poner precio diff dependiendo franja horaria y dia
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaceResponseDTO> addPricing(@Valid @RequestBody SpacePricingParentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(spaceService.addPricing(dto.getSpaceId(), dto.getPricing()));
    }

    @PutMapping("/pricing/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaceResponseDTO> updatePricing(@Valid @RequestBody SpacePricingUpdateRequestDTO dto) {
        return ResponseEntity.ok(spaceService.updatePricing(dto.getSpaceId(), dto.getPricingId(), dto.getPricing()));
    }

    @DeleteMapping("/pricing/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaceResponseDTO> deletePricing(@Valid @RequestBody SpacePricingDeleteRequestDTO dto) {
        return ResponseEntity.ok(spaceService.deletePricing(dto.getSpaceId(), dto.getPricingId()));
    }

    @PostMapping("/get-all-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SpaceListDTO>> getAllSpacesActive() {
        return ResponseEntity.ok(spaceService.getAllSpacesActive());
    }

    @PostMapping("/schedule/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaceScheduleResponseDTO> addSchedule(@Valid @RequestBody SpaceScheduleParentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(spaceScheduleService.addSchedule(dto.getSpaceId(), dto.getSchedule()));
    }

    @PutMapping("/schedule/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaceScheduleResponseDTO> updateSchedule(@Valid @RequestBody SpaceScheduleUpdateRequestDTO dto) {
        return ResponseEntity.ok(spaceScheduleService.updateSchedule(
                dto.getSpaceId(), dto.getScheduleId(), dto.toScheduleRequestDTO()));
    }

    @DeleteMapping("/schedule/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSchedule(@Valid @RequestBody SpaceScheduleDeleteRequestDTO dto) {
        spaceScheduleService.deleteSchedule(dto.getSpaceId(), dto.getScheduleId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/schedule/get-by-space")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SpaceScheduleResponseDTO>> getSchedulesBySpace(@Valid @RequestBody SpaceDetailRequestDTO dto) {
        return ResponseEntity.ok(spaceScheduleService.getSchedulesBySpace(dto.getSpaceId()));
    }
}
