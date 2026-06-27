package hoyjugas.Service;

import hoyjugas.DTO.Sale.*;
import hoyjugas.Enum.CashMovementType;
import hoyjugas.Enum.SaleStatus;
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
import java.time.LocalDateTime;
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
        List<String> alerts = new ArrayList<>();
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
            if (product.getStock() <= product.getMinimumStock()) {
                alerts.add(String.format("⚠️ %s quedó con stock bajo (%d unidades)",
                        product.getName(), product.getStock()));
            }
        }
        sale.setTotalAmount(total);
        sale.setItems(items);
        Sale saved = saleRepository.save(sale);
        registerCashMovement(saved, employee);
        return SaleResponseDTO.fromEntity(saved, alerts);
    }

    public SaleResponseDTO getById(Long id) {
        return SaleResponseDTO.fromEntity(getSaleOrThrow(id));
    }

//    public Page<SaleResponseDTO> getAll(SaleFilterDTO dto) {
//        Pageable pageable = PageRequest.of(dto.getPage(), dto.getSize(),
//                Sort.by(Sort.Direction.fromString(dto.getSortDirection()), dto.getSortBy()));
//        return saleRepository.findAllWithFilters(
//                dto.getClientId(),
//                dto.getEmployeeId(),
//                dto.getPaymentMethod(),
//                dto.getDateFrom(),
//                dto.getDateTo(),
//                pageable
//        ).map(SaleResponseDTO::fromEntity);
//    }

    public SalePageResponseDTO getAll(SaleFilterDTO dto) {

        Pageable pageable = PageRequest.of(
                dto.getPage(),
                dto.getSize(),
                Sort.by(
                        Sort.Direction.fromString(dto.getSortDirection()),
                        dto.getSortBy()
                )
        );

        Page<Sale> page = saleRepository.findAllWithFilters(
                dto.getClientId(),
                dto.getEmployeeId(),
                dto.getPaymentMethod(),
                dto.getDateFrom(),
                dto.getDateTo(),
                pageable
        );

        BigDecimal total = saleRepository.getTotalWithFilters(
                dto.getClientId(),
                dto.getEmployeeId(),
                dto.getPaymentMethod(),
                dto.getDateFrom(),
                dto.getDateTo()
        );

        return new SalePageResponseDTO(
                page.getContent()
                        .stream()
                        .map(SaleResponseDTO::fromEntity)
                        .toList(),
                total,
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber()
        );
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private Sale getSaleOrThrow(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Venta no encontrada"));
    }

    @Transactional
    public SaleResponseDTO cancelSale(Long saleId, User employee) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Venta no encontrada"));
        if (sale.getStatus() == SaleStatus.CANCELADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La venta ya fue cancelada");
        }
        for (SaleItem item : sale.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
        sale.setStatus(SaleStatus.CANCELADA);
        sale.setCancelledAt(LocalDateTime.now());
        sale.setCancelledBy(employee);
        return SaleResponseDTO.fromEntity(saleRepository.save(sale));
    }
}