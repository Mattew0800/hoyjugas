package hoyjugas.DTO.Supplier;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SupplierUpdateRequestDTO extends SupplierRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;
}