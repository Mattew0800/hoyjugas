package hoyjugas.Controller;

import hoyjugas.DTO.Booking.BookingIdRequestDTO;
import hoyjugas.DTO.Sale.SaleIdRequestDTO;
import hoyjugas.Service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/sale")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<byte[]> getSaleTicket(@Valid @RequestBody SaleIdRequestDTO dto) throws Exception {
        byte[] pdf = ticketService.generateSaleTicket(dto.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=ticket-venta-" + dto.getId() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/booking")
    @PreAuthorize("hasRole('USER')")//ver si lo pueden hacer los usuarios o solo los empleados
    public ResponseEntity<byte[]> getBookingTicket(@Valid @RequestBody BookingIdRequestDTO dto) throws Exception {
        byte[] pdf = ticketService.generateBookingTicket(dto.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=comprobante-reserva-turno" + dto.getId() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/booking/payment-receipt")
    @PreAuthorize("hasRole('USER')")//ver si lo pueden hacer los usuarios o solo los empleados
    public ResponseEntity<byte[]> getPaymentReceipt(@Valid @RequestBody BookingIdRequestDTO dto) throws Exception {
        byte[] pdf = ticketService.generatePaymentReceipt(dto.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=comprobante-pago-" + dto.getId() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}