package hoyjugas.Controller;

import hoyjugas.DTO.MercadoPago.PaymentWebHookDTO;
import hoyjugas.Service.BookingService;
import hoyjugas.Service.MpPaymentConfirmationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class MercadoPagoWebhookController {

    private final BookingService bookingService;
    private final MpPaymentConfirmationService mpPaymentConfirmationService;

    @PostMapping({"/mp", "/"})
    public ResponseEntity<Void> handleWebhook(@RequestBody PaymentWebHookDTO payload) {
        if (payload == null || payload.getData() == null || payload.getData().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Long paymentId = Long.parseLong(payload.getData().getId());
            mpPaymentConfirmationService.confirmMpPaymentFromPaymentId(paymentId);
            return ResponseEntity.ok().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        } catch (ResponseStatusException e) {
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
}
}