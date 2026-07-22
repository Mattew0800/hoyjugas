package hoyjugas.Service;

import hoyjugas.DTO.CashMovement.CashMovementFilterDTO;
import hoyjugas.DTO.CashMovement.CashMovementListDTO;
import hoyjugas.DTO.CashMovement.CashMovementSummaryDTO;
import hoyjugas.Enum.CashMovementType;
import hoyjugas.Model.CashMovement;
import hoyjugas.Model.User;
import hoyjugas.Repository.CashMovementRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import static hoyjugas.Service.FormatUtils.formatAmount;
import static hoyjugas.Service.FormatUtils.formatEnum;

@Service
@RequiredArgsConstructor
public class CashMovementService {

    private final CashMovementRepository cashMovementRepository;
    private final UserService userService;

    public Page<CashMovementListDTO> getAll(CashMovementFilterDTO dto) {
        applyDefaultDates(dto);
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
        applyDefaultDates(dto);
        List<CashMovement> movements = getFilteredMovements(dto);
        BigDecimal totalIncome = totalIncome(movements);
        BigDecimal totalOutcome = totalOutcome(movements);
        return new CashMovementSummaryDTO(totalIncome,totalOutcome,totalIncome.subtract(totalOutcome));
    }

    private void applyDefaultDates(CashMovementFilterDTO dto) {
        LocalDateTime now = LocalDateTime.now();
        System.out.println(dto.getDateFrom());
        System.out.println(dto.getDateTo());
        if (dto.getDateTo() == null) {
            dto.setDateTo(now);
        }
        if (dto.getDateFrom() == null) {
            dto.setDateFrom(now.toLocalDate().atStartOfDay());
        }
    }

    public byte[] exportExcel(CashMovementFilterDTO dto){
        applyDefaultDates(dto);
        List<CashMovement> movements = getFilteredMovements(dto);
        BigDecimal totalIncome = totalIncome(movements);
        BigDecimal totalOutcome = totalOutcome(movements);
        CashMovementSummaryDTO summary = new CashMovementSummaryDTO(totalIncome,totalOutcome,totalIncome.subtract(totalOutcome));
        try (Workbook workbook = createWorkbook(movements,summary,dto.getDateFrom(),dto.getDateTo());
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generando Excel", e);
        }
    }

    private Workbook createWorkbook(List<CashMovement> movements, CashMovementSummaryDTO summary, LocalDateTime from, LocalDateTime to) {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Resumen " +
                (from != null ? from.format(DateTimeFormatter.ofPattern("dd-MM-yyyy")) : "inicio") +
                " a " +
                (to != null ? to.format(DateTimeFormatter.ofPattern("dd-MM-yyyy")) : "hoy"));
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.BLACK.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font headerFont = workbook.createFont();
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        CellStyle summaryStyle = workbook.createCellStyle();
        Font summaryFont = workbook.createFont();
        summaryFont.setBold(true);
        summaryFont.setFontHeightInPoints((short) 12);
        summaryStyle.setFont(summaryFont);
        summaryStyle.setBorderTop(BorderStyle.MEDIUM);
        int rowIndex = 0;
        Row headerRow = sheet.createRow(rowIndex++);
        String[] headers = {"N° Recibo", "Total", "Método de pago", "Empleado",
                "Tipo", "Fecha", "N° Turno", "N° Venta", "Cliente", "Concepto", "Detalle"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        sheet.createFreezePane(0, 1);
        for (CashMovement movement : movements) {
            Row row = sheet.createRow(rowIndex);
            CellStyle rowStyle = workbook.createCellStyle();
            int col = 0;
            createCell(row, col++, movement.getReceiptNumber(), rowStyle);
            createCell(row, col++, formatAmount(movement.getAmount()), rowStyle);
            createCell(row, col++, formatEnum(movement.getPaymentMethod().name()), rowStyle);
            createCell(row, col++, movement.getRegisteredBy().getName(), rowStyle);
            createCell(row, col++, formatEnum(movement.getType().name()), rowStyle);
            createCell(row, col++, movement.getDate().format(
                    DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), rowStyle);
            if (movement.getBooking() != null) {
                createCell(row, col++, movement.getBooking().getBookingNumber(), rowStyle);
            } else col++;
            if (movement.getSale() != null) {
                createCell(row, col++, movement.getSale().getSaleNumber(), rowStyle);
                createCell(row, col++, movement.getSale().getClient() != null
                        ? movement.getSale().getClient().getName()
                        : "Mostrador", rowStyle);
            } else col += 2;
            if (movement.getExpense() != null) {
                createCell(row, col++, movement.getExpense().getConcept().getName(), rowStyle);
                createCell(row, col, movement.getExpense().getDetail(), rowStyle);
            }
            rowIndex++;
        }
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        rowIndex++;
        String[] summaryLabels = {
                "TOTAL INGRESOS: " + formatAmount(summary.getTotalIngresos()),
                "TOTAL EGRESOS: " + formatAmount(summary.getTotalEgresos()),
                "BALANCE: " + formatAmount(summary.getBalance())
        };
        for (String label : summaryLabels) {
            Row row = sheet.createRow(rowIndex++);
            Cell cell = row.createCell(0);
            cell.setCellValue(label);
        }
        return workbook;
    }

    private void createCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        if (style != null) cell.setCellStyle(style);
    }
}