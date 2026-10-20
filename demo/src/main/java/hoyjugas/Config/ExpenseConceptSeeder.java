package hoyjugas.Config;

import hoyjugas.Model.ExpenseConcept;
import hoyjugas.Repository.ExpenseConceptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ExpenseConceptSeeder implements CommandLineRunner {

    private final ExpenseConceptRepository expenseConceptRepository;

    private static final List<String> DEFAULT_CONCEPTS = List.of(
            "Mercaderia",
            "Extra",
            "Adelanto de sueldo",
            "Arreglo de canchas",
            "Mantenimiento",
            "Servicios"
    );

    @Override
    public void run(String... args) {
        for (String name : DEFAULT_CONCEPTS) {
            if (!expenseConceptRepository.existsByNameIgnoreCase(name)) {
                ExpenseConcept concept = new ExpenseConcept();
                concept.setName(name);
                concept.setIsExtra(name.equals("Extra"));
                expenseConceptRepository.save(concept);
            }
        }
    }
}