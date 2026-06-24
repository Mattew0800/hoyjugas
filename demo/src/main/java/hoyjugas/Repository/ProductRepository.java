package hoyjugas.Repository;

import hoyjugas.Model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByBarcodeAndIsActiveTrue(String barcode);
    Optional<Product> findByInternalCodeAndIsActiveTrue(String code);
    boolean existsByInternalCode(String code);
    boolean existsByBarcode(String barcode);
    boolean existsByInternalCodeAndIdNot(String code, Long id);
    boolean existsByBarcodeAndIdNot(String barcode, Long id);

    @Query("""
            SELECT p FROM Product p
            WHERE (:categoryId IS NULL OR p.category.id = :categoryId)
            AND (:supplierId IS NULL OR p.supplier.id = :supplierId)
            AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(p.internalCode) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:isActive IS NULL OR p.isActive = :isActive)
            AND (:lowStock IS NULL OR (:lowStock = true AND p.stock <= p.minimumStock))
            ORDER BY p.name ASC
            """)
    Page<Product> findAllWithFilters(
            @Param("categoryId") Long categoryId,
            @Param("supplierId") Long supplierId,
            @Param("search") String search,
            @Param("lowStock") Boolean lowStock,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.stock <= p.minimumStock AND p.isActive = true")
    List<Product> findLowStock();

    @Query("""
        SELECT p FROM Product p
        WHERE p.isActive = true
        AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))
        OR LOWER(p.internalCode) LIKE LOWER(CONCAT('%', :query, '%'))
        OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :query, '%')))
        ORDER BY p.name ASC
        """)
    List<Product> findByNameOrCodeActive(@Param("query") String query);
}