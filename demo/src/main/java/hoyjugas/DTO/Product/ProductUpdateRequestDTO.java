package hoyjugas.DTO.Product;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ProductUpdateRequestDTO extends ProductRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;
}