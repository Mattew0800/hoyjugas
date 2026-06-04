package hoyjugas.Service;

import com.twilio.rest.api.v2010.account.Message;
import hoyjugas.Model.Booking;
import hoyjugas.Model.Space;
import hoyjugas.Model.SystemConfig;
import hoyjugas.Model.User;
import hoyjugas.Repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import com.twilio.type.PhoneNumber;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppService {

    @Value("${twilio.whatsapp.from}")
    private String fromNumber;

    private final SystemConfigRepository systemConfigRepository;

    public void sendBookingReminder(Booking booking, BigDecimal remainingAmount) {
        try {
            SystemConfig config = systemConfigRepository.findById(1)
                    .orElseThrow(() -> new RuntimeException("Config no encontrada"));
            User client = booking.getClient();
            Space space = booking.getSpace();
            String message = buildReminderMessage(booking, client, space, remainingAmount, config);
            Message.creator(
                    new PhoneNumber("whatsapp:" + client.getPhone()),
                    new PhoneNumber(fromNumber),
                    message
            ).create();
        } catch (Exception e) {
            log.error("Error while sending reminder", e);
            log.error("Error enviando WhatsApp a booking {}: {}", booking.getId(), e.getMessage());
        }
    }

    private String buildReminderMessage(Booking booking, User client, Space space,BigDecimal remainingAmount, SystemConfig config) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("¡Hola %s!\n\n", client.getName()));
        sb.append(String.format("Te recordamos que tenés un turno próximo en *%s*:\n\n",
                config.getSportsComplexName()));
        sb.append(String.format("*Espacio:* %s\n", space.getName()));
        sb.append(String.format("*Fecha:* %s\n",
                booking.getStartDatetime().format(dateFormatter)));
        sb.append(String.format("*Horario:* %s a %s\n",
                booking.getStartDatetime().format(timeFormatter),
                booking.getEndDatetime().format(timeFormatter)));
        if (remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
            sb.append(String.format(
                    "*Recordá que en el complejo deberás completar el pago abonando:* $%.0f\n",
                    remainingAmount));
        }
        sb.append(String.format("\n*Dirección:* %s\n", config.getAddress()));
        sb.append("\n¡Te esperamos!");
        return sb.toString();
    }

    public void sendRescheduleNotification(Booking original, Booking newBooking) {
        try {
            SystemConfig config = systemConfigRepository.findById(1)
                    .orElseThrow(() -> new RuntimeException("Config no encontrada"));
            User client = newBooking.getClient();
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            String message = String.format("""
                ¡Hola %s!
                
                Tu turno fue reprogramado exitosamente en *%s*:
                
                 *Turno anterior:* %s %s a %s
                 *Nuevo turno:* %s %s a %s
                 *Espacio:* %s
                 *Dirección:* %s
                
                ¡Te esperamos! 
                """,
                    client.getName(),
                    config.getSportsComplexName(),
                    original.getStartDatetime().format(dateFormatter),
                    original.getStartDatetime().format(timeFormatter),
                    original.getEndDatetime().format(timeFormatter),
                    newBooking.getStartDatetime().format(dateFormatter),
                    newBooking.getStartDatetime().format(timeFormatter),
                    newBooking.getEndDatetime().format(timeFormatter),
                    newBooking.getSpace().getName(),
                    config.getAddress()
            );

            Message.creator(
                    new PhoneNumber("whatsapp:" + client.getPhone()),
                    new PhoneNumber(fromNumber),
                    message
            ).create();

        } catch (Exception e) {
            log.error("Error enviando WhatsApp de reschedule a booking {}: {}",
                    newBooking.getId(), e.getMessage());
        }
    }

    public void sendCancellationNotification(Booking booking) {
        try {
            SystemConfig config = systemConfigRepository.findById(1)
                    .orElseThrow(() -> new RuntimeException("Config no encontrada"));
            User client = booking.getClient();
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            String message = String.format("""
                ¡Hola %s!
                
                Te informamos que tu turno en *%s* fue cancelado:
                
                 *Espacio:* %s
                 *Fecha:* %s
                 *Horario:* %s a %s
                
                
                Recorda que por politicas del complejo, el monto de la seña no se devuelve.
                
                Si creés que es un error, no dudes en comunicarte con nosotros.
                """,
                    client.getName(),
                    config.getSportsComplexName(),
                    booking.getSpace().getName(),
                    booking.getStartDatetime().format(dateFormatter),
                    booking.getStartDatetime().format(timeFormatter),
                    booking.getEndDatetime().format(timeFormatter)
            );
            Message.creator(
                    new PhoneNumber("whatsapp:" + client.getPhone()),
                    new PhoneNumber(fromNumber),
                    message
            ).create();
        } catch (Exception e) {
            log.error("Error enviando cancelación WhatsApp booking {}: {}",
                    booking.getId(), e.getMessage());
        }
    }

    public void sendAbsentNotification(Booking booking) {
        try {
            SystemConfig config = systemConfigRepository.findById(1)
                    .orElseThrow(() -> new RuntimeException("Config no encontrada"));
            User client = booking.getClient();
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            String message = String.format("""
                ¡Hola %s!
                
                Notamos que no te presentaste a tu turno en *%s*:
                
                 *Espacio:* %s
                 *Fecha:* %s
                 *Horario:* %s a %s
                
                 La seña abonada no es reembolsable por ausencia.
                
                Si creés que es un error, no dudes en comunicarte con nosotros.
                """,
                    client.getName(),
                    config.getSportsComplexName(),
                    booking.getSpace().getName(),
                    booking.getStartDatetime().format(dateFormatter),
                    booking.getStartDatetime().format(timeFormatter),
                    booking.getEndDatetime().format(timeFormatter)
            );

            Message.creator(
                    new PhoneNumber("whatsapp:" + client.getPhone()),
                    new PhoneNumber(fromNumber),
                    message
            ).create();

        } catch (Exception e) {
            log.error("Error enviando ausente WhatsApp booking {}: {}",
                    booking.getId(), e.getMessage());
        }
    }
}