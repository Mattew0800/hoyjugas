package hoyjugas.Controller;

import hoyjugas.DTO.Space.*;
import hoyjugas.DTO.SpacePricing.SpacePricingDeleteRequestDTO;
import hoyjugas.DTO.SpacePricing.SpacePricingParentRequestDTO;
import hoyjugas.DTO.SpacePricing.SpacePricingRequestDTO;
import hoyjugas.DTO.SpacePricing.SpacePricingUpdateRequestDTO;
import hoyjugas.DTO.SpaceSchedule.*;
import hoyjugas.Service.PricingService;
import hoyjugas.Service.SpaceScheduleService;
import hoyjugas.Service.SpaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;
    private final SpaceScheduleService spaceScheduleService;
    private final PricingService pricingService;

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

    @PostMapping("/validate-pricing")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> validatePricingCoverage(@Valid @RequestBody List<SpacePricingParentRequestDTO> dto) {
        if (dto.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe enviar al menos una franja de precio");
        }
        Long spaceId = dto.get(0).getSpaceId();
        boolean allSameSpace = dto.stream()
                .allMatch(item -> item.getSpaceId().equals(spaceId));
        if (!allSameSpace) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todos los precios deben ser del mismo espacio");
        }
        List<SpacePricingRequestDTO> pricings = dto.stream()
                .map(SpacePricingParentRequestDTO::getPricing)
                .toList();
        pricingService.validatePricingCoverage(spaceId, pricings);
        return ResponseEntity.ok(Map.of("message", "Precios configurados correctamente"));
    }

    @PutMapping("/schedule/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaceScheduleResponseDTO> updateSchedule(@Valid @RequestBody SpaceScheduleUpdateWithPricingDTO dto) {
        return ResponseEntity.ok(spaceScheduleService.updateScheduleWithPricing(dto.getSpaceId(), dto.getScheduleId(), dto.getSchedule(), dto.getPricings()));
    }

    @PostMapping("/schedule/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaceScheduleResponseDTO> addSchedule(@Valid @RequestBody SpaceScheduleWithPricingDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(spaceScheduleService.addScheduleWithPricing(dto.getSpaceId(), dto.getSchedule(),dto.getPricings()));
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

//    @PostMapping("/schedule/add")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<SpaceScheduleResponseDTO> addSchedule(@Valid @RequestBody SpaceScheduleParentRequestDTO dto) {
//        return ResponseEntity.status(HttpStatus.CREATED)
//                .body(spaceScheduleService.addSchedule(dto.getSpaceId(), dto.getSchedule()));
//    }

//    @PutMapping("/schedule/update")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<SpaceScheduleResponseDTO> updateSchedule(@Valid @RequestBody SpaceScheduleUpdateRequestDTO dto) {
//        return ResponseEntity.ok(spaceScheduleService.updateSchedule(dto.getSpaceId(), dto.getScheduleId(), dto.toScheduleRequestDTO()));
//    }

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
