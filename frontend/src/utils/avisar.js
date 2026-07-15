import { Platform, Alert } from 'react-native';

export function avisar(titulo, mensagem) {
  if (Platform.OS === 'web') {
    window.alert(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
  } else {
    Alert.alert(titulo, mensagem);
  }
}
