package hoyjugas.Controller;

import hoyjugas.DTO.Product.*;
import hoyjugas.DTO.Stock.MovementRequestDTO;
import hoyjugas.DTO.Stock.StockMovementFilterDTO;
import hoyjugas.DTO.Stock.StockMovementResponseDTO;
import hoyjugas.Service.ProductService;
import hoyjugas.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final UserService userService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDetailDTO> createProduct(@Valid @RequestBody ProductRequestDTO dto) {
        return ResponseEntity.ok(productService.create(dto));
    }

    @PostMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDetailDTO> updateProduct(@Valid @RequestBody ProductUpdateRequestDTO dto) {
        return ResponseEntity.ok(productService.update(dto));
    }

    @PostMapping("/get")//✔
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDetailDTO> getProduct(@Valid @RequestBody ProductIdRequestDTO dto) {
        return ResponseEntity.ok(productService.getById(dto.getId()));
    }

    @PostMapping("/barcode")//en caso de que se quiera buscar aparte, medio redundante teniendo el filtrado completo pero al menos está
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ProductListDTO> getByBarcode(@Valid @RequestBody BarcodeRequestDTO dto) {
        return ResponseEntity.ok(productService.getByBarcode(dto.getBarcode()));
    }

    @PostMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ProductDetailDTO>> listProducts(@Valid @RequestBody ProductFilterDTO dto) {
        return ResponseEntity.ok(productService.getAll(dto));
    }

    @PostMapping("/search")//deja buscar por codigo, nombre, codigo de barras
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<ProductListDTO>> searchProducts(@Valid @RequestBody ProductSearchRequestDTO dto) {
        return ResponseEntity.ok(productService.search(dto.getQuery()));
    }

    @PostMapping("/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?>toggleStatus(@Valid @RequestBody ProductIdRequestDTO dto) {
        productService.toggleStatus(dto.getId());
        return ResponseEntity.ok(Map.of("message","Estado del producto actualizado correctamente"));
    }

    @PostMapping("/get-movements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<StockMovementResponseDTO>> getMovements(@Valid @RequestBody StockMovementFilterDTO dto) {
        return ResponseEntity.ok(productService.getMovements(dto));
    }

    @PostMapping("/register-movement")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<StockMovementResponseDTO> registerMovement(@Valid @RequestBody MovementRequestDTO dto){
        return ResponseEntity.ok(productService.registerMovement(dto,userService.validateEmployeePin(dto.getEmployeePin())));
    }

}
