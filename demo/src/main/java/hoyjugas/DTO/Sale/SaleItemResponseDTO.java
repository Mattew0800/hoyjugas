package hoyjugas.DTO.Sale;

import hoyjugas.Model.SaleItem;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class SaleItemResponseDTO {
    private Long id;
    private String productName;
    private String productCode;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    public static SaleItemResponseDTO fromEntity(SaleItem item) {
        SaleItemResponseDTO dto = new SaleItemResponseDTO();
        dto.setId(item.getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductCode(item.getProduct().getInternalCode());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }
}