import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { montarHtmlMapa } from '../utils/mapaHtml';

// versão do celular (Android/iOS)
export default function MapaPontos({ pontos, altura = 320 }) {
  return (
    <View style={{ height: altura, borderRadius: 16, overflow: 'hidden' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: montarHtmlMapa(pontos) }}
        javaScriptEnabled
        nestedScrollEnabled
        style={{ flex: 1 }}
      />
    </View>
  );
}
