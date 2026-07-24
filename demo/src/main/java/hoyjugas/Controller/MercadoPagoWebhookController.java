package hoyjugas.Controller;

import hoyjugas.DTO.MercadoPago.PaymentWebHookDTO;
import hoyjugas.Service.MpPaymentConfirmationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class MercadoPagoWebhookController {

    private final MpPaymentConfirmationService mpPaymentConfirmationService;

    @PostMapping({"/mp","/"})
    public ResponseEntity<Void> handleWebhook(@RequestBody PaymentWebHookDTO payload) {
        if (payload == null || payload.getData() == null || payload.getData().getId() == null) {
            log.warn("Webhook de Mercado Pago inválido o incompleto: {}", payload);
            return ResponseEntity.badRequest().build();
        }
        try {
            String rawPayload = new ObjectMapper().writeValueAsString(payload);
            Long paymentId = Long.parseLong(payload.getData().getId());
            mpPaymentConfirmationService.confirmMpPaymentFromPaymentId(paymentId, rawPayload);
            return ResponseEntity.ok().build();
        } catch (NumberFormatException e) {
            log.warn("paymentId inválido en webhook: {}", payload.getData().getId());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error procesando webhook de Mercado Pago", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}