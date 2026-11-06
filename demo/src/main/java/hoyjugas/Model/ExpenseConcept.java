package hoyjugas.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "expense_concept")
@Getter @Setter @NoArgsConstructor
public class ExpenseConcept {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Boolean isExtra = false;

    @Column(nullable = false)
    private Boolean isActive = true;
}