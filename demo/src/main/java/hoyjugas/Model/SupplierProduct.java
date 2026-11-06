package hoyjugas.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="supplier_product")
public class SupplierProduct {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private Supplier supplier;

    @ManyToOne
    private Product product;

    private BigDecimal defaultDiscount;
}