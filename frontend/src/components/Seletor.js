// Seletor.js
// "Dropdown" simples para escolher uma opção de uma lista
// (ex: Cidade, Frequência de doação, Tipo de necessidade).
// Ao tocar, abre uma janelinha (Modal) com as opções.

import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { cores } from '../theme';

export default function Seletor({ rotulo, valor, opcoes, aoEscolher, placeholder }) {
  const [aberto, setAberto] = useState(false);

  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>

      {/* Caixa que mostra a opção escolhida (ou o placeholder) */}
      <TouchableOpacity style={estilos.caixa} onPress={() => setAberto(true)}>
        <Text style={[estilos.textoCaixa, !valor && estilos.placeholder]}>
          {valor || placeholder}
        </Text>
        <Text style={estilos.seta}>⌄</Text>
      </TouchableOpacity>

      {/* Janela com a lista de opções */}
      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <TouchableOpacity style={estilos.fundo} activeOpacity={1} onPress={() => setAberto(false)}>
          <View style={estilos.janela}>
            <Text style={estilos.tituloJanela}>{rotulo}</Text>
            <FlatList
              data={opcoes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={estilos.opcao}
                  onPress={() => {
                    aoEscolher(item);
                    setAberto(false);
                  }}
                >
                  <Text style={estilos.textoOpcao}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { marginBottom: 16 },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 6 },
  caixa: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: cores.branco,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textoCaixa: { fontSize: 15, color: cores.texto },
  placeholder: { color: '#B9A6AF' },
  seta: { fontSize: 18, color: cores.textoClaro },
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 30,
  },
  janela: {
    backgroundColor: cores.branco,
    borderRadius: 14,
    padding: 16,
    maxHeight: '60%',
  },
  tituloJanela: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.texto,
    marginBottom: 10,
  },
  opcao: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.rosaClaro,
  },
  textoOpcao: { fontSize: 15, color: cores.texto },
});
