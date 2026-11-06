package hoyjugas.Controller;

import hoyjugas.DTO.Supplier.*;
import hoyjugas.Service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupplierDetailDTO> create(@Valid @RequestBody SupplierRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supplierService.create(dto));
    }

    @PostMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupplierDetailDTO> update(@Valid @RequestBody SupplierUpdateRequestDTO dto) {
        return ResponseEntity.ok(supplierService.update(dto.getId(), dto));
    }

    @PostMapping("/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleStatus(@Valid @RequestBody SupplierIdRequestDTO dto) {
        supplierService.toggleStatus(dto.getId());
        return ResponseEntity.ok(Map.of("message", "Estado actualizado correctamente"));
    }

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SupplierListDTO>> getAll() {
        return ResponseEntity.ok(supplierService.getAll());
    }

    @GetMapping("/list-active")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<SupplierListDTO>> getAllActive() {
        return ResponseEntity.ok(supplierService.getAllActive());
    }

    @PostMapping("/get")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupplierDetailDTO> getById(@Valid @RequestBody SupplierIdRequestDTO dto) {
        return ResponseEntity.ok(supplierService.getById(dto.getId()));
    }
}