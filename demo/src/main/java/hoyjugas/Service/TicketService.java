package hoyjugas.Service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import hoyjugas.Enum.PaymentType;
import hoyjugas.Model.Payment;
import hoyjugas.Enum.PaymentStatus;
import hoyjugas.Model.Booking;
import hoyjugas.Model.Sale;
import hoyjugas.Model.SaleItem;
import hoyjugas.Model.SystemConfig;
import hoyjugas.Repository.BookingRepository;
import hoyjugas.Repository.PaymentRepository;
import hoyjugas.Repository.SaleRepository;
import hoyjugas.Repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import static hoyjugas.Service.FormatUtils.formatAmount;
import static hoyjugas.Service.FormatUtils.formatEnum;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final SaleRepository saleRepository;
    private final BookingRepository bookingRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final PaymentRepository paymentRepository;

    public byte[] generateSaleTicket(Long saleId) throws Exception {//metodo de prueba, evidentemente no vamos a imprimir un ticket de venta en hoja a4, lo mismo con los otros metodos
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Venta no encontrada"));
        SystemConfig config = systemConfigRepository.findById(1)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Config no encontrada"));
        ByteArrayOutputStream baos = createBaos();
        PdfFont bold = createBold();
        PdfFont normal = createNormal();
        Document document =resolveDocument(baos,config,bold,normal);
        document.add(new Paragraph("TICKET DE VENTA")
                .setFont(bold).setFontSize(12).setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("N°: " + sale.getSaleNumber())
                .setFont(normal).setFontSize(10));
        document.add(new Paragraph("Fecha: " + sale.getDate()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .setFont(normal).setFontSize(10));
        document.add(new Paragraph("Método de pago: " + sale.getPaymentMethod().name())
                .setFont(normal).setFontSize(10));
        document.add(new LineSeparator(new SolidLine()));
        Table table = new Table(new float[]{3, 1, 1, 1});
        table.setWidth(UnitValue.createPercentValue(100));
        table.addHeaderCell(new Cell().add(new Paragraph("Producto").setFont(bold).setFontSize(9)));
        table.addHeaderCell(new Cell().add(new Paragraph("Cant.").setFont(bold).setFontSize(9)));
        table.addHeaderCell(new Cell().add(new Paragraph("Precio").setFont(bold).setFontSize(9)));
        table.addHeaderCell(new Cell().add(new Paragraph("Subtotal").setFont(bold).setFontSize(9)));
        for (SaleItem item : sale.getItems()) {
            table.addCell(new Cell().add(new Paragraph(item.getProduct().getName())
                    .setFont(normal).setFontSize(9)));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantity()))
                    .setFont(normal).setFontSize(9)));
            table.addCell(new Cell().add(new Paragraph("$" + formatAmount(item.getUnitPrice()))
                    .setFont(normal).setFontSize(9)));
            table.addCell(new Cell().add(new Paragraph("$" + formatAmount(item.getSubtotal()))
                    .setFont(normal).setFontSize(9)));
        }
        document.add(table);
        document.add(new LineSeparator(new SolidLine()));
        document.add(new Paragraph("TOTAL: $" + formatAmount(sale.getTotalAmount()))
                .setFont(bold).setFontSize(14).setTextAlignment(TextAlignment.RIGHT));
        document.add(new Paragraph("\n¡Gracias por tu compra!")
                .setFont(normal).setFontSize(10).setTextAlignment(TextAlignment.CENTER));
        document.close();
        return baos.toByteArray();
    }

    public Document saleTicket(PdfDocument pdf){//para formato de fiscalera (o cercano)
        PageSize ticketSize = new PageSize(226.77f, 500f);
        Document document = new Document(pdf, ticketSize);
        document.setMargins(10, 10, 10, 10);
        return document;
    }

    public Document resolveDocument(ByteArrayOutputStream baos,SystemConfig config, PdfFont bold,PdfFont normal) {
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        document.setMargins(40, 40, 40, 40);
        document.add(new Paragraph(config.getSportsComplexName())
                .setFont(bold).setFontSize(16).setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph(config.getAddress())
                .setFont(normal).setFontSize(10).setTextAlignment(TextAlignment.LEFT));
        document.add(new LineSeparator(new SolidLine()));
        return document;
    }

    public PdfFont createBold() throws IOException {
        return PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
    }

    public PdfFont createNormal() throws IOException {
        return PdfFontFactory.createFont(StandardFonts.HELVETICA);
    }

    public ByteArrayOutputStream createBaos(){
        return new ByteArrayOutputStream();
    }


    public byte[] generateBookingTicket(Long bookingId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Turno no encontrado"));
        SystemConfig config = systemConfigRepository.findById(1)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Config no encontrada"));
        ByteArrayOutputStream baos = createBaos();
        PdfFont bold = createBold();
        PdfFont normal = createNormal();
        Document document =resolveDocument(baos,config,bold,normal);
        document.add(new Paragraph("COMPROBANTE DE RESERVA")
                .setFont(bold).setFontSize(12).setTextAlignment(TextAlignment.CENTER));
        getData(document,booking,normal);
        document.add(new Paragraph("Total del turno: $" + formatAmount(booking.getTotalAmount()))
                .setFont(normal).setFontSize(11));
        BigDecimal totalCollected = paymentRepository.findTotalByBookingIdExcludingType(booking.getId(), PaymentType.DEVOLUCION, PaymentStatus.PAGADO);
        BigDecimal remaining = booking.getTotalAmount()
                .subtract(totalCollected).max(BigDecimal.ZERO);
        document.add(new Paragraph("Abonado: $" + formatAmount(totalCollected))
                .setFont(normal).setFontSize(11));
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            document.add(new Paragraph("Saldo pendiente: $" + formatAmount(remaining))
                    .setFont(bold).setFontSize(11));
        }
        document.add(new Paragraph("Estado de pago: " + formatEnum(booking.getPaymentStatus().name()))
                .setFont(normal).setFontSize(11));
        document.add(new LineSeparator(new SolidLine()));
        document.add(new Paragraph("¡Te esperamos!")
                .setFont(normal).setFontSize(10).setTextAlignment(TextAlignment.CENTER));
        document.close();
        return baos.toByteArray();
    }

    public void getData(Document document,Booking booking,PdfFont normal) {
        document.add(new Paragraph("N°: " + booking.getBookingNumber())
                .setFont(normal).setFontSize(10));
        document.add(new Paragraph("Cliente: " + booking.getClient().getName())
                .setFont(normal).setFontSize(10));
        document.add(new Paragraph("Espacio: " + booking.getSpace().getName())
                .setFont(normal).setFontSize(10));
        document.add(new Paragraph("Fecha: " + booking.getStartDatetime()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .setFont(normal).setFontSize(10));
        document.add(new Paragraph("Horario: " +
                booking.getStartDatetime().format(DateTimeFormatter.ofPattern("HH:mm")) +
                " a " +
                booking.getEndDatetime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .setFont(normal).setFontSize(10));
        document.add(new LineSeparator(new SolidLine()));
    }

    public byte[] generatePaymentReceipt(Long bookingId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Turno no encontrado"));
        SystemConfig config = systemConfigRepository.findById(1)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Config no encontrada"));
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        ByteArrayOutputStream baos = createBaos();
        PdfFont bold = createBold();
        PdfFont normal = createNormal();
        Document document =resolveDocument(baos,config,bold,normal);
        document.add(new Paragraph("COMPROBANTE DE PAGO")
                .setFont(bold).setFontSize(12).setTextAlignment(TextAlignment.CENTER));
        getData(document, booking, normal);
        document.add(new Paragraph("DETALLE DE PAGOS")
                .setFont(bold).setFontSize(11));
        Table table = new Table(new float[]{2, 2, 2, 2});
        table.setWidth(UnitValue.createPercentValue(100));
        table.addHeaderCell(new Cell().add(new Paragraph("Tipo").setFont(bold).setFontSize(9)));
        table.addHeaderCell(new Cell().add(new Paragraph("Método").setFont(bold).setFontSize(9)));
        table.addHeaderCell(new Cell().add(new Paragraph("Fecha").setFont(bold).setFontSize(9)));
        table.addHeaderCell(new Cell().add(new Paragraph("Monto").setFont(bold).setFontSize(9)));
        for (Payment payment : payments) {
            if (payment.getStatus() != PaymentStatus.PAGADO) continue;
            table.addCell(new Cell().add(new Paragraph(formatEnum(payment.getType().name()))
                    .setFont(normal).setFontSize(9)));
            table.addCell(new Cell().add(new Paragraph(
                    payment.getMethod() != null ? payment.getMethod().name() : "-")
                    .setFont(normal).setFontSize(9)));
            table.addCell(new Cell().add(new Paragraph(payment.getCreatedAt()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                    .setFont(normal).setFontSize(9)));
            table.addCell(new Cell().add(new Paragraph("$" + formatAmount(payment.getAmount()))
                    .setFont(normal).setFontSize(9)));
        }
        document.add(table);
        document.add(new LineSeparator(new SolidLine()));
        BigDecimal totalCollected = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PAGADO)
                .filter(p -> p.getType() != PaymentType.DEVOLUCION)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        document.add(new Paragraph("Total abonado: $" + formatAmount(totalCollected))
                .setFont(bold).setFontSize(14).setTextAlignment(TextAlignment.RIGHT));
        document.add(new Paragraph("Total del turno: $" + formatAmount(booking.getTotalAmount()))
                .setFont(normal).setFontSize(11).setTextAlignment(TextAlignment.RIGHT));
        document.add(new Paragraph("Estado: " + formatEnum(booking.getPaymentStatus().name()))
                .setFont(bold).setFontSize(11).setTextAlignment(TextAlignment.RIGHT));
        document.add(new Paragraph("\n¡Gracias por elegirnos!")
                .setFont(normal).setFontSize(10).setTextAlignment(TextAlignment.CENTER));
        document.close();
        return baos.toByteArray();
    }
}