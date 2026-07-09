package hoyjugas.Repository;

import hoyjugas.Model.PasswordResetToken;
import hoyjugas.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser(User user);
    @Query("""
    SELECT t FROM PasswordResetToken t 
    WHERE t.user = :user 
    AND t.used = false 
    AND t.expiryDate > :now
""")
    @Modifying
    @Transactional
    void deleteByExpiryDateBefore(LocalDateTime now);
}