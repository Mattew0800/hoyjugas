package hoyjugas.DTO.SpacePricing;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SpacePricingDeleteRequestDTO {
    @NotNull(message = "El ID del espacio es obligatorio")
    private Long spaceId;

    @NotNull(message = "El ID de la franja es obligatorio")
    private Long pricingId;
}