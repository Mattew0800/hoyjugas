package hoyjugas.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(name = "product")
@Getter @Setter @NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String internalCode;

    @Column(length = 50)
    private String barcode;

    @Column(nullable = false)
    private String name;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal salePrice;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Integer minimumStock;

    @Column(nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Transient
    public BigDecimal getProfit() {
        if (cost == null || salePrice == null) return BigDecimal.ZERO;
        return salePrice.subtract(cost);
    }

    @Transient
    public BigDecimal getProfitPercentage() {
        if (cost == null || cost.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return getProfit().divide(cost, 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}