package hoyjugas.DTO.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUpdateUserRequestDTO {
    @NotNull
    private Long id;

    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,}(?:\\s[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,})+$",
            message = "Nombre y apellido inválidos")
    @Size(min = 2, max = 50)
    private String name;

    @Email
    @Size(max = 100)
    private String email;

    @Pattern(regexp = "^\\d{7,10}$")
    private String dni;

    @Pattern(regexp = "^[0-9]{10}$")
    private String phone;
}