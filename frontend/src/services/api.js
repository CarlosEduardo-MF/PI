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

function del(caminho, corpo) {
  return requisicao(caminho, {
    method: 'DELETE',
    ...(corpo ? { body: JSON.stringify(corpo) } : {}),
  });
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

export function cadastrarInstituicao(dados) {
  return post('/cadastro/instituicao', dados);
}

// dados precisa incluir id_usuario (a instituição ou admin logada)
export function cadastrarPonto(dados) {
  return post('/pontos', dados);
}

export function listarMeusPontos(idUsuario) {
  return get(`/pontos/meus?usuario=${idUsuario}`);
}

export function listarPontosPendentes(idUsuario) {
  return get(`/pontos/pendentes?usuario=${idUsuario}`);
}

export function decidirPonto(idPonto, idUsuario, status) {
  return put(`/pontos/${idPonto}/status`, { id_usuario: idUsuario, status });
}

export function apagarPonto(idPonto, idUsuario) {
  return del(`/pontos/${idPonto}?usuario=${idUsuario}`);
}

export function listarFaqs() {
  return get('/faqs');
}

export function buscarPerfil(tipo, email, idUsuario) {
  return get(`/perfil/${tipo}/${encodeURIComponent(email)}?usuario=${idUsuario}`);
}

export function atualizarPerfil(tipo, email, dados, idUsuario) {
  return put(`/perfil/${tipo}/${encodeURIComponent(email)}`, { ...dados, id_usuario: idUsuario });
}

export function alterarSenha(idUsuario, senhaAtual, novaSenha) {
  return put(`/usuario/${idUsuario}/senha`, { senhaAtual, novaSenha });
}

// apagar a conta exige a senha da usuária
export function deletarConta(idUsuario, senha) {
  return del(`/usuario/${idUsuario}`, { senha });
}

export function listarPostsForum(idUsuario) {
  return get(`/forum/posts?usuario=${idUsuario}`);
}

export function criarPostForum(idUsuario, texto, anonimo) {
  return post('/forum/posts', { id_usuario: idUsuario, texto, anonimo });
}

export function curtirPostForum(idPost, idUsuario) {
  return post(`/forum/posts/${idPost}/curtir`, { id_usuario: idUsuario });
}

export function comentarPostForum(idPost, idUsuario, texto, anonimo) {
  return post(`/forum/posts/${idPost}/comentarios`, { id_usuario: idUsuario, texto, anonimo });
}

export function apagarPostForum(idPost, idUsuario) {
  return del(`/forum/posts/${idPost}?usuario=${idUsuario}`);
}

export function listarContatosChat(idUsuario) {
  return get(`/chat/contatos/${idUsuario}?usuario=${idUsuario}`);
}

export function listarMensagens(idUsuario, idOutro) {
  return get(`/chat/mensagens/${idUsuario}/${idOutro}?usuario=${idUsuario}`);
}

export function enviarMensagem(idRemetente, idDestinatario, texto) {
  return post('/chat/mensagens', {
    id_remetente: idRemetente,
    id_destinatario: idDestinatario,
    texto,
  });
}

export function listarPerfis(idUsuario) {
  return get(`/usuario/${idUsuario}/perfis`);
}

export function registrarEntrega(idRemetente, idDestinatario, item, quantidade) {
  return post('/entregas', {
    id_remetente: idRemetente,
    id_destinatario: idDestinatario,
    item,
    quantidade,
  });
}

export function listarEntregasEntre(idUsuario, idOutro) {
  return get(`/entregas/entre/${idUsuario}/${idOutro}?usuario=${idUsuario}`);
}

export function responderEntrega(idEntrega, idUsuario, resposta) {
  return put(`/entregas/${idEntrega}/responder`, { id_usuario: idUsuario, resposta });
}

export function cancelarEntrega(idEntrega, idUsuario) {
  return put(`/entregas/${idEntrega}/cancelar`, { id_usuario: idUsuario });
}

export function listarMinhasEntregas(idUsuario) {
  return get(`/entregas/minhas?usuario=${idUsuario}`);
}
