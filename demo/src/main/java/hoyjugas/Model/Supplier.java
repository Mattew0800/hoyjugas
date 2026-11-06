package hoyjugas.Model;

import hoyjugas.Enum.AccountType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "supplier")
@Getter @Setter @NoArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String supplierNumber;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, unique = true, length = 13)
    private String cuit;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(length = 100)
    private String bank;

    @Column(length = 50)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    private AccountType accountType;

    private Integer paymentTermDays;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;      // rubro
}