package com.loja.catalogo.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String nome;
    private String email;
    private String senha;
}
