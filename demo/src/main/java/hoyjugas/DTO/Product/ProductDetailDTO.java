package hoyjugas.DTO.Product;

import hoyjugas.Model.Product;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class ProductDetailDTO {//el detalle del producto, solo admin manipula esto
    private Long id;
    private String internalCode;
    private String barcode;
    private String name;
    private BigDecimal cost;
    private BigDecimal salePrice;
    private BigDecimal profit;          // ganancia neta
    private Integer stock;
    private Integer minimumStock;
    private Boolean lowStock;
    private Boolean isActive;
    private String categoryName;
    private String supplierName;
    private BigDecimal discount;

    public static ProductDetailDTO fromEntity(Product product) {
        ProductDetailDTO dto = new ProductDetailDTO();
        dto.setId(product.getId());
        dto.setInternalCode(product.getInternalCode());
        dto.setBarcode(product.getBarcode());
        dto.setName(product.getName());
        dto.setCost(product.getCost());
        dto.setSalePrice(product.getSalePrice());
        dto.setProfit(product.getProfit());
        dto.setStock(product.getStock());
        dto.setMinimumStock(product.getMinimumStock());
        dto.setLowStock(product.getStock() <= product.getMinimumStock());
        dto.setIsActive(product.getIsActive());
        dto.setCategoryName(product.getCategory().getName());
        dto.setSupplierName(product.getSupplier() != null
                ? product.getSupplier().getName() : null);
        dto.setDiscount(product.getDiscount());
        return dto;
    }
}