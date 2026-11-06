package hoyjugas.DTO.Inventory;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class InventoryItemUpdateRequestDTO extends InventoryItemRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;
}