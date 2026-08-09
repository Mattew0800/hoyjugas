package hoyjugas.Service;

import com.mercadopago.resources.payment.Payment;
import hoyjugas.Enum.PaymentMethod;
import hoyjugas.Enum.PaymentStatus;
import hoyjugas.Enum.PaymentType;
import hoyjugas.Model.Booking;
import hoyjugas.Model.MpPaymentAudit;
import hoyjugas.Model.MpPaymentStatusHistory;
import hoyjugas.Repository.*;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.http.HttpStatus;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Backoff;
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
    @Retryable(value = CannotAcquireLockException.class, maxAttempts = 3, backoff = @Backoff(delay = 100))
    public void confirmMpPaymentFromPaymentId(Long paymentId, String rawPayload) {
        Payment mpPayment = mercadoPagoService.getPayment(paymentId.toString());//obtenemos desde la api de mp el objeto que coincide con el id de pago que nos llegó
        if (mpPayment == null) return;
        String externalRef = mpPayment.getExternalReference();//llamamos a la api de mp, esta referencia es el id de la reserva con la que originalmente se creó la preferencia
        if (externalRef == null) return;
        mpPaymentAuditRepository.findByExternalReference(externalRef).ifPresent(audit -> {
            audit.setRawWebhookPayload(rawPayload);//guardamos el json como está, por si hay algun problema con el pago
            mpPaymentAuditRepository.save(audit);
        });
        if (!"approved".equalsIgnoreCase(mpPayment.getStatus())) {
            updateAuditStatus(mpPayment);
            return;
        }
        processApprovedPayment(mpPayment);//primero procesa el pago
        updateAuditOnApproval(mpPayment);//una vez aprobado, empieza a guardar todos los datos consultando por el id del pago
    }

    private String getExternalReference(Payment mpPayment) {
        return mpPayment.getExternalReference();
    }

    private void processApprovedPayment(Payment mpPayment) {
        String externalRef = mpPayment.getExternalReference();
        if (externalRef == null || externalRef.isBlank()||mpPayment.getTransactionAmount()==null) {
            return;
        }
        Long bookingId = Long.parseLong(externalRef);
        Booking booking = bookingRepository.findById(bookingId)//ya que la preferencia se guarda linkeada al id de la reserva, se empieza buscando por ahi
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Turno no encontrado con id: " + bookingId
                ));
        String transactionId = String.valueOf(mpPayment.getId());
        if (paymentRepository.findByTransactionId(transactionId).isPresent()) {//este if evita duplicados por si llega el mismo id dos veces
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
        String externalRef = getExternalReference(mpPayment);
        if (externalRef == null) return;
        mpPaymentAuditRepository.findByExternalReference(externalRef).ifPresent(audit -> {
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
        String externalRef = getExternalReference(mpPayment);
        if (externalRef == null) return;
        mpPaymentAuditRepository.findByExternalReference(externalRef).ifPresent(audit -> {
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
            if (mpPayment.getTransactionDetails() != null&& mpPayment.getTransactionDetails().getNetReceivedAmount() != null) {
                audit.setMpCommission(mpPayment.getTransactionAmount()
                        .subtract(mpPayment.getTransactionDetails().getNetReceivedAmount()));
            }
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
            if (mpPayment.getCard() != null && mpPayment.getCard().getCardholder() != null) {
                audit.setCardholderName(mpPayment.getCard().getCardholder().getName());
            }
            audit.setPaymentMethodId(mpPayment.getPaymentMethodId());
            audit.setPaymentTypeId(mpPayment.getPaymentTypeId());
            audit.setInstallments(mpPayment.getInstallments());
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
        history.setRawPayload(audit.getRawWebhookPayload());
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