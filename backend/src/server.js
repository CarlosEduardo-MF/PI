// server.js
// Servidor (API) do projeto Connected Woman.
// Tecnologias: Node.js + Express + MySQL (queries SQL puras, sem ORM).
//
// Cada rota faz uma operação do app: login, cadastro, doações, pontos de coleta, etc.
// As queries usam "?" para os valores (isso protege contra SQL Injection).

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db"); // nossa conexão com o MySQL

const app = express();
app.use(cors()); // permite que o app (frontend) acesse esta API
app.use(express.json()); // permite ler JSON enviado no corpo das requisições

const PORT = process.env.PORT || 3001;

// ============================================================
// ROTAS DE TESTE
// ============================================================

// Página inicial da API (não usa banco)
app.get("/", (req, res) => {
  res.json({ ok: true, mensagem: "API Connected Woman rodando!" });
});

// Testa se a conexão com o banco está funcionando
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, banco: "conectado" });
  } catch (erro) {
    res.status(500).json({ ok: false, banco: "erro", detalhe: erro.message });
  }
});

// ============================================================
// LOGIN
// ============================================================

// POST /login  -> body: { email, senha }
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const [linhas] = await pool.query(
      "SELECT id_usuario, email, tipo FROM usuario WHERE email = ? AND senha = ?",
      [email, senha]
    );
    if (linhas.length === 0) {
      return res.status(401).json({ ok: false, mensagem: "E-mail ou senha incorretos." });
    }
    res.json({ ok: true, usuario: linhas[0] });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// ============================================================
// CADASTRO (cria usuária de login + registro na tabela certa)
// ============================================================

// POST /cadastro/doadora -> body: { nome, email, telefone, cidade, frequencia, senha }
app.post("/cadastro/doadora", async (req, res) => {
  try {
    const { nome, email, telefone, cidade, frequencia, senha } = req.body;

    // 1) cria a doadora
    const [resultado] = await pool.query(
      "INSERT INTO doadora (nome_doadora, email_doadora, telefone_doadora, cidade_doadora, frequencia_doacao_doadora) VALUES (?, ?, ?, ?, ?)",
      [nome, email, telefone, cidade, frequencia]
    );

    // 2) cria o login (se enviou senha)
    if (email && senha) {
      await pool.query(
        "INSERT INTO usuario (email, senha, tipo) VALUES (?, ?, 'doadora')",
        [email, senha]
      );
    }

    res.status(201).json({ ok: true, id_doadora: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// POST /cadastro/beneficiaria -> body: { nome, email, telefone, cidade, necessidade, senha }
app.post("/cadastro/beneficiaria", async (req, res) => {
  try {
    const { nome, email, telefone, cidade, necessidade, senha } = req.body;

    const [resultado] = await pool.query(
      "INSERT INTO beneficiaria (nome_beneficiaria, email_beneficiaria, telefone_beneficiaria, cidade_beneficiaria, tipo_necessidade_beneficiaria) VALUES (?, ?, ?, ?, ?)",
      [nome, email, telefone, cidade, necessidade]
    );

    if (email && senha) {
      await pool.query(
        "INSERT INTO usuario (email, senha, tipo) VALUES (?, ?, 'beneficiaria')",
        [email, senha]
      );
    }

    res.status(201).json({ ok: true, id_beneficiaria: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// ============================================================
// DOADORAS (listar, ver, editar, apagar)
// ============================================================

app.get("/doadoras", async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM doadora ORDER BY id_doadora DESC");
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.get("/doadoras/:id", async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM doadora WHERE id_doadora = ?", [req.params.id]);
    if (linhas.length === 0) return res.status(404).json({ ok: false, mensagem: "Doadora não encontrada." });
    res.json(linhas[0]);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.put("/doadoras/:id", async (req, res) => {
  try {
    const { nome, email, telefone, cidade, frequencia } = req.body;
    await pool.query(
      "UPDATE doadora SET nome_doadora = ?, email_doadora = ?, telefone_doadora = ?, cidade_doadora = ?, frequencia_doacao_doadora = ? WHERE id_doadora = ?",
      [nome, email, telefone, cidade, frequencia, req.params.id]
    );
    res.json({ ok: true, mensagem: "Doadora atualizada." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.delete("/doadoras/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM doadora WHERE id_doadora = ?", [req.params.id]);
    res.json({ ok: true, mensagem: "Doadora apagada." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// ============================================================
// BENEFICIÁRIAS (listar, ver, editar, apagar)
// ============================================================

app.get("/beneficiarias", async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM beneficiaria ORDER BY id_beneficiaria DESC");
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.get("/beneficiarias/:id", async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM beneficiaria WHERE id_beneficiaria = ?", [req.params.id]);
    if (linhas.length === 0) return res.status(404).json({ ok: false, mensagem: "Beneficiária não encontrada." });
    res.json(linhas[0]);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.put("/beneficiarias/:id", async (req, res) => {
  try {
    const { nome, email, telefone, cidade, necessidade } = req.body;
    await pool.query(
      "UPDATE beneficiaria SET nome_beneficiaria = ?, email_beneficiaria = ?, telefone_beneficiaria = ?, cidade_beneficiaria = ?, tipo_necessidade_beneficiaria = ? WHERE id_beneficiaria = ?",
      [nome, email, telefone, cidade, necessidade, req.params.id]
    );
    res.json({ ok: true, mensagem: "Beneficiária atualizada." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.delete("/beneficiarias/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM beneficiaria WHERE id_beneficiaria = ?", [req.params.id]);
    res.json({ ok: true, mensagem: "Beneficiária apagada." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// ============================================================
// DOAÇÕES (pareamento doadora -> beneficiária)
// ============================================================

// Lista as doações já com os nomes (usando JOIN)
app.get("/doacoes", async (req, res) => {
  try {
    const [linhas] = await pool.query(`
      SELECT d.id_doacao, d.data_doacao, d.status,
             doa.nome_doadora, ben.nome_beneficiaria
      FROM doacao d
      LEFT JOIN doadora doa ON d.id_doadora = doa.id_doadora
      LEFT JOIN beneficiaria ben ON d.id_beneficiaria = ben.id_beneficiaria
      ORDER BY d.id_doacao DESC
    `);
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// Histórico de doações de uma doadora
app.get("/doacoes/doadora/:id", async (req, res) => {
  try {
    const [linhas] = await pool.query(
      "SELECT * FROM doacao WHERE id_doadora = ? ORDER BY id_doacao DESC",
      [req.params.id]
    );
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// Registra uma nova doação
app.post("/doacoes", async (req, res) => {
  try {
    const { id_doadora, id_beneficiaria, data_doacao, status } = req.body;
    const [resultado] = await pool.query(
      "INSERT INTO doacao (id_doadora, id_beneficiaria, data_doacao, status) VALUES (?, ?, ?, ?)",
      [id_doadora, id_beneficiaria, data_doacao, status || "pendente"]
    );
    res.status(201).json({ ok: true, id_doacao: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// Atualiza o status de uma doação (ex: pendente -> concluida)
app.put("/doacoes/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE doacao SET status = ? WHERE id_doacao = ?", [status, req.params.id]);
    res.json({ ok: true, mensagem: "Status atualizado." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.delete("/doacoes/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM doacao WHERE id_doacao = ?", [req.params.id]);
    res.json({ ok: true, mensagem: "Doação apagada." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// ============================================================
// PONTOS DE COLETA (tela Pontos de Coleta)
// ============================================================

app.get("/pontos", async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM ponto_coleta ORDER BY id_ponto");
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.post("/pontos", async (req, res) => {
  try {
    const { nome, endereco, horario, telefone, aberto } = req.body;
    const [resultado] = await pool.query(
      "INSERT INTO ponto_coleta (nome, endereco, horario, telefone, aberto) VALUES (?, ?, ?, ?, ?)",
      [nome, endereco, horario, telefone, aberto ? 1 : 0]
    );
    res.status(201).json({ ok: true, id_ponto: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.delete("/pontos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM ponto_coleta WHERE id_ponto = ?", [req.params.id]);
    res.json({ ok: true, mensagem: "Ponto apagado." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// ============================================================
// FAQ (tela Educação)
// ============================================================

app.get("/faqs", async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM faq ORDER BY id_faq");
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.post("/faqs", async (req, res) => {
  try {
    const { pergunta, resposta } = req.body;
    const [resultado] = await pool.query(
      "INSERT INTO faq (pergunta, resposta) VALUES (?, ?)",
      [pergunta, resposta]
    );
    res.status(201).json({ ok: true, id_faq: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// ============================================================
// RELATÓRIOS (contagens para a administradora)
// ============================================================

app.get("/relatorios", async (req, res) => {
  try {
    const [[doadoras]] = await pool.query("SELECT COUNT(*) AS total FROM doadora");
    const [[beneficiarias]] = await pool.query("SELECT COUNT(*) AS total FROM beneficiaria");
    const [[doacoes]] = await pool.query("SELECT COUNT(*) AS total FROM doacao");
    const [[concluidas]] = await pool.query(
      "SELECT COUNT(*) AS total FROM doacao WHERE status = 'concluida'"
    );
    res.json({
      total_doadoras: doadoras.total,
      total_beneficiarias: beneficiarias.total,
      total_doacoes: doacoes.total,
      doacoes_concluidas: concluidas.total,
    });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// ============================================================
// INICIA O SERVIDOR
// ============================================================

app.listen(PORT, () => {
  console.log(`API Connected Woman rodando em http://localhost:${PORT}`);
});
