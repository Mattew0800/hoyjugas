package hoyjugas.Repository;

import hoyjugas.Model.PasswordResetToken;
import hoyjugas.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser(User user);

    @Modifying
    @Transactional
    void deleteByExpiryDateBefore(LocalDateTime now);
}