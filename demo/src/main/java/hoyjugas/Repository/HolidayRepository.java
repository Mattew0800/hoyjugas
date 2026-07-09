package hoyjugas.Repository;

import hoyjugas.Model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;

public interface HolidayRepository extends JpaRepository<Holiday, Integer> {
    boolean existsByDate(LocalDate date);
}
