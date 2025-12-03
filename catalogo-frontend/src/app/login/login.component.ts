import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface LoginRequest {
  email: string;
  senha: string;
}

interface LoginResponse {
  token: string;
  email: string;
  nome: string;
  perfil: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Catálogo - Login</h2>
        
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              type="email" 
              id="email"
              name="email"
              [(ngModel)]="loginData.email" 
              required 
              class="form-control"
              placeholder="admin@loja.com">
          </div>

          <div class="form-group">
            <label for="senha">Senha:</label>
            <input 
              type="password" 
              id="senha"
              name="senha"
              [(ngModel)]="loginData.senha" 
              required 
              class="form-control"
              placeholder="admin123">
          </div>

          <button 
            type="submit" 
            class="btn-primary"
            [disabled]="!loginForm.form.valid || isLoading">
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Credenciais para teste -->
        <div class="test-credentials">
          <h4>Credenciais de Teste:</h4>
          <p><strong>Admin:</strong> admin@loja.com / admin123</p>
          <p><strong>Cliente:</strong> cliente@loja.com / cliente123</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #555;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-primary:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 0.75rem;
      border-radius: 4px;
      margin-top: 1rem;
      border: 1px solid #f5c6cb;
    }

    .test-credentials {
      margin-top: 2rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
      border: 1px solid #dee2e6;
    }

    .test-credentials h4 {
      margin: 0 0 0.5rem 0;
      color: #495057;
      font-size: 0.9rem;
    }

    .test-credentials p {
      margin: 0.25rem 0;
      font-size: 0.8rem;
      color: #6c757d;
    }
  `]
})
export class LoginComponent {
  loginData: LoginRequest = {
    email: '',
    senha: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(private router: Router) {}

  async onLogin() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.loginData)
      });

      if (response.ok) {
        const loginResponse: LoginResponse = await response.json();
        
        // Salvar token no localStorage
        localStorage.setItem('token', loginResponse.token);
        localStorage.setItem('user', JSON.stringify({
          email: loginResponse.email,
          nome: loginResponse.nome,
          perfil: loginResponse.perfil
        }));

        console.log('Login realizado com sucesso:', loginResponse);
        
        // Redirecionar para página principal (vamos criar depois)
        alert(`Login realizado com sucesso! Bem-vindo, ${loginResponse.nome}!`);
        
      } else {
        const error = await response.text();
        this.errorMessage = 'Email ou senha incorretos';
        console.error('Erro de login:', error);
      }
    } catch (error) {
      this.errorMessage = 'Erro de conexão. Verifique se o backend está rodando.';
      console.error('Erro de conexão:', error);
    } finally {
      this.isLoading = false;
    }
  }
}