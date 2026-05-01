package hoyjugas.Controller;

import hoyjugas.Config.UserDetailsImpl;
import hoyjugas.DTO.Booking.CancelBookingRequestDTO;
import hoyjugas.DTO.RecurringBooking.CancelRecurringCycleRequestDTO;
import hoyjugas.DTO.RecurringBooking.RecurringBookingRequestDTO;
import hoyjugas.DTO.RecurringBooking.RecurringBookingResponseDTO;
import hoyjugas.DTO.RecurringBooking.RecurringCancelResponseDTO;
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

@RestController
@RequestMapping("/recurring-bookings")
@RequiredArgsConstructor
public class RecurringBookingController {

    private final RecurringBookingService recurringBookingService;
    private final UserService userService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RecurringBookingResponseDTO> createRecurringBooking(@Valid @RequestBody RecurringBookingRequestDTO dto) {      User employee = null;
        if (dto.getEmployeePin() != null) {
            employee = userService.validateEmployeePin(dto.getEmployeePin());
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recurringBookingService.createRecurringBooking(dto, employee));
    }

    @PostMapping("/cancel-one")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RecurringCancelResponseDTO> cancelOneBooking(@Valid @RequestBody CancelBookingRequestDTO dto) {
        User employee = null;
        if (dto.getEmployeePin() != null) {
            employee = userService.validateEmployeePin(dto.getEmployeePin());
        }
        return ResponseEntity.ok(recurringBookingService.cancelOneBooking(dto.getBookingId(), dto, employee));
    }

    @PostMapping("/cancel-cycle")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> cancelRecurringCycle(@Valid @RequestBody CancelRecurringCycleRequestDTO dto,@AuthenticationPrincipal UserDetailsImpl me) {
        recurringBookingService.cancelRecurringCycle(dto.getRecurringId(), dto.getCancellationReason(),me.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/client-history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<RecurringBookingResponseDTO>> getRecurringByClient(@Valid @RequestBody ClientIdRequestDTO dto,@AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(
                recurringBookingService.getRecurringByClient(dto.getClientId(), me.getId())
        );
    }
}