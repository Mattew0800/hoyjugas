package hoyjugas.Repository;

import hoyjugas.Enum.NotificationStatus;
import hoyjugas.Enum.NotificationType;
import hoyjugas.Model.BookingNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingNotificationRepository extends JpaRepository<BookingNotification, Integer> {
    List<BookingNotification> findByStatusAndTypeIn(NotificationStatus status, List<NotificationType> types);
    boolean existsByBookingIdAndType(Long bookingId,NotificationType type);

}
