package hoyjugas.DTO.GoodsReceipt;

import hoyjugas.Enum.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class GoodsReceiptRequestDTO {
    @NotNull(message = "El proveedor es obligatorio")
    private Long supplierId;

    private String voucher;

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;

    private String notes;

    @NotBlank(message = "El PIN es obligatorio")
    private String employeePin;

    @NotEmpty(message = "Debe ingresar al menos un producto")
    @Valid
    private List<GoodsReceiptItemRequestDTO> items;
}