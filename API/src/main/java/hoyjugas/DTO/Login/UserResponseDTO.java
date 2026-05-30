package hoyjugas.DTO.Login;

import com.fasterxml.jackson.annotation.JsonInclude;
import hoyjugas.Enum.Role;
import hoyjugas.Model.User;
import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phone;
    private String dni;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String token;

    public static UserResponseDTO fromEntity(User user, boolean role) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setDni(user.getDni());
        if(role){
            dto.setRole(user.getRole());
        }
        return dto;
    }

}
