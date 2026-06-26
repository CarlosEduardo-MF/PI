// ComoFuncionaScreen.js
// Tela "Como Funciona" - mostra os 3 passos de uso da plataforma.

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

// Os 3 passos. Cada um tem um ícone, título e descrição.
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

export default function ComoFuncionaScreen() {
  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Como Funciona</Text>
      <Text style={estilos.intro}>
        Em apenas 3 passos você já está fazendo parte dessa rede de solidariedade.
      </Text>

      {PASSOS.map((passo, indice) => (
        <View key={passo.titulo} style={estilos.cartao}>
          {/* Número do passo */}
          <View style={estilos.numeroCirculo}>
            <Text style={estilos.numero}>{indice + 1}</Text>
          </View>

          <View style={estilos.iconeCirculo}>
            <Ionicons name={passo.icone} size={26} color={cores.rosa} />
          </View>

          <Text style={estilos.passoTitulo}>{passo.titulo}</Text>
          <Text style={estilos.passoTexto}>{passo.texto}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: cores.texto, marginBottom: 8 },
  intro: { fontSize: 15, color: cores.textoClaro, marginBottom: 24, lineHeight: 22 },
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
  },
  numeroCirculo: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: cores.rosa,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: { color: cores.branco, fontWeight: 'bold' },
  iconeCirculo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD6E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  passoTitulo: { fontSize: 18, fontWeight: 'bold', color: cores.texto, marginBottom: 8 },
  passoTexto: { fontSize: 14, color: cores.textoClaro, textAlign: 'center', lineHeight: 20 },
});
