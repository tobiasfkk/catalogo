import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WebsocketService, ProductEvent } from '../websocket.service';
import { Subscription } from 'rxjs';

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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="products-container">
      <header class="products-header">
        <h1>Catálogo de Produtos</h1>
        <div class="user-info">
          <button *ngIf="isAdmin" class="btn-add" (click)="openProductModal()">+ Adicionar Produto</button>
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
              <div *ngIf="isAdmin" class="product-actions">
                <button class="btn-edit" (click)="editProduct(product)">Editar</button>
                <button class="btn-delete" (click)="deleteProduct(product.id)">Excluir</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && !errorMessage && products.length === 0" class="empty-state">
          <p>Nenhum produto encontrado.</p>
        </div>
      </div>

      <!-- Modal de Produto -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Editar Produto' : 'Novo Produto' }}</h2>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          <form (ngSubmit)="saveProduct()" #productForm="ngForm">
            <div class="form-group">
              <label for="nome">Nome *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                [(ngModel)]="currentProduct.nome"
                required
                maxlength="100"
                #nome="ngModel"
                class="form-control"
              />
              <span *ngIf="nome.invalid && nome.touched" class="error-message">
                Nome é obrigatório (máx. 100 caracteres)
              </span>
            </div>

            <div class="form-group">
              <label for="descricao">Descrição *</label>
              <textarea
                id="descricao"
                name="descricao"
                [(ngModel)]="currentProduct.descricao"
                required
                maxlength="500"
                rows="4"
                #descricao="ngModel"
                class="form-control"
              ></textarea>
              <span *ngIf="descricao.invalid && descricao.touched" class="error-message">
                Descrição é obrigatória (máx. 500 caracteres)
              </span>
            </div>

            <div class="form-group">
              <label for="preco">Preço (R$) *</label>
              <input
                type="number"
                id="preco"
                name="preco"
                [(ngModel)]="currentProduct.preco"
                required
                min="0.01"
                step="0.01"
                #preco="ngModel"
                class="form-control"
              />
              <span *ngIf="preco.invalid && preco.touched" class="error-message">
                Preço deve ser maior que zero
              </span>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="ativo"
                  [(ngModel)]="currentProduct.ativo"
                />
                Produto ativo
              </label>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn-save" [disabled]="!productForm.form.valid">
                {{ isEditMode ? 'Salvar Alterações' : 'Criar Produto' }}
              </button>
            </div>
          </form>
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

    .btn-add {
      padding: 0.5rem 1rem;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-add:hover {
      background-color: #218838;
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

    .product-actions {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
    }

    .btn-edit,
    .btn-delete {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-edit {
      background-color: #007bff;
      color: white;
    }

    .btn-edit:hover {
      background-color: #0056b3;
    }

    .btn-delete {
      background-color: #dc3545;
      color: white;
    }

    .btn-delete:hover {
      background-color: #c82333;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .btn-close:hover {
      background-color: #f1f1f1;
    }

    form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .form-control:invalid:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      margin: 0;
      cursor: pointer;
    }

    .checkbox-group input[type="checkbox"] {
      margin-right: 0.5rem;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .error-message {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }

    .btn-cancel,
    .btn-save {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel {
      background-color: #6c757d;
      color: white;
    }

    .btn-cancel:hover {
      background-color: #5a6268;
    }

    .btn-save {
      background-color: #28a745;
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      background-color: #218838;
    }

    .btn-save:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
    }
  `]
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading = true;
  errorMessage = '';
  userName = '';
  isAdmin = false;
  showModal = false;
  isEditMode = false;
  currentProduct: Product = this.getEmptyProduct();
  private wsSubscription?: Subscription;

  constructor(
    private router: Router,
    private websocketService: WebsocketService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.checkAdminRole();
    this.loadProducts();
    this.connectWebSocket();
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  connectWebSocket() {
    this.websocketService.connect();
    
    this.wsSubscription = this.websocketService.productEvents$.subscribe((event: ProductEvent) => {
      switch (event.type) {
        case 'created':
          // Adiciona novo produto se ele estiver ativo
          if (event.data.ativo) {
            this.products.unshift(event.data);
            console.log('Produto adicionado automaticamente!');
          }
          break;
          
        case 'updated':
          // Atualiza produto existente
          const updateIndex = this.products.findIndex(p => p.id === event.data.id);
          if (updateIndex !== -1) {
            this.products[updateIndex] = event.data;
            console.log('Produto atualizado automaticamente!');
          }
          break;
          
        case 'deleted':
          // Remove produto da lista
          this.products = this.products.filter(p => p.id !== event.data);
          console.log('Produto removido automaticamente!');
          break;
      }
    });
  }

  loadUserInfo() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.nome || user.email;
    }
  }

  checkAdminRole() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT Payload:', payload);
        console.log('Roles no payload:', payload.roles);
        this.isAdmin = payload.roles?.includes('ADMIN') || false;
        console.log('isAdmin definido como:', this.isAdmin);
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        this.isAdmin = false;
      }
    }
  }

  getEmptyProduct(): Product {
    return {
      id: 0,
      nome: '',
      descricao: '',
      preco: 0,
      ativo: true
    };
  }

  openProductModal() {
    this.isEditMode = false;
    this.currentProduct = this.getEmptyProduct();
    this.showModal = true;
  }

  editProduct(product: Product) {
    this.isEditMode = true;
    this.currentProduct = { ...product };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentProduct = this.getEmptyProduct();
  }

  async saveProduct() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const url = this.isEditMode 
        ? `http://localhost:8081/products/${this.currentProduct.id}`
        : 'http://localhost:8081/products';
      
      const method = this.isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.currentProduct)
      });

      if (response.ok) {
        this.closeModal();
        // WebSocket irá atualizar a lista automaticamente
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      } else {
        const error = await response.text();
        alert(`Erro ao salvar produto: ${error}`);
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro de conexão ao salvar produto');
    }
  }

  async deleteProduct(id: number) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // WebSocket irá atualizar a lista automaticamente
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      } else {
        alert('Erro ao excluir produto');
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro de conexão ao excluir produto');
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