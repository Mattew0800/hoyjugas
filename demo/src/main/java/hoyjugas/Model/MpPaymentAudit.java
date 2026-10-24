package hoyjugas.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "mp_payment_audit")
@Getter
@Setter
@NoArgsConstructor
public class MpPaymentAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(length = 100, nullable = false)
    private String preferenceId;

    @Column(length = 10000)
    private String externalReference;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preferenceAmount;

    @Column(nullable = false)
    private LocalDateTime preferenceCreatedAt;

    @Column(length = 100)
    private String paymentId;

    @Column(length = 50)
    private String paymentStatus;

    @Column(columnDefinition = "TEXT")
    private String paymentStatusDetail;

    private LocalDateTime paymentCreatedAt;

    private LocalDateTime paymentLastUpdated;

    @Column(precision = 10, scale = 2)
    private BigDecimal paidAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal netAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal mpCommission;

    @Column(length = 100)
    private String payerName;

    @Column(length = 100)
    private String payerEmail;

    @Column(length = 50)
    private String paymentMethodId;//TIPO DE PAGO (dinero en cuenta, en tarjetas pone la empresa primero como visa mastercard etc)

    @Column
    private Integer installments;//cantidad de cuotas

    @Column(length = 50)
    private String paymentTypeId;//aca si sale si es tipo credito o debito, para dinero en cuenta es el mismo nombre que en paymentmethodId

    @Column(length = 10)
    private String cardLastFourDigits;//ultimos 4

    @Column(length = 100)
    private String cardholderName;//por las dudas

    @Column(columnDefinition = "TEXT")
    private String rawWebhookPayload;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.preferenceCreatedAt == null) {
            this.preferenceCreatedAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}