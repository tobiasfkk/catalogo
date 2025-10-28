package com.loja.catalogo.controller;

import com.loja.catalogo.dto.LoginRequest;
import com.loja.catalogo.dto.LoginResponse;
import com.loja.catalogo.dto.SignupRequest;
import com.loja.catalogo.entity.Profile;
import com.loja.catalogo.entity.User;
import com.loja.catalogo.repository.UserRepository;
import com.loja.catalogo.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciais inválidas");
            }

            User user = userOpt.get();

            // Verifica senha
            if (!passwordEncoder.matches(loginRequest.getSenha(), user.getSenha())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciais inválidas");
            }

            // Gera token JWT
            String token = jwtService.generateToken(user.getEmail(), user.getPerfil().name());

            LoginResponse response = new LoginResponse(token, user.getEmail(), user.getPerfil().name());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erro interno do servidor");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        try {
            // Verifica se email já existe
            if (userRepository.existsByEmail(signupRequest.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email já cadastrado");
            }

            // Cria novo usuário (sempre como CLIENTE)
            User user = User.builder()
                .nome(signupRequest.getNome())
                .email(signupRequest.getEmail())
                .senha(passwordEncoder.encode(signupRequest.getSenha()))
                .perfil(Profile.CLIENTE) // Novos usuários sempre são CLIENTE
                .build();

            userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED)
                .body("Usuário cadastrado com sucesso");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erro interno do servidor");
        }
    }
}
