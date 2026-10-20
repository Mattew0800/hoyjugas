package hoyjugas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HoyJugas {
	public static void main(String[] args) {
		SpringApplication.run(HoyJugas.class, args);
	}

}
