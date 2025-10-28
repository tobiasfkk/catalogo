-- Inserir usuários conforme especificação do projeto
-- admin@loja.com: Admin@123 (hash BCrypt)
-- cliente@loja.com: Cliente@123 (hash BCrypt)
INSERT INTO users (nome, email, senha, perfil) VALUES ('Administrador', 'admin@loja.com', '$2a$10$N.zmdr9k7uOCQb07YitZ4.Hm6.KTdJ.G9B5sURIGefPCqg.Zj3XrO', 'ADMIN');
INSERT INTO users (nome, email, senha, perfil) VALUES ('Cliente', 'cliente@loja.com', '$2a$10$8zf2ZnWh3pxBr2GlwTFaDu1YQK.PJyX4SvnWdOOGK2PZGL2gFJ4M6', 'CLIENTE');

-- Inserir produtos
INSERT INTO product (nome, descricao, preco, ativo) VALUES ('Produto A', 'Descricao do Produto A', 50.00, true);
INSERT INTO product (nome, descricao, preco, ativo) VALUES ('Produto B', 'Descricao do Produto B', 30.00, true);
INSERT INTO product (nome, descricao, preco, ativo) VALUES ('Produto C', 'Descricao do Produto C', 20.00, true);
INSERT INTO product (nome, descricao, preco, ativo) VALUES ('Produto D', 'Descricao do Produto D', 15.00, false);
