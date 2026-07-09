package hoyjugas.DTO.Booking;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SpaceAvailabilityDTO {
    private Long spaceId;
    private String spaceName;
    private String spaceType;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private BigDecimal price;
    private Boolean available;
}
