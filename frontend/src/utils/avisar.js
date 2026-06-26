// avisar.js
// Mostra uma mensagem simples para a usuária.
// Importante: no NAVEGADOR (web), o Alert do React Native não funciona direito,
// por isso usamos o alerta do próprio navegador (window.alert) quando estamos na web.
// No celular, usamos o Alert normal do React Native.

import { Platform, Alert } from 'react-native';

export function avisar(titulo, mensagem) {
  if (Platform.OS === 'web') {
    window.alert(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
  } else {
    Alert.alert(titulo, mensagem);
  }
}
