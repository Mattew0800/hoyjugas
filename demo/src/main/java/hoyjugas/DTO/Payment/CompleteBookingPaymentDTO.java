package hoyjugas.DTO.Payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class CompleteBookingPaymentDTO extends PaymentRequestDTO {

    @NotNull(message = "El ID del turno es obligatorio")
    private Long bookingId;
}