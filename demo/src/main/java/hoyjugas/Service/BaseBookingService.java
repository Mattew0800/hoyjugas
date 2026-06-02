package hoyjugas.Service;

import hoyjugas.DTO.Booking.BookingResponseDTO;
import hoyjugas.Enum.*;
import hoyjugas.Model.*;
import hoyjugas.Repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
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
                .filter(p -> p.getType() == PaymentType.DEVOLUCION)
                .filter(p -> p.getStatus() == PaymentStatus.PAGADO || p.getStatus() == PaymentStatus.REEMBOLSADO)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal netPaid = totalPaid.subtract(totalReturned);
        if (netPaid.compareTo(BigDecimal.ZERO) <= 0) {
            return PaymentStatus.NO_PAGADO;
        }
        if (netPaid.compareTo(totalAmount) >= 0) {
            return PaymentStatus.PAGADO;
        }
        return PaymentStatus.RESERVADO;
    }

    protected BigDecimal calculateDeposit(Space space, BigDecimal totalPrice) {
        return space.getDepositValue()
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
                        PaymentType.INTERNO,
                        PaymentStatus.NO_PAGADO
                );
        BigDecimal totalCollected = paymentRepository
                .findTotalByBookingIdExcludingType(booking.getId(), PaymentType.DEVOLUCION, PaymentStatus.PAGADO);
        BigDecimal remainingAmount = booking.getTotalAmount().subtract(totalCollected).max(BigDecimal.ZERO);
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
                PaymentType.INTERNO
        );
        transfer.setStatus(PaymentStatus.PAGADO);
        return transfer;
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

    @Transactional(rollbackFor = Exception.class)
    public void confirmMpPaymentFromPaymentId(Long paymentId) {
        if (paymentId == null) {
            return;
        }
        com.mercadopago.resources.payment.Payment mpPayment = mercadoPagoService.getPayment(paymentId.toString());
        if (mpPayment == null) {
            return;
        }
        if (!"approved".equalsIgnoreCase(mpPayment.getStatus())) {
            return;
        }
        processApprovedPayment(mpPayment);
    }

    private void processApprovedPayment(com.mercadopago.resources.payment.Payment mpPayment) {
        String externalRef = mpPayment.getExternalReference();
        if (externalRef == null || externalRef.isBlank()) {
            return;
        }
        Long bookingId = Long.parseLong(externalRef);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Turno no encontrado con id: " + bookingId));
        String transactionId = String.valueOf(mpPayment.getId());
        if (paymentRepository.findByTransactionId(transactionId).isPresent()) {
            return;
        }
        BigDecimal transactionAmount = mpPayment.getTransactionAmount();
        PaymentType paymentType = determinePaymentType(booking, transactionAmount);
        Payment payment = buildPayment(
                booking,
                PaymentMethod.MERCADOPAGO,
                transactionAmount,
                transactionId,
                null,
                paymentType
        );
        payment.setStatus(PaymentStatus.PAGADO);
        paymentRepository.save(payment);
        PaymentStatus newPaymentStatus = calculatePaymentStatus(booking.getId(), booking.getTotalAmount());
        booking.setPaymentStatus(newPaymentStatus);
        bookingRepository.save(booking);
        scheduleReminder(booking);
    }

    private PaymentType determinePaymentType(Booking booking, BigDecimal paidAmount) {
        return paidAmount.compareTo(booking.getTotalAmount()) >= 0
                ? PaymentType.PAGO_TOTAL
                : PaymentType.SEÑA;
    }
}
