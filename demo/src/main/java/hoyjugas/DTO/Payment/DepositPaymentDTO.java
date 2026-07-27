package hoyjugas.DTO.Payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
public class DepositPaymentDTO extends PaymentRequestDTO {

    @NotNull(message = "El monto de la seña es obligatorio")
    @DecimalMin(value = "0.01")
    private BigDecimal depositAmount;

}