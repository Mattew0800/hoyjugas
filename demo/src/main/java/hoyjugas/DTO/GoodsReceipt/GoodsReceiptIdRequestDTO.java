package hoyjugas.DTO.GoodsReceipt;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GoodsReceiptIdRequestDTO {
    @NotNull(message = "El id es obligatorio")
    private Long id;
}