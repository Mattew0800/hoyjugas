package hoyjugas.DTO.Product;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductSearchRequestDTO {
    @NotBlank
    private String query;
}