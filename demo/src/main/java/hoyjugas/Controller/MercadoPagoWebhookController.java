package hoyjugas.Controller;

import com.mercadopago.exceptions.MPInvalidWebhookSignatureException;
import com.mercadopago.webhook.WebhookSignatureValidator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import hoyjugas.Service.MpPaymentConfirmationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class MercadoPagoWebhookController {

    @Value("${mp.webhook.secret}")
    private String webhookSecret;

    private final MpPaymentConfirmationService mpPaymentConfirmationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/mp")
    public ResponseEntity<Void> handleWebhook(
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId,
            @RequestParam(value = "data.id", required = false) String dataId,
            @RequestBody String rawPayload) {
        if (xSignature == null || xRequestId == null) {
            log.warn("Webhook recibido sin headers requeridos. Headers presentes: x-signature={}, x-request-id={}",  xSignature != null, xRequestId != null);
            return ResponseEntity.badRequest().build();
        }
        try {
            WebhookSignatureValidator.validate(xSignature, xRequestId, dataId, webhookSecret);
            log.info("Firma de webhook validada correctamente para xRequestId: {}", xRequestId);
        } catch (MPInvalidWebhookSignatureException e) {
            log.warn("Firma de webhook de Mercado Pago INVÁLIDA - xRequestId: {} | Motivo: {}", xRequestId, e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error inesperado validando firma del webhook - xRequestId: {}", xRequestId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        try {
            JsonNode payload = objectMapper.readTree(rawPayload);
            Long paymentId = dataId != null
                    ? Long.parseLong(dataId)
                    : payload.path("data").path("id").asLong(0);
            String type = payload.path("type").asText("");
            log.info("Procesando webhook - Type: {}, PaymentId: {}", type, paymentId);
            if (paymentId > 0 && "payment".equals(type)) {
                mpPaymentConfirmationService.confirmMpPaymentFromPaymentId(paymentId, rawPayload);
            } else {
                log.info("Webhook ignorado (no es tipo 'payment' o no tiene paymentId válido). Type: {}", type);
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error procesando el payload del webhook - xRequestId: {}", xRequestId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}