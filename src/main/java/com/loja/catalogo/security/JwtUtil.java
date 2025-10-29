package com.loja.catalogo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Classe utilitária para gerar e validar tokens JWT
 *
 * Pense nesta classe como uma "máquina de criar ingressos":
 * - Cria ingressos (tokens) com informações do usuário
 * - Valida se o ingresso é válido
 * - Extrai informações do ingresso
 */
@Component
public class JwtUtil {

    // Chave secreta para assinar os tokens (como uma senha mestra)
    private final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // Token expira em 24 horas (86400000 milissegundos)
    private final long EXPIRATION_TIME = 86400000;

    /**
     * Gera um token JWT para um usuário
     * @param email Email do usuário
     * @param perfil Perfil do usuário (ADMIN ou CLIENTE)
     * @return Token JWT em formato String
     */
    public String generateToken(String email, String perfil) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("perfil", perfil);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email) // Email é o "dono" do token
                .setIssuedAt(new Date()) // Data de criação
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // Data de expiração
                .signWith(SECRET_KEY) // Assina com a chave secreta
                .compact();
    }

    /**
     * Extrai o email do usuário do token
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extrai o perfil do usuário do token
     */
    public String extractPerfil(String token) {
        return extractAllClaims(token).get("perfil", String.class);
    }

    /**
     * Valida se o token é válido (não expirou e o email confere)
     */
    public boolean validateToken(String token, String email) {
        final String tokenEmail = extractEmail(token);
        return (tokenEmail.equals(email) && !isTokenExpired(token));
    }

    /**
     * Verifica se o token expirou
     */
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    /**
     * Extrai todas as informações do token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

