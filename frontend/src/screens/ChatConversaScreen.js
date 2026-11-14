import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Seletor from '../components/Seletor';
import Botao from '../components/Botao';
import {
  listarMensagens,
  enviarMensagem,
  listarEntregasEntre,
  registrarEntrega,
  responderEntrega,
  cancelarEntrega,
} from '../services/api';
import { avisar } from '../utils/avisar';
import { cores } from '../theme';

const INTERVALO_MS = 3000;
const ITENS = ['Absorventes', 'Coletor menstrual', 'Calcinha absorvente', 'Itens de higiene', 'Outro'];

export default function ChatConversaScreen({ route, usuario }) {
  const { id_outro, nome, tipo_outro } = route.params;
  const [mensagens, setMensagens] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [texto, setTexto] = useState('');
  const lista = useRef(null);

  // só uma doadora conversando com uma beneficiária registra entregas
  const podeRegistrar = usuario.tipo === 'doadora' && tipo_outro === 'beneficiaria';
  const [painelAberto, setPainelAberto] = useState(false);
  const [item, setItem] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [registrando, setRegistrando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [msgs, ents] = await Promise.all([
        listarMensagens(usuario.id_usuario, id_outro),
        listarEntregasEntre(usuario.id_usuario, id_outro),
      ]);
      // só atualiza o estado se algo mudou (evita re-render a cada 3s)
      setMensagens((atual) =>
        atual.length === msgs.length &&
        atual[atual.length - 1]?.id_mensagem === msgs[msgs.length - 1]?.id_mensagem
          ? atual
          : msgs
      );
      setEntregas((atual) => (JSON.stringify(atual) === JSON.stringify(ents) ? atual : ents));
    } catch {
      // falhas de rede no polling são ignoradas; tenta de novo no próximo ciclo
    }
  }, [usuario.id_usuario, id_outro]);

  useEffect(() => {
    carregar();
    const timer = setInterval(carregar, INTERVALO_MS);
    return () => clearInterval(timer);
  }, [carregar]);

  async function enviar() {
    const limpo = texto.trim();
    if (!limpo) return;
    setTexto('');
    try {
      await enviarMensagem(usuario.id_usuario, id_outro, limpo);
      carregar();
    } catch (e) {
      setTexto(limpo);
      avisar('Erro', e.message);
    }
  }

  async function registrar() {
    const qtd = parseInt(quantidade, 10);
    if (!item) {
      avisar('Atenção', 'Escolha o que você entregou.');
      return;
    }
    if (!Number.isInteger(qtd) || qtd < 1 || qtd > 999) {
      avisar('Atenção', 'Informe a quantidade, de 1 a 999.');
      return;
    }
    setRegistrando(true);
    try {
      await registrarEntrega(usuario.id_usuario, id_outro, item, qtd);
      setItem('');
      setQuantidade('1');
      setPainelAberto(false);
      await carregar();
    } catch (e) {
      avisar('Não foi possível registrar', e.message);
    } finally {
      setRegistrando(false);
    }
  }

  async function responder(entrega, resposta) {
    try {
      await responderEntrega(entrega.id_doacao, usuario.id_usuario, resposta);
      await carregar();
    } catch (e) {
      avisar('Não foi possível responder', e.message);
    }
  }

  async function cancelar(entrega) {
    try {
      await cancelarEntrega(entrega.id_doacao, usuario.id_usuario);
      await carregar();
    } catch (e) {
      avisar('Não foi possível cancelar', e.message);
    }
  }

  // mensagens e entregas juntas, em ordem de horário
  const itens = [
    ...mensagens.map((m) => ({ tipo: 'mensagem', chave: `m${m.id_mensagem}`, data: m.enviada_em, m })),
    ...entregas.map((e) => ({ tipo: 'entrega', chave: `e${e.id_doacao}`, data: e.criada_em, e })),
  ].sort((a, b) => new Date(a.data) - new Date(b.data));

  function renderEntrega(e) {
    const fui_eu_que_entreguei = e.id_usuario_doadora === usuario.id_usuario;
    const titulo = fui_eu_que_entreguei
      ? `Você registrou a entrega de ${e.quantidade} × ${e.item}`
      : `${nome} registrou a entrega de ${e.quantidade} × ${e.item}`;

    return (
      <View style={estilos.entrega}>
        <View style={estilos.entregaTopo}>
          <Ionicons name="gift-outline" size={18} color={cores.rosa} />
          <Text style={estilos.entregaTitulo}>{titulo}</Text>
        </View>

        {e.status === 'pendente' && !fui_eu_que_entreguei && (
          <>
            <Text style={estilos.entregaTexto}>Você recebeu?</Text>
            <View style={estilos.entregaBotoes}>
              <TouchableOpacity
                style={[estilos.btnEntrega, estilos.btnNao]}
                onPress={() => responder(e, 'nao_recebi')}
              >
                <Text style={estilos.btnNaoTexto}>Não recebi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[estilos.btnEntrega, estilos.btnSim]}
                onPress={() => responder(e, 'recebi')}
              >
                <Text style={estilos.btnSimTexto}>Recebi</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {e.status === 'pendente' && fui_eu_que_entreguei && (
          <>
            <Text style={estilos.entregaTexto}>Aguardando {nome} confirmar o recebimento.</Text>
            <TouchableOpacity onPress={() => cancelar(e)}>
              <Text style={estilos.linkCancelar}>Cancelar este registro</Text>
            </TouchableOpacity>
          </>
        )}

        {e.status === 'concluida' && (
          <Text style={[estilos.entregaTexto, { color: cores.verde, fontWeight: '600' }]}>
            ✔ Recebimento confirmado
          </Text>
        )}

        {e.status === 'cancelada' && (
          <Text style={[estilos.entregaTexto, { color: '#B00020' }]}>
            Não confirmada / cancelada
          </Text>
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={lista}
        data={itens}
        keyExtractor={(i) => i.chave}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => lista.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<Text style={estilos.vazio}>Nenhuma mensagem ainda. Diga oi! 💗</Text>}
        renderItem={({ item: i }) => {
          if (i.tipo === 'entrega') return renderEntrega(i.e);
          const minha = i.m.id_remetente === usuario.id_usuario;
          return (
            <View style={[estilos.balao, minha ? estilos.minha : estilos.deles]}>
              <Text style={{ color: minha ? cores.branco : cores.texto, fontSize: 15 }}>
                {i.m.texto}
              </Text>
            </View>
          );
        }}
      />

      {podeRegistrar && painelAberto && (
        <View style={estilos.painel}>
          <Text style={estilos.painelTitulo}>Registrar uma entrega</Text>
          <Text style={estilos.painelDica}>
            {nome} vai ver este registro e confirmar que recebeu. Só depois ele conta como concluído.
          </Text>
          <Seletor
            rotulo="O que você entregou?"
            valor={item}
            opcoes={ITENS}
            aoEscolher={setItem}
            placeholder="Selecione o item"
          />
          <View style={estilos.linhaQtd}>
            <Text style={estilos.rotuloQtd}>Quantidade</Text>
            <TextInput
              style={estilos.inputQtd}
              value={quantidade}
              onChangeText={(t) => setQuantidade(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
          <Botao
            titulo={registrando ? 'Registrando...' : 'Registrar entrega'}
            onPress={registrar}
          />
        </View>
      )}

      <View style={estilos.barra}>
        {podeRegistrar && (
          <TouchableOpacity
            style={[estilos.btnPresente, painelAberto && { backgroundColor: cores.rosaClaro }]}
            onPress={() => setPainelAberto(!painelAberto)}
          >
            <Ionicons name="gift-outline" size={20} color={cores.rosa} />
          </TouchableOpacity>
        )}
        <TextInput
          style={estilos.input}
          value={texto}
          onChangeText={setTexto}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#B9A6AF"
          onSubmitEditing={enviar}
          returnKeyType="send"
        />
        <TouchableOpacity style={estilos.btn} onPress={enviar}>
          <Ionicons name="send" size={18} color={cores.branco} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  vazio: { textAlign: 'center', color: cores.textoClaro, marginTop: 30 },
  balao: { maxWidth: '78%', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8 },
  minha: { alignSelf: 'flex-end', backgroundColor: cores.rosa, borderBottomRightRadius: 4 },
  deles: {
    alignSelf: 'flex-start',
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderBottomLeftRadius: 4,
  },
  entrega: {
    alignSelf: 'center',
    width: '92%',
    backgroundColor: cores.branco,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: cores.rosa,
    padding: 12,
    marginVertical: 8,
  },
  entregaTopo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  entregaTitulo: { flex: 1, fontSize: 14, fontWeight: 'bold', color: cores.texto },
  entregaTexto: { fontSize: 13, color: cores.textoClaro },
  entregaBotoes: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btnEntrega: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnSim: { backgroundColor: cores.verde },
  btnSimTexto: { color: cores.branco, fontWeight: 'bold' },
  btnNao: { borderWidth: 1.5, borderColor: '#B00020', backgroundColor: cores.branco },
  btnNaoTexto: { color: '#B00020', fontWeight: 'bold' },
  linkCancelar: { fontSize: 12, color: cores.rosa, marginTop: 6, fontWeight: '600' },
  painel: {
    backgroundColor: cores.branco,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    padding: 14,
  },
  painelTitulo: { fontSize: 15, fontWeight: 'bold', color: cores.texto, marginBottom: 4 },
  painelDica: { fontSize: 12, color: cores.textoClaro, marginBottom: 12, lineHeight: 17 },
  linhaQtd: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  rotuloQtd: { fontSize: 14, fontWeight: '600', color: cores.texto },
  inputQtd: {
    width: 80,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: cores.texto,
    textAlign: 'center',
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: cores.branco,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  btnPresente: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: cores.rosa,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: cores.rosaClaro,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: cores.texto,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cores.rosa,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
