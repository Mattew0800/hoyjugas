package hoyjugas.Repository;

import hoyjugas.Enum.Role;
import hoyjugas.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
    Optional<User> findByPin(String pin);
    List<User> findByRole(Role role);
    boolean existsByPhone(String phone);
    boolean existsByDni(String dni);
    boolean existsByEmail(String dni);
}
