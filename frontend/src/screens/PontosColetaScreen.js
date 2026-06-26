// PontosColetaScreen.js
// Tela "Pontos de Coleta e Entrega".
// Tem um espaço reservado para o mapa (será adicionado depois) e
// uma lista de pontos onde é possível deixar ou retirar doações.

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

// Lista de pontos (dados de exemplo, só para mostrar visualmente)
const PONTOS = [
  {
    nome: 'Centro Comunitário Restinga',
    endereco: 'Rua das Flores, 123 - Restinga, Porto Alegre',
    horario: 'Seg a Sex: 9h às 18h',
    telefone: '(51) 3333-4444',
    aberto: true,
  },
  {
    nome: 'Casa da Mulher - Canoas',
    endereco: 'Av. Central, 456 - Centro, Canoas',
    horario: 'Seg a Sáb: 8h às 17h',
    telefone: '(51) 3555-6666',
    aberto: true,
  },
  {
    nome: 'Posto de Saúde São Leopoldo',
    endereco: 'Rua Brasil, 789 - Centro, São Leopoldo',
    horario: 'Seg a Sex: 7h às 19h',
    telefone: '(51) 3777-8888',
    aberto: false,
  },
];

export default function PontosColetaScreen() {
  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Pontos de Coleta e Entrega</Text>
      <Text style={estilos.intro}>
        Encontre o ponto de coleta mais próximo de você. Estes locais recebem doações e
        distribuem kits de higiene menstrual.
      </Text>

      {/* Espaço reservado para o mapa (placeholder) */}
      <View style={estilos.mapa}>
        <Ionicons name="location" size={40} color={cores.rosa} />
        <Text style={estilos.mapaTitulo}>Mapa Interativo</Text>
        <Text style={estilos.mapaTexto}>Em breve: visualize todos os pontos no mapa</Text>
      </View>

      {/* Lista de pontos */}
      {PONTOS.map((ponto) => (
        <View key={ponto.nome} style={estilos.cartao}>
          <View style={estilos.cabecalho}>
            <Text style={estilos.nome}>{ponto.nome}</Text>
            <View style={[estilos.selo, ponto.aberto ? estilos.seloAberto : estilos.seloFechado]}>
              <Text style={[estilos.seloTexto, { color: ponto.aberto ? cores.verde : '#B00020' }]}>
                {ponto.aberto ? 'Aberto' : 'Fechado'}
              </Text>
            </View>
          </View>

          <Linha icone="location-outline" texto={ponto.endereco} />
          <Linha icone="time-outline" texto={ponto.horario} />
          <Linha icone="call-outline" texto={ponto.telefone} />
        </View>
      ))}
    </ScrollView>
  );
}

// Linha de informação com ícone (endereço, horário, telefone)
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
