package hoyjugas.DTO.User;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class UpdatePinRequestDTO extends ClientIdRequestDTO {
    @NotBlank(message = "El nuevo pin es obligatorio")
    private String pin;
}
