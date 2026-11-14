import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { listarPontosPendentes, decidirPonto } from '../services/api';
import { avisar } from '../utils/avisar';
import { cores } from '../theme';

export default function AprovacaoPontosScreen({ usuario }) {
  const [pontos, setPontos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [decidindo, setDecidindo] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setErro('');
      setPontos(await listarPontosPendentes(usuario.id_usuario));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [usuario.id_usuario]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function decidir(ponto, status) {
    setDecidindo(ponto.id_ponto);
    try {
      await decidirPonto(ponto.id_ponto, usuario.id_usuario, status);
      await carregar();
    } catch (e) {
      avisar('Não foi possível salvar', e.message);
    } finally {
      setDecidindo(null);
    }
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Pontos aguardando aprovação</Text>
      <Text style={estilos.intro}>
        Confira o endereço antes de aprovar. Só os pontos aprovados aparecem no mapa para as
        usuárias.
      </Text>

      {carregando && <ActivityIndicator size="large" color={cores.rosa} style={{ marginTop: 20 }} />}
      {!carregando && erro !== '' && <Text style={estilos.aviso}>{erro}</Text>}
      {!carregando && erro === '' && pontos.length === 0 && (
        <Text style={estilos.aviso}>Nenhum ponto aguardando aprovação. 🎉</Text>
      )}

      {pontos.map((p) => {
        const temPin = p.latitude != null && p.longitude != null;
        return (
          <View key={p.id_ponto} style={estilos.cartao}>
            <Text style={estilos.nome}>{p.nome}</Text>
            <Text style={estilos.instituicao}>
              Enviado por: {p.instituicao || 'instituição sem cadastro'}
            </Text>

            <Linha icone="location-outline" texto={p.endereco} />
            <Linha icone="time-outline" texto={p.horario} />
            {!!p.telefone && <Linha icone="call-outline" texto={p.telefone} />}
            <Linha
              icone={temPin ? 'checkmark-circle-outline' : 'warning-outline'}
              texto={
                temPin
                  ? 'Endereço localizado no mapa'
                  : 'Endereço NÃO localizado no mapa (ficará sem pin)'
              }
              cor={temPin ? cores.verde : '#B00020'}
            />

            <View style={estilos.botoes}>
              <TouchableOpacity
                style={[estilos.btn, estilos.btnRecusar]}
                onPress={() => decidir(p, 'recusado')}
                disabled={decidindo === p.id_ponto}
              >
                <Text style={estilos.btnRecusarTexto}>Recusar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[estilos.btn, estilos.btnAprovar]}
                onPress={() => decidir(p, 'aprovado')}
                disabled={decidindo === p.id_ponto}
              >
                <Text style={estilos.btnAprovarTexto}>Aprovar</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function Linha({ icone, texto, cor }) {
  return (
    <View style={estilos.linha}>
      <Ionicons name={icone} size={16} color={cor || cores.rosa} />
      <Text style={[estilos.linhaTexto, cor && { color: cor }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: cores.texto, marginBottom: 8 },
  intro: { fontSize: 14, color: cores.textoClaro, marginBottom: 20, lineHeight: 20 },
  aviso: { fontSize: 14, color: cores.textoClaro, textAlign: 'center', marginTop: 16 },
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  nome: { fontSize: 16, fontWeight: 'bold', color: cores.texto },
  instituicao: { fontSize: 12, color: cores.textoClaro, marginBottom: 10 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  linhaTexto: { fontSize: 14, color: cores.textoClaro, flex: 1 },
  botoes: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  btnAprovar: { backgroundColor: cores.verde },
  btnAprovarTexto: { color: cores.branco, fontWeight: 'bold' },
  btnRecusar: { borderWidth: 1.5, borderColor: '#B00020', backgroundColor: cores.branco },
  btnRecusarTexto: { color: '#B00020', fontWeight: 'bold' },
});
