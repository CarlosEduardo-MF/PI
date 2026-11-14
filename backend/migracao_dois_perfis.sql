-- Rode este arquivo se o banco connected_woman JÁ existe.
-- Permite o mesmo e-mail ter um perfil de doadora e um de beneficiária.
USE connected_woman;

ALTER TABLE usuario
  DROP INDEX email,
  ADD UNIQUE KEY uq_usuario_email_tipo (email, tipo);
