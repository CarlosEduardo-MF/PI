// Geocodificação: converte um endereço em latitude/longitude usando o
// Nominatim (OpenStreetMap). É gratuito, sem chave de API, mas limita a
// 1 requisição por segundo e exige um User-Agent que identifique o app.

const URL_NOMINATIM = "https://nominatim.openstreetmap.org/search";
const ESTADO_PREFERIDO = process.env.GEOCODIFICACAO_ESTADO || "Rio Grande do Sul";

async function buscar(consulta) {
  const params = new URLSearchParams({
    q: consulta,
    format: "json",
    limit: "5",
    countrycodes: "br",
  });

  const resposta = await fetch(`${URL_NOMINATIM}?${params}`, {
    headers: { "User-Agent": "ConnectedWoman/1.0 (projeto escolar)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!resposta.ok) throw new Error(`Nominatim respondeu ${resposta.status}`);

  const resultados = await resposta.json();

  // Ruas com o mesmo nome existem em várias cidades/estados. Só aceita um
  // resultado se a cidade informada no endereço aparecer nele.
  const cidade = extrairCidade(consulta);
  // ignora o 1º trecho do display_name (nome do lugar, ex.: "Canoas Hotel")
  const regiao = (r) => normalizar(r.display_name.split(",").slice(1).join(","));
  // descarta resultados que são só bairro/cidade/região: o pin cairia no centro
  // da área e ficaria longe do endereço real. Só aceita rua, prédio ou local.
  const daCidade = resultados.filter(
    (r) => !ehAproximado(r) && (!cidade || regiao(r).includes(cidade))
  );
  // entre os da cidade, prefere os do estado do projeto (cidades homônimas)
  const estado = normalizar(ESTADO_PREFERIDO);
  const certo =
    daCidade.find((r) => regiao(r).includes(estado)) || daCidade[0];
  if (!certo) return null;
  return { latitude: Number(certo.lat), longitude: Number(certo.lon) };
}

// resultado de área (bairro, cidade, limite administrativo), e não de um endereço/local
function ehAproximado(r) {
  if (r.class === "boundary") return true;
  if (r.class === "place") return !["house", "building", "plot"].includes(r.type);
  return false;
}

function normalizar(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Cidade = último trecho do endereço que não seja só a sigla do estado.
// "Av. Central, 456 - Centro, Canoas" -> "canoas"
// "Praça da Matriz, Porto Alegre, RS" -> "porto alegre"
function extrairCidade(endereco) {
  const partes = endereco
    .split(",")
    .map((p) => normalizar(p).replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 2); // descarta "rs", "sp"...
  if (partes.length < 2) return "";
  // tira a sigla colada no fim: "porto alegre rs" -> "porto alegre"
  return partes[partes.length - 1].replace(/\s+[a-z]{2}$/, "");
}

// Devolve { latitude, longitude } ou null se não achar / se o serviço falhar.
// Nunca lança erro: o cadastro do ponto não pode falhar por causa do mapa.
async function geocodificar(endereco) {
  const texto = (endereco || "").trim();
  if (!texto) return null;

  try {
    // 1ª tentativa: endereço completo
    let local = await buscar(texto);
    if (local) return local;

    // 2ª tentativa: sem o número/complemento, ex.: "Rua X, 123 - Bairro, Cidade" -> "Rua X - Bairro, Cidade"
    const simplificado = texto.replace(/,?\s*\d+[A-Za-z]?\b/, "");
    if (simplificado !== texto) {
      await new Promise((r) => setTimeout(r, 1100)); // respeita o limite de 1 req/s
      local = await buscar(simplificado);
      if (local) return local;
    }
    return null;
  } catch (erro) {
    console.warn("Falha na geocodificação:", erro.message);
    return null;
  }
}

module.exports = { geocodificar };
