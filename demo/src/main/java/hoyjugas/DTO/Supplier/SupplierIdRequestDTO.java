package hoyjugas.DTO.Supplier;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SupplierIdRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;
}