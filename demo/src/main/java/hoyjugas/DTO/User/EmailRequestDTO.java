package hoyjugas.DTO.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmailRequestDTO {
    @NotBlank(message = "El email no puede estar vacío")
    @Email(message = "El mail debe tener un formato válido")
    private String email;
}