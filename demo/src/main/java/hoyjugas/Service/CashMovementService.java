package hoyjugas.Service;

import hoyjugas.DTO.CashMovement.CashMovementFilterDTO;
import hoyjugas.DTO.CashMovement.CashMovementListDTO;
import hoyjugas.DTO.CashMovement.CashMovementSummaryDTO;
import hoyjugas.Enum.CashMovementType;
import hoyjugas.Model.CashMovement;
import hoyjugas.Repository.CashMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CashMovementService {

    private final CashMovementRepository cashMovementRepository;

    public Page<CashMovementListDTO> getAll(CashMovementFilterDTO dto) {
        Pageable pageable = PageRequest.of(dto.getPage(), dto.getSize(),
                Sort.by(Sort.Direction.fromString(dto.getSortDirection()), dto.getSortBy()));

        return cashMovementRepository.findAllWithFilters(
                dto.getDateFrom(),
                dto.getDateTo(),
                dto.getPaymentMethod(),
                dto.getType(),
                dto.getEmployeeId(),
                pageable
        ).map(CashMovementListDTO::fromEntity);
    }

    public CashMovementSummaryDTO getSummary(CashMovementFilterDTO dto) {
        List<CashMovement> movements = cashMovementRepository.findAllWithFilters(
                dto.getDateFrom(),
                dto.getDateTo(),
                dto.getPaymentMethod(),
                dto.getType(),
                dto.getEmployeeId(),
                Pageable.unpaged()
        ).getContent();

        BigDecimal totalIngresos = movements.stream()
                .filter(m -> m.getType() == CashMovementType.TURNO
                        || m.getType() == CashMovementType.VENTA)
                .map(CashMovement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalEgresos = movements.stream()
                .filter(m -> m.getType() == CashMovementType.GASTO
                        || m.getType() == CashMovementType.DEVOLUCION)
                .map(CashMovement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CashMovementSummaryDTO(
                totalIngresos,
                totalEgresos,
                totalIngresos.subtract(totalEgresos)
        );
    }
}