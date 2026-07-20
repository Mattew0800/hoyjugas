package hoyjugas.Controller;

import hoyjugas.DTO.Expense.*;
import hoyjugas.Service.ExpenseService;
import hoyjugas.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserService userService;

    @PostMapping("/concept/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExpenseConceptResponseDTO> createConcept(@Valid @RequestBody ExpenseConceptRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createConcept(dto));
    }

    @PostMapping("/concept/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleConceptStatus(
            @Valid @RequestBody ExpenseConceptIdRequestDTO dto) {
        expenseService.toggleConceptStatus(dto.getId());
        return ResponseEntity.ok(Map.of("message", "Estado del concepto actualizado correctamente"));
    }

    @GetMapping("/concept/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExpenseConceptResponseDTO>> getAllConcepts() {
        return ResponseEntity.ok(expenseService.getAllConcepts());
    }

    @GetMapping("/concept/list-active")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<ExpenseConceptResponseDTO>> getActiveConcepts() {
        return ResponseEntity.ok(expenseService.getActiveConcepts());
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ExpenseResponseDTO> createExpense(@Valid @RequestBody ExpenseRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createExpense(dto, userService.validateEmployeePin(dto.getEmployeePin())));
    }

    @PostMapping("/get")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ExpenseResponseDTO> getById(@Valid @RequestBody ExpenseIdRequestDTO dto) {
        return ResponseEntity.ok(expenseService.getById(dto.getId()));
    }

    @PostMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ExpenseResponseDTO>> getAll(@Valid @RequestBody ExpenseFilterDTO dto) {
        return ResponseEntity.ok(expenseService.getAll(dto));
    }

}