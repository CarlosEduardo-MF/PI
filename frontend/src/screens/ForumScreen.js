import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  listarPostsForum,
  criarPostForum,
  curtirPostForum,
  comentarPostForum,
  apagarPostForum,
} from '../services/api';
import { avisar } from '../utils/avisar';
import { cores } from '../theme';

const ATUALIZA_A_CADA_MS = 10000;

function formatarData(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes} às ${hora}:${min}`;
}

export default function ForumScreen({ usuario }) {
  const [posts, setPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [texto, setTexto] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [publicando, setPublicando] = useState(false);

  const [comentandoId, setComentandoId] = useState(null);
  const [comentarioTexto, setComentarioTexto] = useState('');

  const carregar = useCallback(async () => {
    try {
      const dados = await listarPostsForum(usuario.id_usuario);
      setPosts(dados);
      setErro('');
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [usuario.id_usuario]);

  // carrega ao entrar na aba e atualiza sozinho enquanto ela estiver aberta
  useFocusEffect(
    useCallback(() => {
      carregar();
      const timer = setInterval(carregar, ATUALIZA_A_CADA_MS);
      return () => clearInterval(timer);
    }, [carregar])
  );

  async function publicar() {
    const limpo = texto.trim();
    if (!limpo || publicando) return;
    setPublicando(true);
    try {
      await criarPostForum(usuario.id_usuario, limpo, anonimo);
      setTexto('');
      await carregar();
    } catch (e) {
      avisar('Não foi possível publicar', e.message);
    } finally {
      setPublicando(false);
    }
  }

  async function curtir(id) {
    try {
      await curtirPostForum(id, usuario.id_usuario);
      await carregar();
    } catch (e) {
      avisar('Erro', e.message);
    }
  }

  function alternarComentario(id) {
    setComentandoId(comentandoId === id ? null : id);
    setComentarioTexto('');
  }

  async function comentar(postId) {
    const limpo = comentarioTexto.trim();
    if (!limpo) return;
    try {
      await comentarPostForum(postId, usuario.id_usuario, limpo, anonimo);
      setComentarioTexto('');
      await carregar();
    } catch (e) {
      avisar('Não foi possível comentar', e.message);
    }
  }

  async function apagar(postId) {
    try {
      await apagarPostForum(postId, usuario.id_usuario);
      await carregar();
    } catch (e) {
      avisar('Não foi possível apagar', e.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <Text style={estilos.titulo}>Fórum da Comunidade</Text>
        <Text style={estilos.intro}>
          Um espaço seguro para compartilhar experiências, tirar dúvidas e apoiar outras mulheres.
        </Text>

        <View style={estilos.caixaNovo}>
          <TextInput
            style={estilos.input}
            value={texto}
            onChangeText={setTexto}
            placeholder="Escreva algo para a comunidade..."
            placeholderTextColor="#B9A6AF"
            maxLength={1000}
            multiline
          />
          <View style={estilos.rodapeNovo}>
            <TouchableOpacity style={estilos.anonimoBtn} onPress={() => setAnonimo(!anonimo)}>
              <Ionicons
                name={anonimo ? 'checkbox' : 'square-outline'}
                size={20}
                color={cores.rosa}
              />
              <Text style={estilos.anonimoTexto}>Postar como anônima</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.btnPublicar} onPress={publicar} disabled={publicando}>
              <Ionicons name="send" size={16} color={cores.branco} />
              <Text style={estilos.btnPublicarTexto}>Publicar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {carregando && <ActivityIndicator size="large" color={cores.rosa} style={{ marginTop: 20 }} />}
        {!carregando && erro !== '' && <Text style={estilos.aviso}>{erro}</Text>}
        {!carregando && erro === '' && posts.length === 0 && (
          <Text style={estilos.aviso}>Ainda não há publicações. Seja a primeira a escrever! 💗</Text>
        )}

        {posts.map((post) => (
          <View key={post.id_post} style={estilos.card}>
            <View style={estilos.cardTopo}>
              <View style={estilos.avatar}>
                <Text style={estilos.avatarLetra}>{post.autora.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={estilos.autora}>{post.autora}</Text>
                <Text style={estilos.data}>{formatarData(post.criado_em)}</Text>
              </View>
              {(post.minha || usuario.tipo === 'admin') && (
                <TouchableOpacity onPress={() => apagar(post.id_post)}>
                  <Ionicons name="trash-outline" size={18} color={cores.textoClaro} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={estilos.texto}>{post.texto}</Text>

            <View style={estilos.acoes}>
              <TouchableOpacity style={estilos.acaoBtn} onPress={() => curtir(post.id_post)}>
                <Ionicons
                  name={post.curtiu ? 'heart' : 'heart-outline'}
                  size={16}
                  color={cores.rosa}
                />
                <Text style={estilos.acaoTexto}>{post.curtidas}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={estilos.acaoBtn} onPress={() => alternarComentario(post.id_post)}>
                <Ionicons name="chatbubble-outline" size={16} color={cores.rosa} />
                <Text style={estilos.acaoTexto}>{post.comentarios.length}</Text>
              </TouchableOpacity>
            </View>

            {post.comentarios.map((c) => (
              <View key={c.id_comentario} style={estilos.comentario}>
                <Text style={estilos.comentarioAutora}>{c.autora}</Text>
                <Text style={estilos.comentarioTexto}>{c.texto}</Text>
              </View>
            ))}

            {comentandoId === post.id_post && (
              <View style={estilos.caixaComentario}>
                <TextInput
                  style={estilos.inputComentario}
                  value={comentarioTexto}
                  onChangeText={setComentarioTexto}
                  placeholder={anonimo ? 'Comentar como anônima...' : 'Escreva um comentário...'}
                  placeholderTextColor="#B9A6AF"
                  maxLength={1000}
                />
                <TouchableOpacity style={estilos.btnEnviar} onPress={() => comentar(post.id_post)}>
                  <Ionicons name="send" size={14} color={cores.branco} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: cores.texto, marginBottom: 8 },
  intro: { fontSize: 15, color: cores.textoClaro, marginBottom: 20, lineHeight: 22 },
  aviso: { fontSize: 14, color: cores.textoClaro, textAlign: 'center', marginTop: 16 },
  caixaNovo: {
    backgroundColor: cores.branco,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  input: {
    fontSize: 15,
    color: cores.texto,
    minHeight: 48,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  rodapeNovo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  anonimoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  anonimoTexto: { fontSize: 13, color: cores.textoClaro },
  btnPublicar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: cores.rosa,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnPublicarTexto: { color: cores.branco, fontWeight: 'bold' },
  card: {
    backgroundColor: cores.branco,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.rosa,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: { color: cores.branco, fontWeight: 'bold', fontSize: 16 },
  autora: { fontSize: 15, fontWeight: 'bold', color: cores.texto },
  data: { fontSize: 11, color: cores.textoClaro },
  texto: { fontSize: 14, color: cores.textoClaro, lineHeight: 21, marginBottom: 12 },
  acoes: { flexDirection: 'row', gap: 20 },
  acaoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  acaoTexto: { fontSize: 14, color: cores.rosa, fontWeight: '600' },
  comentario: {
    backgroundColor: cores.rosaClaro,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: cores.rosa,
  },
  comentarioAutora: { fontSize: 13, fontWeight: 'bold', color: cores.texto, marginBottom: 2 },
  comentarioTexto: { fontSize: 13, color: cores.textoClaro, lineHeight: 19 },
  caixaComentario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  inputComentario: {
    flex: 1,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: cores.texto,
  },
  btnEnviar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: cores.rosa,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
