package hoyjugas.DTO.Inventory;

import hoyjugas.Model.InventoryMovement;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class InventoryMovementResponseDTO {
    private Long id;
    private String movementNumber;
    private String itemName;
    private String type;
    private Integer quantity;
    private Integer quantityBefore;
    private Integer quantityAfter;
    private String reason;
    private String registeredByName;
    private LocalDateTime createdAt;

    public static InventoryMovementResponseDTO fromEntity(InventoryMovement movement) {
        InventoryMovementResponseDTO dto = new InventoryMovementResponseDTO();
        dto.setId(movement.getId());
        dto.setMovementNumber(movement.getMovementNumber());
        dto.setItemName(movement.getInventoryItem().getName());
        dto.setType(movement.getType().name());
        dto.setQuantity(movement.getQuantity());
        dto.setQuantityBefore(movement.getQuantityBefore());
        dto.setQuantityAfter(movement.getQuantityAfter());
        dto.setReason(movement.getReason());
        dto.setRegisteredByName(movement.getRegisteredBy().getName());
        dto.setCreatedAt(movement.getCreatedAt());
        return dto;
    }
}