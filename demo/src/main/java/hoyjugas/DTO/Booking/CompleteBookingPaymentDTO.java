package hoyjugas.DTO.Booking;

import hoyjugas.DTO.Payment.PaymentRequestDTO;
import jakarta.validation.constraints.NotNull;

public class CompleteBookingPaymentDTO extends PaymentRequestDTO {
    @NotNull(message = "El ID del turno es obligatorio")
    private Long bookingId;
}
