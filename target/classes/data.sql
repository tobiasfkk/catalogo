-- Inserir usuários (senhas simples, sem criptografia)
INSERT INTO users (nome, email, senha, perfil) VALUES ('Administrador', 'admin@loja.com', 'admin123', 'ADMIN');
INSERT INTO users (nome, email, senha, perfil) VALUES ('Cliente', 'cliente@loja.com', 'cliente123', 'CLIENTE');

-- Inserir produtos
INSERT INTO product (nome, descricao, preco, ativo) VALUES ('Produto A', 'Descricao do Produto A', 50.00, true);
INSERT INTO product (nome, descricao, preco, ativo) VALUES ('Produto B', 'Descricao do Produto B', 30.00, true);
INSERT INTO product (nome, descricao, preco, ativo) VALUES ('Produto C', 'Descricao do Produto C', 20.00, true);
INSERT INTO product (nome, descricao, preco, ativo) VALUES ('Produto D', 'Descricao do Produto D', 15.00, false);
