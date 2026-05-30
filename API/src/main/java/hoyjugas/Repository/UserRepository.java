package hoyjugas.Repository;

import hoyjugas.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
}
