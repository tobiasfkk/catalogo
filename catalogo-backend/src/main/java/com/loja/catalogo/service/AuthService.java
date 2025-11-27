package com.loja.catalogo.service;

import com.loja.catalogo.dto.LoginRequest;
import com.loja.catalogo.dto.LoginResponse;
import com.loja.catalogo.entity.User;
import com.loja.catalogo.repository.UserRepository;
import com.loja.catalogo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Serviço de autenticação
 * Responsável por fazer login e gerar tokens
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Faz login do usuário
     * @param loginRequest Email e senha
     * @return Token JWT e informações do usuário
     */
    public LoginResponse login(LoginRequest loginRequest) {
        // 1. Busca o usuário pelo email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou senha incorretos"));

        // 2. Verifica se a senha está correta (comparação simples, sem criptografia)
        if (!user.getSenha().equals(loginRequest.getSenha())) {
            throw new RuntimeException("Email ou senha incorretos");
        }

        // 3. Gera o token JWT
        String token = jwtUtil.generateToken(user.getEmail(), user.getPerfil().name());

        // 4. Retorna o token e informações do usuário
        return new LoginResponse(
                token,
                user.getEmail(),
                user.getNome(),
                user.getPerfil().name()
        );
    }
}

