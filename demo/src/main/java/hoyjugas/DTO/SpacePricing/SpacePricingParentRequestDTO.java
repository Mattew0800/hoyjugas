package hoyjugas.DTO.SpacePricing;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SpacePricingParentRequestDTO {
    @NotNull(message = "El ID del espacio es obligatorio")
    private Long spaceId;

    @NotNull(message = "La franja horaria es obligatoria")
    @Valid
    private SpacePricingRequestDTO pricing;
}
