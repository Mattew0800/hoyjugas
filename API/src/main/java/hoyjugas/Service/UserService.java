package hoyjugas.Service;

import hoyjugas.DTO.Login.UserResponseDTO;
import hoyjugas.DTO.Login.UserUpdateDTO;
import hoyjugas.Enum.Role;
import hoyjugas.Model.User;
import hoyjugas.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
@Service
public class UserService {

    private UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthService authService;

    public UserService(BCryptPasswordEncoder passwordEncoder, AuthService authService, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
        this.userRepository = userRepository;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public UserResponseDTO updateSelf(Long userId, UserUpdateDTO dto) {
        User me = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        validateRoleChange(me, dto);
        String oldEmail = me.getEmail();
        User updated = updateUser(me.getId(), dto, false);
        UserResponseDTO response = UserResponseDTO.fromEntity(updated,false );
        if (!updated.getEmail().equals(oldEmail)) {
            String newToken = authService.generateToken(updated);
            response.setToken(newToken);
        }
        return response;
    }

    @Transactional
    public User updateUser(Long id, UserUpdateDTO dto, boolean allowRoleChange) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (dto.getEmail() != null &&
                userRepository.existsByEmailIgnoreCaseAndIdNot(dto.getEmail().trim().toLowerCase(), id)) {
            throw new IllegalArgumentException("El email ya está en uso");
        }
        validateAndProcessPasswordChange(existing, dto);
        dto.applyToEntity(existing, allowRoleChange);
        return userRepository.save(existing);
    }

    private void validateAndProcessPasswordChange(User user, UserUpdateDTO dto) {
        boolean wantsPasswordChange = notBlank(dto.getOldPassword()) ||
                notBlank(dto.getNewPassword()) ||
                notBlank(dto.getNewNewPassword());
        if (!wantsPasswordChange) {
            return;
        }
        if (!notBlank(dto.getOldPassword()) ||
                !notBlank(dto.getNewPassword()) ||
                !notBlank(dto.getNewNewPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Para cambiar la contraseña debés completar todos los campos");
        }

        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual es incorrecta.");
        }

        if (!dto.getNewPassword().equals(dto.getNewNewPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las contraseñas nuevas no coinciden.");
        }

        if (passwordEncoder.matches(dto.getNewPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva contraseña no puede ser igual a la actual.");
        }
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
    }

    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }

    private void validateRoleChange(User user, UserUpdateDTO dto) {
        if (dto.getRole() != null && dto.getRole() != user.getRole() && user.getRole() == Role.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tenés permisos para cambiar el rol de usuario.");
        }
    }
}


