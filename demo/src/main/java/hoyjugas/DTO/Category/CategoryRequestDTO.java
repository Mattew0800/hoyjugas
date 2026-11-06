package hoyjugas.DTO.Category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequestDTO {
    @NotBlank(message = "El código es obligatorio")
    @Size(max = 20)
    private String code;

    @NotBlank(message = "El nombre es obligatorio")
    private String name;
}