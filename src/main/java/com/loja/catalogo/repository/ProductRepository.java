package com.loja.catalogo.repository;

import com.loja.catalogo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByAtivoTrue();
    List<Product> findByAtivoFalse();
    List<Product>findByNomeAndAtivoTrue(String nome);

    @Query(value="select p from Product p where p.ativo = true and p.preco between :minPrice and :maxPrice")
    List<Product> findByPrecoBetween(
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice
    );
}
