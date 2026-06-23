package hoyjugas.Repository;

import hoyjugas.Model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByIsActiveTrue();
    boolean existsBySupplierNumber(String supplierNumber);
    boolean existsByCuit(String cuit);
    boolean existsBySupplierNumberAndIdNot(String supplierNumber, Long id);
    boolean existsByCuitAndIdNot(String cuit, Long id);
}