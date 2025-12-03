# Multi-stage build para Angular
FROM node:22.12-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Imagem final com Nginx
FROM nginx:alpine

# Copiar arquivos buildados para o Nginx
COPY --from=builder /app/dist/catalogo-frontend /usr/share/nginx/html

# Configuração personalizada do Nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]