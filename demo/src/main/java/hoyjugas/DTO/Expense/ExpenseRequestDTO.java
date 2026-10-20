package hoyjugas.DTO.Expense;

import hoyjugas.Enum.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExpenseRequestDTO {
    @NotNull(message = "El concepto es obligatorio")
    private Long conceptId;

    private String voucher;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    @NotBlank(message = "El detalle es obligatorio")
    private String detail;

    private Long supplierId;

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;

    @NotBlank(message = "El PIN es obligatorio")
    private String employeePin;
}