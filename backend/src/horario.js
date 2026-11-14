// Horário de funcionamento dos pontos de coleta.
// Cada ponto tem: dia_inicio e dia_fim (0 = domingo ... 6 = sábado),
// hora_abre e hora_fecha ("HH:MM" ou "HH:MM:SS").
// O status "aberto agora" é calculado a cada consulta, no horário de Brasília.

const FUSO = "America/Sao_Paulo";
const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_SEMANA = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// "9", "9h", "9:5", "09:00" -> "09:00". Devolve null se não for um horário válido.
function normalizarHora(valor) {
  const m = /^\s*(\d{1,2})(?:\s*[:h]\s*(\d{1,2})?)?\s*$/i.exec(String(valor ?? ""));
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] === undefined ? 0 : Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function emMinutos(hora) {
  const [h, m] = String(hora).split(":").map(Number);
  return h * 60 + m;
}

// dia e minutos do dia no fuso de Brasília
function agoraEmBrasilia(data = new Date()) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(data);
  const pega = (tipo) => partes.find((p) => p.type === tipo).value;
  return {
    dia: DIAS_SEMANA[pega("weekday")],
    minutos: Number(pega("hour")) * 60 + Number(pega("minute")),
  };
}

function temHorario(ponto) {
  return (
    ponto.dia_inicio != null &&
    ponto.dia_fim != null &&
    ponto.hora_abre != null &&
    ponto.hora_fecha != null
  );
}

// Sem horário cadastrado, usa o campo antigo "aberto" (marcado à mão).
function estaAbertoAgora(ponto, data = new Date()) {
  if (!temHorario(ponto)) return ponto.aberto === 1 || ponto.aberto === true;

  const { dia, minutos } = agoraEmBrasilia(data);
  const ini = Number(ponto.dia_inicio);
  const fim = Number(ponto.dia_fim);
  // aceita intervalos que viram a semana, ex.: sexta a segunda
  const diaOk = ini <= fim ? dia >= ini && dia <= fim : dia >= ini || dia <= fim;

  return diaOk && minutos >= emMinutos(ponto.hora_abre) && minutos < emMinutos(ponto.hora_fecha);
}

function formatarHora(hora) {
  const [h, m] = String(hora).split(":");
  return Number(m) === 0 ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

// "Seg a Sex: 9h às 18h"
function descreverHorario(ponto) {
  if (!temHorario(ponto)) return ponto.horario;
  const dias =
    Number(ponto.dia_inicio) === Number(ponto.dia_fim)
      ? DIAS_CURTOS[ponto.dia_inicio]
      : `${DIAS_CURTOS[ponto.dia_inicio]} a ${DIAS_CURTOS[ponto.dia_fim]}`;
  return `${dias}: ${formatarHora(ponto.hora_abre)} às ${formatarHora(ponto.hora_fecha)}`;
}

module.exports = { normalizarHora, estaAbertoAgora, descreverHorario, DIAS_CURTOS };
