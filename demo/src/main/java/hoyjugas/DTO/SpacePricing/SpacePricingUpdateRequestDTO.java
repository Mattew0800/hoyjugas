package hoyjugas.DTO.SpacePricing;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SpacePricingUpdateRequestDTO {
    @NotNull(message = "El ID del espacio es obligatorio")
    private Long spaceId;

    @NotNull(message = "El ID de la franja es obligatorio")
    private Long pricingId;

    @NotNull(message = "La franja horaria es obligatoria")
    @Valid
    private SpacePricingRequestDTO pricing;
}
