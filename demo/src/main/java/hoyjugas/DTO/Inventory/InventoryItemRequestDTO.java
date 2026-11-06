package hoyjugas.DTO.Inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryItemRequestDTO {
    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotNull(message = "La cantidad mínima es obligatoria")
    @Min(value = 0)
    private Integer minimumQuantity;

    private String description;
    private Long categoryId;
}