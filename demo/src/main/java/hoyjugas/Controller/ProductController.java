package hoyjugas.Controller;

import hoyjugas.DTO.Product.*;
import hoyjugas.Service.ProductService;
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

@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

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

    @PostMapping("/get")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDetailDTO> getProduct(
            @Valid @RequestBody ProductIdRequestDTO dto) {
        return ResponseEntity.ok(productService.getById(dto.getId()));
    }

    @PostMapping("/barcode")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ProductListDTO> getByBarcode(@Valid @RequestBody BarcodeRequestDTO dto) {
        return ResponseEntity.ok(productService.getByBarcode(dto.getBarcode()));
    }

    @PostMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ProductDetailDTO>> listProducts(
            @Valid @RequestBody ProductFilterDTO dto) {
        return ResponseEntity.ok(productService.getAll(dto));
    }

    @PostMapping("/search")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<ProductListDTO>> searchProducts(
            @Valid @RequestBody ProductSearchRequestDTO dto) {
        return ResponseEntity.ok(productService.search(dto.getQuery()));
    }
}
