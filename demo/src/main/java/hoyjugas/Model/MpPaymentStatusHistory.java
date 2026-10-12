package hoyjugas.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "mp_payment_status_history")
@Getter
@Setter
@NoArgsConstructor
public class MpPaymentStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mp_payment_audit_id", nullable = false)
    private MpPaymentAudit audit;

    @Column(length = 100)
    private String paymentId;

    @Column(length = 50)
    private String previousStatus;

    @Column(length = 50, nullable = false)
    private String newStatus;

    @Column(columnDefinition = "TEXT")
    private String statusDetail;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    @Column(columnDefinition = "TEXT")
    private String rawPayload;

    @PrePersist
    public void prePersist() {
        if (this.changedAt == null) {
            this.changedAt = LocalDateTime.now();
        }
    }
}