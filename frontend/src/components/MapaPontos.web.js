import { montarHtmlMapa } from '../utils/mapaHtml';

// versão do navegador
export default function MapaPontos({ pontos, altura = 320 }) {
  return (
    <iframe
      title="Mapa dos pontos de coleta"
      srcDoc={montarHtmlMapa(pontos)}
      style={{ width: '100%', height: altura, border: 0, borderRadius: 16 }}
    />
  );
}
