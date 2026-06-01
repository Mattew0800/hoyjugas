package hoyjugas.Controller;

import hoyjugas.Service.BookingService;
import hoyjugas.Service.MercadoPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class MercadoPagoWebhookController {

    private final MercadoPagoService mercadoPagoService;
    private final BookingService bookingService;

    @PostMapping("/mp")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> handleWebhook(@RequestBody Map<String, Object> payload)  {
        String type = (String) payload.get("type");
        if ("payment".equals(type)) {
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            String paymentId = String.valueOf(data.get("id"));
            bookingService.confirmMpPayment(paymentId);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/pruebita")
    public ResponseEntity<Void>webhook(@RequestBody String body){
        System.out.println("WEBHOOK RECIBIDO");
        System.out.println(body);
        return ResponseEntity.ok().build();
    }
}