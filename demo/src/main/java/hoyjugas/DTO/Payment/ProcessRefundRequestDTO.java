package hoyjugas.DTO.Payment;

import hoyjugas.Enum.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProcessRefundRequestDTO {

    @NotNull(message = "El ID del turno es obligatorio")
    private Long bookingId;

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;

    private String transactionId;

    @NotBlank(message = "El PIN es obligatorio")
    private String employeePin;

    private String notes;
}