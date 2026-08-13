package hoyjugas.Controller;

import hoyjugas.Config.UserDetailsImpl;
import hoyjugas.DTO.Login.ResetPasswordRequestDTO;
import hoyjugas.DTO.User.*;
import hoyjugas.Service.AuthService;
import hoyjugas.Service.PasswordResetService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request,HttpServletResponse response) {
        LoginResponseDTO result = authService.registerUser(request);
        authService.setAuthCookie(response, result.getToken());
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
    public ResponseEntity<EmployeeCreatedDTO> registerAdmin(@Valid @RequestBody RegisterRequestDTO request) {
        EmployeeCreatedDTO result = authService.registerAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PutMapping("/update-pin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeCreatedDTO>updatePin(@Valid @RequestBody UpdatePinRequestDTO dto, @AuthenticationPrincipal UserDetailsImpl me){
        return ResponseEntity.ok(authService.updatePin(dto.getId(), dto.getPin(),me.getId()));
    }

    @PutMapping("/dismiss-employee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?>dismiss(@Valid @RequestBody ClientIdRequestDTO dto, @AuthenticationPrincipal UserDetailsImpl me){
        authService.dismissEmployee(dto.getId(),me.getId());
        return ResponseEntity.ok(Map.of("message", "Empleado dado de baja correctamente"));
    }

    @GetMapping("/view-current-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmployeeCardDTO>> viewActiveStaff(){
        return ResponseEntity.ok(authService.viewActiveStaff());
    }

    @GetMapping("/view-history-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmployeeCardDTO>> viewHistoryStaff(){
        return ResponseEntity.ok(authService.viewStaff());
    }

    @PutMapping("/deactivate-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?>deactivateUser(@Valid @RequestBody ClientIdRequestDTO dto,@AuthenticationPrincipal UserDetailsImpl me){
        authService.deactivateUser(dto.getId(),me.getId());
        return ResponseEntity.ok(Map.of("message", "Usuario dado de baja correctamente"));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request,HttpServletResponse response) {
        LoginResponseDTO result = authService.login(request);
        authService.setAuthCookie(response, result.getToken());
        result.setToken(null);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("authToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message","Sesión cerrada"));
    }
}