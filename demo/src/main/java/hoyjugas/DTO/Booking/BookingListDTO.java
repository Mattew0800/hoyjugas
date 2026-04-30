package hoyjugas.DTO.Booking;

import hoyjugas.Model.Booking;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BookingListDTO {
    private Long id;
    private String bookingNumber;
    private String clientName;
    private String clientPhone;
    private String spaceName;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String status;
    private String paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal remainingAmount;
    private String paymentCollectedByName;

    public static BookingListDTO fromEntity(Booking booking) {
        BookingListDTO dto = new BookingListDTO();
        dto.setId(booking.getId());
        dto.setBookingNumber(booking.getBookingNumber());
        dto.setClientName(booking.getClient().getName());
        dto.setClientPhone(booking.getClient().getPhone());
        dto.setSpaceName(booking.getSpace().getName());
        dto.setStartDatetime(booking.getStartDatetime());
        dto.setEndDatetime(booking.getEndDatetime());
        dto.setStatus(booking.getPaymentStatus().name());
        dto.setPaymentStatus(booking.getPaymentStatus().name());
        dto.setTotalAmount(booking.getTotalAmount());
        return dto;
}
}
