-- banco connected woman
-- Este é o ÚNICO arquivo SQL do projeto: cria o banco, as 11 tabelas e os dados de exemplo.
-- Rode UMA vez, em um banco novo. Para recomeçar do zero, apague o banco antes:
--   DROP DATABASE connected_woman;   (isso apaga todos os dados)

CREATE DATABASE IF NOT EXISTS connected_woman
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE connected_woman;

-- usuario
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  senha VARCHAR(150) NOT NULL,
  tipo ENUM('doadora', 'beneficiaria', 'admin', 'instituicao') NOT NULL,
  -- o mesmo e-mail pode ter um perfil de doadora e um de beneficiária
  UNIQUE KEY uq_usuario_email_tipo (email, tipo)
);

-- doadoras
CREATE TABLE IF NOT EXISTS doadora (
  id_doadora INT AUTO_INCREMENT PRIMARY KEY,
  nome_doadora VARCHAR(150) NOT NULL,
  email_doadora VARCHAR(150),
  telefone_doadora VARCHAR(20),
  cidade_doadora VARCHAR(100),
  frequencia_doacao_doadora VARCHAR(50)
);

-- beneficiarias
CREATE TABLE IF NOT EXISTS beneficiaria (
  id_beneficiaria INT AUTO_INCREMENT PRIMARY KEY,
  nome_beneficiaria VARCHAR(150) NOT NULL,
  email_beneficiaria VARCHAR(150),
  telefone_beneficiaria VARCHAR(20),
  cidade_beneficiaria VARCHAR(100),
  tipo_necessidade_beneficiaria VARCHAR(100)
);

-- instituicoes (cadastram os pontos de coleta)
CREATE TABLE IF NOT EXISTS instituicao (
  id_instituicao INT AUTO_INCREMENT PRIMARY KEY,
  nome_instituicao VARCHAR(150) NOT NULL,
  email_instituicao VARCHAR(150),
  telefone_instituicao VARCHAR(20),
  cidade_instituicao VARCHAR(100)
);

-- doacoes
CREATE TABLE IF NOT EXISTS doacao (
  id_doacao INT AUTO_INCREMENT PRIMARY KEY,
  id_doadora INT,
  id_beneficiaria INT,
  data_doacao DATE,
  status ENUM('pendente', 'em_andamento', 'concluida', 'cancelada') DEFAULT 'pendente',
  FOREIGN KEY (id_doadora) REFERENCES doadora(id_doadora),
  FOREIGN KEY (id_beneficiaria) REFERENCES beneficiaria(id_beneficiaria),
  -- entregas registradas no chat: a doadora informa o que entregou e a beneficiária confirma
  id_usuario_doadora INT NULL,
  id_usuario_beneficiaria INT NULL,
  item VARCHAR(100) NULL,
  quantidade INT NULL,
  criada_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  respondida_em TIMESTAMP NULL,
  FOREIGN KEY (id_usuario_doadora) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
  FOREIGN KEY (id_usuario_beneficiaria) REFERENCES usuario(id_usuario) ON DELETE SET NULL
);

-- pontos de coleta
CREATE TABLE IF NOT EXISTS ponto_coleta (
  id_ponto INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  endereco VARCHAR(255),
  horario VARCHAR(100),
  telefone VARCHAR(20),
  aberto TINYINT(1) DEFAULT 1,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  -- horário de funcionamento: dias 0 (dom) a 6 (sáb); o "aberto agora" é calculado pelo backend
  dia_inicio TINYINT,
  dia_fim TINYINT,
  hora_abre TIME,
  hora_fecha TIME,
  -- pontos novos ficam "pendente" até a administradora aprovar
  status ENUM('pendente', 'aprovado', 'recusado') NOT NULL DEFAULT 'pendente',
  id_usuario INT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- mensagens do chat entre doadoras e beneficiarias (ids da tabela usuario)
CREATE TABLE IF NOT EXISTS mensagem (
  id_mensagem INT AUTO_INCREMENT PRIMARY KEY,
  id_remetente INT NOT NULL,
  id_destinatario INT NOT NULL,
  texto TEXT NOT NULL,
  enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_remetente) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_destinatario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- fórum (posts, comentários e curtidas das usuárias; ids da tabela usuario)
CREATE TABLE IF NOT EXISTS forum_post (
  id_post INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  texto TEXT NOT NULL,
  anonimo TINYINT(1) DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forum_comentario (
  id_comentario INT AUTO_INCREMENT PRIMARY KEY,
  id_post INT NOT NULL,
  id_usuario INT NOT NULL,
  texto TEXT NOT NULL,
  anonimo TINYINT(1) DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_post) REFERENCES forum_post(id_post) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forum_curtida (
  id_post INT NOT NULL,
  id_usuario INT NOT NULL,
  PRIMARY KEY (id_post, id_usuario),
  FOREIGN KEY (id_post) REFERENCES forum_post(id_post) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- faq
CREATE TABLE IF NOT EXISTS faq (
  id_faq INT AUTO_INCREMENT PRIMARY KEY,
  pergunta VARCHAR(255) NOT NULL,
  resposta TEXT NOT NULL
);

-- dados de exemplo

INSERT INTO usuario (email, senha, tipo) VALUES
('admin@connectedwoman.org', '123456', 'admin'),
('doadora@email.com', '123456', 'doadora'),
('beneficiaria@email.com', '123456', 'beneficiaria');

INSERT INTO doadora (nome_doadora, email_doadora, telefone_doadora, cidade_doadora, frequencia_doacao_doadora) VALUES
('Maria Silva', 'maria@email.com', '(51) 99999-1111', 'Porto Alegre', 'Mensalmente'),
('Ana Souza', 'ana@email.com', '(51) 99999-2222', 'Canoas', 'Quinzenalmente');

INSERT INTO beneficiaria (nome_beneficiaria, email_beneficiaria, telefone_beneficiaria, cidade_beneficiaria, tipo_necessidade_beneficiaria) VALUES
('Joana Lima', 'joana@email.com', '(51) 98888-3333', 'São Leopoldo', 'Absorventes'),
('Carla Dias', 'carla@email.com', '(51) 98888-4444', 'Gravataí', 'Itens de higiene');

INSERT INTO doacao (id_doadora, id_beneficiaria, data_doacao, status) VALUES
(1, 1, '2026-06-01', 'concluida'),
(2, 2, '2026-06-10', 'pendente');

INSERT INTO ponto_coleta (nome, endereco, horario, telefone, aberto, latitude, longitude, dia_inicio, dia_fim, hora_abre, hora_fecha, status) VALUES
('Centro Comunitário Restinga', 'Rua das Flores, 123 - Restinga, Porto Alegre', 'Seg a Sex: 9h às 18h', '(51) 3333-4444', 1, -30.1550000, -51.1820000, 1, 5, '09:00', '18:00', 'aprovado'),
('Casa da Mulher - Canoas', 'Av. Central, 456 - Centro, Canoas', 'Seg a Sáb: 8h às 17h', '(51) 3555-6666', 1, -29.9178000, -51.1836000, 1, 6, '08:00', '17:00', 'aprovado'),
('Posto de Saúde São Leopoldo', 'Rua Brasil, 789 - Centro, São Leopoldo', 'Seg a Sex: 7h às 19h', '(51) 3777-8888', 0, -29.7600000, -51.1470000, 1, 5, '07:00', '19:00', 'aprovado');

INSERT INTO faq (pergunta, resposta) VALUES
('O que é pobreza menstrual?', 'É a falta de acesso a produtos de higiene menstrual, saneamento básico, infraestrutura e informações adequadas, o que afeta diretamente a dignidade de quem menstrua.'),
('Quantas vezes devo trocar o absorvente?', 'O ideal é trocar o absorvente a cada 4 horas, mesmo em dias de fluxo mais leve, para evitar infecções e manter a higiene.'),
('O que é um coletor menstrual?', 'É um recipiente de silicone reutilizável que coleta o fluxo menstrual. Pode durar anos, sendo uma opção econômica e sustentável.'),
('Como descartar absorventes corretamente?', 'Embrulhe o absorvente usado em papel e descarte no lixo comum. Nunca jogue no vaso sanitário.'),
('Como faço para receber doações?', 'Basta se cadastrar como beneficiária no app. Conectamos você a uma doadora da sua região e indicamos o ponto de coleta mais próximo.');
