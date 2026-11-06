package hoyjugas.Controller;

import hoyjugas.DTO.Category.CategoryIdRequestDTO;
import hoyjugas.DTO.Category.CategoryRequestDTO;
import hoyjugas.DTO.Category.CategoryResponseDTO;
import hoyjugas.DTO.Category.CategoryUpdateRequestDTO;
import hoyjugas.Service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/category")
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponseDTO> createCategory(@Valid @RequestBody CategoryRequestDTO dto) {
        return ResponseEntity.ok(categoryService.create(dto));
    }

    @PostMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponseDTO> updateCategory(@Valid @RequestBody CategoryUpdateRequestDTO dto) {
        return ResponseEntity.ok(categoryService.update(dto));
    }

    @PostMapping("/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleCategoryStatus(@Valid @RequestBody CategoryIdRequestDTO dto) {
        categoryService.toggleStatus(dto.getId());
        return ResponseEntity.ok(Map.of("message", "Estado del rubro actualizado correctamente"));
    }

    @GetMapping("/get-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategory() {
        return ResponseEntity.ok(categoryService.getAll());
    }

    @GetMapping("/get")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponseDTO> getCategory(@Valid @RequestBody CategoryIdRequestDTO dto) {
        return ResponseEntity.ok(categoryService.getById(dto.getId()));
    }

    @GetMapping("get-active")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<CategoryResponseDTO>> getActiveCategory() {
        return ResponseEntity.ok(categoryService.getAllActive());
    }
}
