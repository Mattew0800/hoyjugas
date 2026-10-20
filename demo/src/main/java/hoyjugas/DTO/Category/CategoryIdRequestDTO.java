package hoyjugas.DTO.Category;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategoryIdRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;
}
