package hoyjugas.Controller;

import hoyjugas.Config.UserDetailsImpl;
import hoyjugas.DTO.Booking.CancelBookingRequestDTO;
import hoyjugas.DTO.RecurringBooking.*;
import hoyjugas.Model.User;
import hoyjugas.Service.RecurringBookingService;
import hoyjugas.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
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
        User employee = userService.validateStaffPin(dto.getEmployeePin());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recurringBookingService.createRecurringBooking(dto, employee));
    }

    @PostMapping("/cancel-one")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<RecurringCancelResponseDTO> cancelOneBooking(@Valid @RequestBody CancelBookingRequestDTO dto) {
        User employee = userService.validateStaffPin(dto.getEmployeePin());
        return ResponseEntity.ok(recurringBookingService.cancelOneBooking(dto.getBookingId(), dto, employee));
    }

    @PostMapping("/cancel-cycle")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> cancelRecurringCycle(@Valid @RequestBody CancelRecurringCycleRequestDTO dto, @AuthenticationPrincipal UserDetailsImpl me) {
        User employee = userService.validateStaffPin(dto.getEmployeePin());
        recurringBookingService.cancelRecurringCycle(dto.getRecurringId(), dto.getCancellationReason(), me.getId(), employee);
        return ResponseEntity.ok(Map.of("message", "Ciclo cancelado correctamente"));
    }

    @PostMapping("/client-history")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<Page<RecurringBookingResponseDTO>> getRecurringByClient(@Valid @RequestBody RecurringBookingFilterRequestDTO dto, @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(recurringBookingService.getRecurringByClient(me.getId(), dto));
    }

    @PostMapping("/my-recurring")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<RecurringBookingResponseDTO>> getMyRecurring(@Valid @RequestBody RecurringBookingFilterRequestDTO dto, @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(recurringBookingService.getRecurringByClient(me.getId(), dto));
    }

    @PostMapping("/detail")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RecurringBookingDetailDTO> getRecurringBookingDetail(@Valid @RequestBody RecurringBookingDetailRequestDTO dto, @AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(recurringBookingService.getRecurringBookingByBookingId(dto.getRecurringBookingId(), me.getId(), me.getRole()));
    }

    @PostMapping("/get-future")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<RecurringBookingResponseDTO>> getFutureRecurringBookings(@RequestBody(required = false) FutureRecurringFilterDTO dto, @AuthenticationPrincipal UserDetailsImpl me) {
        Long targetClientId = (dto != null) ? dto.getClientId() : null;
        return ResponseEntity.ok(recurringBookingService.getFutureRecurringBookings(me.getId(), me.getRole(), targetClientId));
    }

    @PostMapping("/detail-by-id")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RecurringBookingDetailDTO> getRecurringDetailById(@Valid @RequestBody RecurringBookingIdRequestDTO dto,@AuthenticationPrincipal UserDetailsImpl me) {
        return ResponseEntity.ok(recurringBookingService.getRecurringBookingById(dto.getRecurringBookingId(),me.getId(),me.getRole()));
    }
}