# Connected Woman — Frontend (App Mobile) 💗

Aplicativo mobile do projeto **Connected Woman**, feito em **React Native com Expo**.
Conecta mulheres através da solidariedade para combater a **pobreza menstrual**.

---

## ✅ O que precisa ter instalado

- **Node.js**
- **App "Expo Go"** no celular (Play Store / App Store) — opcional, só para testar no celular

---

## ▶️ Como rodar

1. Abra o terminal **dentro da pasta `frontend`**.
2. Instale as dependências (só na primeira vez):
   ```
   npm install
   ```
3. Inicie o projeto:
   - No **navegador** (mais fácil de ver rápido):
     ```
     npx expo start --web
     ```
     Abre em <http://localhost:8081>.
   - No **celular** (formato real de app):
     ```
     npx expo start
     ```
     Escaneie o QR Code com o app **Expo Go** (celular e PC no mesmo Wi-Fi).

---

## 📱 Telas do app

| Tela | O que faz |
|------|-----------|
| **Login** | E-mail, senha, "Esqueceu a senha?" e botões para entrar como doadora/beneficiária. |
| **Cadastro** | Formulário com seletor "Quero doar" / "Preciso de ajuda". |
| **Início** | Apresentação do projeto e estatísticas. |
| **Sobre** | Projeto, missão e ODS da ONU. |
| **Como Funciona** | Os 3 passos: cadastro, conexão e doação. |
| **Pontos de Coleta** | Lista de pontos (e espaço para o mapa). |
| **Educação** | Perguntas frequentes (FAQ). |
| **Perfil** | Configurações da conta + botão **Sair** (logout), no ícone de perfil do topo. |

---

## 📂 Organização

```
frontend/
├── App.js                  -> navegação (login + abas + perfil/logout)
├── src/
│   ├── theme.js            -> cores do app
│   ├── components/         -> Botao, Campo, Seletor
│   ├── utils/avisar.js     -> mensagens (funciona na web e no celular)
│   └── screens/            -> todas as telas
```

---

## 🔗 Conectar com o backend

A API fica na pasta `../backend`. Para chamar a API do app, use `fetch` apontando para
`http://localhost:3001` (web) ou `http://SEU_IP:3001` (celular). Veja exemplos no README do backend.

> 💡 Mude as cores do app todo em um lugar só: `src/theme.js`.
