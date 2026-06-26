# Connected Woman 💗

Projeto **Connected Woman** — uma plataforma que conecta mulheres através da solidariedade
para combater a **pobreza menstrual**, unindo doadoras e beneficiárias.

O projeto está dividido em duas partes:

```
PI/
├── frontend/   -> App mobile (React Native + Expo) — a parte visual
└── backend/    -> API (Node.js + Express + MySQL) — as funcionalidades e o banco
```

---

## 🚀 Como rodar

### 1. Frontend (o app)
```
cd frontend
npm install
npx expo start --web      (no navegador)   ou   npx expo start   (no celular, via Expo Go)
```
👉 Instruções completas em [`frontend/README.md`](frontend/README.md)

### 2. Backend (a API + banco)
```
cd backend
npm install
# crie o banco rodando o database.sql no MySQL, ajuste o .env, e:
npm start
```
👉 Instruções completas em [`backend/README.md`](backend/README.md)

---

## 🧩 Tecnologias

- **Frontend:** React Native, Expo, React Navigation
- **Backend:** Node.js, Express, MySQL (queries SQL puras)

---

Projeto Integrador — Senac São Leopoldo.
Autoria: Cássius Vinícius Ribeiro da Silva, Lavínia Orth Figueiredo, Maria Luiza Bernardo Duarte.
