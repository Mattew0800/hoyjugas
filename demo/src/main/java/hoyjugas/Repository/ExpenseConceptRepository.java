package hoyjugas.Repository;

import hoyjugas.Model.ExpenseConcept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseConceptRepository extends JpaRepository<ExpenseConcept, Long> {
    Optional<ExpenseConcept> findByNameIgnoreCase(String name);
    List<ExpenseConcept> findByIsActiveTrue();
    boolean existsByNameIgnoreCase(String name);
}