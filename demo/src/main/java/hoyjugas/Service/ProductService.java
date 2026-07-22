package hoyjugas.Service;

import hoyjugas.DTO.Product.*;
import hoyjugas.DTO.Stock.MovementRequestDTO;
import hoyjugas.DTO.Stock.StockMovementFilterDTO;
import hoyjugas.DTO.Stock.StockMovementResponseDTO;
import hoyjugas.Enum.MovementType;
import hoyjugas.Model.*;
import hoyjugas.Repository.CategoryRepository;
import hoyjugas.Repository.ProductRepository;
import hoyjugas.Repository.StockMovementRepository;
import hoyjugas.Repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;
import java.util.List;

import static hoyjugas.Service.FormatUtils.formatEnum;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ExcelService excelService;

    public Page<ProductDetailDTO> getAll(ProductFilterDTO dto) {
        Pageable pageable = PageRequest.of(dto.getPage(), dto.getSize(),
                Sort.by(Sort.Direction.fromString(dto.getSortDirection()), dto.getSortBy()));
        return productRepository.findAllWithFilters(
                dto.getCategoryId(),
                dto.getSupplierId(),
                dto.getSearch(),
                dto.getLowStock(),
                dto.getIsActive(),
                pageable
        ).map(ProductDetailDTO::fromEntity);
    }

    public ProductDetailDTO getById(Long id) {
        return ProductDetailDTO.fromEntity(getProductOrThrow(id));
    }

    public ProductListDTO getByBarcode(String barcode) {
        return productRepository.findByBarcodeAndIsActiveTrue(barcode)
                .map(ProductListDTO::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    public ProductListDTO getByInternalCode(String code) {
        return productRepository.findByInternalCodeAndIsActiveTrue(code)
                .map(ProductListDTO::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    @Transactional
    public ProductDetailDTO create(ProductRequestDTO dto) {
        if (productRepository.existsByInternalCode(dto.getInternalCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un producto con ese código interno");
        }
        if (dto.getBarcode() != null &&
                productRepository.existsByBarcode(dto.getBarcode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un producto con ese código de barras");
        }
        Category category =getCategoryOrThrow(dto.getCategoryId());
        Supplier supplier = null;
        if (dto.getSupplierId() != null) {
            supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Proveedor no encontrado"));
        }
        Product product = new Product();
        mapDtoToEntity(dto, product, category, supplier);
        return ProductDetailDTO.fromEntity(productRepository.save(product));
    }

    public Category getCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rubro no encontrado"));
    }

    @Transactional
    public ProductDetailDTO update(ProductUpdateRequestDTO dto) {
        Long id=dto.getId();
        Product product = getProductOrThrow(id);
        if (productRepository.existsByInternalCodeAndIdNot(dto.getInternalCode(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un producto con ese código interno");
        }
        if (dto.getBarcode() != null &&
                productRepository.existsByBarcodeAndIdNot(dto.getBarcode(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un producto con ese código de barras");
        }
        Category category = getCategoryOrThrow(dto.getCategoryId());
        Supplier supplier = null;
        if (dto.getSupplierId() != null) {
            supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Proveedor no encontrado"));
        }
        mapDtoToEntity(dto, product, category, supplier);
        return ProductDetailDTO.fromEntity(productRepository.save(product));
    }

    @Transactional
    public void toggleStatus(Long id) {
        Product product = getProductOrThrow(id);
        product.setIsActive(!product.getIsActive());
        productRepository.save(product);
    }

    @Transactional
    public StockMovementResponseDTO registerMovement(MovementRequestDTO dto, User employee) {
        Product product = getProductOrThrow(dto.getProductId());
        int stockBefore = product.getStock();
        int stockAfter = calculateNewStock(stockBefore, dto.getQuantity(), dto.getType());
        if (stockAfter < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El stock resultante no puede ser negativo");
        }
        product.setStock(stockAfter);
        productRepository.save(product);
        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setType(dto.getType());
        movement.setQuantity(dto.getQuantity());
        movement.setStockBefore(stockBefore);
        movement.setStockAfter(stockAfter);
        movement.setReason(dto.getReason());
        movement.setRegisteredBy(employee);
        movement.setMovementNumber(generateMovementNumber());
        return StockMovementResponseDTO.fromEntity(
                stockMovementRepository.save(movement));
    }

    public Page<StockMovementResponseDTO> getMovements(StockMovementFilterDTO dto) {
        Pageable pageable = PageRequest.of(dto.getPage(), dto.getSize(),
                Sort.by(Sort.Direction.fromString(dto.getSortDirection()), dto.getSortBy()));
        return stockMovementRepository.findAllWithFilters(
                dto.getProductId(),
                dto.getType(),
                dto.getDateFrom(),
                dto.getDateTo(),
                pageable
        ).map(StockMovementResponseDTO::fromEntity);
    }

    public List<ProductListDTO> getLowStock() {
        return productRepository.findLowStock()
                .stream()
                .map(ProductListDTO::fromEntity)
                .toList();
    }

    private int calculateNewStock(int current, int quantity, MovementType type) {
        return switch (type) {
            case INGRESO -> current + quantity;
            case EGRESO -> current - quantity;
            case AJUSTE -> quantity;
        };
    }

    private String generateMovementNumber() {
        long count = stockMovementRepository.count() + 1;
        return String.format("MOV-%08d", count);
    }

    private void mapDtoToEntity(ProductRequestDTO dto, Product product,
                                Category category, Supplier supplier) {
        product.setInternalCode(dto.getInternalCode());
        product.setBarcode(dto.getBarcode());
        product.setName(dto.getName());
        product.setCost(dto.getCost());
        product.setSalePrice(dto.getSalePrice());
        product.setMinimumStock(dto.getMinimumStock());
        product.setCategory(category);
        product.setSupplier(supplier);
    }

    public Product getProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    public List<ProductListDTO> search(String query) {
        return productRepository
                .findByNameOrCodeActive(query)
                .stream()
                .map(ProductListDTO::fromEntity)
                .toList();
    }

    public byte[] exportStockMovementsExcel(StockMovementFilterDTO dto) {
        List<StockMovement> movements = stockMovementRepository
                .findAllWithFilters(dto.getProductId(), dto.getType(),
                        dto.getDateFrom(), dto.getDateTo(), Pageable.unpaged())
                .getContent();
        List<String> headers = List.of(
                "N° Movimiento", "Producto", "Código", "Tipo", "Cantidad",
                "Stock Antes", "Stock Después", "Motivo", "Empleado", "Fecha");
        List<List<String>> rows = movements.stream()
                .map(m -> List.of(
                        m.getMovementNumber(),
                        m.getProduct().getName(),
                        m.getProduct().getInternalCode(),
                        formatEnum(m.getType().name()),
                        String.valueOf(m.getQuantity()),
                        String.valueOf(m.getStockBefore()),
                        String.valueOf(m.getStockAfter()),
                        m.getReason() != null ? m.getReason() : "",
                        m.getRegisteredBy().getName(),
                        m.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                ))
                .toList();

        return excelService.export(headers, rows, "Movimientos stock");
    }
}