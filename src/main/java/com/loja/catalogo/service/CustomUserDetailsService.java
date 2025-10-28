package com.loja.catalogo.service;

import com.loja.catalogo.entity.User;
import com.loja.catalogo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        String role = "ROLE_" + user.getPerfil().name(); // "ROLE_ADMIN" ou "ROLE_CLIENTE"

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getSenha())
            .authorities(role)
            .build();
    }
}