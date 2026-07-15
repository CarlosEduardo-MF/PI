import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { cores } from '../theme';

export default function Botao({ titulo, onPress, tipo = 'cheio', estilo }) {
  const ehContorno = tipo === 'contorno';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[estilos.base, ehContorno ? estilos.contorno : estilos.cheio, estilo]}
    >
      <Text style={[estilos.texto, ehContorno && estilos.textoContorno]}>
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cheio: {
    backgroundColor: cores.rosa,
  },
  contorno: {
    backgroundColor: cores.branco,
    borderWidth: 1.5,
    borderColor: cores.rosa,
  },
  texto: {
    color: cores.branco,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoContorno: {
    color: cores.rosa,
  },
});
