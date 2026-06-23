package hoyjugas.DTO.GoodsReceipt;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class GoodsReceiptItemRequestDTO {
    @NotNull(message = "El producto es obligatorio")
    private Long productId;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1)
    private Integer quantity;

    @NotNull(message = "El costo unitario es obligatorio")
    @DecimalMin(value = "0.01")
    private BigDecimal unitCost;

    private BigDecimal newSalePrice;    // opcional
}