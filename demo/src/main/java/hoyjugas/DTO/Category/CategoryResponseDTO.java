package hoyjugas.DTO.Category;

import hoyjugas.Model.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor
@AllArgsConstructor
public class CategoryResponseDTO {
    private Long id;
    private String code;
    private String name;
    private Boolean isActive;

    public static CategoryResponseDTO fromEntity(Category category) {
        return new CategoryResponseDTO(
                category.getId(),
                category.getCode(),
                category.getName(),
                category.getIsActive()
        );
    }
}