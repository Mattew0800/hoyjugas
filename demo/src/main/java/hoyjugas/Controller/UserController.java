package hoyjugas.Controller;

import hoyjugas.Config.UserDetailsImpl;
import hoyjugas.DTO.Login.UserResponseDTO;
import hoyjugas.DTO.Login.UserUpdateDTO;
import hoyjugas.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserResponseDTO> getSelf(@AuthenticationPrincipal UserDetailsImpl me){
        return userService.findById(me.getId()).map(user->UserResponseDTO.fromEntity(user,true))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }


    @PutMapping("/me/update")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserResponseDTO> updateSelf(@AuthenticationPrincipal UserDetailsImpl principal, @Valid @RequestBody UserUpdateDTO dto) {
        return ResponseEntity.ok(userService.updateSelf(principal.getId(), dto));
    }
}

