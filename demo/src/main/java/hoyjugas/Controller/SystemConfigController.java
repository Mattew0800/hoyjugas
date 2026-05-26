package hoyjugas.Controller;

import hoyjugas.DTO.System.SystemConfigCreateDTO;
import hoyjugas.DTO.System.SystemConfigUpdateDTO;
import hoyjugas.Model.SystemConfig;
import hoyjugas.Service.SystemConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("admin/config")
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfig> addSystemConfig(
            @Valid @RequestBody SystemConfigCreateDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(systemConfigService.createConfig(dto));
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfig> updateSystemConfig(
            @Valid @RequestBody SystemConfigUpdateDTO dto
    ) {
        return ResponseEntity.ok(
                systemConfigService.updateConfig(dto)
        );
    }
}