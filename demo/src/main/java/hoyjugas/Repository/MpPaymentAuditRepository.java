package hoyjugas.Repository;

import hoyjugas.Model.MpPaymentAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Repository
public interface MpPaymentAuditRepository extends JpaRepository<MpPaymentAudit, Long> {
    Optional<MpPaymentAudit> findByPreferenceId(String preferenceId);
    Optional<MpPaymentAudit> findByPaymentId(String paymentId);
    Optional<MpPaymentAudit> findByExternalReference(String externalReference);
}