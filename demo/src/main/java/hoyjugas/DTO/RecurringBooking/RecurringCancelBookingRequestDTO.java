package hoyjugas.DTO.RecurringBooking;

import hoyjugas.DTO.Booking.CancelBookingRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RecurringCancelBookingRequestDTO {
    @NotNull
    private Long bookingId;

    @NotNull
    @Valid
    private CancelBookingRequestDTO cancellation;
}