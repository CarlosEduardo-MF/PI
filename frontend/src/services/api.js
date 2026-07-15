import { Platform } from 'react-native';

const IP_DA_MAQUINA = '192.168.0.10';

export const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:3001'
    : `http://${IP_DA_MAQUINA}:3001`;

async function requisicao(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    });
  } catch (erro) {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se o back-end está rodando.'
    );
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    const msg =
      (dados && (dados.mensagem || dados.erro)) ||
      `Erro ${resposta.status} ao chamar a API.`;
    throw new Error(msg);
  }

  return dados;
}

function get(caminho) {
  return requisicao(caminho, { method: 'GET' });
}

function post(caminho, corpo) {
  return requisicao(caminho, { method: 'POST', body: JSON.stringify(corpo) });
}

function put(caminho, corpo) {
  return requisicao(caminho, { method: 'PUT', body: JSON.stringify(corpo) });
}

function del(caminho) {
  return requisicao(caminho, { method: 'DELETE' });
}


export function login(email, senha) {
  return post('/login', { email, senha });
}

export function cadastrarDoadora(dados) {
  return post('/cadastro/doadora', dados);
}

export function cadastrarBeneficiaria(dados) {
  return post('/cadastro/beneficiaria', dados);
}

export function listarPontos() {
  return get('/pontos');
}

export function listarFaqs() {
  return get('/faqs');
}

export function buscarPerfil(tipo, email) {
  return get(`/perfil/${tipo}/${encodeURIComponent(email)}`);
}

export function atualizarPerfil(tipo, email, dados) {
  return put(`/perfil/${tipo}/${encodeURIComponent(email)}`, dados);
}

export function alterarSenha(idUsuario, senhaAtual, novaSenha) {
  return put(`/usuario/${idUsuario}/senha`, { senhaAtual, novaSenha });
}

export function deletarConta(idUsuario) {
  return del(`/usuario/${idUsuario}`);
}
