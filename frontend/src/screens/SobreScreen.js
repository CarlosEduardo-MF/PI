import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

const ODS = [
  { numero: '1', texto: 'Erradicação da pobreza' },
  { numero: '3', texto: 'Saúde e bem-estar' },
  { numero: '10', texto: 'Redução das desigualdades' },
];

const PASSOS = [
  {
    icone: 'person-add',
    titulo: 'Cadastro',
    texto: 'Crie seu perfil como doadora ou beneficiária. O processo é simples, rápido e seguro.',
  },
  {
    icone: 'link',
    titulo: 'Conexão',
    texto: 'Nossa plataforma conecta doadoras com mulheres que precisam de ajuda na sua região.',
  },
  {
    icone: 'gift',
    titulo: 'Doação',
    texto: 'A entrega é combinada com segurança em pontos de coleta próximos a você.',
  },
];

export default function SobreScreen() {
  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Sobre o projeto</Text>

      <View style={estilos.cartao}>
        <Text style={estilos.subtitulo}>O que é a Connected Woman?</Text>
        <Text style={estilos.texto}>
          A Connected Woman é uma plataforma digital que conecta mulheres através da
          solidariedade. Unimos doadoras e beneficiárias para combater a pobreza menstrual,
          promovendo dignidade, saúde e empoderamento feminino.
        </Text>
      </View>

      <View style={estilos.cartao}>
        <Text style={estilos.subtitulo}>Nossa missão</Text>
        <Text style={estilos.texto}>
          Reduzir as desigualdades enfrentadas por mulheres em situação de vulnerabilidade,
          usando a tecnologia como ponte para o apoio entre mulheres e garantindo o acesso a
          itens básicos de higiene menstrual.
        </Text>
      </View>

      <Text style={estilos.subtitulo}>Como Funciona</Text>
      <View style={estilos.listaPassos}>
        {PASSOS.map((passo, i) => (
          <View key={passo.titulo} style={estilos.passo}>
            <View style={estilos.passoNumero}>
              <Text style={estilos.passoNumeroTexto}>{i + 1}</Text>
            </View>
            <View style={estilos.passoIcone}>
              <Ionicons name={passo.icone} size={20} color={cores.rosa} />
            </View>
            <View style={estilos.passoTextos}>
              <Text style={estilos.passoTitulo}>{passo.titulo}</Text>
              <Text style={estilos.passoTexto}>{passo.texto}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={estilos.subtitulo}>Conectado aos ODS da ONU</Text>
      <View style={estilos.listaOds}>
        {ODS.map((item) => (
          <View key={item.numero} style={estilos.itemOds}>
            <View style={estilos.bolinhaOds}>
              <Text style={estilos.numeroOds}>{item.numero}</Text>
            </View>
            <Text style={estilos.textoOds}>{item.texto}</Text>
          </View>
        ))}
      </View>

      <View style={estilos.frase}>
        <Ionicons name="heart" size={20} color={cores.rosa} />
        <Text style={estilos.fraseTexto}>
          Juntas somos mais fortes. Dignidade menstrual é um direito de todas.
        </Text>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: cores.texto, marginBottom: 16 },
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  subtitulo: { fontSize: 17, fontWeight: 'bold', color: cores.rosa, marginBottom: 10 },
  texto: { fontSize: 15, color: cores.textoClaro, lineHeight: 22 },
  listaPassos: { marginBottom: 20 },
  passo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.branco,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  passoNumero: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: cores.rosa,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passoNumeroTexto: { color: cores.branco, fontWeight: 'bold', fontSize: 13 },
  passoIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passoTextos: { flex: 1 },
  passoTitulo: { fontSize: 15, fontWeight: 'bold', color: cores.texto, marginBottom: 2 },
  passoTexto: { fontSize: 13, color: cores.textoClaro, lineHeight: 18 },
  listaOds: { marginBottom: 20 },
  itemOds: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.branco,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  bolinhaOds: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: cores.rosa,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroOds: { color: cores.branco, fontWeight: 'bold', fontSize: 16 },
  textoOds: { fontSize: 15, color: cores.texto, fontWeight: '600' },
  frase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFD6E8',
    borderRadius: 12,
    padding: 16,
  },
  fraseTexto: { flex: 1, color: cores.texto, fontStyle: 'italic', lineHeight: 20 },
});
