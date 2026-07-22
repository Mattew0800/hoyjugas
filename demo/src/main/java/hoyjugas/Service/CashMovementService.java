package hoyjugas.Service;

import hoyjugas.DTO.CashMovement.CashMovementFilterDTO;
import hoyjugas.DTO.CashMovement.CashMovementListDTO;
import hoyjugas.DTO.CashMovement.CashMovementSummaryDTO;
import hoyjugas.Enum.CashMovementType;
import hoyjugas.Model.CashMovement;
import hoyjugas.Model.User;
import hoyjugas.Repository.CashMovementRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import static hoyjugas.Service.FormatUtils.formatAmount;
import static hoyjugas.Service.FormatUtils.formatEnum;

@Service
@RequiredArgsConstructor
public class CashMovementService {

    private final CashMovementRepository cashMovementRepository;
    private final UserService userService;

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

    private List<CashMovement> getFilteredMovements(CashMovementFilterDTO dto) {
        return cashMovementRepository.findAllWithFilters(
                dto.getDateFrom(),
                dto.getDateTo(),
                dto.getPaymentMethod(),
                dto.getType(),
                dto.getEmployeeId(),
                Pageable.unpaged()
        ).getContent();
    }

    private BigDecimal totalIncome(List<CashMovement> movements) {
        return movements.stream()
                .filter(m -> m.getType() == CashMovementType.TURNO
                        || m.getType() == CashMovementType.VENTA)
                .map(CashMovement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal totalOutcome(List<CashMovement> movements) {
        return movements.stream()
                .filter(m -> m.getType() == CashMovementType.GASTO
                        || m.getType() == CashMovementType.DEVOLUCION)
                .map(CashMovement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public CashMovementSummaryDTO getSummary(CashMovementFilterDTO dto) {
        List<CashMovement> movements = getFilteredMovements(dto);
        BigDecimal totalIncome = totalIncome(movements);
        BigDecimal totalOutcome = totalOutcome(movements);
        return new CashMovementSummaryDTO(totalIncome,totalOutcome,totalIncome.subtract(totalOutcome));
    }

    public Workbook exportExcel(CashMovementFilterDTO dto) {
        List<CashMovement> movements = getFilteredMovements(dto);
        BigDecimal totalIncome = totalIncome(movements);
        BigDecimal totalOutcome = totalOutcome(movements);
        CashMovementSummaryDTO summary = new CashMovementSummaryDTO(totalIncome,totalOutcome,totalIncome.subtract(totalOutcome));
        return createWorkbook(movements, summary,dto.getDateFrom(),dto.getDateTo());
    }

    private Workbook createWorkbook(List<CashMovement> movements, CashMovementSummaryDTO summary, LocalDateTime from, LocalDateTime to) {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Resumen " +
                (from != null ? from.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "inicio") +
                " a " +
                (to != null ? to.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "hoy"));
        int rowIndex = 0;
        for (CashMovement movement : movements) {
            Row row = sheet.createRow(rowIndex++);
            int col = 0;
            row.createCell(col++).setCellValue("N°: " + movement.getReceiptNumber());
            row.createCell(col++).setCellValue("Total: " + formatAmount(movement.getAmount()));
            row.createCell(col++).setCellValue("Metodo de pago:" + formatEnum(movement.getPaymentMethod().name()));
            row.createCell(col++).setCellValue("Empleado: " + movement.getRegisteredBy().getName());
            row.createCell(col++).setCellValue("Tipo de movimiento: " + formatEnum(movement.getType().name()));
            row.createCell(col++).setCellValue("Fecha: " + movement.getDate());
            if(movement.getBooking() != null) {
                row.createCell(col++).setCellValue("N° de turno: " + movement.getBooking().getBookingNumber());
            }
            if (movement.getSale() != null) {
                row.createCell(col++).setCellValue("N° de venta: " + movement.getSale().getSaleNumber());
                row.createCell(col++).setCellValue("Cliente: " +
                        (movement.getSale().getClient() != null
                                ? movement.getSale().getClient().getName()
                                : "Mostrador"));
            }
            if (movement.getExpense() != null) {
                row.createCell(col++).setCellValue("Concepto: " + movement.getExpense().getConcept().getName());
                row.createCell(col).setCellValue("Detalle: " + movement.getExpense().getDetail());
            }
        }
        Row emptyRow = sheet.createRow(rowIndex++);
        Row summaryRow1 = sheet.createRow(rowIndex++);
        summaryRow1.createCell(0).setCellValue("TOTAL INGRESOS: " + formatAmount(summary.getTotalIngresos()));
        Row summaryRow2 = sheet.createRow(rowIndex++);
        summaryRow2.createCell(0).setCellValue("TOTAL EGRESOS: " + formatAmount(summary.getTotalEgresos()));
        Row summaryRow3 = sheet.createRow(rowIndex++);
        summaryRow3.createCell(0).setCellValue("BALANCE: " + formatAmount(summary.getBalance()));
        return workbook;
    }

}