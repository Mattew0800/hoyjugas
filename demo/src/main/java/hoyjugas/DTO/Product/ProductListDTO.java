package hoyjugas.DTO.Product;

import hoyjugas.Model.Product;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class ProductListDTO {//producto listado, no muestra ganancia etc
    private Long id;
    private String internalCode;
    private String barcode;
    private String name;
    private BigDecimal salePrice;
    private Integer stock;
    private Boolean lowStock;           // true si stock <= minimumStock
    private String categoryName;

    public static ProductListDTO fromEntity(Product product) {
        ProductListDTO dto = new ProductListDTO();
        dto.setId(product.getId());
        dto.setInternalCode(product.getInternalCode());
        dto.setBarcode(product.getBarcode());
        dto.setName(product.getName());
        dto.setSalePrice(product.getSalePrice());
        dto.setStock(product.getStock());
        dto.setLowStock(product.getStock() <= product.getMinimumStock());
        dto.setCategoryName(product.getCategory().getName());
        return dto;
    }
}