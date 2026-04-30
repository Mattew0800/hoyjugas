package hoyjugas.DTO.RecurringBooking;

import hoyjugas.Model.Booking;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class RecurringBookingSlotDTO {

    private Long bookingId;
    private String bookingNumber;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String bookingStatus;
    private String paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private BigDecimal remainingAmount;
    private Boolean isInitialDeposit;

    public static RecurringBookingSlotDTO fromEntity(Booking booking,int turnoNumero,int turnosConSeñaDoble,BigDecimal depositAmount,BigDecimal remainingAmount) {
        RecurringBookingSlotDTO dto = new RecurringBookingSlotDTO();
        dto.setBookingId(booking.getId());
        dto.setBookingNumber(booking.getBookingNumber());
        dto.setStartDatetime(booking.getStartDatetime());
        dto.setEndDatetime(booking.getEndDatetime());
        dto.setBookingStatus(booking.getBookingStatus().name());
        dto.setPaymentStatus(booking.getPaymentStatus().name());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setDepositAmount(depositAmount);
        dto.setRemainingAmount(remainingAmount);
        dto.setIsInitialDeposit(turnoNumero <= turnosConSeñaDoble);
        return dto;
    }
}
