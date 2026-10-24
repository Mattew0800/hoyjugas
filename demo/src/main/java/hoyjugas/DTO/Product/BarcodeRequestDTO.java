package hoyjugas.DTO.Product;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BarcodeRequestDTO {
    @NotBlank(message = "El código de barras es obligatorio")
    private String barcode;
}