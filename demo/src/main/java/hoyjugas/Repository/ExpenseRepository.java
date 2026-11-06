package hoyjugas.Repository;

import hoyjugas.Model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("""
            SELECT e FROM Expense e
            WHERE (:conceptId IS NULL OR e.concept.id = :conceptId)
            AND (:supplierId IS NULL OR e.supplier.id = :supplierId)
            AND (:dateFrom IS NULL OR e.date >= :dateFrom)
            AND (:dateTo IS NULL OR e.date <= :dateTo)
            ORDER BY e.date DESC
            """)
    Page<Expense> findAllWithFilters(
            @Param("conceptId") Long conceptId,
            @Param("supplierId") Long supplierId,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );
}