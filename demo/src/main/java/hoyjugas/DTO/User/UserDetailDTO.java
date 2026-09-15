package hoyjugas.DTO.User;

import hoyjugas.DTO.Login.UserResponseDTO;
import hoyjugas.Model.User;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class UserDetailDTO extends UserResponseDTO {
    private List<String> observations;

    public static UserDetailDTO fromEntity(User user, List<String> observations) {
        UserDetailDTO dto = new UserDetailDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setDni(user.getDni());
        dto.setRole(user.getRole());
        dto.setObservations(observations);
        return dto;
    }
}