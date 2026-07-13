package hoyjugas.DTO.Login;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequestDTO {
    @NotBlank
    private String token;

    @Size(min = 6)
    private String newPassword;
}