package hoyjugas.DTO.Inventory;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryItemIdRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;
}