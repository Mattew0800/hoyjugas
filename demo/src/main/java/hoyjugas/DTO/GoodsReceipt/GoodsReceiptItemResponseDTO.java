package hoyjugas.DTO.GoodsReceipt;

import hoyjugas.Model.GoodsReceiptItem;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class GoodsReceiptItemResponseDTO {
    private Long id;
    private String productName;
    private String productCode;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal subtotal;
    private BigDecimal newSalePrice;

    public static GoodsReceiptItemResponseDTO fromEntity(GoodsReceiptItem item) {
        GoodsReceiptItemResponseDTO dto = new GoodsReceiptItemResponseDTO();
        dto.setId(item.getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductCode(item.getProduct().getInternalCode());
        dto.setQuantity(item.getQuantity());
        dto.setUnitCost(item.getUnitCost());
        dto.setSubtotal(item.getSubtotal());
        dto.setNewSalePrice(item.getNewSalePrice());
        return dto;
    }
}