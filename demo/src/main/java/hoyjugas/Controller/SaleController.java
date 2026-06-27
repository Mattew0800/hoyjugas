package hoyjugas.Controller;

import hoyjugas.DTO.Sale.*;
import hoyjugas.Service.SaleService;
import hoyjugas.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sales")
public class SaleController {

    private final SaleService saleService;
    private final UserService userService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<SaleResponseDTO> createSale(@Valid @RequestBody SaleRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(saleService.createSale(dto, userService.validateEmployeePin(dto.getEmployeePin())));
    }

    @PostMapping("/get")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<SaleResponseDTO> getById(@Valid @RequestBody SaleIdRequestDTO dto) {
        return ResponseEntity.ok(saleService.getById(dto.getId()));
    }

    @PostMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalePageResponseDTO> getAll(@Valid @RequestBody SaleFilterDTO dto) {
        return ResponseEntity.ok(saleService.getAll(dto));
    }

    @PostMapping("/cancel")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<SaleResponseDTO> cancel(@Valid @RequestBody SaleCancelRequestDTO dto) {
        return ResponseEntity.ok(saleService.cancelSale(dto.getId(),userService.validateEmployeePin(dto.getPin())));
    }
}