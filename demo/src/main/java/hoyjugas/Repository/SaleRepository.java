package hoyjugas.Repository;

import hoyjugas.Enum.SaleStatus;
import hoyjugas.Model.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import hoyjugas.Enum.PaymentMethod;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    @Query("""
            SELECT s FROM Sale s
            WHERE (:clientId IS NULL OR s.client.id = :clientId)
            AND (:employeeId IS NULL OR s.registeredBy.id = :employeeId)
            AND (:paymentMethod IS NULL OR s.paymentMethod = :paymentMethod)
            AND (:dateFrom IS NULL OR s.date >= :dateFrom)
            AND (:dateTo IS NULL OR s.date <= :dateTo)
            AND (:status IS NULL OR s.status = :status)
            ORDER BY s.date DESC
            """)
    Page<Sale> findAllWithFilters(
            @Param("clientId") Long clientId,
            @Param("employeeId") Long employeeId,
            @Param("paymentMethod") PaymentMethod paymentMethod,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            @Param("status")SaleStatus status,
            Pageable pageable
    );

    @Query("""
        SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s
        WHERE (:clientId IS NULL OR s.client.id = :clientId)
        AND (:employeeId IS NULL OR s.registeredBy.id = :employeeId)
        AND (:paymentMethod IS NULL OR s.paymentMethod = :paymentMethod)
        AND (:dateFrom IS NULL OR s.date >= :dateFrom)
        AND (:dateTo IS NULL OR s.date <= :dateTo)
        AND (:status IS NULL OR s.status = :status)
        """)
    BigDecimal getTotalWithFilters(
            @Param("clientId") Long clientId,
            @Param("employeeId") Long employeeId,
            @Param("paymentMethod") PaymentMethod paymentMethod,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            @Param("status")SaleStatus status
    );
}