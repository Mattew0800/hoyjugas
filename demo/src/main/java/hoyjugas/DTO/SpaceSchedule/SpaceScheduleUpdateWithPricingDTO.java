package hoyjugas.DTO.SpaceSchedule;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SpaceScheduleUpdateWithPricingDTO extends SpaceScheduleWithPricingDTO {
    @NotNull
    private Long scheduleId;
}