import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Botao from '../components/Botao';
import { cores } from '../theme';

export default function InicioScreen({ navigation }) {
  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.selo}>
        <Ionicons name="heart" size={16} color={cores.rosa} />
        <Text style={estilos.seloTexto}>Dignidade Menstrual para Todas</Text>
      </View>

      <View style={estilos.heroCard}>
        <Image
          source={require('../img/mulheres.jpg')}
          style={estilos.heroImagem}
          resizeMode="contain"
        />
      </View>

      <Text style={estilos.titulo}>Connected Woman</Text>
      <Text style={estilos.texto}>
        Conectando mulheres através da solidariedade. Nossa plataforma une doadoras e
        beneficiárias para combater a pobreza menstrual e promover dignidade, saúde e
        empoderamento feminino.
      </Text>

      <View style={estilos.botoes}>
        <Botao titulo="Quero Doar" onPress={() => navigation.navigate('Pontos')} estilo={estilos.botao} />
        <Botao titulo="Preciso de Ajuda" tipo="contorno" onPress={() => navigation.navigate('Pontos')} estilo={estilos.botao} />
      </View>

      <View style={estilos.estatisticas}>
        <Estatistica icone="people" numero="1.200+" rotulo="Mulheres Ajudadas" />
        <Estatistica icone="cube" numero="5.000+" rotulo="Kits Doados" />
        <Estatistica icone="heart" numero="800+" rotulo="Doadoras Ativas" />
      </View>
    </ScrollView>
  );
}

function Estatistica({ icone, numero, rotulo }) {
  return (
    <View style={estilos.itemEstat}>
      <Ionicons name={icone} size={26} color={cores.rosa} />
      <Text style={estilos.numero}>{numero}</Text>
      <Text style={estilos.rotuloEstat}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 24 },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    backgroundColor: '#FFD6E8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginBottom: 20,
  },
  seloTexto: { color: cores.rosa, fontWeight: '600' },
  heroCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: cores.branco,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroImagem: {
    width: '100%',
    height: 160,
  },
  titulo: { fontSize: 26, fontWeight: 'bold', color: cores.texto, marginBottom: 12, textAlign: 'center' },
  texto: { fontSize: 15, color: cores.textoClaro, lineHeight: 22, marginBottom: 20, textAlign: 'center' },
  botoes: { gap: 12, marginBottom: 28 },
  botao: {},
  estatisticas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemEstat: { alignItems: 'center', flex: 1 },
  numero: { fontSize: 20, fontWeight: 'bold', color: cores.texto, marginTop: 6, textAlign: 'center' },
  rotuloEstat: { fontSize: 12, color: cores.textoClaro, textAlign: 'center', marginTop: 2 },
});
