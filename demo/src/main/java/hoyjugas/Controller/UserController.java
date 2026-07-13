package hoyjugas.Controller;

import hoyjugas.Config.UserDetailsImpl;
import hoyjugas.DTO.Login.UserResponseDTO;
import hoyjugas.DTO.Login.UserUpdateDTO;
import hoyjugas.Service.AuthService;
import hoyjugas.Service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final AuthService authService;


    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserResponseDTO> getSelf(@AuthenticationPrincipal UserDetailsImpl me){
        return userService.findById(me.getId()).map(user->UserResponseDTO.fromEntity(user,true))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/me/update")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserResponseDTO> updateSelf(@AuthenticationPrincipal UserDetailsImpl me,@Valid @RequestBody UserUpdateDTO dto, HttpServletResponse response){
        UserResponseDTO result = userService.updateSelf(me.getId(), dto);
        if (result.getToken() != null) {
            authService.setAuthCookie(response, result.getToken());
            result.setToken(null);
        }
        return ResponseEntity.ok(result);
    }
}

