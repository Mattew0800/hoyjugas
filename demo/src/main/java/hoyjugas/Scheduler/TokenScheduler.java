package hoyjugas.Scheduler;

import hoyjugas.Repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class TokenScheduler {
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void cleanTokens() {
        passwordResetTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now().minusMinutes(5));
    }
}
