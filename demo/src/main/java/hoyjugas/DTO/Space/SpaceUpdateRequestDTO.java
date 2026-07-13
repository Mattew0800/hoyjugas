package hoyjugas.DTO.Space;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SpaceUpdateRequestDTO extends SpaceRequestDTO {
    @NotNull(message = "El ID del espacio es obligatorio")
    private Long spaceId;
}