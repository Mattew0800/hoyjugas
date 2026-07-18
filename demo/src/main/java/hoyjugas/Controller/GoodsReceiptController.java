package hoyjugas.Controller;

import hoyjugas.DTO.GoodsReceipt.GoodsReceiptFilterDTO;
import hoyjugas.DTO.GoodsReceipt.GoodsReceiptIdRequestDTO;
import hoyjugas.DTO.GoodsReceipt.GoodsReceiptRequestDTO;
import hoyjugas.DTO.GoodsReceipt.GoodsReceiptResponseDTO;
import hoyjugas.Model.User;
import hoyjugas.Service.GoodsReceiptService;
import hoyjugas.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/goods-receipt")
@RequiredArgsConstructor
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;
    private final UserService userService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<GoodsReceiptResponseDTO> create(@Valid @RequestBody GoodsReceiptRequestDTO dto) {
        User employee = userService.validateEmployeePin(dto.getEmployeePin());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goodsReceiptService.create(dto, employee));
    }

    @PostMapping("/get")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<GoodsReceiptResponseDTO> getById(@Valid @RequestBody GoodsReceiptIdRequestDTO dto) {
        return ResponseEntity.ok(goodsReceiptService.getById(dto.getId()));
    }

    @PostMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<GoodsReceiptResponseDTO>> getAll(@Valid @RequestBody GoodsReceiptFilterDTO dto) {
        return ResponseEntity.ok(goodsReceiptService.getAll(dto));
    }
}