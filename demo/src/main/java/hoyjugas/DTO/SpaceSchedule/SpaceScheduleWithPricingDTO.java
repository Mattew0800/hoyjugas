package hoyjugas.DTO.SpaceSchedule;

import hoyjugas.DTO.SpacePricing.SpacePricingRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SpaceScheduleWithPricingDTO {
    @NotNull
    private Long spaceId;

    @NotNull
    @Valid
    private SpaceScheduleRequestDTO schedule;

    @NotEmpty(message = "Debe enviar al menos una franja de precio")
    @Valid
    private List<SpacePricingRequestDTO> pricings;
}
