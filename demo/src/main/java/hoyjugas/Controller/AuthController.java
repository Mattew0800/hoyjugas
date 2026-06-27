package hoyjugas.Controller;

import hoyjugas.DTO.Login.ResetPasswordRequestDTO;
import hoyjugas.DTO.User.*;
import hoyjugas.Service.AuthService;
import hoyjugas.Service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080"})
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registerUser(request));
    }

    @PostMapping("/register-employee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeCreatedDTO> registerEmployee(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerEmployee(request));
    }

    @PostMapping("/promote-to-employee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> promoteToEmployee(@Valid @RequestBody EmailRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.promoteToEmployee(dto.getEmail()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid EmailRequestDTO request){
        passwordResetService.sendResetLink(request.getEmail());
        return ResponseEntity.ok(Map.of("message","Si el email existe en nuestra base de datos, se envió un link de recuperación."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message","Contraseña actualizada correctamente"));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<LoginResponseDTO> registerAdmin(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registerAdmin(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }
}