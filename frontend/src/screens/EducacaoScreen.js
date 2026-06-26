// EducacaoScreen.js
// Tela "Educação" - perguntas frequentes (FAQ).
// Ao tocar em uma pergunta, a resposta aparece embaixo (efeito sanfona).

import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';

// Lista de perguntas e respostas
const PERGUNTAS = [
  {
    pergunta: 'O que é pobreza menstrual?',
    resposta:
      'É a falta de acesso a produtos de higiene menstrual, saneamento básico, infraestrutura e informações adequadas, o que afeta diretamente a dignidade de quem menstrua.',
  },
  {
    pergunta: 'Quantas vezes devo trocar o absorvente?',
    resposta:
      'O ideal é trocar o absorvente a cada 4 horas, mesmo em dias de fluxo mais leve, para evitar infecções e manter a higiene.',
  },
  {
    pergunta: 'O que é um coletor menstrual?',
    resposta:
      'É um recipiente de silicone reutilizável que coleta o fluxo menstrual. Pode durar anos, sendo uma opção econômica e sustentável.',
  },
  {
    pergunta: 'Como descartar absorventes corretamente?',
    resposta:
      'Embrulhe o absorvente usado em papel e descarte no lixo comum. Nunca jogue no vaso sanitário, pois entope e polui o meio ambiente.',
  },
  {
    pergunta: 'Como faço para receber doações?',
    resposta:
      'Basta se cadastrar como beneficiária no app. Nós conectamos você a uma doadora da sua região e indicamos o ponto de coleta mais próximo.',
  },
];

// Sinais de alerta de saúde
const SINAIS = [
  'Dor menstrual que não melhora com analgésicos comuns',
  'Sangramento que dura mais de 7 dias',
  'Ciclos menores que 21 dias ou maiores que 35 dias',
  'Fluxo extremamente intenso',
  'Sintomas de infecção após uso de produtos menstruais inadequados',
];

// Recursos de apoio gratuitos
const RECURSOS = [
  { icone: 'medkit', titulo: 'Postos de Saúde', desc: 'oferecem atendimento ginecológico gratuito' },
  { icone: 'medical', titulo: 'Farmácias populares', desc: 'distribuem absorventes gratuitamente' },
  { icone: 'school', titulo: 'Escolas públicas', desc: 'devem fornecer produtos menstruais às alunas' },
  { icone: 'heart-circle', titulo: 'ONGs e projetos sociais', desc: 'também apoiam mulheres' },
  { icone: 'business', titulo: 'SUS', desc: 'oferece diversos serviços de saúde da mulher sem custo' },
];

export default function EducacaoScreen() {
  // Guarda qual pergunta está aberta (o índice). null = nenhuma aberta.
  const [aberta, setAberta] = useState(null);

  function alternar(indice) {
    // Se tocar na que já está aberta, fecha. Senão, abre a nova.
    setAberta(aberta === indice ? null : indice);
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Educação Menstrual</Text>
      <Text style={estilos.intro}>
        Tire suas dúvidas sobre saúde, higiene e cuidados menstruais.
      </Text>

      {PERGUNTAS.map((item, indice) => {
        const estaAberta = aberta === indice;
        return (
          <View key={indice} style={estilos.cartao}>
            <TouchableOpacity style={estilos.pergunta} onPress={() => alternar(indice)}>
              <Text style={estilos.perguntaTexto}>{item.pergunta}</Text>
              <Ionicons
                name={estaAberta ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={cores.rosa}
              />
            </TouchableOpacity>

            {/* A resposta só aparece quando a pergunta está aberta */}
            {estaAberta && <Text style={estilos.resposta}>{item.resposta}</Text>}
          </View>
        );
      })}

      {/* ----- Sinais de Alerta ----- */}
      <View style={estilos.alertaCartao}>
        <View style={estilos.alertaCabecalho}>
          <Ionicons name="warning" size={20} color="#B45309" />
          <Text style={estilos.alertaTitulo}>Sinais de Alerta</Text>
        </View>
        <Text style={estilos.alertaIntro}>
          Fique atenta a estes sinais que podem indicar problemas de saúde:
        </Text>
        {SINAIS.map((sinal) => (
          <View key={sinal} style={estilos.alertaItem}>
            <Ionicons name="flash" size={14} color="#EF4444" />
            <Text style={estilos.alertaTexto}>{sinal}</Text>
          </View>
        ))}
        <Text style={estilos.alertaRodape}>
          <Text style={estilos.negrito}>
            Em caso de emergência, procure atendimento médico imediatamente.
          </Text>{' '}
          Existem serviços públicos de saúde disponíveis gratuitamente.
        </Text>
      </View>

      {/* ----- Recursos Adicionais ----- */}
      <View style={estilos.recursosCartao}>
        <Text style={estilos.recursosTitulo}>Recursos Adicionais</Text>
        {RECURSOS.map((recurso) => (
          <View key={recurso.titulo} style={estilos.recursoItem}>
            <View style={estilos.recursoIcone}>
              <Ionicons name={recurso.icone} size={18} color={cores.rosa} />
            </View>
            <Text style={estilos.recursoTexto}>
              <Text style={estilos.negrito}>{recurso.titulo}</Text> {recurso.desc}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: cores.texto, marginBottom: 8 },
  intro: { fontSize: 15, color: cores.textoClaro, marginBottom: 20, lineHeight: 22 },
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  pergunta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 10,
  },
  perguntaTexto: { fontSize: 15, fontWeight: '600', color: cores.texto, flex: 1 },
  resposta: {
    fontSize: 14,
    color: cores.textoClaro,
    lineHeight: 21,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  negrito: { fontWeight: 'bold' },
  // ----- Sinais de Alerta (amarelo) -----
  alertaCartao: {
    backgroundColor: '#FEF9C3',
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#FACC15',
  },
  alertaCabecalho: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  alertaTitulo: { fontSize: 17, fontWeight: 'bold', color: '#B45309' },
  alertaIntro: { fontSize: 14, color: '#713F12', marginBottom: 12 },
  alertaItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  alertaTexto: { fontSize: 14, color: '#713F12', flex: 1 },
  alertaRodape: { fontSize: 13, color: '#713F12', marginTop: 8, lineHeight: 19 },
  // ----- Recursos Adicionais (azul) -----
  recursosCartao: {
    backgroundColor: '#DBEAFE',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderLeftWidth: 5,
    borderLeftColor: '#60A5FA',
  },
  recursosTitulo: { fontSize: 18, fontWeight: 'bold', color: '#0D9488', marginBottom: 14 },
  recursoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.branco,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  recursoIcone: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFD6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recursoTexto: { fontSize: 14, color: cores.texto, flex: 1, lineHeight: 19 },
});
