package hoyjugas.Repository;

import hoyjugas.Enum.CashMovementType;
import hoyjugas.Enum.PaymentMethod;
import hoyjugas.Model.CashMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface CashMovementRepository extends JpaRepository<CashMovement, Long> {

    @Query("""
            SELECT c FROM CashMovement c
            WHERE (:dateFrom IS NULL OR c.date >= :dateFrom)
            AND (:dateTo IS NULL OR c.date <= :dateTo)
            AND (:paymentMethod IS NULL OR c.paymentMethod = :paymentMethod)
            AND (:type IS NULL OR c.type = :type)
            AND (:employeeId IS NULL OR c.registeredBy.id = :employeeId)
            ORDER BY c.date ASC
            """)
    Page<CashMovement> findAllWithFilters(
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            @Param("paymentMethod") PaymentMethod paymentMethod,
            @Param("type") CashMovementType type,
            @Param("employeeId") Long employeeId,
            Pageable pageable
    );
}