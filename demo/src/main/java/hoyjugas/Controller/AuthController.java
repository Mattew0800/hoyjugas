package hoyjugas.Controller;

import hoyjugas.DTO.Login.ResetPasswordRequestDTO;
import hoyjugas.DTO.User.*;
import hoyjugas.Service.AuthService;
import hoyjugas.Service.PasswordResetService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(
            @Valid @RequestBody RegisterRequestDTO request,
            HttpServletResponse response) {
        LoginResponseDTO result = authService.registerUser(request);
        setAuthCookie(response, result.getToken());
        result.setToken(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/register-employee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeCreatedDTO> registerEmployee(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerEmployee(request));
    }

    @PostMapping("/promote-to-employee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> promoteToEmployee(@Valid @RequestBody EmailRequestDTO dto) {
        authService.promoteToEmployee(dto.getEmail());
        return ResponseEntity.ok(Map.of("message", "Empleado promocionado correctamente!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid EmailRequestDTO request) {
        passwordResetService.sendResetLink(request.getEmail());
        return ResponseEntity.ok("Si el email existe, se envió un link de recuperación.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Contraseña actualizada correctamente");
    }

    @PostMapping("/register-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoginResponseDTO> registerAdmin(
            @Valid @RequestBody RegisterRequestDTO request,
            HttpServletResponse response) {
        LoginResponseDTO result = authService.registerAdmin(request);
        setAuthCookie(response, result.getToken());
        result.setToken(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request,
            HttpServletResponse response) {
        LoginResponseDTO result = authService.login(request);
        setAuthCookie(response, result.getToken());
        result.setToken(null);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("authToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message","Sesión cerrada"));
    }

    private void setAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("authToken", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);//cambiar en prod
        cookie.setPath("/");
        cookie.setMaxAge(86400);
        response.addCookie(cookie);
    }

}