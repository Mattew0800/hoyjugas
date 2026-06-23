package hoyjugas.Repository;

import hoyjugas.Model.GoodsReceipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, Long> {

    @Query("""
            SELECT g FROM GoodsReceipt g
            WHERE (:supplierId IS NULL OR g.supplier.id = :supplierId)
            AND (:dateFrom IS NULL OR g.date >= :dateFrom)
            AND (:dateTo IS NULL OR g.date <= :dateTo)
            ORDER BY g.date DESC
            """)
    Page<GoodsReceipt> findAllWithFilters(
            @Param("supplierId") Long supplierId,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );
}
