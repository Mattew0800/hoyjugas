package hoyjugas.Controller;

import hoyjugas.DTO.Inventory.*;
import hoyjugas.Service.InventoryService;
import hoyjugas.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final UserService userService;

    @PostMapping("/create-item")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItemResponseDTO> create(@Valid @RequestBody InventoryItemRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.create(dto));
    }

    @PostMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItemResponseDTO> update(@Valid @RequestBody InventoryItemUpdateRequestDTO dto) {
        return ResponseEntity.ok(inventoryService.update(dto.getId(), dto));
    }

    @PostMapping("/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleStatus(@Valid @RequestBody InventoryItemIdRequestDTO dto) {
        inventoryService.toggleStatus(dto.getId());
        return ResponseEntity.ok(Map.of("message", "Estado actualizado correctamente"));
    }

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryItemResponseDTO>> getAll() {
        return ResponseEntity.ok(inventoryService.getAll());
    }

    @GetMapping("/list-active")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<InventoryItemResponseDTO>> getAllActive() {
        return ResponseEntity.ok(inventoryService.getAllActive());
    }

    @PostMapping("/get")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryItemResponseDTO> getById(@Valid @RequestBody InventoryItemIdRequestDTO dto) {
        return ResponseEntity.ok(inventoryService.getById(dto.getId()));
    }

    @PostMapping("/movement/register")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryMovementResponseDTO> registerMovement(@Valid @RequestBody InventoryMovementRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventoryService.registerMovement(dto.getItemId(), dto, userService.validateEmployeePin(dto.getEmployeePin())));
    }

    @PostMapping("/movement/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryMovementResponseDTO>> getMovements(@Valid @RequestBody InventoryItemIdRequestDTO dto) {
        return ResponseEntity.ok(inventoryService.getMovementsByItem(dto.getId()));
    }
}