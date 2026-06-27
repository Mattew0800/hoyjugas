package hoyjugas.Controller;

import hoyjugas.DTO.CashMovement.CashMovementFilterDTO;
import hoyjugas.DTO.CashMovement.CashMovementListDTO;
import hoyjugas.DTO.CashMovement.CashMovementSummaryDTO;
import hoyjugas.Service.CashMovementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cash-movements")
@RequiredArgsConstructor
public class CashMovementController {

    private final CashMovementService cashMovementService;

    @PostMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CashMovementListDTO>> getAll(@Valid @RequestBody CashMovementFilterDTO dto) {
        return ResponseEntity.ok(cashMovementService.getAll(dto));
    }

    @PostMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CashMovementSummaryDTO> getSummary(@Valid @RequestBody CashMovementFilterDTO dto) {
        return ResponseEntity.ok(cashMovementService.getSummary(dto));
    }
}