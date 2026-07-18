package hoyjugas.Service;

import hoyjugas.DTO.Inventory.InventoryItemRequestDTO;
import hoyjugas.DTO.Inventory.InventoryItemResponseDTO;
import hoyjugas.DTO.Inventory.InventoryMovementRequestDTO;
import hoyjugas.DTO.Inventory.InventoryMovementResponseDTO;
import hoyjugas.DTO.Stock.MovementRequestDTO;
import hoyjugas.Enum.MovementType;
import hoyjugas.Model.InventoryItem;
import hoyjugas.Model.User;
import hoyjugas.Model.InventoryMovement;
import hoyjugas.Repository.CategoryRepository;
import hoyjugas.Repository.InventoryItemRepository;
import hoyjugas.Repository.InventoryMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import hoyjugas.Model.Category;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public List<InventoryItemResponseDTO> getAll() {
        return inventoryItemRepository.findAll()
                .stream()
                .map(InventoryItemResponseDTO::fromEntity)
                .toList();
    }

    public List<InventoryItemResponseDTO> getAllActive() {
        return inventoryItemRepository.findByIsActiveTrue()
                .stream()
                .map(InventoryItemResponseDTO::fromEntity)
                .toList();
    }

    public InventoryItemResponseDTO getById(Long id) {
        return InventoryItemResponseDTO.fromEntity(getItemOrThrow(id));
    }

    @Transactional
    public InventoryItemResponseDTO create(InventoryItemRequestDTO dto) {
        Category category = dto.getCategoryId() != null
                ? categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Rubro no encontrado"))
                : null;

        InventoryItem item = new InventoryItem();
        item.setName(dto.getName());
        item.setMinimumQuantity(dto.getMinimumQuantity());
        item.setDescription(dto.getDescription());
        item.setCategory(category);

        return InventoryItemResponseDTO.fromEntity(inventoryItemRepository.save(item));
    }

    @Transactional
    public InventoryItemResponseDTO update(Long id, InventoryItemRequestDTO dto) {
        InventoryItem item = getItemOrThrow(id);

        Category category = dto.getCategoryId() != null
                ? categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Rubro no encontrado"))
                : null;

        item.setName(dto.getName());
        item.setMinimumQuantity(dto.getMinimumQuantity());
        item.setDescription(dto.getDescription());
        item.setCategory(category);

        return InventoryItemResponseDTO.fromEntity(inventoryItemRepository.save(item));
    }

    @Transactional
    public void toggleStatus(Long id) {
        InventoryItem item = getItemOrThrow(id);
        item.setIsActive(!item.getIsActive());
        inventoryItemRepository.save(item);
    }

    @Transactional
    public InventoryMovementResponseDTO registerMovement(Long itemId, InventoryMovementRequestDTO dto, User employee) {
        InventoryItem item = getItemOrThrow(itemId);
        int quantityBefore = item.getQuantity();
        int quantityAfter = calculateNewQuantity(quantityBefore, dto.getQuantity(), dto.getType());
        if (quantityAfter < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La cantidad resultante no puede ser negativa");
        }
        item.setQuantity(quantityAfter);
        inventoryItemRepository.save(item);
        InventoryMovement movement = new InventoryMovement();
        movement.setInventoryItem(item);
        movement.setType(dto.getType());
        movement.setQuantity(dto.getQuantity());
        movement.setQuantityBefore(quantityBefore);
        movement.setQuantityAfter(quantityAfter);
        movement.setReason(dto.getReason());
        movement.setRegisteredBy(employee);
        movement.setMovementNumber(generateMovementNumber());
        return InventoryMovementResponseDTO.fromEntity(inventoryMovementRepository.save(movement));
    }

    public List<InventoryMovementResponseDTO> getMovementsByItem(Long itemId) {
        getItemOrThrow(itemId);
        List<InventoryMovementResponseDTO> inventoryMovement = inventoryMovementRepository
                .findByInventoryItemIdOrderByCreatedAtDesc(itemId)
                .stream()
                .map(InventoryMovementResponseDTO::fromEntity)
                .toList();
        if (inventoryMovement.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se han encontrado movimientos de este item");
        }
        return inventoryMovement;
    }

    private int calculateNewQuantity(int current, int quantity, MovementType type) {
        return switch (type) {
            case INGRESO -> current + quantity;
            case EGRESO -> current - quantity;
            case AJUSTE -> quantity;  // el ajuste setea la cantidad directamente
        };
    }

    private String generateMovementNumber() {
        long count = inventoryMovementRepository.count() + 1;
        return String.format("INV-%08d", count);
    }

    private InventoryItem getItemOrThrow(Long id) {
        return inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Item de inventario no encontrado"));
    }
}