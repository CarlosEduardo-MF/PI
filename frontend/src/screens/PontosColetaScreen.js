import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listarPontos, listarMeusPontos, listarPontosPendentes, apagarPonto } from '../services/api';
import { avisar } from '../utils/avisar';
import MapaPontos from '../components/MapaPontos';
import { cores } from '../theme';

const ROTULO_STATUS = {
  pendente: { texto: 'Aguardando aprovação', cor: '#B7791F', fundo: '#FEF3C7' },
  aprovado: { texto: 'Aprovado', cor: '#16A34A', fundo: '#DCFCE7' },
  recusado: { texto: 'Recusado', cor: '#B00020', fundo: '#FEE2E2' },
};

export default function PontosColetaScreen({ navigation, usuario }) {
  const ehInstituicao = usuario?.tipo === 'instituicao';
  const ehAdmin = usuario?.tipo === 'admin';
  const [meusPontos, setMeusPontos] = useState([]);
  const [qtdPendentes, setQtdPendentes] = useState(0);
  const [pontos, setPontos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [cidade, setCidade] = useState('');
  const [somenteAbertos, setSomenteAbertos] = useState(false);

  // recarrega sempre que a tela ganha foco (ex.: depois de cadastrar um ponto novo)
  useFocusEffect(
    useCallback(() => {
      async function buscar() {
        try {
          setErro('');
          const dados = await listarPontos();
          setPontos(dados);
          if (ehInstituicao) setMeusPontos(await listarMeusPontos(usuario.id_usuario));
          if (ehAdmin) setQtdPendentes((await listarPontosPendentes(usuario.id_usuario)).length);
        } catch (e) {
          setErro(e.message);
        } finally {
          setCarregando(false);
        }
      }
      buscar();
    }, [ehInstituicao, ehAdmin, usuario?.id_usuario])
  );

  const filtrados = pontos.filter((p) => {
    const aberto = p.aberto === 1 || p.aberto === true;
    const texto = `${p.endereco || ''} ${p.nome || ''}`.toLowerCase();
    return (!somenteAbertos || aberto) && (!cidade.trim() || texto.includes(cidade.trim().toLowerCase()));
  });
  const noMapa = filtrados.filter((p) => p.latitude != null && p.longitude != null);

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Pontos de Coleta e Entrega</Text>
      <Text style={estilos.intro}>
        Encontre o ponto de coleta mais próximo de você. Estes locais recebem doações e
        distribuem kits de higiene menstrual.
      </Text>

      {(ehInstituicao || ehAdmin) && (
        <TouchableOpacity
          style={estilos.btnCadastrar}
          onPress={() => navigation.navigate('CadastroPonto')}
        >
          <Ionicons name="add-circle-outline" size={20} color={cores.rosa} />
          <Text style={estilos.btnCadastrarTexto}>Cadastrar ponto de coleta</Text>
        </TouchableOpacity>
      )}

      {ehAdmin && (
        <TouchableOpacity
          style={estilos.btnCadastrar}
          onPress={() => navigation.navigate('AprovacaoPontos')}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color={cores.rosa} />
          <Text style={estilos.btnCadastrarTexto}>
            Pontos aguardando aprovação ({qtdPendentes})
          </Text>
        </TouchableOpacity>
      )}

      {ehInstituicao && meusPontos.length > 0 && (
        <View style={estilos.meus}>
          <Text style={estilos.meusTitulo}>Meus pontos</Text>
          {meusPontos.map((p) => {
            const st = ROTULO_STATUS[p.status] || ROTULO_STATUS.pendente;
            return (
              <View key={p.id_ponto} style={estilos.meuItem}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.meuNome}>{p.nome}</Text>
                  <Text style={estilos.meuEndereco}>{p.endereco}</Text>
                </View>
                <View style={[estilos.selo, { backgroundColor: st.fundo }]}>
                  <Text style={[estilos.seloTexto, { color: st.cor }]}>{st.texto}</Text>
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await apagarPonto(p.id_ponto, usuario.id_usuario);
                      setMeusPontos((l) => l.filter((x) => x.id_ponto !== p.id_ponto));
                      setPontos((l) => l.filter((x) => x.id_ponto !== p.id_ponto));
                    } catch (e) {
                      avisar('Não foi possível apagar', e.message);
                    }
                  }}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={cores.textoClaro} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      <View style={estilos.filtros}>
        <TextInput
          style={estilos.inputFiltro}
          value={cidade}
          onChangeText={setCidade}
          placeholder="Filtrar por cidade ou nome (ex.: Canoas)"
          placeholderTextColor="#B9A6AF"
        />
        <TouchableOpacity
          style={[estilos.chip, somenteAbertos && estilos.chipAtivo]}
          onPress={() => setSomenteAbertos(!somenteAbertos)}
        >
          <Text style={[estilos.chipTexto, somenteAbertos && { color: cores.branco }]}>
            Somente abertos
          </Text>
        </TouchableOpacity>
        <Text style={estilos.contagem}>
          {filtrados.length} ponto(s) encontrado(s) · {noMapa.length} no mapa
        </Text>
      </View>

      <MapaPontos pontos={noMapa} altura={320} />
      <View style={estilos.legenda}>
        <View style={[estilos.bolinha, { backgroundColor: cores.verde }]} />
        <Text style={estilos.legendaTexto}>Aberto</Text>
        <View style={[estilos.bolinha, { backgroundColor: '#B00020' }]} />
        <Text style={estilos.legendaTexto}>Fechado</Text>
      </View>

      {carregando && <ActivityIndicator size="large" color={cores.rosa} style={{ marginTop: 20 }} />}

      {!carregando && erro !== '' && <Text style={estilos.aviso}>{erro}</Text>}

      {!carregando && erro === '' && filtrados.length === 0 && (
        <Text style={estilos.aviso}>Nenhum ponto de coleta encontrado.</Text>
      )}

      {filtrados.map((ponto) => {
        const estaAberto = ponto.aberto === 1 || ponto.aberto === true;
        return (
          <View key={ponto.id_ponto} style={estilos.cartao}>
            <View style={estilos.cabecalho}>
              <Text style={estilos.nome}>{ponto.nome}</Text>
              <View style={[estilos.selo, estaAberto ? estilos.seloAberto : estilos.seloFechado]}>
                <Text style={[estilos.seloTexto, { color: estaAberto ? cores.verde : '#B00020' }]}>
                  {estaAberto ? 'Aberto' : 'Fechado'}
                </Text>
              </View>
            </View>

            <Linha icone="location-outline" texto={ponto.endereco} />
            <Linha icone="time-outline" texto={ponto.horario} />
            <Linha icone="call-outline" texto={ponto.telefone} />
          </View>
        );
      })}
    </ScrollView>
  );
}

function Linha({ icone, texto }) {
  return (
    <View style={estilos.linha}>
      <Ionicons name={icone} size={16} color={cores.rosa} />
      <Text style={estilos.linhaTexto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: cores.texto, marginBottom: 8 },
  intro: { fontSize: 14, color: cores.textoClaro, marginBottom: 20, lineHeight: 20 },
  aviso: { fontSize: 14, color: cores.textoClaro, textAlign: 'center', marginTop: 16 },
  btnCadastrar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: cores.rosa,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: cores.branco,
    marginBottom: 16,
  },
  btnCadastrarTexto: { color: cores.rosa, fontWeight: 'bold', fontSize: 15 },
  meus: {
    backgroundColor: cores.branco,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  meusTitulo: { fontSize: 15, fontWeight: 'bold', color: cores.texto, marginBottom: 8 },
  meuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: cores.rosaClaro },
  meuNome: { fontSize: 14, fontWeight: '600', color: cores.texto },
  meuEndereco: { fontSize: 12, color: cores.textoClaro },
  filtros: { marginBottom: 14 },
  inputFiltro: {
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: cores.texto,
    marginBottom: 10,
  },
  chip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: cores.rosa,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  chipAtivo: { backgroundColor: cores.rosa },
  chipTexto: { color: cores.rosa, fontSize: 13, fontWeight: '600' },
  contagem: { fontSize: 12, color: cores.textoClaro },
  legenda: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 18 },
  legendaTexto: { fontSize: 12, color: cores.textoClaro, marginRight: 10 },
  bolinha: { width: 10, height: 10, borderRadius: 5 },
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nome: { fontSize: 16, fontWeight: 'bold', color: cores.texto, flex: 1 },
  selo: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  seloAberto: { backgroundColor: '#DCFCE7' },
  seloFechado: { backgroundColor: '#FEE2E2' },
  seloTexto: { fontSize: 12, fontWeight: '600' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  linhaTexto: { fontSize: 14, color: cores.textoClaro, flex: 1 },
});
