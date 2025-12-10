package com.loja.catalogo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filtro que intercepta todas as requisições para verificar o token JWT
 *
 * Pense neste filtro como um "porteiro":
 * - Verifica se a pessoa tem um ingresso (token)
 * - Valida se o ingresso é válido
 * - Libera ou bloqueia o acesso
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Pega o token do cabeçalho "Authorization"
        final String authHeader = request.getHeader("Authorization");

        String email = null;
        String token = null;

        // 2. Verifica se o cabeçalho começa com "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remove "Bearer " e pega só o token
            try {
                email = jwtUtil.extractEmail(token);
            } catch (Exception e) {
                // Token inválido ou expirado
                System.out.println("Token inválido: " + e.getMessage());
            }
        }

        // 3. Se tem email válido e não está autenticado ainda
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Valida o token
            if (jwtUtil.validateToken(token, email)) {
                String perfil = jwtUtil.extractPerfil(token);

                // Cria a autenticação com o perfil do usuário (sem prefixo ROLE_)
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority(perfil))
                    );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Marca o usuário como autenticado
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // 4. Continua a requisição
        filterChain.doFilter(request, response);
    }
}

