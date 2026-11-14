import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import Campo from '../components/Campo';
import Seletor from '../components/Seletor';
import Botao from '../components/Botao';
import { avisar } from '../utils/avisar';
import { cadastrarPonto } from '../services/api';
import { cores } from '../theme';

const CIDADES = [
  'Porto Alegre',
  'Canoas',
  'São Leopoldo',
  'Novo Hamburgo',
  'Gravataí',
  'Sapucaia do Sul',
  'Esteio',
  'Viamão',
];

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// horários de 30 em 30 minutos: 00:00, 00:30, ... 23:30 (e 23:59 para "o dia todo")
const HORAS = [];
for (let h = 0; h < 24; h++) {
  HORAS.push(`${String(h).padStart(2, '0')}:00`);
  HORAS.push(`${String(h).padStart(2, '0')}:30`);
}
HORAS.push('23:59');

export default function CadastroPontoScreen({ navigation, usuario }) {
  const [nome, setNome] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [diaInicio, setDiaInicio] = useState('Segunda');
  const [diaFim, setDiaFim] = useState('Sexta');
  const [horaAbre, setHoraAbre] = useState('09:00');
  const [horaFecha, setHoraFecha] = useState('18:00');
  const [telefone, setTelefone] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!nome.trim() || !rua.trim() || !numero.trim() || !cidade) {
      avisar('Atenção', 'Preencha o nome da instituição, a rua, o número e a cidade.');
      return;
    }
    // a rua precisa ter nome (não só números), senão o mapa não acha o lugar certo
    if (!/[A-Za-zÀ-ú]{3,}/.test(rua)) {
      avisar('Atenção', 'Informe o nome da rua, por exemplo: Rua Brasil. O número vai no campo ao lado.');
      return;
    }

    // as horas "HH:MM" comparam certo como texto (ex.: "09:00" < "18:00")
    if (horaAbre >= horaFecha) {
      avisar('Atenção', 'O horário de fechamento precisa ser depois do horário de abertura.');
      return;
    }

    // formato que a busca de localização entende melhor:
    // "Rua Brasil, 789 - Centro, São Leopoldo"
    const logradouro = `${rua.trim()}, ${numero.trim()}`;
    const endereco = bairro.trim()
      ? `${logradouro} - ${bairro.trim()}, ${cidade}`
      : `${logradouro}, ${cidade}`;

    setSalvando(true);
    try {
      const resposta = await cadastrarPonto({
        id_usuario: usuario.id_usuario,
        nome: nome.trim(),
        endereco,
        telefone: telefone.trim(),
        dia_inicio: DIAS.indexOf(diaInicio),
        dia_fim: DIAS.indexOf(diaFim),
        hora_abre: horaAbre,
        hora_fecha: horaFecha,
      });

      const semPin = resposta.localizado
        ? ''
        : '\n\nAtenção: não encontramos esse endereço exato no mapa, então ele aparecerá só na ' +
          'lista, sem pin. Confira se o nome da rua, o número e a cidade estão corretos.';

      if (resposta.status === 'pendente') {
        avisar(
          'Enviado para aprovação!',
          'Seu ponto de coleta foi enviado e vai aparecer no mapa depois que nossa equipe aprovar. ' +
            'Você acompanha o status em "Meus pontos".' + semPin
        );
      } else {
        avisar('Ponto cadastrado!', 'Ele já aparece no mapa de pontos de coleta.' + semPin);
      }
      navigation.goBack();
    } catch (erro) {
      avisar('Não foi possível cadastrar', erro.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Cadastrar ponto de coleta</Text>
      <Text style={estilos.descricao}>
        Cadastre a instituição que vai receber e entregar as doações. Usamos o endereço para
        mostrar o local no mapa automaticamente.
      </Text>

      <Campo
        rotulo="Nome da instituição"
        valor={nome}
        aoMudar={setNome}
        placeholder="Ex.: Casa da Mulher"
      />
      <Campo rotulo="Rua" valor={rua} aoMudar={setRua} placeholder="Ex.: Rua Brasil" />
      <Campo
        rotulo="Número"
        valor={numero}
        aoMudar={setNumero}
        placeholder="Ex.: 789 (ou s/n)"
      />
      <Campo rotulo="Bairro" valor={bairro} aoMudar={setBairro} placeholder="Ex.: Centro" />
      <Seletor
        rotulo="Cidade"
        valor={cidade}
        opcoes={CIDADES}
        aoEscolher={setCidade}
        placeholder="Selecione a cidade"
      />
      <Text style={estilos.secao}>Horário de funcionamento</Text>
      <Seletor rotulo="Abre de" valor={diaInicio} opcoes={DIAS} aoEscolher={setDiaInicio} />
      <Seletor rotulo="Até" valor={diaFim} opcoes={DIAS} aoEscolher={setDiaFim} />
      <Seletor rotulo="Abre às" valor={horaAbre} opcoes={HORAS} aoEscolher={setHoraAbre} />
      <Seletor rotulo="Fecha às" valor={horaFecha} opcoes={HORAS} aoEscolher={setHoraFecha} />
      <Text style={estilos.dica}>
        O app mostra "Aberto" ou "Fechado" automaticamente, conforme o dia e a hora.
      </Text>

      <Campo
        rotulo="Telefone"
        valor={telefone}
        aoMudar={setTelefone}
        placeholder="(51) 3333-4444"
        tipoTeclado="phone-pad"
      />

      {salvando ? (
        <View style={estilos.carregando}>
          <ActivityIndicator color={cores.rosa} />
          <Text style={estilos.carregandoTexto}>Localizando o endereço no mapa...</Text>
        </View>
      ) : (
        <Botao titulo="Cadastrar ponto" onPress={salvar} />
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 20, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: cores.texto, marginBottom: 8 },
  descricao: { fontSize: 14, color: cores.textoClaro, lineHeight: 20, marginBottom: 20 },
  secao: { fontSize: 16, fontWeight: 'bold', color: cores.texto, marginBottom: 10, marginTop: 4 },
  dica: { fontSize: 12, color: cores.textoClaro, marginBottom: 20, marginTop: -6 },
  carregando: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 14 },
  carregandoTexto: { fontSize: 14, color: cores.textoClaro },
});
