// Monta a página HTML com o mapa (Leaflet + OpenStreetMap, sem chave de API).
// É usada pelo MapaPontos no celular (WebView) e na web (iframe).

function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function montarHtmlMapa(pontos) {
  const dados = pontos.map((p) => ({
    lat: Number(p.latitude),
    lng: Number(p.longitude),
    aberto: p.aberto === 1 || p.aberto === true,
    html:
      `<b>${escapar(p.nome)}</b><br>${escapar(p.endereco)}<br>${escapar(p.horario)}` +
      `<br>${p.aberto === 1 || p.aberto === true ? 'Aberto' : 'Fechado'}`,
  }));

  // evita fechar o <script> por engano se algum texto tiver "</"
  const json = JSON.stringify(dados).replace(/</g, '\u003c');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#mapa{height:100%;margin:0;padding:0}</style>
</head>
<body>
<div id="mapa"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var pontos = ${json};
  var mapa = L.map('mapa').setView([-30.03, -51.2], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(mapa);

  var limites = [];
  pontos.forEach(function (p) {
    var cor = p.aberto ? '#16A34A' : '#B00020';
    L.circleMarker([p.lat, p.lng], {
      radius: 10, color: '#fff', weight: 2, fillColor: cor, fillOpacity: 0.95
    }).addTo(mapa).bindPopup(p.html);
    limites.push([p.lat, p.lng]);
  });
  if (limites.length === 1) mapa.setView(limites[0], 14);
  else if (limites.length > 1) mapa.fitBounds(limites, { padding: [30, 30] });
</script>
</body>
</html>`;
}
