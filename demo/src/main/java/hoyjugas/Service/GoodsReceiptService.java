package hoyjugas.Service;

import hoyjugas.DTO.GoodsReceipt.GoodsReceiptFilterDTO;
import hoyjugas.DTO.GoodsReceipt.GoodsReceiptItemRequestDTO;
import hoyjugas.DTO.GoodsReceipt.GoodsReceiptRequestDTO;
import hoyjugas.DTO.GoodsReceipt.GoodsReceiptResponseDTO;
import hoyjugas.Enum.CashMovementType;
import hoyjugas.Enum.MovementType;
import hoyjugas.Model.*;
import hoyjugas.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoodsReceiptService {

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CashMovementRepository cashMovementRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseConceptRepository expenseConceptRepository;

    @Transactional
    public GoodsReceiptResponseDTO create(GoodsReceiptRequestDTO dto, User employee) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Proveedor no encontrado"));
        GoodsReceipt receipt = new GoodsReceipt();
        receipt.setSupplier(supplier);
        receipt.setVoucher(dto.getVoucher());
        receipt.setPaymentMethod(dto.getPaymentMethod());
        receipt.setNotes(dto.getNotes());
        receipt.setRegisteredBy(employee);
        receipt.setMovementNumber(generateMovementNumber());
        BigDecimal total = BigDecimal.ZERO;
        List<GoodsReceiptItem> items = new ArrayList<>();
        for (GoodsReceiptItemRequestDTO itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Producto no encontrado"));
            BigDecimal subtotal = itemDto.getUnitCost()
                    .multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            GoodsReceiptItem item = new GoodsReceiptItem();
            item.setGoodsReceipt(receipt);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitCost(itemDto.getUnitCost());
            item.setSubtotal(subtotal);
            item.setNewSalePrice(itemDto.getNewSalePrice());
            items.add(item);
            int stockBefore = product.getStock();
            int stockAfter = stockBefore + itemDto.getQuantity();
            product.setStock(stockAfter);
            product.setCost(itemDto.getUnitCost());
            if (itemDto.getNewSalePrice() != null) {
                product.setSalePrice(itemDto.getNewSalePrice());
            }
            productRepository.save(product);
            StockMovement movement = new StockMovement();
            movement.setProduct(product);
            movement.setType(MovementType.INGRESO);
            movement.setQuantity(itemDto.getQuantity());
            movement.setStockBefore(stockBefore);
            movement.setStockAfter(stockAfter);
            movement.setReason("Ingreso por remito " +
                    (dto.getVoucher() != null ? dto.getVoucher() : ""));
            movement.setRegisteredBy(employee);
            movement.setMovementNumber(generateStockMovementNumber());
            movement.setGoodsReceipt(receipt);
            stockMovementRepository.save(movement);

            total = total.add(subtotal);
        }
        receipt.setTotalAmount(total);
        receipt.setItems(items);
        GoodsReceipt saved = goodsReceiptRepository.save(receipt);
        registerExpense(saved, employee);
        return GoodsReceiptResponseDTO.fromEntity(saved);
    }

    public GoodsReceiptResponseDTO getById(Long id) {
        return GoodsReceiptResponseDTO.fromEntity(getReceiptOrThrow(id));
    }

    public Page<GoodsReceiptResponseDTO> getAll(GoodsReceiptFilterDTO dto) {
        Pageable pageable = PageRequest.of(dto.getPage(), dto.getSize(),
                Sort.by(Sort.Direction.fromString(dto.getSortDirection()), dto.getSortBy()));
        return goodsReceiptRepository.findAllWithFilters(
                dto.getSupplierId(),
                dto.getDateFrom(),
                dto.getDateTo(),
                pageable
        ).map(GoodsReceiptResponseDTO::fromEntity);
    }

    private void registerExpense(GoodsReceipt receipt, User employee) {
        ExpenseConcept concept = expenseConceptRepository.findByNameIgnoreCase("Mercaderia")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Concepto 'Mercaderia' no configurado"));
        Expense expense = new Expense();
        expense.setMovementNumber(generateExpenseNumber());
        expense.setConcept(concept);
        expense.setVoucher(receipt.getVoucher());
        expense.setAmount(receipt.getTotalAmount());
        expense.setDetail("Ingreso de mercadería - " + receipt.getMovementNumber());
        expense.setSupplier(receipt.getSupplier());
        expense.setRegisteredBy(employee);
        expense.setPaymentMethod(receipt.getPaymentMethod());
        Expense savedExpense = expenseRepository.save(expense);
        CashMovement cashMovement = new CashMovement();
        cashMovement.setReceiptNumber(generateReceiptNumber());
        cashMovement.setType(CashMovementType.GASTO);
        cashMovement.setPaymentMethod(receipt.getPaymentMethod());
        cashMovement.setAmount(receipt.getTotalAmount());
        cashMovement.setExpense(savedExpense);
        cashMovement.setRegisteredBy(employee);
        cashMovementRepository.save(cashMovement);
    }

    private String generateMovementNumber() {
        long count = goodsReceiptRepository.count() + 1;
        return String.format("REM-%08d", count);
    }

    private String generateStockMovementNumber() {
        long count = stockMovementRepository.count() + 1;
        return String.format("MOV-%08d", count);
    }

    private String generateExpenseNumber() {
        long count = expenseRepository.count() + 1;
        return String.format("GAS-%08d", count);
    }

    private String generateReceiptNumber() {
        long count = cashMovementRepository.count() + 1;
        return String.format("REC-%08d", count);
    }

    private GoodsReceipt getReceiptOrThrow(Long id) {
        return goodsReceiptRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Remito no encontrado"));
    }
}