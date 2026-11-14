# Connected Woman 💗

Projeto **Connected Woman** — uma plataforma que conecta mulheres através da solidariedade
para combater a **pobreza menstrual**, unindo doadoras e beneficiárias.

O projeto está dividido em duas partes:

```
PI/
├── frontend/   -> App (React Native + Expo) — a parte visual
└── backend/    -> API (Node.js + Express + MySQL) — as funcionalidades e o banco
```

---

## ✨ O que o app faz

- **Cadastro e login** de doadoras, beneficiárias e instituições. O mesmo e-mail pode ter um perfil de doadora e um de beneficiária.
- **Mapa de pontos de coleta**, com filtro por cidade e status **Aberto/Fechado** calculado pelo horário de funcionamento.
- **Instituições** cadastram pontos de coleta, e a **administradora aprova** cada ponto antes de ele aparecer no mapa.
- **Chat** entre doadoras e beneficiárias.
- **Registro de entregas** no chat: a doadora informa o que entregou e a beneficiária confirma o recebimento.
- **Fórum** da comunidade, com curtidas, comentários e opção de postar como anônima.
- **Educação** (perguntas frequentes) e **Perfil** (editar dados, trocar senha, apagar conta).

---

## 🚀 Como rodar (passo a passo)

O GitHub guarda só o código. O banco de dados, a senha do MySQL e as dependências
**não vêm junto**, então em uma máquina nova siga estes passos, **nesta ordem**.

### O que precisa estar instalado
- [Node.js](https://nodejs.org) (versão 18 ou mais nova)
- [MySQL 8](https://dev.mysql.com/downloads/) e o MySQL Workbench
- Git

### 1. Baixar o projeto
```
git clone https://github.com/CarlosEduardo-MF/PI.git
cd PI
```

### 2. Criar o banco de dados
1. Abra o **MySQL Workbench** e entre na sua conexão local.
2. Menu **File → Open SQL Script** e escolha `backend/database.sql`.
3. Clique no raio ⚡ (Execute). Rode **uma vez só**.

Isso cria o banco `connected_woman` com as 11 tabelas e alguns dados de exemplo.

> Já tem o banco de uma versão anterior? Em vez do `database.sql`, rode os arquivos
> `backend/migracao_*.sql` que ainda não rodou. Eles só adicionam o que é novo, sem apagar dados.

### 3. Configurar e ligar o backend (a API)
```
cd backend
copy .env.example .env        (no Mac/Linux: cp .env.example .env)
```
Abra o arquivo `.env` e coloque a **senha do seu MySQL** em `DB_PASSWORD`. Depois:
```
npm install
npm run dev
```
Quando aparecer `API Connected Woman rodando em http://localhost:3001`, está no ar.
**Deixe este terminal aberto.**

### 4. Ligar o frontend (o app)
Em **outro** terminal:
```
cd frontend
npm install
npm run web
```
O app abre no navegador em `http://localhost:8081`.

👉 Detalhes de cada parte: [`backend/README.md`](backend/README.md) e [`frontend/README.md`](frontend/README.md)

---

## 🔑 Contas de exemplo

O `database.sql` cria estas contas para você testar (senha **123456**):

| Perfil | E-mail |
|---|---|
| Doadora | `doadora@email.com` |
| Beneficiária | `beneficiaria@email.com` |
| Administradora | `admin@connectedwoman.org` |

- **Troque a senha da administradora** logo na primeira vez (Perfil → Alterar senha).
- Para testar o **chat**, entre com a doadora em uma janela e com a beneficiária em uma janela anônima do navegador.
- Para testar **pontos de coleta**: em "Cadastre-se", escolha **Sou instituição** e cadastre um ponto. Ele só aparece no mapa depois que a administradora aprovar (aba Pontos → "Pontos aguardando aprovação").

---

## 🛠️ Problemas comuns

| O que aparece | O que fazer |
|---|---|
| "Não foi possível conectar ao servidor" | O backend não está rodando. Rode `npm run dev` na pasta `backend`. |
| `Access denied for user 'root'` no backend | A senha do MySQL no `backend/.env` está errada. |
| Erro de tabela ou coluna inexistente | O banco está desatualizado. Rode o `database.sql` (banco novo) ou os `migracao_*.sql`. |
| Mapa em branco | O mapa precisa de internet. |
| Ponto novo sem pin no mapa | O endereço não foi encontrado. Confira rua, número e cidade. |

**No celular:** o app aponta para `localhost`, que só funciona no navegador do próprio computador.
Para abrir no celular é preciso ajustar o IP da máquina em `frontend/src/services/api.js`
(`IP_DA_MAQUINA`) e usar um build do app, já que o Expo Go pode não rodar esta versão.

---

## 🧩 Tecnologias

- **Frontend:** React Native, Expo, React Navigation
- **Backend:** Node.js, Express, MySQL (queries SQL puras)
- **Mapa:** Leaflet + OpenStreetMap, e Nominatim para transformar endereço em localização

---

Projeto Integrador — Senac São Leopoldo.
Autoria: Cássius Vinícius Ribeiro da Silva, Lavínia Orth Figueiredo, Maria Luiza Bernardo Duarte.
