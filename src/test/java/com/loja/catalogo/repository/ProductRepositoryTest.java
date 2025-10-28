package com.loja.catalogo.repository;

import com.loja.catalogo.entity.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Test
    void shouldSaveAndFindActiveProducts() {
        Product product = Product.builder()
                .nome("Camiseta Polo")
                .descricao("Camiseta confortável de algodão")
                .preco(79.90)
                .ativo(true)
                .build();

        productRepository.save(product);
        var activeProducts = productRepository.findByAtivoTrue();

        assertThat(activeProducts).hasSize(1);
        assertThat(activeProducts.get(0).getNome()).isEqualTo("Camiseta Polo");
    }
}
