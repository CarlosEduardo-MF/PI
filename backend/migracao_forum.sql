-- Rode este arquivo se o banco connected_woman JÁ existe (cria as tabelas do fórum).
USE connected_woman;

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
