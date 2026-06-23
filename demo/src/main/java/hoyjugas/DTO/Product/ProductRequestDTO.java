package hoyjugas.DTO.Product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequestDTO {
    @NotBlank(message = "El código interno es obligatorio")
    private String internalCode;

    private String barcode;

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @DecimalMin(value = "0.01")
    private BigDecimal cost;

    @NotNull(message = "El precio de venta es obligatorio")
    @DecimalMin(value = "0.01")
    private BigDecimal salePrice;

    @NotNull(message = "El stock mínimo es obligatorio")
    @Min(value = 0)
    private Integer minimumStock;

    @NotNull(message = "El rubro es obligatorio")
    private Long categoryId;

    private Long supplierId;
}