import { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarMinhasEntregas } from '../services/api';
import { cores } from '../theme';

const STATUS = {
  pendente: { texto: 'Aguardando confirmação', cor: '#B7791F', fundo: '#FEF3C7' },
  concluida: { texto: 'Confirmada', cor: '#16A34A', fundo: '#DCFCE7' },
  cancelada: { texto: 'Não confirmada', cor: '#B00020', fundo: '#FEE2E2' },
};

function formatarData(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
}

export default function HistoricoEntregasScreen({ usuario }) {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function buscar() {
        try {
          setErro('');
          setLista(await listarMinhasEntregas(usuario.id_usuario));
        } catch (e) {
          setErro(e.message);
        } finally {
          setCarregando(false);
        }
      }
      buscar();
    }, [usuario.id_usuario])
  );

  const confirmadas = lista.filter((e) => e.status === 'concluida');
  const totalItens = confirmadas.reduce((soma, e) => soma + e.quantidade, 0);
  const ehDoadora = usuario.tipo === 'doadora';

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>{ehDoadora ? 'Doações que entreguei' : 'Doações que recebi'}</Text>

      {!carregando && erro === '' && (
        <View style={estilos.resumo}>
          <Text style={estilos.resumoNumero}>{totalItens}</Text>
          <Text style={estilos.resumoTexto}>
            {totalItens === 1 ? 'item confirmado' : 'itens confirmados'} em {confirmadas.length}{' '}
            {confirmadas.length === 1 ? 'entrega' : 'entregas'}
          </Text>
        </View>
      )}

      {carregando && <ActivityIndicator size="large" color={cores.rosa} style={{ marginTop: 20 }} />}
      {!carregando && erro !== '' && <Text style={estilos.aviso}>{erro}</Text>}
      {!carregando && erro === '' && lista.length === 0 && (
        <Text style={estilos.aviso}>
          {ehDoadora
            ? 'Nenhuma entrega registrada ainda. Registre pelo ícone de presente, na conversa do Chat.'
            : 'Nenhuma entrega recebida ainda.'}
        </Text>
      )}

      {lista.map((e) => {
        const st = STATUS[e.status] || STATUS.pendente;
        return (
          <View key={e.id_doacao} style={estilos.cartao}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.item}>
                {e.quantidade} × {e.item}
              </Text>
              <Text style={estilos.detalhe}>
                {e.papel === 'enviada' ? 'Para' : 'De'} {e.outra} · {formatarData(e.criada_em)}
              </Text>
            </View>
            <View style={[estilos.selo, { backgroundColor: st.fundo }]}>
              <Text style={[estilos.seloTexto, { color: st.cor }]}>{st.texto}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: cores.texto, marginBottom: 14 },
  aviso: { fontSize: 14, color: cores.textoClaro, textAlign: 'center', marginTop: 16, lineHeight: 20 },
  resumo: {
    backgroundColor: cores.branco,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  resumoNumero: { fontSize: 34, fontWeight: 'bold', color: cores.rosa },
  resumoTexto: { fontSize: 13, color: cores.textoClaro },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.branco,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
    marginBottom: 10,
  },
  item: { fontSize: 15, fontWeight: 'bold', color: cores.texto },
  detalhe: { fontSize: 12, color: cores.textoClaro, marginTop: 2 },
  selo: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  seloTexto: { fontSize: 11, fontWeight: '600' },
});
