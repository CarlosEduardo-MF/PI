import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

const POSTS_INICIAIS = [
  {
    id: 1,
    autora: 'Mariana',
    texto: 'Alguém sabe onde consigo absorventes gratuitos em Canoas?',
    curtidas: 4,
    comentarios: [
      { id: 11, autora: 'Juliana', texto: 'Tem um ponto de coleta na Casa da Mulher em Canoas!' },
    ],
  },
  {
    id: 2,
    autora: 'Juliana',
    texto: 'Esse projeto é maravilhoso! Já consegui doar um kit essa semana 💗',
    curtidas: 12,
    comentarios: [],
  },
  {
    id: 3,
    autora: 'Beatriz',
    texto: 'Dica: o coletor menstrual mudou minha vida, dura anos e economiza muito.',
    curtidas: 8,
    comentarios: [
      { id: 31, autora: 'Anônima', texto: 'Vou experimentar, obrigada pela dica!' },
    ],
  },
  {
    id: 4,
    autora: 'Anônima',
    texto: 'Obrigada por existir essa comunidade. Me sinto acolhida aqui.',
    curtidas: 15,
    comentarios: [],
  },
];

export default function ForumScreen() {
  const [posts, setPosts] = useState(POSTS_INICIAIS);
  const [texto, setTexto] = useState('');

  const [comentandoId, setComentandoId] = useState(null);
  const [comentarioTexto, setComentarioTexto] = useState('');

  function publicar() {
    const limpo = texto.trim();
    if (!limpo) return;
    const novo = { id: Date.now(), autora: 'Você', texto: limpo, curtidas: 0, comentarios: [] };
    setPosts([novo, ...posts]);
    setTexto('');
  }

  function curtir(id) {
    setPosts(posts.map((p) => (p.id === id ? { ...p, curtidas: p.curtidas + 1 } : p)));
  }

  function alternarComentario(id) {
    setComentandoId(comentandoId === id ? null : id);
    setComentarioTexto('');
  }

  function comentar(postId) {
    const limpo = comentarioTexto.trim();
    if (!limpo) return;
    const novoComentario = { id: Date.now(), autora: 'Você', texto: limpo };
    setPosts(
      posts.map((p) =>
        p.id === postId ? { ...p, comentarios: [...p.comentarios, novoComentario] } : p
      )
    );
    setComentarioTexto('');
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
            multiline
          />
          <TouchableOpacity style={estilos.btnPublicar} onPress={publicar}>
            <Ionicons name="send" size={16} color={cores.branco} />
            <Text style={estilos.btnPublicarTexto}>Publicar</Text>
          </TouchableOpacity>
        </View>

        {posts.map((post) => (
          <View key={post.id} style={estilos.card}>
            <View style={estilos.cardTopo}>
              <View style={estilos.avatar}>
                <Text style={estilos.avatarLetra}>{post.autora.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={estilos.autora}>{post.autora}</Text>
            </View>

            <Text style={estilos.texto}>{post.texto}</Text>

            <View style={estilos.acoes}>
              <TouchableOpacity style={estilos.acaoBtn} onPress={() => curtir(post.id)}>
                <Ionicons name="heart" size={16} color={cores.rosa} />
                <Text style={estilos.acaoTexto}>{post.curtidas}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={estilos.acaoBtn} onPress={() => alternarComentario(post.id)}>
                <Ionicons name="chatbubble-outline" size={16} color={cores.rosa} />
                <Text style={estilos.acaoTexto}>{post.comentarios.length}</Text>
              </TouchableOpacity>
            </View>

            {post.comentarios.map((c) => (
              <View key={c.id} style={estilos.comentario}>
                <Text style={estilos.comentarioAutora}>{c.autora}</Text>
                <Text style={estilos.comentarioTexto}>{c.texto}</Text>
              </View>
            ))}

            {comentandoId === post.id && (
              <View style={estilos.caixaComentario}>
                <TextInput
                  style={estilos.inputComentario}
                  value={comentarioTexto}
                  onChangeText={setComentarioTexto}
                  placeholder="Escreva um comentário..."
                  placeholderTextColor="#B9A6AF"
                />
                <TouchableOpacity style={estilos.btnEnviar} onPress={() => comentar(post.id)}>
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
  btnPublicar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: cores.rosa,
    borderRadius: 10,
    paddingVertical: 10,
    alignSelf: 'flex-end',
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
