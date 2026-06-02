package hoyjugas.Service;

import hoyjugas.DTO.User.EmployeeCreatedDTO;
import hoyjugas.DTO.User.LoginRequestDTO;
import hoyjugas.DTO.User.LoginResponseDTO;
import hoyjugas.DTO.User.RegisterRequestDTO;
import hoyjugas.Enum.Role;
import hoyjugas.Model.User;
import hoyjugas.Repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final Key key;
    private final long jwtExpirationMs;

    public AuthService(UserRepository userRepository, Key key, BCryptPasswordEncoder passwordEncoder, @Value("${jwt.expiration}") long jwtExpirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.key = key;
        this.jwtExpirationMs = jwtExpirationMs;
    }

    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Correo o contraseña incorrectos"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Correo o contraseña incorrectos");
        }
        String token = generateToken(user);
        return new LoginResponseDTO(token, user.getEmail(), user.getName());
    }

    @Transactional
    public LoginResponseDTO registerUser(RegisterRequestDTO request) {
        User user = createUser(request, Role.USER, false, null);
        String token = generateToken(user);
        return new LoginResponseDTO(token, user.getEmail(), user.getName());
    }

    @Transactional
    public EmployeeCreatedDTO registerEmployee(RegisterRequestDTO request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            return promoteToEmployee(existingUser.get().getEmail());
        }
        String rawPin = generateRawPin();
        User user = createUser(request, Role.EMPLOYEE, true, rawPin);
        return new EmployeeCreatedDTO(user, rawPin);
    }

    @Transactional
    public EmployeeCreatedDTO promoteToEmployee(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email no encontrado"));
        if (user.getRole() == Role.EMPLOYEE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El usuario ya es empleado");
        }
        String rawPin = generateRawPin();
        user.setRole(Role.EMPLOYEE);
        user.setPin(passwordEncoder.encode(rawPin));
        User savedUser = userRepository.save(user);
        return new EmployeeCreatedDTO(savedUser, rawPin);
    }

    @Transactional
    public LoginResponseDTO registerAdmin(RegisterRequestDTO request) {
        User user = createUser(request, Role.ADMIN, false, null);
        return new LoginResponseDTO(null, user.getEmail(), user.getName());
    }

    private User createUser(RegisterRequestDTO request, Role role, boolean hasPin, String rawPin) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese mail ya pertenece a una cuenta");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese telefono ya pertenece a una cuenta");
        }
        if (userRepository.existsByDni(request.getDni())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese DNI ya pertenece a una cuenta");
        }
        User user = User.fromRegisterDTO(request, passwordEncoder);
        user.setEnabled(true);
        user.setRole(role);
        if (hasPin && rawPin != null) {
            user.setPin(passwordEncoder.encode(rawPin));
        }
        return userRepository.save(user);
    }

    private String generateRawPin() {
        return String.format("%04d", new Random().nextInt(10000));
    }

    public String generateToken(User user) {
        var tokenBuilder = Jwts.builder()
                .setSubject(user.getEmail())
                .claim("name", user.getName())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .signWith(key, SignatureAlgorithm.HS512);
        if (jwtExpirationMs > 0) {
            tokenBuilder.setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs));
        }
        return tokenBuilder.compact();
    }
}