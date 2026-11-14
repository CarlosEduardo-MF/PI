-- Rode este arquivo se o banco connected_woman JÁ existe.
-- Cria o tipo de conta "instituição" e a aprovação de pontos de coleta.
USE connected_woman;

ALTER TABLE usuario
  MODIFY tipo ENUM('doadora', 'beneficiaria', 'admin', 'instituicao') NOT NULL;

CREATE TABLE IF NOT EXISTS instituicao (
  id_instituicao INT AUTO_INCREMENT PRIMARY KEY,
  nome_instituicao VARCHAR(150) NOT NULL,
  email_instituicao VARCHAR(150),
  telefone_instituicao VARCHAR(20),
  cidade_instituicao VARCHAR(100)
);

-- todo ponto novo nasce "pendente" e só aparece no mapa depois de aprovado pela administradora
ALTER TABLE ponto_coleta
  ADD COLUMN status ENUM('pendente', 'aprovado', 'recusado') NOT NULL DEFAULT 'pendente',
  ADD COLUMN id_usuario INT NULL,
  ADD FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE;

-- os pontos que já existiam continuam visíveis
UPDATE ponto_coleta SET status = 'aprovado';
