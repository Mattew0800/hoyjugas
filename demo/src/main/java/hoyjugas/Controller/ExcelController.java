package hoyjugas.Controller;

import hoyjugas.Service.CashMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final CashMovementService cashMovementService;

//    @RequestMapping("/list")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<List<String>> getAllExcel() {
//
//    }
}
