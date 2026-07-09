package hoyjugas.DTO.Space;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SpaceDetailRequestDTO {
    @NotNull(message = "El ID del espacio es obligatorio")
    private Long spaceId;
}
