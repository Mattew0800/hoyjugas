package hoyjugas.Service;

import hoyjugas.DTO.Category.CategoryRequestDTO;
import hoyjugas.DTO.Category.CategoryResponseDTO;
import hoyjugas.DTO.Category.CategoryUpdateRequestDTO;
import hoyjugas.Model.Category;
import hoyjugas.Repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponseDTO> getAll() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryResponseDTO::fromEntity)
                .toList();
    }

    public List<CategoryResponseDTO> getAllActive() {
        return categoryRepository.findByIsActiveTrue()
                .stream()
                .map(CategoryResponseDTO::fromEntity)
                .toList();
    }

    public CategoryResponseDTO getById(Long id) {
        return CategoryResponseDTO.fromEntity(getCategoryOrThrow(id));
    }

    @Transactional
    public CategoryResponseDTO create(CategoryRequestDTO dto) {
        if (categoryRepository.existsByCodeIgnoreCase(dto.getCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un rubro con ese código");
        }
        if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un rubro con ese nombre");
        }
        Category category = new Category();
        category.setCode(dto.getCode().toUpperCase());
        category.setName(dto.getName());
        return CategoryResponseDTO.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponseDTO update(CategoryUpdateRequestDTO dto) {
        Long id = dto.getId();
        Category category = getCategoryOrThrow(id);
        if (categoryRepository.existsByCodeIgnoreCaseAndIdNot(dto.getCode(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un rubro con ese código");
        }
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(dto.getName(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un rubro con ese nombre");
        }
        category.setCode(dto.getCode().toUpperCase());
        category.setName(dto.getName());
        return CategoryResponseDTO.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public void toggleStatus(Long id) {
        Category category = getCategoryOrThrow(id);
        category.setIsActive(!category.getIsActive());
        categoryRepository.save(category);
    }

    private Category getCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Rubro no encontrado"));
    }
}