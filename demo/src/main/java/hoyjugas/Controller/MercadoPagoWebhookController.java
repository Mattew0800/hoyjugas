package hoyjugas.Controller;

import hoyjugas.Service.MpPaymentConfirmationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;

@Slf4j
@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class MercadoPagoWebhookController {

    private final MpPaymentConfirmationService mpPaymentConfirmationService;

    @PostMapping("/mp")
    public ResponseEntity<Void> handleWebhook(@RequestParam(name = "data.id", required = false) Long dataId,@RequestParam(name = "type", required = false) String type,
            @RequestBody(required = false) JsonNode payload
    ) {
        log.info("Webhook: type={} dataId={} payload={}", type, dataId, payload);
        Long paymentId = dataId;
        if (paymentId == null && payload != null && payload.path("data").has("id")) {
            paymentId = payload.path("data").path("id").asLong();
        }
        if (paymentId == null) return ResponseEntity.ok().build();
        mpPaymentConfirmationService.confirmMpPaymentFromPaymentId(paymentId, String.valueOf(payload));
        return ResponseEntity.ok().build();
    }
}