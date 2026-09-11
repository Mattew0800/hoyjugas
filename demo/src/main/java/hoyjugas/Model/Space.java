package hoyjugas.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "space")
@Getter
@Setter
@NoArgsConstructor
public class Space {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false,length = 100)
    private String type;

    @Column(nullable = false)
    private Integer slotDuration;//duracion del intervalo del espacio (o sea cuanto dura cada turno)

    @Column(nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "space", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<SpacePricing> pricings = new ArrayList<>();
    
    @Column(precision = 10, scale = 2,nullable = false)
    private BigDecimal depositValue;//monto de seña

    @Column(length=500)
    private String photoUrl;
}

