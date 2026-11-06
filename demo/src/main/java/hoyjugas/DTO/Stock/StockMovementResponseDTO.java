package hoyjugas.DTO.Stock;

import hoyjugas.Model.StockMovement;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class StockMovementResponseDTO {
    private Long id;
    private String movementNumber;
    private String productName;
    private String productCode;
    private String type;
    private Integer quantity;
    private Integer stockBefore;
    private Integer stockAfter;
    private String reason;
    private String registeredByName;
    private LocalDateTime createdAt;

    public static StockMovementResponseDTO fromEntity(StockMovement movement) {
        StockMovementResponseDTO dto = new StockMovementResponseDTO();
        dto.setId(movement.getId());
        dto.setMovementNumber(movement.getMovementNumber());
        dto.setProductName(movement.getProduct().getName());
        dto.setProductCode(movement.getProduct().getInternalCode());
        dto.setType(movement.getType().name());
        dto.setQuantity(movement.getQuantity());
        dto.setStockBefore(movement.getStockBefore());
        dto.setStockAfter(movement.getStockAfter());
        dto.setReason(movement.getReason());
        dto.setRegisteredByName(movement.getRegisteredBy().getName());
        dto.setCreatedAt(movement.getCreatedAt());
        return dto;
    }
}