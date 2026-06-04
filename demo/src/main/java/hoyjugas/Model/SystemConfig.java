package hoyjugas.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "system_config")
public class SystemConfig {

    @Id
    private Integer id=1;

    private Integer cancellationHoursLimit;

    private Integer reminderHoursBeforeBooking;

    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;

    private BigDecimal recurringDepositMultiplier;

    private int recurringInitialDepositTurns;
    
    private Integer maxRecurringCancellations;

    private String address;

    private String sportsComplexName;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal normalDepositFactor = new BigDecimal("0.30");//dsps sacar
}