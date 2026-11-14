-- Rode este arquivo se o banco connected_woman JÁ existe.
-- Entregas: a doadora registra o que entregou e a beneficiária confirma que recebeu.
-- Status: pendente (aguardando confirmação) -> concluida (recebi) ou cancelada (não recebi / cancelada).
USE connected_woman;

ALTER TABLE doacao
  ADD COLUMN id_usuario_doadora INT NULL,
  ADD COLUMN id_usuario_beneficiaria INT NULL,
  ADD COLUMN item VARCHAR(100) NULL,
  ADD COLUMN quantidade INT NULL,
  ADD COLUMN criada_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN respondida_em TIMESTAMP NULL,
  ADD FOREIGN KEY (id_usuario_doadora) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
  ADD FOREIGN KEY (id_usuario_beneficiaria) REFERENCES usuario(id_usuario) ON DELETE SET NULL;
