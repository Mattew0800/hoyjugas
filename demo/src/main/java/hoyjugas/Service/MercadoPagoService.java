package hoyjugas.Service;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import hoyjugas.Enum.PaymentType;
import hoyjugas.Model.Booking;
import hoyjugas.Model.MpPaymentAudit;
import hoyjugas.Repository.MpPaymentAuditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MercadoPagoService {

    @Value("${mp.success.url}")
    private String successUrl;

    @Value("${mp.failure.url}")
    private String failureUrl;

    @Value("${mp.pending.url}")
    private String pendingUrl;

    @Value("${mp.webhook.url}")
    private String webhookUrl;

    private final MpPaymentAuditRepository mpPaymentAuditRepository;

    public String createPreference(Booking booking, PaymentType paymentType) throws MPApiException, MPException {
        try {
            BigDecimal amount = calculateAmount(booking, paymentType);
            PreferenceClient client = new PreferenceClient();
            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title("Reserva " + booking.getSpace().getName())
                    .description(getDescription(booking, paymentType))
                    .quantity(1)
                    .unitPrice(amount)
                    .currencyId("ARS")
                    .build();
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(successUrl + "?bookingId=" + booking.getId())
                    .failure(failureUrl + "?bookingId=" + booking.getId())
                    .pending(pendingUrl + "?bookingId=" + booking.getId())
                    .build();
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(List.of(item))
                    .backUrls(backUrls)
                    .externalReference(String.valueOf(booking.getId()))
                    .notificationUrl(webhookUrl)
                    .build();
            Preference preference = client.create(preferenceRequest);
            MpPaymentAudit audit = new MpPaymentAudit();
            audit.setBooking(booking);
            audit.setExternalReference(String.valueOf(booking.getId()));
            audit.setPreferenceAmount(amount);
            audit.setPreferenceId(preference.getId());
            mpPaymentAuditRepository.save(audit);
            return preference.getInitPoint();
        } catch (MPApiException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al crear preferencia en mercado pago " );
        } catch (MPException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al comunicarse con Mercado Pago");
        }
    }

    private BigDecimal calculateAmount(Booking booking, PaymentType paymentType) {
        return paymentType == PaymentType.PAGO_TOTAL
                ? booking.getTotalAmount()
                : booking.getSpace().getDepositValue();
    }

    private String getDescription(Booking booking, PaymentType paymentType) {
        String typeText = paymentType == PaymentType.PAGO_TOTAL ? "Pago total" : "Seña";
        return typeText + " - Turno " + booking.getBookingNumber();
    }

    public Payment getPayment(String paymentId) {
        try {
            PaymentClient client = new PaymentClient();
            return client.get(Long.parseLong(paymentId));
        } catch (MPApiException e) {
            if (e.getStatusCode() == 404) {
                return null;
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error MP: " + e.getApiResponse().getContent());
        } catch (MPException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al comunicarse con Mercado Pago: " + e.getMessage());
        }
    }
}
