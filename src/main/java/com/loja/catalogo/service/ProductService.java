package com.loja.catalogo.service;

import com.loja.catalogo.entity.Product;
import com.loja.catalogo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> findAllActiveProducts() {
        return productRepository.findByAtivoTrue();
    }

    public List<Product> findAllInactiveProducts() {
        return productRepository.findByAtivoFalse();
    }

    public List<Product> findByNome(String nome) {
        return productRepository.findByNomeAndAtivoTrue(nome);
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto com id " + id + " não encontrado."));
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public Product update(Long id, Product productDetails) {
        Product product = findById(id);
        product.setNome(productDetails.getNome());
        product.setDescricao(productDetails.getDescricao());
        product.setPreco(productDetails.getPreco());
        product.setAtivo(productDetails.getAtivo());
        return productRepository.save(product);
    }

    public void delete(Long id) {
        Product product = findById(id);
        product.setAtivo(false);
        productRepository.save(product);
    }

    public List<Product> findByPrecoBetween(Double minPrice, Double maxPrice) {
        return productRepository.findByPrecoBetween(minPrice, maxPrice);
    }
}
