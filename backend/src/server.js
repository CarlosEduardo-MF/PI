
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { geocodificar } = require("./geocodificacao");
const { normalizarHora, estaAbertoAgora, descreverHorario } = require("./horario");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;


app.get("/", (req, res) => {
  res.json({ ok: true, mensagem: "API Connected Woman rodando!" });
});


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
    // o mesmo e-mail pode ter 2 perfis (doadora e beneficiária): devolve todos para o app perguntar
    res.json({ ok: true, usuario: linhas[0], perfis: linhas });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// outros perfis da mesma pessoa (mesmo e-mail), para "trocar de perfil" no app
app.get("/usuario/:id/perfis", async (req, res) => {
  try {
    const [linhas] = await pool.query(
      `SELECT u2.id_usuario, u2.email, u2.tipo
       FROM usuario u1 JOIN usuario u2 ON u2.email = u1.email
       WHERE u1.id_usuario = ? ORDER BY u2.id_usuario`,
      [Number(req.params.id) || 0]
    );
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});


// impede cadastro com e-mail repetido ANTES de gravar qualquer coisa
// O mesmo e-mail pode ter um perfil de doadora E um de beneficiária, desde que use a mesma senha.
// Devolve null se pode cadastrar, ou { status, mensagem } se não pode.
async function verificarEmailParaCadastro(email, tipo, senha) {
  if (!email) return null;
  const [linhas] = await pool.query("SELECT tipo, senha FROM usuario WHERE email = ?", [email]);
  if (linhas.length === 0) return null;

  if (linhas.some((l) => l.tipo === tipo)) {
    return { status: 409, mensagem: "Este e-mail já tem um perfil desse tipo. Tente entrar com ele." };
  }
  const par = ["doadora", "beneficiaria"];
  if (!par.includes(tipo) || linhas.some((l) => !par.includes(l.tipo))) {
    return { status: 409, mensagem: "Este e-mail já está cadastrado. Tente entrar com ele." };
  }
  if (linhas[0].senha !== senha) {
    return {
      status: 401,
      mensagem: "Este e-mail já tem uma conta. Para criar o outro perfil, use a mesma senha dela.",
    };
  }
  return null;
}

app.post("/cadastro/doadora", async (req, res) => {
  try {
    const { nome, email, telefone, cidade, frequencia, senha } = req.body;
    const problema = await verificarEmailParaCadastro(email, "doadora", senha);
    if (problema) return res.status(problema.status).json({ ok: false, mensagem: problema.mensagem });

    const [resultado] = await pool.query(
      "INSERT INTO doadora (nome_doadora, email_doadora, telefone_doadora, cidade_doadora, frequencia_doacao_doadora) VALUES (?, ?, ?, ?, ?)",
      [nome, email, telefone, cidade, frequencia]
    );
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

app.post("/cadastro/instituicao", async (req, res) => {
  try {
    const { nome, email, telefone, cidade, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ ok: false, mensagem: "Preencha o nome, o e-mail e a senha." });
    }
    const problema = await verificarEmailParaCadastro(email, "instituicao", senha);
    if (problema) return res.status(problema.status).json({ ok: false, mensagem: problema.mensagem });
    const [resultado] = await pool.query(
      "INSERT INTO instituicao (nome_instituicao, email_instituicao, telefone_instituicao, cidade_instituicao) VALUES (?, ?, ?, ?)",
      [nome, email, telefone, cidade]
    );
    await pool.query("INSERT INTO usuario (email, senha, tipo) VALUES (?, ?, 'instituicao')", [email, senha]);
    res.status(201).json({ ok: true, id_instituicao: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.post("/cadastro/beneficiaria", async (req, res) => {
  try {
    const { nome, email, telefone, cidade, necessidade, senha } = req.body;
    const problema = await verificarEmailParaCadastro(email, "beneficiaria", senha);
    if (problema) return res.status(problema.status).json({ ok: false, mensagem: problema.mensagem });

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

// Rotas administrativas (listar, editar e apagar cadastros e doações): só a administradora.
// O pedido precisa trazer o id dela em ?usuario= (ou id_usuario no corpo).
async function exigirAdmin(req, res, next) {
  try {
    const quem = await buscarUsuario(req.query.usuario ?? req.body?.id_usuario);
    if (!quem || quem.tipo !== "admin") {
      return res.status(403).json({ ok: false, mensagem: "Só a administradora pode acessar esta área." });
    }
    next();
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
}

app.get("/doadoras", exigirAdmin, async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM doadora ORDER BY id_doadora DESC");
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.get("/doadoras/:id", exigirAdmin, async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM doadora WHERE id_doadora = ?", [req.params.id]);
    if (linhas.length === 0) return res.status(404).json({ ok: false, mensagem: "Doadora não encontrada." });
    res.json(linhas[0]);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.put("/doadoras/:id", exigirAdmin, async (req, res) => {
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

app.delete("/doadoras/:id", exigirAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM doadora WHERE id_doadora = ?", [req.params.id]);
    res.json({ ok: true, mensagem: "Doadora apagada." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.get("/beneficiarias", exigirAdmin, async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM beneficiaria ORDER BY id_beneficiaria DESC");
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.get("/beneficiarias/:id", exigirAdmin, async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM beneficiaria WHERE id_beneficiaria = ?", [req.params.id]);
    if (linhas.length === 0) return res.status(404).json({ ok: false, mensagem: "Beneficiária não encontrada." });
    res.json(linhas[0]);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.put("/beneficiarias/:id", exigirAdmin, async (req, res) => {
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

app.delete("/beneficiarias/:id", exigirAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM beneficiaria WHERE id_beneficiaria = ?", [req.params.id]);
    res.json({ ok: true, mensagem: "Beneficiária apagada." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.get("/doacoes", exigirAdmin, async (req, res) => {
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


app.get("/doacoes/doadora/:id", exigirAdmin, async (req, res) => {
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

app.post("/doacoes", exigirAdmin, async (req, res) => {
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


app.put("/doacoes/:id", exigirAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE doacao SET status = ? WHERE id_doacao = ?", [status, req.params.id]);
    res.json({ ok: true, mensagem: "Status atualizado." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.delete("/doacoes/:id", exigirAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM doacao WHERE id_doacao = ?", [req.params.id]);
    res.json({ ok: true, mensagem: "Doação apagada." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});



app.get("/pontos", async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM ponto_coleta WHERE status = 'aprovado' ORDER BY id_ponto");
    // "aberto" é calculado agora pelo horário de funcionamento (fuso de Brasília)
    const agora = new Date();
    res.json(
      linhas.map((p) => ({
        ...p,
        horario: descreverHorario(p),
        aberto: estaAbertoAgora(p, agora) ? 1 : 0,
      }))
    );
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// quem está pedindo (o app envia o id da usuária logada; ainda não há token de login)
async function buscarUsuario(id) {
  const [linhas] = await pool.query("SELECT id_usuario, tipo, email FROM usuario WHERE id_usuario = ?", [Number(id) || 0]);
  return linhas[0] || null;
}

app.post("/pontos", async (req, res) => {
  try {
    const quem = await buscarUsuario(req.body.id_usuario);
    if (!quem || (quem.tipo !== "instituicao" && quem.tipo !== "admin")) {
      return res.status(403).json({
        ok: false,
        mensagem: "Só instituições cadastradas podem criar pontos de coleta.",
      });
    }
    // instituição: fica pendente até a administradora aprovar. admin: já entra aprovado.
    const status = quem.tipo === "admin" ? "aprovado" : "pendente";

    const { nome, endereco, telefone, dia_inicio, dia_fim } = req.body;
    let { latitude, longitude, horario } = req.body;

    // horário de funcionamento (opcional, mas se vier tem que vir completo e válido)
    const hora_abre = normalizarHora(req.body.hora_abre);
    const hora_fecha = normalizarHora(req.body.hora_fecha);
    const temHorario = req.body.hora_abre != null || req.body.hora_fecha != null;
    const diaValido = (d) => Number.isInteger(Number(d)) && d !== null && d !== "" && d >= 0 && d <= 6;
    if (temHorario) {
      if (!hora_abre || !hora_fecha || !diaValido(dia_inicio) || !diaValido(dia_fim)) {
        return res.status(400).json({
          ok: false,
          mensagem: "Horário inválido. Informe os dias e as horas de abertura e fechamento (ex.: 09:00 e 18:00).",
        });
      }
      if (hora_abre >= hora_fecha) {
        return res.status(400).json({
          ok: false,
          mensagem: "O horário de fechamento precisa ser depois do horário de abertura.",
        });
      }
      horario = descreverHorario({ dia_inicio, dia_fim, hora_abre, hora_fecha });
    }

    // se não vieram coordenadas, descobre pelo endereço
    let localizado = latitude != null && longitude != null;
    if (!localizado) {
      const local = await geocodificar(endereco);
      if (local) {
        latitude = local.latitude;
        longitude = local.longitude;
        localizado = true;
      }
    }

    const [resultado] = await pool.query(
      `INSERT INTO ponto_coleta
         (nome, endereco, horario, telefone, aberto, latitude, longitude, dia_inicio, dia_fim, hora_abre, hora_fecha, status, id_usuario)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome, endereco, horario, telefone,
        latitude ?? null, longitude ?? null,
        temHorario ? dia_inicio : null, temHorario ? dia_fim : null,
        temHorario ? hora_abre : null, temHorario ? hora_fecha : null,
        status, quem.id_usuario,
      ]
    );
    res.status(201).json({
      ok: true,
      id_ponto: resultado.insertId,
      status,
      localizado,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      aviso: localizado
        ? undefined
        : "Ponto salvo, mas não foi possível encontrar o endereço no mapa. Confira o endereço.",
    });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// pontos da própria instituição (qualquer status)
app.get("/pontos/meus", async (req, res) => {
  try {
    const quem = await buscarUsuario(req.query.usuario);
    if (!quem) return res.status(404).json({ ok: false, mensagem: "Usuária não encontrada." });
    const [linhas] = await pool.query(
      "SELECT * FROM ponto_coleta WHERE id_usuario = ? ORDER BY id_ponto DESC",
      [quem.id_usuario]
    );
    res.json(linhas.map((p) => ({ ...p, horario: descreverHorario(p) })));
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// fila de aprovação (só administradora)
app.get("/pontos/pendentes", async (req, res) => {
  try {
    const quem = await buscarUsuario(req.query.usuario);
    if (!quem || quem.tipo !== "admin") {
      return res.status(403).json({ ok: false, mensagem: "Só a administradora vê os pontos pendentes." });
    }
    const [linhas] = await pool.query(
      `SELECT p.*,
              (SELECT i.nome_instituicao FROM instituicao i
                JOIN usuario u ON u.email = i.email_instituicao
                WHERE u.id_usuario = p.id_usuario ORDER BY i.id_instituicao DESC LIMIT 1) AS instituicao
       FROM ponto_coleta p
       WHERE p.status = 'pendente'
       ORDER BY p.id_ponto`
    );
    res.json(linhas.map((p) => ({ ...p, horario: descreverHorario(p) })));
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// aprovar ou recusar (só administradora)
app.put("/pontos/:id/status", async (req, res) => {
  try {
    const quem = await buscarUsuario(req.body.id_usuario);
    if (!quem || quem.tipo !== "admin") {
      return res.status(403).json({ ok: false, mensagem: "Só a administradora pode aprovar ou recusar pontos." });
    }
    const { status } = req.body;
    if (status !== "aprovado" && status !== "recusado") {
      return res.status(400).json({ ok: false, mensagem: "Status inválido." });
    }
    const [r] = await pool.query("UPDATE ponto_coleta SET status = ? WHERE id_ponto = ?", [status, req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ ok: false, mensagem: "Ponto não encontrado." });
    res.json({ ok: true, status });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.delete("/pontos/:id", async (req, res) => {
  try {
    const quem = await buscarUsuario(req.query.usuario);
    const [[ponto]] = await pool.query("SELECT id_usuario FROM ponto_coleta WHERE id_ponto = ?", [req.params.id]);
    if (!ponto) return res.status(404).json({ ok: false, mensagem: "Ponto não encontrado." });
    if (!quem || (quem.tipo !== "admin" && ponto.id_usuario !== quem.id_usuario)) {
      return res.status(403).json({ ok: false, mensagem: "Você só pode apagar os seus próprios pontos." });
    }
    await pool.query("DELETE FROM ponto_coleta WHERE id_ponto = ?", [req.params.id]);
    res.json({ ok: true, mensagem: "Ponto apagado." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});



app.get("/faqs", async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM faq ORDER BY id_faq");
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.post("/faqs", exigirAdmin, async (req, res) => {
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


// perfil
app.get("/perfil/:tipo/:email", async (req, res) => {
  try {
    const { tipo, email } = req.params;
    if (tipo === "doadora") {
      const [linhas] = await pool.query(
        "SELECT * FROM doadora WHERE email_doadora = ?",
        [email]
      );
      return res.json(linhas[0] || null);
    }
    if (tipo === "beneficiaria") {
      const [linhas] = await pool.query(
        "SELECT * FROM beneficiaria WHERE email_beneficiaria = ?",
        [email]
      );
      return res.json(linhas[0] || null);
    }
    if (tipo === "instituicao") {
      const [linhas] = await pool.query(
        "SELECT * FROM instituicao WHERE email_instituicao = ? ORDER BY id_instituicao DESC",
        [email]
      );
      return res.json(linhas[0] || null);
    }
    res.json(null);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.put("/perfil/:tipo/:email", async (req, res) => {
  try {
    const { tipo, email } = req.params;
    const { nome, telefone, cidade, frequencia, necessidade } = req.body;

    if (tipo === "doadora") {
      await pool.query(
        "UPDATE doadora SET nome_doadora = ?, telefone_doadora = ?, cidade_doadora = ?, frequencia_doacao_doadora = ? WHERE email_doadora = ?",
        [nome, telefone, cidade, frequencia, email]
      );
    } else if (tipo === "beneficiaria") {
      await pool.query(
        "UPDATE beneficiaria SET nome_beneficiaria = ?, telefone_beneficiaria = ?, cidade_beneficiaria = ?, tipo_necessidade_beneficiaria = ? WHERE email_beneficiaria = ?",
        [nome, telefone, cidade, necessidade, email]
      );
    } else if (tipo === "instituicao") {
      await pool.query(
        "UPDATE instituicao SET nome_instituicao = ?, telefone_instituicao = ?, cidade_instituicao = ? WHERE email_instituicao = ?",
        [nome, telefone, cidade, email]
      );
    } else {
      return res.status(400).json({ ok: false, mensagem: "Tipo de perfil inválido." });
    }

    res.json({ ok: true, mensagem: "Perfil atualizado." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.put("/usuario/:id/senha", async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    if (!novaSenha) {
      return res.status(400).json({ ok: false, mensagem: "Informe a nova senha." });
    }

    const [linhas] = await pool.query(
      "SELECT email, senha FROM usuario WHERE id_usuario = ?",
      [req.params.id]
    );
    if (linhas.length === 0) {
      return res.status(404).json({ ok: false, mensagem: "Usuária não encontrada." });
    }
    if (linhas[0].senha !== senhaAtual) {
      return res.status(401).json({ ok: false, mensagem: "Senha atual incorreta." });
    }

    // a senha é uma só por e-mail: vale para todos os perfis (doadora e beneficiária)
    await pool.query("UPDATE usuario SET senha = ? WHERE email = ?", [novaSenha, linhas[0].email]);
    res.json({ ok: true, mensagem: "Senha alterada." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.delete("/usuario/:id", async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      "SELECT email, tipo FROM usuario WHERE id_usuario = ?",
      [req.params.id]
    );
    if (usuarios.length === 0) {
      return res.status(404).json({ ok: false, mensagem: "Usuária não encontrada." });
    }
    const { email, tipo } = usuarios[0];

    if (tipo === "doadora") {
      const [doadoras] = await pool.query(
        "SELECT id_doadora FROM doadora WHERE email_doadora = ?",
        [email]
      );
      for (const d of doadoras) {
        await pool.query("DELETE FROM doacao WHERE id_doadora = ?", [d.id_doadora]);
      }
      await pool.query("DELETE FROM doadora WHERE email_doadora = ?", [email]);
    } else if (tipo === "beneficiaria") {
      const [beneficiarias] = await pool.query(
        "SELECT id_beneficiaria FROM beneficiaria WHERE email_beneficiaria = ?",
        [email]
      );
      for (const b of beneficiarias) {
        await pool.query("DELETE FROM doacao WHERE id_beneficiaria = ?", [
          b.id_beneficiaria,
        ]);
      }
      await pool.query("DELETE FROM beneficiaria WHERE email_beneficiaria = ?", [email]);
    } else if (tipo === "instituicao") {
      await pool.query("DELETE FROM instituicao WHERE email_instituicao = ?", [email]);
    }

    await pool.query("DELETE FROM usuario WHERE id_usuario = ?", [req.params.id]);
    res.json({ ok: true, mensagem: "Conta apagada." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});


// nome da usuária a partir do cadastro (sem JOIN: e-mail repetido não duplica linhas)
const NOME_CADASTRO = `COALESCE(
  (SELECT d.nome_doadora FROM doadora d WHERE d.email_doadora = u.email ORDER BY d.id_doadora DESC LIMIT 1),
  (SELECT b.nome_beneficiaria FROM beneficiaria b WHERE b.email_beneficiaria = u.email ORDER BY b.id_beneficiaria DESC LIMIT 1),
  (SELECT i.nome_instituicao FROM instituicao i WHERE i.email_instituicao = u.email ORDER BY i.id_instituicao DESC LIMIT 1),
  SUBSTRING_INDEX(u.email, '@', 1))`;

// chat: doadoras conversam com beneficiarias (e vice-versa)
app.get("/chat/contatos/:idUsuario", async (req, res) => {
  try {
    const id = Number(req.params.idUsuario);
    const [[eu]] = await pool.query("SELECT tipo, email FROM usuario WHERE id_usuario = ?", [id]);
    if (!eu) return res.status(404).json({ ok: false, mensagem: "Usuária não encontrada." });
    if (eu.tipo !== "doadora" && eu.tipo !== "beneficiaria") return res.json([]);

    const tipoOposto = eu.tipo === "doadora" ? "beneficiaria" : "doadora";

    const [linhas] = await pool.query(
      `SELECT u.id_usuario, u.tipo,
              ${NOME_CADASTRO} AS nome,
              (SELECT m.texto FROM mensagem m
                WHERE (m.id_remetente = ? AND m.id_destinatario = u.id_usuario)
                   OR (m.id_remetente = u.id_usuario AND m.id_destinatario = ?)
                ORDER BY m.id_mensagem DESC LIMIT 1) AS ultima_mensagem,
              (SELECT MAX(m.id_mensagem) FROM mensagem m
                WHERE (m.id_remetente = ? AND m.id_destinatario = u.id_usuario)
                   OR (m.id_remetente = u.id_usuario AND m.id_destinatario = ?)) AS ultima_id
       FROM usuario u
       WHERE u.tipo = ? AND u.email <> ?
       ORDER BY ultima_id IS NULL, ultima_id DESC, nome`,
      [id, id, id, id, tipoOposto, eu.email]
    );
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.get("/chat/mensagens/:idA/:idB", async (req, res) => {
  try {
    const { idA, idB } = req.params;
    const [linhas] = await pool.query(
      `SELECT id_mensagem, id_remetente, id_destinatario, texto, enviada_em
       FROM mensagem
       WHERE (id_remetente = ? AND id_destinatario = ?)
          OR (id_remetente = ? AND id_destinatario = ?)
       ORDER BY id_mensagem`,
      [idA, idB, idB, idA]
    );
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.post("/chat/mensagens", async (req, res) => {
  try {
    const { id_remetente, id_destinatario, texto } = req.body;
    const limpo = (texto || "").trim();
    if (!id_remetente || !id_destinatario || !limpo) {
      return res.status(400).json({ ok: false, mensagem: "Mensagem inválida." });
    }
    const [resultado] = await pool.query(
      "INSERT INTO mensagem (id_remetente, id_destinatario, texto) VALUES (?, ?, ?)",
      [id_remetente, id_destinatario, limpo]
    );
    res.status(201).json({ ok: true, id_mensagem: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});


// fórum: posts, comentários e curtidas de usuárias reais
const NOME_AUTORA = `CASE WHEN x.anonimo = 1 THEN 'Anônima' ELSE ${NOME_CADASTRO} END`;
const JUNTAR_AUTORA = `JOIN usuario u ON u.id_usuario = x.id_usuario`;

app.get("/forum/posts", async (req, res) => {
  try {
    const eu = Number(req.query.usuario) || 0;
    const [posts] = await pool.query(
      `SELECT x.id_post, x.texto, x.criado_em, x.id_usuario = ? AS minha,
              ${NOME_AUTORA} AS autora,
              (SELECT COUNT(*) FROM forum_curtida c WHERE c.id_post = x.id_post) AS curtidas,
              EXISTS(SELECT 1 FROM forum_curtida c WHERE c.id_post = x.id_post AND c.id_usuario = ?) AS curtiu
       FROM forum_post x ${JUNTAR_AUTORA}
       ORDER BY x.id_post DESC
       LIMIT 100`,
      [eu, eu]
    );

    let comentarios = [];
    if (posts.length > 0) {
      [comentarios] = await pool.query(
        `SELECT x.id_comentario, x.id_post, x.texto, x.criado_em, x.id_usuario = ? AS minha,
                ${NOME_AUTORA} AS autora
         FROM forum_comentario x ${JUNTAR_AUTORA}
         WHERE x.id_post IN (?)
         ORDER BY x.id_comentario`,
        [eu, posts.map((p) => p.id_post)]
      );
    }

    // nunca devolve o id de quem escreveu (protege quem postou como anônima)
    res.json(
      posts.map((p) => ({
        ...p,
        minha: !!p.minha,
        curtiu: !!p.curtiu,
        comentarios: comentarios
          .filter((c) => c.id_post === p.id_post)
          .map((c) => ({ ...c, minha: !!c.minha })),
      }))
    );
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

function textoForumValido(texto) {
  const limpo = (texto || "").trim();
  return limpo && limpo.length <= 1000 ? limpo : null;
}

app.post("/forum/posts", async (req, res) => {
  try {
    const { id_usuario, anonimo } = req.body;
    const texto = textoForumValido(req.body.texto);
    if (!id_usuario || !texto) {
      return res.status(400).json({ ok: false, mensagem: "Escreva uma mensagem de até 1000 caracteres." });
    }
    const [r] = await pool.query(
      "INSERT INTO forum_post (id_usuario, texto, anonimo) VALUES (?, ?, ?)",
      [id_usuario, texto, anonimo ? 1 : 0]
    );
    res.status(201).json({ ok: true, id_post: r.insertId });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// curtir / descurtir (uma curtida por pessoa)
app.post("/forum/posts/:id/curtir", async (req, res) => {
  try {
    const { id_usuario } = req.body;
    if (!id_usuario) return res.status(400).json({ ok: false, mensagem: "Usuária não informada." });
    const [r] = await pool.query(
      "DELETE FROM forum_curtida WHERE id_post = ? AND id_usuario = ?",
      [req.params.id, id_usuario]
    );
    if (r.affectedRows === 0) {
      await pool.query("INSERT INTO forum_curtida (id_post, id_usuario) VALUES (?, ?)", [
        req.params.id,
        id_usuario,
      ]);
    }
    res.json({ ok: true, curtiu: r.affectedRows === 0 });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.post("/forum/posts/:id/comentarios", async (req, res) => {
  try {
    const { id_usuario, anonimo } = req.body;
    const texto = textoForumValido(req.body.texto);
    if (!id_usuario || !texto) {
      return res.status(400).json({ ok: false, mensagem: "Escreva um comentário de até 1000 caracteres." });
    }
    const [r] = await pool.query(
      "INSERT INTO forum_comentario (id_post, id_usuario, texto, anonimo) VALUES (?, ?, ?, ?)",
      [req.params.id, id_usuario, texto, anonimo ? 1 : 0]
    );
    res.status(201).json({ ok: true, id_comentario: r.insertId });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// apagar post: só a dona do post (ou admin)
app.delete("/forum/posts/:id", async (req, res) => {
  try {
    const eu = Number(req.query.usuario) || 0;
    const [[post]] = await pool.query("SELECT id_usuario FROM forum_post WHERE id_post = ?", [req.params.id]);
    if (!post) return res.status(404).json({ ok: false, mensagem: "Post não encontrado." });
    const [[quem]] = await pool.query("SELECT tipo FROM usuario WHERE id_usuario = ?", [eu]);
    if (post.id_usuario !== eu && quem?.tipo !== "admin") {
      return res.status(403).json({ ok: false, mensagem: "Você só pode apagar os seus próprios posts." });
    }
    await pool.query("DELETE FROM forum_post WHERE id_post = ?", [req.params.id]);
    res.json({ ok: true, mensagem: "Post apagado." });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});


// entregas: a doadora registra o que entregou e a beneficiária confirma que recebeu.
// pendente -> concluida ("recebi") ou cancelada ("não recebi" / doadora desistiu)
const ITENS_ENTREGA = ["Absorventes", "Coletor menstrual", "Calcinha absorvente", "Itens de higiene", "Outro"];

app.post("/entregas", async (req, res) => {
  try {
    const rem = await buscarUsuario(req.body.id_remetente);
    const dest = await buscarUsuario(req.body.id_destinatario);
    if (!rem || rem.tipo !== "doadora" || !dest || dest.tipo !== "beneficiaria") {
      return res.status(403).json({ ok: false, mensagem: "Só uma doadora pode registrar a entrega para uma beneficiária." });
    }
    if (rem.email === dest.email) {
      return res.status(400).json({ ok: false, mensagem: "Você não pode registrar uma doação para você mesma." });
    }
    const { item } = req.body;
    const quantidade = Number(req.body.quantidade);
    if (!ITENS_ENTREGA.includes(item)) {
      return res.status(400).json({ ok: false, mensagem: "Escolha o item entregue." });
    }
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 999) {
      return res.status(400).json({ ok: false, mensagem: "Informe a quantidade (de 1 a 999)." });
    }
    const [r] = await pool.query(
      `INSERT INTO doacao (id_usuario_doadora, id_usuario_beneficiaria, item, quantidade, data_doacao, status)
       VALUES (?, ?, ?, ?, CURDATE(), 'pendente')`,
      [rem.id_usuario, dest.id_usuario, item, quantidade]
    );
    res.status(201).json({ ok: true, id_doacao: r.insertId });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// entregas entre duas pessoas (aparecem no chat). Só quem participa pode ver.
app.get("/entregas/entre/:idA/:idB", async (req, res) => {
  try {
    const a = Number(req.params.idA);
    const b = Number(req.params.idB);
    const eu = Number(req.query.usuario);
    if (eu !== a && eu !== b) {
      return res.status(403).json({ ok: false, mensagem: "Você não participa desta conversa." });
    }
    const [linhas] = await pool.query(
      `SELECT id_doacao, item, quantidade, status, criada_em, respondida_em,
              id_usuario_doadora, id_usuario_beneficiaria
       FROM doacao
       WHERE item IS NOT NULL
         AND ((id_usuario_doadora = ? AND id_usuario_beneficiaria = ?)
           OR (id_usuario_doadora = ? AND id_usuario_beneficiaria = ?))
       ORDER BY id_doacao`,
      [a, b, b, a]
    );
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// a beneficiária confirma ("recebi") ou nega ("nao_recebi")
app.put("/entregas/:id/responder", async (req, res) => {
  try {
    const eu = Number(req.body.id_usuario);
    const { resposta } = req.body;
    if (resposta !== "recebi" && resposta !== "nao_recebi") {
      return res.status(400).json({ ok: false, mensagem: "Resposta inválida." });
    }
    const [[e]] = await pool.query("SELECT * FROM doacao WHERE id_doacao = ? AND item IS NOT NULL", [req.params.id]);
    if (!e) return res.status(404).json({ ok: false, mensagem: "Entrega não encontrada." });
    if (e.id_usuario_beneficiaria !== eu) {
      return res.status(403).json({ ok: false, mensagem: "Só a beneficiária que recebeu pode responder." });
    }
    if (e.status !== "pendente") {
      return res.status(409).json({ ok: false, mensagem: "Esta entrega já foi respondida." });
    }
    const status = resposta === "recebi" ? "concluida" : "cancelada";
    await pool.query("UPDATE doacao SET status = ?, respondida_em = NOW() WHERE id_doacao = ?", [status, e.id_doacao]);
    res.json({ ok: true, status });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// a doadora desiste de uma entrega que ainda não foi confirmada
app.put("/entregas/:id/cancelar", async (req, res) => {
  try {
    const eu = Number(req.body.id_usuario);
    const [[e]] = await pool.query("SELECT * FROM doacao WHERE id_doacao = ? AND item IS NOT NULL", [req.params.id]);
    if (!e) return res.status(404).json({ ok: false, mensagem: "Entrega não encontrada." });
    if (e.id_usuario_doadora !== eu) {
      return res.status(403).json({ ok: false, mensagem: "Só quem registrou pode cancelar." });
    }
    if (e.status !== "pendente") {
      return res.status(409).json({ ok: false, mensagem: "Esta entrega já foi respondida." });
    }
    await pool.query("UPDATE doacao SET status = 'cancelada', respondida_em = NOW() WHERE id_doacao = ?", [e.id_doacao]);
    res.json({ ok: true, status: "cancelada" });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// histórico da usuária (o que enviou, se for doadora; o que recebeu, se for beneficiária)
app.get("/entregas/minhas", async (req, res) => {
  try {
    const eu = Number(req.query.usuario) || 0;
    const [linhas] = await pool.query(
      `SELECT e.id_doacao, e.item, e.quantidade, e.status, e.criada_em, e.respondida_em,
              CASE WHEN e.id_usuario_doadora = ? THEN 'enviada' ELSE 'recebida' END AS papel,
              COALESCE((SELECT ${NOME_CADASTRO} FROM usuario u
                         WHERE u.id_usuario = CASE WHEN e.id_usuario_doadora = ?
                                                   THEN e.id_usuario_beneficiaria
                                                   ELSE e.id_usuario_doadora END),
                       'Usuária removida') AS outra
       FROM doacao e
       WHERE e.item IS NOT NULL AND (e.id_usuario_doadora = ? OR e.id_usuario_beneficiaria = ?)
       ORDER BY e.id_doacao DESC
       LIMIT 100`,
      [eu, eu, eu, eu]
    );
    res.json(linhas);
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Connected Woman rodando em http://localhost:${PORT}`);
});
