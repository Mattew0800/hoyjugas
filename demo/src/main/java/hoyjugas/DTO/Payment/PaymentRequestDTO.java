package hoyjugas.DTO.Payment;

import hoyjugas.Enum.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequestDTO {

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;

    private String transactionId;

    private String employeePin;

    @DecimalMin(value = "0.01")
    private BigDecimal amount;
}
