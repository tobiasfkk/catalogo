package com.loja.catalogo.repository;

import com.loja.catalogo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByAtivoTrue();
    List<Product> findByAtivoFalse();
    List<Product>findByNomeAndAtivoTrue(String nome);
}
