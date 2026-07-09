package hoyjugas.DTO.SpaceSchedule;

import hoyjugas.Model.SpaceSchedule;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SpaceScheduleResponseDTO {

    private Long id;
    private Long spaceId;
    private String spaceName;
    private String dayType;
    private LocalTime openingTime;
    private LocalTime closingTime;

    public static SpaceScheduleResponseDTO fromEntity(SpaceSchedule schedule) {
        SpaceScheduleResponseDTO dto = new SpaceScheduleResponseDTO();
        dto.setId(schedule.getId());
        dto.setSpaceId(schedule.getSpace().getId());
        dto.setSpaceName(schedule.getSpace().getName());
        dto.setDayType(schedule.getDayType().name());
        dto.setOpeningTime(schedule.getOpeningTime());
        dto.setClosingTime(schedule.getClosingTime());
        return dto;
    }
}
