-- Rode este arquivo se o banco connected_woman JÁ existe.
-- Adiciona o horário de funcionamento estruturado aos pontos de coleta.
-- Dias: 0 = domingo ... 6 = sábado.
USE connected_woman;

ALTER TABLE ponto_coleta
  ADD COLUMN dia_inicio TINYINT,
  ADD COLUMN dia_fim TINYINT,
  ADD COLUMN hora_abre TIME,
  ADD COLUMN hora_fecha TIME;

UPDATE ponto_coleta SET dia_inicio = 1, dia_fim = 5, hora_abre = '09:00', hora_fecha = '18:00' WHERE nome LIKE 'Centro Comunitário Restinga%';
UPDATE ponto_coleta SET dia_inicio = 1, dia_fim = 6, hora_abre = '08:00', hora_fecha = '17:00' WHERE nome LIKE 'Casa da Mulher - Canoas%';
UPDATE ponto_coleta SET dia_inicio = 1, dia_fim = 5, hora_abre = '07:00', hora_fecha = '19:00' WHERE nome LIKE 'Posto de Saúde São Leopoldo%';
