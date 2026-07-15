import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listarPontos } from '../services/api';
import { cores } from '../theme';

export default function PontosColetaScreen() {
  const [pontos, setPontos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function buscar() {
      try {
        setErro('');
        setCarregando(true);
        const dados = await listarPontos();
        setPontos(dados);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    buscar();
  }, []);

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Pontos de Coleta e Entrega</Text>
      <Text style={estilos.intro}>
        Encontre o ponto de coleta mais próximo de você. Estes locais recebem doações e
        distribuem kits de higiene menstrual.
      </Text>

      <View style={estilos.mapa}>
        <Ionicons name="location" size={40} color={cores.rosa} />
        <Text style={estilos.mapaTitulo}>Mapa Interativo</Text>
        <Text style={estilos.mapaTexto}>Em breve: visualize todos os pontos no mapa</Text>
      </View>

      {carregando && <ActivityIndicator size="large" color={cores.rosa} style={{ marginTop: 20 }} />}

      {!carregando && erro !== '' && <Text style={estilos.aviso}>{erro}</Text>}

      {!carregando && erro === '' && pontos.length === 0 && (
        <Text style={estilos.aviso}>Nenhum ponto de coleta cadastrado ainda.</Text>
      )}

      {pontos.map((ponto) => {
        const estaAberto = ponto.aberto === 1 || ponto.aberto === true;
        return (
          <View key={ponto.id_ponto} style={estilos.cartao}>
            <View style={estilos.cabecalho}>
              <Text style={estilos.nome}>{ponto.nome}</Text>
              <View style={[estilos.selo, estaAberto ? estilos.seloAberto : estilos.seloFechado]}>
                <Text style={[estilos.seloTexto, { color: estaAberto ? cores.verde : '#B00020' }]}>
                  {estaAberto ? 'Aberto' : 'Fechado'}
                </Text>
              </View>
            </View>

            <Linha icone="location-outline" texto={ponto.endereco} />
            <Linha icone="time-outline" texto={ponto.horario} />
            <Linha icone="call-outline" texto={ponto.telefone} />
          </View>
        );
      })}
    </ScrollView>
  );
}

function Linha({ icone, texto }) {
  return (
    <View style={estilos.linha}>
      <Ionicons name={icone} size={16} color={cores.rosa} />
      <Text style={estilos.linhaTexto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: cores.texto, marginBottom: 8 },
  intro: { fontSize: 14, color: cores.textoClaro, marginBottom: 20, lineHeight: 20 },
  aviso: { fontSize: 14, color: cores.textoClaro, textAlign: 'center', marginTop: 16 },
  mapa: {
    backgroundColor: '#FBD9EA',
    borderRadius: 16,
    paddingVertical: 36,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: cores.borda,
  },
  mapaTitulo: { fontSize: 16, fontWeight: 'bold', color: cores.texto, marginTop: 8 },
  mapaTexto: { fontSize: 13, color: cores.textoClaro, marginTop: 4 },
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nome: { fontSize: 16, fontWeight: 'bold', color: cores.texto, flex: 1 },
  selo: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  seloAberto: { backgroundColor: '#DCFCE7' },
  seloFechado: { backgroundColor: '#FEE2E2' },
  seloTexto: { fontSize: 12, fontWeight: '600' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  linhaTexto: { fontSize: 14, color: cores.textoClaro, flex: 1 },
});
