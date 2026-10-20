package hoyjugas.Service;

import hoyjugas.DTO.Expense.*;
import hoyjugas.Enum.CashMovementType;
import hoyjugas.Model.*;
import hoyjugas.Repository.CashMovementRepository;
import hoyjugas.Repository.ExpenseConceptRepository;
import hoyjugas.Repository.ExpenseRepository;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseConceptRepository expenseConceptRepository;
    private final SupplierRepository supplierRepository;
    private final CashMovementRepository cashMovementRepository;

    public List<ExpenseConceptResponseDTO> getAllConcepts() {
        return expenseConceptRepository.findAll()
                .stream()
                .map(ExpenseConceptResponseDTO::fromEntity)
                .toList();
    }

    public List<ExpenseConceptResponseDTO> getActiveConcepts() {
        return expenseConceptRepository.findByIsActiveTrue()
                .stream()
                .map(ExpenseConceptResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public ExpenseConceptResponseDTO createConcept(ExpenseConceptRequestDTO dto) {
        if (expenseConceptRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un concepto con ese nombre");
        }
        ExpenseConcept concept = new ExpenseConcept();
        concept.setName(dto.getName());
        concept.setIsExtra(dto.getIsExtra());
        return ExpenseConceptResponseDTO.fromEntity(expenseConceptRepository.save(concept));
    }

    @Transactional
    public void toggleConceptStatus(Long id) {
        ExpenseConcept concept = expenseConceptRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Concepto no encontrado"));
        concept.setIsActive(!concept.getIsActive());
        expenseConceptRepository.save(concept);
    }


    @Transactional
    public ExpenseResponseDTO createExpense(ExpenseRequestDTO dto, User employee) {
        ExpenseConcept concept = expenseConceptRepository.findById(dto.getConceptId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Concepto no encontrado"));
        Supplier supplier = null;
        if (dto.getSupplierId() != null) {
            supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Proveedor no encontrado"));
        }
        Expense expense = new Expense();
        expense.setMovementNumber(generateExpenseNumber());
        expense.setConcept(concept);
        expense.setVoucher(dto.getVoucher());
        expense.setAmount(dto.getAmount());
        expense.setDetail(dto.getDetail());
        expense.setSupplier(supplier);
        expense.setRegisteredBy(employee);
        expense.setPaymentMethod(dto.getPaymentMethod());
        Expense saved = expenseRepository.save(expense);
        CashMovement cashMovement = new CashMovement();
        cashMovement.setReceiptNumber(generateReceiptNumber());
        cashMovement.setType(CashMovementType.GASTO);
        cashMovement.setPaymentMethod(dto.getPaymentMethod());
        cashMovement.setAmount(dto.getAmount());
        cashMovement.setExpense(saved);
        cashMovement.setRegisteredBy(employee);
        cashMovementRepository.save(cashMovement);
        return ExpenseResponseDTO.fromEntity(saved);
    }

    public ExpenseResponseDTO getById(Long id) {
        return ExpenseResponseDTO.fromEntity(getExpenseOrThrow(id));
    }

    public Page<ExpenseResponseDTO> getAll(ExpenseFilterDTO dto) {
        Pageable pageable = PageRequest.of(dto.getPage(), dto.getSize(),
                Sort.by(Sort.Direction.fromString(dto.getSortDirection()), dto.getSortBy()));
        return expenseRepository.findAllWithFilters(
                dto.getConceptId(),
                dto.getSupplierId(),
                dto.getDateFrom(),
                dto.getDateTo(),
                pageable
        ).map(ExpenseResponseDTO::fromEntity);
    }

    private String generateExpenseNumber() {
        long count = expenseRepository.count() + 1;
        return String.format("GAS-%08d", count);
    }

    private String generateReceiptNumber() {
        long count = cashMovementRepository.count() + 1;
        return String.format("REC-%08d", count);
    }

    private Expense getExpenseOrThrow(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Gasto no encontrado"));
    }
}