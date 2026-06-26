# Connected Woman — Backend (API) 💗

API do projeto **Connected Woman**, feita em **Node.js + Express** com banco de dados
**MySQL** (usando **queries SQL puras**, sem ORM).

---

## ✅ O que precisa ter instalado

- **Node.js**
- **MySQL** (MySQL Server + MySQL Workbench, ou XAMPP, etc.)

---

## ▶️ Como rodar (passo a passo)

1. **Crie o banco de dados.** Abra o MySQL e rode o arquivo `database.sql`.
   - Pelo terminal:
     ```
     mysql -u root -p < database.sql
     ```
   - Ou copie e cole o conteúdo de `database.sql` no MySQL Workbench e execute.

2. **Configure o acesso ao banco.** Abra o arquivo `.env` e ajuste se necessário
   (usuário, senha do seu MySQL):
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=connected_woman
   PORT=3001
   ```

3. **Instale as dependências** (só na primeira vez):
   ```
   npm install
   ```

4. **Inicie a API:**
   ```
   npm start
   ```
   Vai aparecer: `API Connected Woman rodando em http://localhost:3001`

5. **Teste no navegador:** abra <http://localhost:3001> — deve mostrar uma mensagem de sucesso.
   E <http://localhost:3001/health> testa a conexão com o banco.

---

## 🔑 Logins de teste (já vêm no banco)

| E-mail | Senha | Tipo |
|--------|-------|------|
| `doadora@email.com` | `123456` | doadora |
| `beneficiaria@email.com` | `123456` | beneficiaria |
| `admin@connectedwoman.org` | `123456` | admin |

---

## 📋 Rotas da API

### Teste
- `GET /` — verifica se a API está no ar
- `GET /health` — testa a conexão com o banco

### Login e Cadastro
- `POST /login` — body: `{ email, senha }`
- `POST /cadastro/doadora` — body: `{ nome, email, telefone, cidade, frequencia, senha }`
- `POST /cadastro/beneficiaria` — body: `{ nome, email, telefone, cidade, necessidade, senha }`

### Doadoras
- `GET /doadoras` · `GET /doadoras/:id` · `PUT /doadoras/:id` · `DELETE /doadoras/:id`

### Beneficiárias
- `GET /beneficiarias` · `GET /beneficiarias/:id` · `PUT /beneficiarias/:id` · `DELETE /beneficiarias/:id`

### Intermediárias
- `GET /intermediarias` · `POST /intermediarias`

### Doações
- `GET /doacoes` — lista com os nomes (JOIN)
- `GET /doacoes/doadora/:id` — histórico de uma doadora
- `POST /doacoes` — body: `{ id_doadora, id_intermediaria, id_beneficiaria, data_doacao, status }`
- `PUT /doacoes/:id` — body: `{ status }`
- `DELETE /doacoes/:id`

### Pontos de Coleta
- `GET /pontos` · `POST /pontos` · `DELETE /pontos/:id`

### FAQ (Educação)
- `GET /faqs` · `POST /faqs`

### Relatórios
- `GET /relatorios` — contagens (doadoras, beneficiárias, doações)

---

## 📂 Arquivos

```
backend/
├── server.js       -> servidor Express com todas as rotas
├── db.js           -> conexão com o MySQL (pool)
├── database.sql    -> cria o banco, as tabelas e dados de exemplo
├── .env            -> configurações do banco (ajuste aqui)
└── package.json    -> dependências e scripts
```

---

## 🔗 Como conectar com o app (frontend)

No app React Native, faça requisições para `http://localhost:3001` (no navegador/web) ou
`http://SEU_IP:3001` (no celular). Exemplo de login:

```js
const resposta = await fetch("http://localhost:3001/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, senha }),
});
const dados = await resposta.json();
```
