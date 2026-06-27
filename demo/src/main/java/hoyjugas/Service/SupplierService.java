package hoyjugas.Service;

import hoyjugas.DTO.Supplier.SupplierDetailDTO;
import hoyjugas.DTO.Supplier.SupplierListDTO;
import hoyjugas.DTO.Supplier.SupplierRequestDTO;
import hoyjugas.Model.Category;
import hoyjugas.Model.Supplier;
import hoyjugas.Repository.CategoryRepository;
import hoyjugas.Repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final CategoryRepository categoryRepository;

    public List<SupplierListDTO> getAll() {
        return supplierRepository.findAll()
                .stream()
                .map(SupplierListDTO::fromEntity)
                .toList();
    }

    public List<SupplierListDTO> getAllActive() {
        return supplierRepository.findByIsActiveTrue()
                .stream()
                .map(SupplierListDTO::fromEntity)
                .toList();
    }

    public SupplierDetailDTO getById(Long id) {
        return SupplierDetailDTO.fromEntity(getSupplierOrThrow(id));
    }

    @Transactional
    public SupplierDetailDTO create(SupplierRequestDTO dto) {
        if (supplierRepository.existsBySupplierNumber(dto.getSupplierNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un proveedor con ese número");
        }
        if (supplierRepository.existsByCuit(dto.getCuit())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un proveedor con ese CUIT");
        }
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rubro no encontrado"));
        Supplier supplier = new Supplier();
        mapDtoToEntity(dto, supplier, category);
        return SupplierDetailDTO.fromEntity(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierDetailDTO update(Long id, SupplierRequestDTO dto) {
        Supplier supplier = getSupplierOrThrow(id);

        if (supplierRepository.existsBySupplierNumberAndIdNot(dto.getSupplierNumber(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un proveedor con ese número");
        }
        if (supplierRepository.existsByCuitAndIdNot(dto.getCuit(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un proveedor con ese CUIT");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Rubro no encontrado"));

        mapDtoToEntity(dto, supplier, category);
        return SupplierDetailDTO.fromEntity(supplierRepository.save(supplier));
    }

    @Transactional
    public void toggleStatus(Long id) {
        Supplier supplier = getSupplierOrThrow(id);
        supplier.setIsActive(!supplier.getIsActive());
        supplierRepository.save(supplier);
    }

    private void mapDtoToEntity(SupplierRequestDTO dto, Supplier supplier, Category category) {
        supplier.setSupplierNumber(dto.getSupplierNumber());
        supplier.setName(dto.getName());
        supplier.setPhone(dto.getPhone());
        supplier.setCuit(dto.getCuit());
        supplier.setCategory(category);
        supplier.setBank(dto.getBank());
        supplier.setAccountNumber(dto.getAccountNumber());
        supplier.setAccountType(dto.getAccountType());
        supplier.setPaymentTermDays(dto.getPaymentTermDays());
    }

    public Supplier getSupplierOrThrow(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Proveedor no encontrado"));
    }
}