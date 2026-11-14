import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarContatosChat } from '../services/api';
import { cores } from '../theme';

export default function ChatListaScreen({ navigation, usuario }) {
  const [contatos, setContatos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // recarrega sempre que a aba ganha foco (mostra a última mensagem atualizada)
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      async function buscar() {
        try {
          setErro('');
          const dados = await listarContatosChat(usuario.id_usuario);
          if (ativo) setContatos(dados);
        } catch (e) {
          if (ativo) setErro(e.message);
        } finally {
          if (ativo) setCarregando(false);
        }
      }
      buscar();
      return () => {
        ativo = false;
      };
    }, [usuario.id_usuario])
  );

  const quem = usuario.tipo === 'doadora' ? 'beneficiárias' : 'doadoras';

  if (carregando) {
    return <ActivityIndicator size="large" color={cores.rosa} style={{ marginTop: 40 }} />;
  }

  return (
    <View style={estilos.tela}>
      {erro !== '' && <Text style={estilos.aviso}>{erro}</Text>}
      <FlatList
        data={contatos}
        keyExtractor={(c) => String(c.id_usuario)}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View>
            <Text style={estilos.logada}>
              Você está conectada como {usuario.email} ({usuario.tipo})
            </Text>
            <Text style={estilos.intro}>Converse com {quem} para combinar a doação.</Text>
          </View>
        }
        ListEmptyComponent={
          erro === '' && <Text style={estilos.aviso}>Ainda não há {quem} cadastradas.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={estilos.item}
            onPress={() =>
              navigation.navigate('Conversa', { id_outro: item.id_usuario, nome: item.nome, tipo_outro: item.tipo })
            }
          >
            <View style={estilos.avatar}>
              <Text style={estilos.avatarLetra}>{(item.nome || '?').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.nome}>{item.nome}</Text>
              <Text style={estilos.ultima} numberOfLines={1}>
                {item.ultima_mensagem || 'Toque para iniciar a conversa'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  logada: { fontSize: 12, color: cores.rosa, fontWeight: '600', marginBottom: 6 },
  intro: { fontSize: 14, color: cores.textoClaro, marginBottom: 14 },
  aviso: { fontSize: 14, color: cores.textoClaro, textAlign: 'center', marginTop: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.branco,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: cores.rosa,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: { color: cores.branco, fontWeight: 'bold', fontSize: 18 },
  nome: { fontSize: 16, fontWeight: 'bold', color: cores.texto },
  ultima: { fontSize: 13, color: cores.textoClaro, marginTop: 2 },
});
