package hoyjugas.Service;

import hoyjugas.DTO.Sale.SaleFilterDTO;
import hoyjugas.DTO.Sale.SaleItemRequestDTO;
import hoyjugas.DTO.Sale.SaleRequestDTO;
import hoyjugas.DTO.Sale.SaleResponseDTO;
import hoyjugas.Enum.CashMovementType;
import hoyjugas.Model.*;
import hoyjugas.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CashMovementRepository cashMovementRepository;

    @Transactional
    public SaleResponseDTO createSale(SaleRequestDTO dto, User employee) {
        for (SaleItemRequestDTO itemDto : dto.getItems()) {
            Product product = getProductOrThrow(itemDto.getProductId());
            if (!product.getIsActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El producto " + product.getName() + " no está activo");
            }
            if (product.getStock() < itemDto.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Stock insuficiente para " + product.getName() +
                                ". Disponible: " + product.getStock());
            }
        }
        User client = null;
        if (dto.getClientId() != null) {
            client = userRepository.findById(dto.getClientId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        }
        Sale sale = new Sale();
        sale.setClient(client);
        sale.setPaymentMethod(dto.getPaymentMethod());
        sale.setNotes(dto.getNotes());
        sale.setRegisteredBy(employee);
        sale.setSaleNumber(generateSaleNumber());
        BigDecimal total = BigDecimal.ZERO;
        List<SaleItem> items = new ArrayList<>();
        for (SaleItemRequestDTO itemDto : dto.getItems()) {
            Product product = getProductOrThrow(itemDto.getProductId());
            BigDecimal subtotal = product.getSalePrice()
                    .multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(product.getSalePrice());
            item.setSubtotal(subtotal);
            items.add(item);
            product.setStock(product.getStock() - itemDto.getQuantity());
            productRepository.save(product);
            total = total.add(subtotal);
        }
        sale.setTotalAmount(total);
        sale.setItems(items);
        Sale saved = saleRepository.save(sale);
        registerCashMovement(saved, employee);
        return SaleResponseDTO.fromEntity(saved);
    }

    public SaleResponseDTO getById(Long id) {
        return SaleResponseDTO.fromEntity(getSaleOrThrow(id));
    }

    public Page<SaleResponseDTO> getAll(SaleFilterDTO dto) {
        Pageable pageable = PageRequest.of(dto.getPage(), dto.getSize(),
                Sort.by(Sort.Direction.fromString(dto.getSortDirection()), dto.getSortBy()));
        return saleRepository.findAllWithFilters(
                dto.getClientId(),
                dto.getEmployeeId(),
                dto.getPaymentMethod(),
                dto.getDateFrom(),
                dto.getDateTo(),
                pageable
        ).map(SaleResponseDTO::fromEntity);
    }

    private void registerCashMovement(Sale sale, User employee) {
        CashMovement movement = new CashMovement();
        movement.setReceiptNumber(generateReceiptNumber());
        movement.setType(CashMovementType.VENTA);
        movement.setPaymentMethod(sale.getPaymentMethod());
        movement.setAmount(sale.getTotalAmount());
        movement.setSale(sale);
        movement.setRegisteredBy(employee);
        cashMovementRepository.save(movement);
    }

    private String generateSaleNumber() {
        long count = saleRepository.count() + 1;
        return String.format("VTA-%08d", count);
    }

    private String generateReceiptNumber() {
        long count = cashMovementRepository.count() + 1;
        return String.format("REC-%08d", count);
    }

    private Product getProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private Sale getSaleOrThrow(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Venta no encontrada"));
    }
}