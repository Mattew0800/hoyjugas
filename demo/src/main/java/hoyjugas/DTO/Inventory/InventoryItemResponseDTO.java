package hoyjugas.DTO.Inventory;

import hoyjugas.Model.InventoryItem;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InventoryItemResponseDTO {
    private Long id;
    private String name;
    private Integer quantity;
    private Integer minimumQuantity;
    private Boolean lowStock;
    private String description;
    private String categoryName;
    private Boolean isActive;

    public static InventoryItemResponseDTO fromEntity(InventoryItem item) {
        InventoryItemResponseDTO dto = new InventoryItemResponseDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setQuantity(item.getQuantity());
        dto.setMinimumQuantity(item.getMinimumQuantity());
        dto.setLowStock(item.getQuantity() <= item.getMinimumQuantity());
        dto.setDescription(item.getDescription());
        dto.setCategoryName(item.getCategory() != null
                ? item.getCategory().getName() : null);
        dto.setIsActive(item.getIsActive());
        return dto;
    }
}