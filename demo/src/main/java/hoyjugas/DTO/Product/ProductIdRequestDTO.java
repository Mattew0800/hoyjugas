package hoyjugas.DTO.Product;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductIdRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;
}