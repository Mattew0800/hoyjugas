package hoyjugas.Scheduler;

import hoyjugas.Enum.NotificationStatus;
import hoyjugas.Enum.NotificationType;
import hoyjugas.Enum.PaymentStatus;
import hoyjugas.Enum.PaymentType;
import hoyjugas.Model.Booking;
import hoyjugas.Model.BookingNotification;
import hoyjugas.Repository.BookingNotificationRepository;
import hoyjugas.Repository.PaymentRepository;
import hoyjugas.Service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingReminderScheduler {

    private final BookingNotificationRepository bookingNotificationRepository;
    private final WhatsAppService whatsAppService;
    private final PaymentRepository paymentRepository;

    @Scheduled(fixedDelay = 300000)
    @Transactional
    public void processReminders() {
        List<BookingNotification> pending = bookingNotificationRepository
                .findByStatusAndTypeIn(NotificationStatus.PENDIENTE, List.of(NotificationType.RECUERDO_24H,NotificationType.CANCELADO));
        for (BookingNotification notification : pending) {
            Booking booking = notification.getBooking();
             if (notification.getType() == NotificationType.RECUERDO_24H) {
                LocalDateTime sendAt = booking.getStartDatetime()
                        .minusHours(notification.getHoursBefore());
                if (LocalDateTime.now().isAfter(sendAt)) {
                    try {
                        BigDecimal totalCollected = paymentRepository.findTotalByBookingIdExcludingType(
                                booking.getId(), PaymentType.DEVOLUCION, PaymentStatus.PAGADO);
                        BigDecimal remaining = booking.getTotalAmount()
                                .subtract(totalCollected).max(BigDecimal.ZERO);
                        whatsAppService.sendBookingReminder(booking, remaining);
                        notification.setStatus(NotificationStatus.ENVIADO);
                        notification.setSentAt(LocalDateTime.now());
                    } catch (Exception e) {
                        notification.setStatus(NotificationStatus.ERROR);
                        log.error("Error enviando recordatorio {}: {}", notification.getId(), e.getMessage());
                    }
                    bookingNotificationRepository.save(notification);
                }
            }else if(notification.getType() == NotificationType.CANCELADO) {
                try {
                    whatsAppService.sendCancellationNotification(booking);
                    notification.setStatus(NotificationStatus.ENVIADO);
                    notification.setSentAt(LocalDateTime.now());
                } catch (Exception e) {
                    notification.setStatus(NotificationStatus.ERROR);
                    log.error("Error enviando cancelación {}: {}", notification.getId(), e.getMessage());
                }
            }else if(notification.getType() == NotificationType.AUSENTE) {
                try {
                    whatsAppService.sendAbsentNotification(booking);
                    notification.setStatus(NotificationStatus.ENVIADO);
                    notification.setSentAt(LocalDateTime.now());
                } catch (Exception e) {
                    notification.setStatus(NotificationStatus.ERROR);
                    log.error("Error enviando aviso de ausentismo {}: {}", notification.getId(), e.getMessage());
                }
            }
        }
    }
}