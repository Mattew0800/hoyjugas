package hoyjugas.Controller;

import hoyjugas.Config.UserDetailsImpl;
import hoyjugas.DTO.Booking.BookingResponseDTO;
import hoyjugas.DTO.Booking.CancelBookingRequestDTO;
import hoyjugas.DTO.Booking.RescheduleBookingRequestDTO;
import hoyjugas.DTO.RecurringBooking.*;
import hoyjugas.DTO.User.ClientIdRequestDTO;
import hoyjugas.Model.User;
import hoyjugas.Service.RecurringBookingService;
import hoyjugas.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recurring-bookings")
@RequiredArgsConstructor
public class RecurringBookingController {

    private final RecurringBookingService recurringBookingService;
    private final UserService userService;

    @PostMapping("/preview")//llamar a esto primero para ver como quedaria la reserva por si hay algun turno que se cruza, luego llamar a create para concretar
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<RecurringBookingPreviewDTO> previewRecurringBooking(
            @Valid @RequestBody RecurringBookingRequestDTO dto) {
        return ResponseEntity.ok(recurringBookingService.previewRecurringBooking(dto));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<RecurringBookingResponseDTO> createRecurringBooking(@Valid @RequestBody RecurringBookingRequestDTO dto) {
        User employee = userService.validateEmployeePin(dto.getEmployeePin());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recurringBookingService.createRecurringBooking(dto, employee));
    }

    @PostMapping("/cancel-one")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<RecurringCancelResponseDTO> cancelOneBooking(@Valid @RequestBody CancelBookingRequestDTO dto) {
           User employee = userService.validateEmployeePin(dto.getEmployeePin());
        return ResponseEntity.ok(recurringBookingService.cancelOneBooking(dto.getBookingId(), dto, employee));
    }

    @PostMapping("/cancel-cycle")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> cancelRecurringCycle(@Valid @RequestBody CancelRecurringCycleRequestDTO dto,@AuthenticationPrincipal UserDetailsImpl me) {
        User employee = userService.validateEmployeePin(dto.getEmployeePin());
        recurringBookingService.cancelRecurringCycle(dto.getRecurringId(), dto.getCancellationReason(),me.getId(), employee);
        return ResponseEntity.ok(Map.of("message", "Ciclo cancelado correctamente"));
    }

    @PostMapping("/client-history")//agregar filtrado
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<RecurringBookingResponseDTO>> getRecurringByClient(@Valid @RequestBody ClientIdRequestDTO dto,@AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(
                recurringBookingService.getRecurringByClient(dto.getClientId(), me.getId())
        );
    }

    @PostMapping("/my-recurring")
    @PreAuthorize("hasRole('USER')")// agregar filtrado
    public ResponseEntity<List<RecurringBookingResponseDTO>> getMyRecurring(@AuthenticationPrincipal UserDetailsImpl me) {   return ResponseEntity.ok(
                recurringBookingService.getRecurringByClient(me.getId(), me.getId())
        );
    }
}