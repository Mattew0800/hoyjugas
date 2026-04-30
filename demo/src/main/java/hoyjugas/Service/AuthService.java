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
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final Key key;
    private final long jwtExpirationMs;

    public AuthService(UserRepository userRepository,
                       @Value("${jwt.secret}") String jwtSecret,
                       @Value("${jwt.expiration}") long jwtExpirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
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
        return createWithRole(request, Role.EMPLOYEE, true, false);
    }

    @Transactional
    public EmployeeCreatedDTO registerEmployee(RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return promoteToEmployee(request.getEmail());
        }
        String rawPin = generateRawPin();
        LoginResponseDTO loginResponse = createWithRole(request, Role.EMPLOYEE, false, true, rawPin);
        return new EmployeeCreatedDTO(loginResponse, rawPin);
    }

    @Transactional
    public EmployeeCreatedDTO promoteToEmployee(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email no encontrado"));
        String rawPin = generateRawPin();
        user.setRole(Role.EMPLOYEE);
        user.setPin(passwordEncoder.encode(rawPin));
        userRepository.save(user);
        return new EmployeeCreatedDTO(user, rawPin);
    }

    @Transactional
    public LoginResponseDTO registerAdmin(RegisterRequestDTO request) {
        return createWithRole(request, Role.ADMIN, false, false);
    }

    private LoginResponseDTO createWithRole(RegisterRequestDTO request, Role role, boolean autoLogin, boolean hasPin, String... rawPin) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese mail ya pertenece a una cuenta, por favor inicia sesión");
        }
        User user = User.fromRegisterDTO(request, passwordEncoder);
        user.setEnabled(true);
        user.setRole(role);
        if (hasPin && rawPin.length > 0) {
            user.setPin(passwordEncoder.encode(rawPin[0]));
        }
        User savedUser = userRepository.save(user);
        if (autoLogin) {
            String token = generateToken(savedUser);
            return new LoginResponseDTO(token, savedUser.getEmail(), savedUser.getName());
        } else {
            return new LoginResponseDTO(null, savedUser.getEmail(), savedUser.getName());
        }
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
