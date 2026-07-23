package hoyjugas.Service;

import com.mercadopago.resources.payment.Payment;
import hoyjugas.Enum.PaymentMethod;
import hoyjugas.Enum.PaymentStatus;
import hoyjugas.Enum.PaymentType;
import hoyjugas.Model.Booking;
import hoyjugas.Model.MpPaymentAudit;
import hoyjugas.Model.MpPaymentStatusHistory;
import hoyjugas.Repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class MpPaymentConfirmationService extends BaseBookingService {

    private final MercadoPagoService mercadoPagoService;
    private final BookingRepository bookingRepository;
    private final MpPaymentAuditRepository mpPaymentAuditRepository;
    private final MpPaymentStatusHistoryRepository mpPaymentStatusHistoryRepository;

    public MpPaymentConfirmationService(
            BookingNotificationRepository bookingNotificationRepository,
            SystemConfigRepository systemConfigRepository,
            UserRepository userRepository,
            SpaceRepository spaceRepository,
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository,
            MercadoPagoService mercadoPagoService,
            MpPaymentAuditRepository mpPaymentAuditRepository,
            MpPaymentStatusHistoryRepository mpPaymentStatusHistoryRepository
    ) {
        super(
                bookingNotificationRepository,
                systemConfigRepository,
                userRepository,
                spaceRepository,
                paymentRepository,
                bookingRepository
        );
        this.mercadoPagoService = mercadoPagoService;
        this.bookingRepository = bookingRepository;
        this.mpPaymentAuditRepository = mpPaymentAuditRepository;
        this.mpPaymentStatusHistoryRepository = mpPaymentStatusHistoryRepository;
    }

    @Transactional
    public void confirmMpPaymentFromPaymentId(Long paymentId) {
        Payment mpPayment = mercadoPagoService.getPayment(paymentId.toString());
        if (mpPayment == null) return;
        if (!"approved".equalsIgnoreCase(mpPayment.getStatus())) {
            updateAuditStatus(mpPayment);
            return;
        }
        processApprovedPayment(mpPayment);
        updateAuditOnApproval(mpPayment);
    }

    private void processApprovedPayment(Payment mpPayment) {
        String externalRef = mpPayment.getExternalReference();
        if (externalRef == null || externalRef.isBlank()||mpPayment.getTransactionAmount()==null) {
            return;
        }
        Long bookingId = Long.parseLong(externalRef);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Turno no encontrado con id: " + bookingId
                ));
        String transactionId = String.valueOf(mpPayment.getId());
        if (paymentRepository.findByTransactionId(transactionId).isPresent()) {
            return;
        }
        BigDecimal transactionAmount = mpPayment.getTransactionAmount();
        PaymentType paymentType = determinePaymentType(booking, transactionAmount);
        hoyjugas.Model.Payment payment = new hoyjugas.Model.Payment();
        payment.setBooking(booking);
        payment.setMethod(PaymentMethod.MERCADOPAGO);
        payment.setType(paymentType);
        payment.setAmount(transactionAmount);
        payment.setStatus(PaymentStatus.PAGADO);
        payment.setTransactionId(transactionId);
        paymentRepository.save(payment);
        PaymentStatus newPaymentStatus = calculatePaymentStatus(booking.getId(), booking.getTotalAmount());
        booking.setPaymentStatus(newPaymentStatus);
        bookingRepository.save(booking);
        scheduleReminder(booking);
    }

    @Transactional
    public void updateAuditStatus(Payment mpPayment) {
        LocalDateTime now = LocalDateTime.now();
        String preferenceId = getPreferenceId(mpPayment);
        if (preferenceId == null) return;
        mpPaymentAuditRepository.findByPreferenceId(preferenceId).ifPresent(audit -> {
            String previousStatus = audit.getPaymentStatus();
            audit.setPaymentId(mpPayment.getId() != null ? String.valueOf(mpPayment.getId()) : null);
            audit.setPaymentStatus(mpPayment.getStatus());
            audit.setPaymentStatusDetail(mpPayment.getStatusDetail());
            audit.setPaymentLastUpdated(now);
            mpPaymentAuditRepository.save(audit);
            MpPaymentStatusHistory history = buildHistory(
                    audit,
                    previousStatus,
                    mpPayment.getStatus(),
                    mpPayment.getStatusDetail(),
                    now
            );
            mpPaymentStatusHistoryRepository.save(history);
        });
    }

    @Transactional
    public void updateAuditOnApproval(Payment mpPayment) {
        LocalDateTime now = LocalDateTime.now();
        String preferenceId = getPreferenceId(mpPayment);
        if (preferenceId == null) return;
        mpPaymentAuditRepository.findByPreferenceId(preferenceId).ifPresent(audit -> {
            String previousStatus = audit.getPaymentStatus();
            audit.setPaymentId(mpPayment.getId() != null ? String.valueOf(mpPayment.getId()) : null);
            audit.setPaymentStatus(mpPayment.getStatus());
            audit.setPaymentStatusDetail(mpPayment.getStatusDetail());
            audit.setPaymentCreatedAt(mpPayment.getDateApproved() != null
                    ? mpPayment.getDateApproved().toLocalDateTime()
                    : null);
            audit.setPaymentLastUpdated(now);
            audit.setPaidAmount(mpPayment.getTransactionAmount());
            audit.setNetAmount(mpPayment.getTransactionDetails() != null
                    ? mpPayment.getTransactionDetails().getNetReceivedAmount()
                    : null);
            audit.setMpCommission(
                    mpPayment.getTransactionAmount() != null
                            && mpPayment.getTransactionDetails() != null
                            && mpPayment.getTransactionDetails().getNetReceivedAmount() != null
                            ? mpPayment.getTransactionAmount().subtract(
                            mpPayment.getTransactionDetails().getNetReceivedAmount())
                            : null
            );
            if (mpPayment.getPayer() != null) {
                String firstName = mpPayment.getPayer().getFirstName() != null
                        ? mpPayment.getPayer().getFirstName()
                        : "";
                String lastName = mpPayment.getPayer().getLastName() != null
                        ? mpPayment.getPayer().getLastName()
                        : "";
                audit.setPayerName((firstName + " " + lastName).trim());
                audit.setPayerEmail(mpPayment.getPayer().getEmail());
            }
            if (mpPayment.getCard() != null) {
                audit.setCardLastFourDigits(mpPayment.getCard().getLastFourDigits());
            }
            audit.setPaymentMethodId(mpPayment.getPaymentMethodId());
            mpPaymentAuditRepository.save(audit);
            MpPaymentStatusHistory history = buildHistory(
                    audit,
                    previousStatus,
                    mpPayment.getStatus(),
                    mpPayment.getStatusDetail(),
                    now
            );
            mpPaymentStatusHistoryRepository.save(history);
        });
    }

    private MpPaymentStatusHistory buildHistory(MpPaymentAudit audit,String previousStatus, String newStatus,String statusDetail,LocalDateTime changedAt) {
        MpPaymentStatusHistory history = new MpPaymentStatusHistory();
        history.setAudit(audit);
        history.setPaymentId(audit.getPaymentId());
        history.setPreviousStatus(previousStatus);
        history.setNewStatus(newStatus);
        history.setStatusDetail(statusDetail);
        history.setChangedAt(changedAt);
        return history;
    }

    private String getPreferenceId(Payment mpPayment) {
        return mpPayment.getOrder() != null && mpPayment.getOrder().getId() != null
                ? mpPayment.getOrder().getId().toString()
                : null;
    }

    private PaymentType determinePaymentType(Booking booking, BigDecimal paidAmount) {
        return paidAmount.compareTo(booking.getTotalAmount()) >= 0
                ? PaymentType.PAGO_TOTAL
                : PaymentType.SEÑA;
    }
}