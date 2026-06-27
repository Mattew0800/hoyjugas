package hoyjugas.DTO.Sale;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SaleIdRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;
}