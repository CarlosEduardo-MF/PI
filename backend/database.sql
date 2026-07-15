-- banco connected woman

CREATE DATABASE IF NOT EXISTS connected_woman
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE connected_woman;

-- usuario
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(150) NOT NULL,
  tipo ENUM('doadora', 'beneficiaria', 'admin') NOT NULL
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

-- doacoes
CREATE TABLE IF NOT EXISTS doacao (
  id_doacao INT AUTO_INCREMENT PRIMARY KEY,
  id_doadora INT,
  id_beneficiaria INT,
  data_doacao DATE,
  status ENUM('pendente', 'em_andamento', 'concluida', 'cancelada') DEFAULT 'pendente',
  FOREIGN KEY (id_doadora) REFERENCES doadora(id_doadora),
  FOREIGN KEY (id_beneficiaria) REFERENCES beneficiaria(id_beneficiaria)
);

-- pontos de coleta
CREATE TABLE IF NOT EXISTS ponto_coleta (
  id_ponto INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  endereco VARCHAR(255),
  horario VARCHAR(100),
  telefone VARCHAR(20),
  aberto TINYINT(1) DEFAULT 1
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

INSERT INTO ponto_coleta (nome, endereco, horario, telefone, aberto) VALUES
('Centro Comunitário Restinga', 'Rua das Flores, 123 - Restinga, Porto Alegre', 'Seg a Sex: 9h às 18h', '(51) 3333-4444', 1),
('Casa da Mulher - Canoas', 'Av. Central, 456 - Centro, Canoas', 'Seg a Sáb: 8h às 17h', '(51) 3555-6666', 1),
('Posto de Saúde São Leopoldo', 'Rua Brasil, 789 - Centro, São Leopoldo', 'Seg a Sex: 7h às 19h', '(51) 3777-8888', 0);

INSERT INTO faq (pergunta, resposta) VALUES
('O que é pobreza menstrual?', 'É a falta de acesso a produtos de higiene menstrual, saneamento básico, infraestrutura e informações adequadas, o que afeta diretamente a dignidade de quem menstrua.'),
('Quantas vezes devo trocar o absorvente?', 'O ideal é trocar o absorvente a cada 4 horas, mesmo em dias de fluxo mais leve, para evitar infecções e manter a higiene.'),
('O que é um coletor menstrual?', 'É um recipiente de silicone reutilizável que coleta o fluxo menstrual. Pode durar anos, sendo uma opção econômica e sustentável.'),
('Como descartar absorventes corretamente?', 'Embrulhe o absorvente usado em papel e descarte no lixo comum. Nunca jogue no vaso sanitário.'),
('Como faço para receber doações?', 'Basta se cadastrar como beneficiária no app. Conectamos você a uma doadora da sua região e indicamos o ponto de coleta mais próximo.');
