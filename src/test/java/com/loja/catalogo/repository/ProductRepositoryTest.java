package com.loja.catalogo.repository;

import com.loja.catalogo.entity.Product;
import org.junit.jupiter.api.BeforeEach;
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

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
    }

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

    @Test
    void shouldFindProductsByPriceRange() {
        // Arrange - criar produtos com preços diferentes
        Product product1 = Product.builder()
                .nome("Produto Barato")
                .descricao("Produto dentro da faixa")
                .preco(25.0)
                .ativo(true)
                .build();

        Product product2 = Product.builder()
                .nome("Produto Médio")
                .descricao("Produto dentro da faixa")
                .preco(45.0)
                .ativo(true)
                .build();

        Product product3 = Product.builder()
                .nome("Produto Caro")
                .descricao("Produto fora da faixa")
                .preco(80.0)
                .ativo(true)
                .build();

        Product product4 = Product.builder()
                .nome("Produto Inativo")
                .descricao("Produto inativo")
                .preco(30.0)
                .ativo(false)
                .build();

        productRepository.save(product1);
        productRepository.save(product2);
        productRepository.save(product3);
        productRepository.save(product4);

        // Act - buscar produtos entre 20 e 50
        var productsInRange = productRepository.findByPrecoBetween(20.0, 50.0);

        // Assert - deve retornar apenas os produtos ativos na faixa de preço
        assertThat(productsInRange).hasSize(2);
        assertThat(productsInRange).extracting(Product::getNome)
                .containsExactlyInAnyOrder("Produto Barato", "Produto Médio");
        assertThat(productsInRange).allMatch(Product::getAtivo);
    }

}
