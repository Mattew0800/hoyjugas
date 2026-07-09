package hoyjugas.DTO.RecurringBooking;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecurringCancelResponseDTO {

    private Long bookingId;
    private Boolean fullCycleCancelled;
    private Integer currentCancellations;
    private Integer maxCancellations;
    private String message;

    public RecurringCancelResponseDTO(Long bookingId, Boolean fullCycleCancelled,
                                      Integer currentCancellations, Integer maxCancellations) {
        this.bookingId = bookingId;
        this.fullCycleCancelled = fullCycleCancelled;
        this.currentCancellations = currentCancellations;
        this.maxCancellations = maxCancellations;
        this.message = fullCycleCancelled
                ? "Se superó el límite de cancelaciones. El ciclo fue cancelado automáticamente."
                : String.format("Turno cancelado. Cancelaciones: %d/%d",
                currentCancellations, maxCancellations);
    }
}
