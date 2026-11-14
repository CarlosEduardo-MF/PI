-- Rode este arquivo se o banco connected_woman JÁ existe (para não recriar tudo)
USE connected_woman;

ALTER TABLE ponto_coleta
  ADD COLUMN latitude DECIMAL(10, 7),
  ADD COLUMN longitude DECIMAL(10, 7);

UPDATE ponto_coleta SET latitude = -30.1550000, longitude = -51.1820000 WHERE nome LIKE 'Centro Comunitário Restinga%';
UPDATE ponto_coleta SET latitude = -29.9178000, longitude = -51.1836000 WHERE nome LIKE 'Casa da Mulher - Canoas%';
UPDATE ponto_coleta SET latitude = -29.7600000, longitude = -51.1470000 WHERE nome LIKE 'Posto de Saúde São Leopoldo%';

CREATE TABLE IF NOT EXISTS mensagem (
  id_mensagem INT AUTO_INCREMENT PRIMARY KEY,
  id_remetente INT NOT NULL,
  id_destinatario INT NOT NULL,
  texto TEXT NOT NULL,
  enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_remetente) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_destinatario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);
