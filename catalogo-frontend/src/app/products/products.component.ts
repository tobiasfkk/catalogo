import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="products-container">
      <header class="products-header">
        <h1>Catálogo de Produtos</h1>
        <div class="user-info">
          <span>Bem-vindo, {{ userName }}!</span>
          <button class="btn-logout" (click)="logout()">Sair</button>
        </div>
      </header>

      <div class="products-content">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading">
          <p>Carregando produtos...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Products List -->
        <div *ngIf="!isLoading && !errorMessage" class="products-grid">
          <div 
            *ngFor="let product of products" 
            class="product-card"
            [class.inactive]="!product.ativo">
            
            <div class="product-info">
              <h3>{{ product.nome }}</h3>
              <p class="product-description">{{ product.descricao }}</p>
              <div class="product-footer">
                <span class="product-price">R$ {{ product.preco | number:'1.2-2' }}</span>
                <span 
                  class="product-status"
                  [class.active]="product.ativo"
                  [class.inactive]="!product.ativo">
                  {{ product.ativo ? 'Disponível' : 'Indisponível' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && !errorMessage && products.length === 0" class="empty-state">
          <p>Nenhum produto encontrado.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .products-header {
      background: white;
      padding: 1rem 2rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .products-header h1 {
      color: #333;
      margin: 0;
      font-size: 1.8rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info span {
      color: #666;
      font-weight: 500;
    }

    .btn-logout {
      padding: 0.5rem 1rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }

    .btn-logout:hover {
      background-color: #c82333;
    }

    .products-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .loading, .error-message, .empty-state {
      text-align: center;
      padding: 3rem;
      font-size: 1.1rem;
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .product-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .product-card.inactive {
      opacity: 0.6;
    }

    .product-info {
      padding: 1.5rem;
    }

    .product-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.2rem;
    }

    .product-description {
      color: #666;
      margin: 0 0 1rem 0;
      line-height: 1.5;
      font-size: 0.9rem;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-price {
      font-size: 1.3rem;
      font-weight: bold;
      color: #28a745;
    }

    .product-status {
      padding: 0.3rem 0.8rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .product-status.active {
      background-color: #d4edda;
      color: #155724;
    }

    .product-status.inactive {
      background-color: #f8d7da;
      color: #721c24;
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;
  errorMessage = '';
  userName = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadProducts();
  }

  loadUserInfo() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.nome || user.email;
    }
  }

  async loadProducts() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      const token = localStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      const response = await fetch('http://localhost:8081/products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.products = await response.json();
      } else if (response.status === 401) {
        // Token expirado
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'Erro ao carregar produtos. Tente novamente.';
      }
    } catch (error) {
      this.errorMessage = 'Erro de conexão. Verifique se o backend está rodando.';
      console.error('Erro ao carregar produtos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}