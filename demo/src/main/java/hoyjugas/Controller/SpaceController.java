package hoyjugas.Controller;

import hoyjugas.DTO.Space.*;
import hoyjugas.DTO.SpacePricing.SpacePricingDeleteRequestDTO;
import hoyjugas.DTO.SpacePricing.SpacePricingParentRequestDTO;
import hoyjugas.DTO.SpacePricing.SpacePricingUpdateRequestDTO;
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

    @PutMapping("/toggle-status")
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

    @PostMapping("/pricing/add")
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

    @PutMapping("/pricing/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaceResponseDTO> deletePricing(@Valid @RequestBody SpacePricingDeleteRequestDTO dto) {
        return ResponseEntity.ok(spaceService.deletePricing(dto.getSpaceId(), dto.getPricingId()));
    }
}
