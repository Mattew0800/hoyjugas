package hoyjugas.Service;

import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.PaymentData;
import hoyjugas.DTO.Booking.BookingResponseDTO;
import hoyjugas.Enum.*;
import hoyjugas.Model.*;
import hoyjugas.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@RequiredArgsConstructor
public abstract class BaseBookingService {

    protected final BookingNotificationRepository bookingNotificationRepository;
    protected final SystemConfigRepository systemConfigRepository;
    protected final UserRepository userRepository;
    protected final SpaceRepository spaceRepository;
    protected final PaymentRepository paymentRepository;
    protected final BookingRepository bookingRepository;
    protected final MercadoPagoService mercadoPagoService;

    protected void scheduleNotification(Booking booking, NotificationType type) {
        BookingNotification notif = new BookingNotification();
        notif.setBooking(booking);
        notif.setType(type);
        notif.setStatus(NotificationStatus.PENDIENTE);
        bookingNotificationRepository.save(notif);
    }

    protected SystemConfig getSystemConfig() {
        return systemConfigRepository.findById(1)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Configuración del sistema no encontrada"
                ));
    }
    protected User getClientOrThrow(Long clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        if (!client.getRole().equals(Role.USER)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario no es un cliente");
        }
        return client;
    }

    protected Space getActiveSpaceOrThrow(Long spaceId) {
        return spaceRepository.findByIdAndIsActiveTrue(spaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));
    }

    protected Payment buildPayment(Booking booking, PaymentMethod method,
                                   BigDecimal amount, String transactionId,
                                   User employee, PaymentType type) {
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setType(type);
        payment.setMethod(method);
        payment.setAmount(amount);
        payment.setStatus(PaymentStatus.PAGADO);
        payment.setTransactionId(transactionId);
        payment.setCollectedBy(employee);
        return payment;
    }

    protected PaymentStatus calculatePaymentStatus(Long bookingId, BigDecimal totalAmount) {
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        BigDecimal totalPaid = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PAGADO)
                .filter(p -> p.getType() != PaymentType.DEVOLUCION)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalReturned = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PAGADO
                        || p.getStatus() == PaymentStatus.REEMBOLSADO)
                .filter(p -> p.getType() == PaymentType.DEVOLUCION)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal net = totalPaid.subtract(totalReturned);
        if (totalPaid.compareTo(BigDecimal.ZERO) > 0 && net.compareTo(BigDecimal.ZERO) <= 0) {
            return PaymentStatus.REEMBOLSADO;
        }
        if (net.compareTo(totalAmount) >= 0) {
            return PaymentStatus.PAGADO;
        }
        if (net.compareTo(BigDecimal.ZERO) > 0) {
            return PaymentStatus.RESERVADO;
        }
        return PaymentStatus.NO_PAGADO;
    }

    protected BigDecimal calculateDeposit(Space space, BigDecimal totalPrice) {
        return space.getFixedDeposit()
                .min(totalPrice);
    }

    protected void assignBookingNumbers(List<Booking> bookings) {
        bookings.forEach(b ->
                b.setBookingNumber("BK-" + String.format("%08d", b.getId()))
        );
        bookingRepository.saveAll(bookings);
    }

    protected Booking assignBookingNumber(Booking booking) {
        String bookingNumber = "BK-" + String.format("%08d", booking.getId());
        bookingRepository.updateBookingNumber(booking.getId(), bookingNumber);
        booking.setBookingNumber(bookingNumber);
        return booking;
    }

    protected BookingResponseDTO buildBookingResponseDTO(Booking booking) {
        BigDecimal depositAmount = paymentRepository
                .findTotalByBookingIdAndType(
                        booking.getId(),
                        PaymentType.DEPOSITO,
                        PaymentStatus.NO_PAGADO
                );

        BigDecimal totalCobrado = paymentRepository
                .findTotalByBookingIdExcludingType(booking.getId(), PaymentType.DEVOLUCION, PaymentStatus.PAGADO);

        BigDecimal remainingAmount = booking.getTotalAmount().subtract(totalCobrado).max(BigDecimal.ZERO);

        String createdByName = booking.getCreatedBy() != null
                ? booking.getCreatedBy().getName()
                : null;

        String collectedByName = paymentRepository
                .findFirstByBookingIdAndTypeOrderByCreatedAtDesc(booking.getId(), PaymentType.PAGO_TOTAL)
                .map(p -> p.getCollectedBy() != null ? p.getCollectedBy().getName() : null)
                .orElse(null);

        return BookingResponseDTO.fromEntity(booking, depositAmount, remainingAmount, createdByName, collectedByName);
    }

    protected Payment buildTransferPayment(Booking original, Booking newBooking,
                                           BigDecimal amount, User employee) {
        Payment transfer = buildPayment(
                newBooking,
                PaymentMethod.INTERNO,
                amount,
                "TRANSFER-FROM-" + original.getBookingNumber(),
                employee,
                PaymentType.DEPOSITO
        );
        transfer.setStatus(PaymentStatus.PAGADO);
        return transfer;
    }

    @Transactional
    public void confirmMpPayment(String paymentId) {
        com.mercadopago.resources.payment.Payment mpPayment =
                mercadoPagoService.getPayment(paymentId);
        if (!"approved".equals(mpPayment.getStatus())) return;
        Booking booking = bookingRepository
                .findById(Long.parseLong(mpPayment.getExternalReference()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Turno no encontrado"));
        Payment payment = buildPayment(
                booking,
                PaymentMethod.MERCADOPAGO,
                mpPayment.getTransactionAmount(),
                String.valueOf(mpPayment.getId()),
                null,
                PaymentType.DEPOSITO
        );
        payment.setStatus(PaymentStatus.PAGADO);
        paymentRepository.save(payment);
        booking.setPaymentStatus(calculatePaymentStatus(booking.getId(), booking.getTotalAmount()));
        bookingRepository.save(booking);
        scheduleReminder(booking);
    }

    protected void scheduleReminder(Booking booking) {
        boolean alreadyExists = bookingNotificationRepository
                .existsByBookingIdAndType(booking.getId(), NotificationType.RECUERDO_24H);

        if (!alreadyExists) {
            SystemConfig config = getSystemConfig();
            BookingNotification notif = new BookingNotification();
            notif.setBooking(booking);
            notif.setType(NotificationType.RECUERDO_24H);
            notif.setStatus(NotificationStatus.PENDIENTE);
            notif.setHoursBefore(config.getReminderHoursBeforeBooking());
            bookingNotificationRepository.save(notif);
        }
    }
}

