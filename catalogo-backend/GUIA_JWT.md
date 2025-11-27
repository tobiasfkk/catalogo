# 🔐 Guia Completo de JWT - Passo a Passo

## O que foi implementado?

Implementei um sistema de autenticação JWT (JSON Web Token) completo com:

### 📁 Arquivos Criados:

1. **JwtUtil.java** - Gera e valida tokens
2. **JwtAuthenticationFilter.java** - Intercepta requisições e verifica tokens
3. **AuthService.java** - Serviço de login
4. **AuthController.java** - Endpoint de login
5. **LoginRequest.java** - Recebe email e senha
6. **LoginResponse.java** - Retorna token e dados do usuário

---

## 🎯 Como Funciona (Analogia Simples):

### 1. **LOGIN = Comprar Ingresso**
- Você vai à bilheteria (endpoint /auth/login)
- Apresenta seus documentos (email e senha)
- Recebe um ingresso (token JWT) válido por 24 horas

### 2. **USAR O TOKEN = Mostrar o Ingresso**
- Cada vez que quer acessar algo protegido
- Mostra o ingresso no cabeçalho da requisição
- Se válido, pode entrar

### 3. **TOKEN EXPIRA = Ingresso vence**
- Após 24 horas, precisa fazer login novamente

---

## 📝 Como Testar no Postman

### **PASSO 1: Fazer Login (Obter o Token)**

**Endpoint:** POST `http://localhost:8080/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@loja.com",
  "senha": "Admin@123"
}
```

**Resposta Esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJwZXJmaWwiOiJBRE1JTiIsInN1YiI6ImFkbWluQGxvamEuY29tIiwiaWF0IjoxNjk4NTI...",
  "email": "admin@loja.com",
  "nome": "Administrador",
  "perfil": "ADMIN"
}
```

**⚠️ IMPORTANTE:** Copie o valor do `token` para usar nos próximos passos!

---

### **PASSO 2: Usar o Token em Requisições Protegidas**

Agora que tem o token, pode acessar endpoints protegidos.

#### **Exemplo 1: Listar Produtos Inativos (só ADMIN pode)**

**Endpoint:** GET `http://localhost:8080/products/inactive`

**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

**Como adicionar no Postman:**
1. Vá na aba "Headers"
2. Adicione:
   - **Key:** `Authorization`
   - **Value:** `Bearer eyJhbGciOiJIUzI1NiJ9...` (cole o token depois de "Bearer ")

**Resposta Esperada:**
```json
[
  {
    "id": 4,
    "nome": "Produto D",
    "descricao": "Descricao do Produto D",
    "preco": 15.0,
    "ativo": false
  }
]
```

#### **Exemplo 2: Criar um Produto (só ADMIN pode)**

**Endpoint:** POST `http://localhost:8080/products`

**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nome": "Produto Novo",
  "descricao": "Descrição do produto novo",
  "preco": 100.00,
  "ativo": true
}
```

---

### **PASSO 3: Testar com Usuário CLIENTE**

**Login como cliente:**

**Endpoint:** POST `http://localhost:8080/auth/login`

**Body:**
```json
{
  "email": "cliente@loja.com",
  "senha": "cliente123"
}
```

**Tentar acessar endpoint de ADMIN:**

GET `http://localhost:8080/products/inactive`

**Headers:**
```
Authorization: Bearer TOKEN_DO_CLIENTE
```

**Resposta Esperada:** ❌ 403 Forbidden (acesso negado)

---

## 🚫 Endpoints PÚBLICOS (não precisam de token):

```
GET  /products              - Lista produtos ativos
GET  /products/search?nome=Produto A - Busca por nome
GET  /products/1            - Busca por ID
POST /auth/login            - Login
```

## 🔒 Endpoints PROTEGIDOS (precisam de token ADMIN):

```
GET    /products/inactive  - Lista inativos
POST   /products           - Criar produto
PUT    /products/{id}      - Atualizar produto
DELETE /products/{id}      - Deletar produto
```

---

##  Resumo Visual

```
┌─────────────────┐
│   1. LOGIN      │  POST /auth/login
│   email + senha │  ──────────────────────┐
└─────────────────┘                         │
                                            ▼
                                   ┌────────────────┐
                                   │  Recebe TOKEN  │
                                   │  (ingresso)    │
                                   └────────────────┘
                                            │
                ┌───────────────────────────┴───────────────────────────┐
                │                                                       │
                ▼                                                       ▼
    ┌────────────────────────┐                           ┌────────────────────────┐
    │  2. USA TOKEN          │                           │  SEM TOKEN             │
    │  Authorization: Bearer │                           │  Endpoint Público      │
    │  [TOKEN]               │                           │  /products             │
    └────────────────────────┘                           └────────────────────────┘
                │                                                       │
                ▼                                                       ▼
    ┌────────────────────────┐                           ┌────────────────────────┐
    │  ✅ ACESSO LIBERADO    │                           │  ✅ ACESSO LIBERADO    │
    │  Endpoint Protegido    │                           │  Sem autenticação      │
    └────────────────────────┘                           └────────────────────────┘
```

---

## 🔧 Detalhes Técnicos (para entender o código):

### **JwtUtil.java:**
- Cria tokens com informações do usuário (email, perfil)
- Valida se o token é válido e não expirou
- Token expira em 24 horas

### **JwtAuthenticationFilter.java:**
- Intercepta TODAS as requisições
- Procura o token no header "Authorization"
- Se encontrar, valida e autentica o usuário
- Se não encontrar ou for inválido, continua (endpoints públicos funcionam)

### **SecurityConfig.java:**
- Define quais endpoints são públicos (`/auth/**`, `/products/**`)
- Adiciona o filtro JWT antes da autenticação padrão
- Desabilita CSRF (não precisa para API REST)

### **AuthService.java:**
- Busca usuário no banco pelo email
- Verifica se a senha está correta (BCrypt)
- Gera o token JWT
- Retorna o token e dados do usuário

---

## 🎓 Conceitos Importantes:

1. **JWT = JSON Web Token** - Um "ingresso digital" codificado
2. **Bearer Token** - Tipo de autenticação que usa tokens
3. **Header Authorization** - Onde enviamos o token nas requisições
4. **Expiration** - Token tem prazo de validade (24h)
5. **Claims** - Informações guardadas no token (email, perfil)
6. **Secret Key** - Chave secreta para assinar os tokens (garante segurança)

---

## 📦 Usuários Disponíveis (já no banco de dados):

| Email | Senha | Perfil |
|-------|-------|--------|
| admin@loja.com | admin123 | ADMIN |
| cliente@loja.com | cliente123 | CLIENTE |

---

## ❓ Troubleshooting:

### "401 Unauthorized"
- Você esqueceu de adicionar o token no header
- Ou o token expirou (faça login novamente)
- Ou colocou o token errado

### "403 Forbidden"
- Você não tem permissão (ex: CLIENTE tentando acessar endpoint de ADMIN)

### "Token inválido"
- Token corrompido ou modificado
- Faça login novamente para obter um novo token

---

Pronto! Agora você tem um sistema de autenticação JWT completo e funcional! 🎉

