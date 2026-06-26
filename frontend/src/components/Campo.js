// Campo.js
// Campo de texto com um rótulo (label) em cima.
// Usado nos formulários de Login e Cadastro.

import { View, Text, TextInput, StyleSheet } from 'react-native';
import { cores } from '../theme';

export default function Campo({ rotulo, valor, aoMudar, placeholder, tipoTeclado, senha }) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        style={estilos.input}
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor="#B9A6AF"
        keyboardType={tipoTeclado}
        secureTextEntry={senha}
        autoCapitalize="none"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: {
    marginBottom: 16,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: cores.texto,
    backgroundColor: cores.branco,
  },
});
