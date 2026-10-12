package hoyjugas.Repository;

import hoyjugas.Model.MpPaymentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MpPaymentStatusHistoryRepository extends JpaRepository<MpPaymentStatusHistory, Integer> {
}
