package hoyjugas.DTO.Booking;

import hoyjugas.Model.Booking;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponseDTO {
    private Long id;
    private String bookingNumber;

    private Long clientId;
    private String clientName;
    private String clientPhone;

    private Long spaceId;
    private String spaceName;
    private String spaceType;

    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;

    private String status;
    private String paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private BigDecimal remainingAmount;
    private String depositLabel;

    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private Boolean refunded;

    private String createdByName;
    private String paymentCollectedByName;
    private LocalDateTime createdAt;

    private Boolean termsAccepted;

    public static BookingResponseDTO fromEntity(
            Booking booking,
            BigDecimal depositAmount,
            BigDecimal remainingAmount,
            String createdByName,
            String paymentCollectedByName
    ) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(booking.getId());
        dto.setBookingNumber(booking.getBookingNumber());

        dto.setClientId(booking.getClient().getId());
        dto.setClientName(booking.getClient().getName());
        dto.setClientPhone(booking.getClient().getPhone());

        dto.setSpaceId(booking.getSpace().getId());
        dto.setSpaceName(booking.getSpace().getName());
        dto.setSpaceType(booking.getSpace().getType().name());

        dto.setStartDatetime(booking.getStartDatetime());
        dto.setEndDatetime(booking.getEndDatetime());

        dto.setStatus(booking.getBookingStatus().name());
        dto.setPaymentStatus(booking.getPaymentStatus().name());

        dto.setTotalAmount(booking.getTotalAmount());
        dto.setDepositAmount(depositAmount);
        dto.setRemainingAmount(remainingAmount);

        dto.setCancelledAt(booking.getCancelledAt());
        dto.setCancellationReason(booking.getCancellationReason());
        dto.setRefunded(booking.getRefunded());

        dto.setCreatedByName(createdByName);
        dto.setPaymentCollectedByName(paymentCollectedByName);

        dto.setCreatedAt(booking.getCreatedAt());
        dto.setTermsAccepted(booking.getTermsAccepted());

        return dto;
    }
}