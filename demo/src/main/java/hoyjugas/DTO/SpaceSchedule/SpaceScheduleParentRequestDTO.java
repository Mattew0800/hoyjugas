package hoyjugas.DTO.SpaceSchedule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpaceScheduleParentRequestDTO {
    @NotNull
    private Long spaceId;

    @Valid
    @NotNull
    private SpaceScheduleRequestDTO schedule;
}