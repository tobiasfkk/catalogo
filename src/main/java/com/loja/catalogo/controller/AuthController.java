package com.loja.catalogo.controller;

import com.loja.catalogo.dto.LoginRequest;
import com.loja.catalogo.dto.LoginResponse;
import com.loja.catalogo.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para autenticação (login)
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Endpoint de login
     * POST /auth/login
     * Body: { "email": "admin@loja.com", "senha": "Admin@123" }
     * Retorna: { "token": "eyJhbGci...", "email": "admin@loja.com", "nome": "Administrador", "perfil": "ADMIN" }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
}

