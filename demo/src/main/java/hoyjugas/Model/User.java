package hoyjugas.Model;

import hoyjugas.DTO.User.RegisterRequestDTO;
import hoyjugas.Enum.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import lombok.Setter;
import org.checkerframework.checker.units.qual.C;
import org.checkerframework.common.aliasing.qual.Unique;
import org.springframework.security.crypto.password.PasswordEncoder;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name="user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column (nullable = false)
    private String password;

    @Email(message = "El mail tiene que tener un formato correcto")
    @Column(nullable = false,unique = true)
    private String email;

    @Size(min = 7,max = 9)
    @Column(unique = true,nullable = false)
    private String dni;

    @Size(min = 10,max = 10)
    @Column(unique = true,nullable = false)
    private String phone;

    @Column(length = 60)
    private String pin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false,length = 10)
    private Role role;

    public static User fromRegisterDTO(RegisterRequestDTO dto, PasswordEncoder encoder) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        user.setDni(dto.getDni());
        user.setPhone(dto.getPhone());
        return user;
    }

    private boolean enabled;
}
