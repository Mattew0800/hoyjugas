package hoyjugas.Controller;

import hoyjugas.DTO.CashMovement.CashMovementFilterDTO;
import hoyjugas.DTO.Inventory.InventoryItemIdRequestDTO;
import hoyjugas.DTO.Inventory.InventoryMovementFilterDTO;
import hoyjugas.DTO.Stock.StockMovementFilterDTO;
import hoyjugas.Service.CashMovementService;
import hoyjugas.Service.InventoryService;
import hoyjugas.Service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final CashMovementService cashMovementService;
    private final InventoryService inventoryService;
    private final ProductService productService;

    @PostMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> getAllExcel(@Valid @RequestBody CashMovementFilterDTO dto) {
        System.out.println(dto.getDateTo());
        System.out.println(dto.getDateFrom());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=resumen-caja.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(cashMovementService.exportExcel(dto));
    }

    @PostMapping("/inventory-movements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportInventoryMovements(@Valid @RequestBody InventoryMovementFilterDTO dto) {
        return excelResponse(inventoryService.exportMovementsExcel(dto.getItemId()), "movimientos-inventario");
    }

    @PostMapping("/stock-movements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportStockMovements(@Valid @RequestBody StockMovementFilterDTO dto) {
        return excelResponse(productService.exportStockMovementsExcel(dto), "movimientos-stock");
    }

    private ResponseEntity<byte[]> excelResponse(byte[] data, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + filename + ".xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }


}
