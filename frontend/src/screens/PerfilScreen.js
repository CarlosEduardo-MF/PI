import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import { avisar } from '../utils/avisar';
import { buscarPerfil, atualizarPerfil, alterarSenha, deletarConta, listarPerfis } from '../services/api';
import { cores } from '../theme';

function rotuloTipo(tipo) {
  if (tipo === 'doadora') return 'Doadora';
  if (tipo === 'beneficiaria') return 'Beneficiária';
  if (tipo === 'admin') return 'Administradora';
  if (tipo === 'instituicao') return 'Instituição';
  return 'Usuária';
}

export default function PerfilScreen({ usuario, onSair, onTrocar, navigation }) {
  // outro perfil da mesma pessoa (mesmo e-mail): doadora <-> beneficiária
  const [outroPerfil, setOutroPerfil] = useState(null);
  const ehDoadora = usuario?.tipo === 'doadora';
  const ehInstituicao = usuario?.tipo === 'instituicao';
  const temCadastro =
    usuario?.tipo === 'doadora' || usuario?.tipo === 'beneficiaria' || ehInstituicao;

  const [perfil, setPerfil] = useState(null);

  const [confirmando, setConfirmando] = useState(false);
  const [confirmandoDelete, setConfirmandoDelete] = useState(false);
  const [editando, setEditando] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [extra, setExtra] = useState('');

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  useEffect(() => {
    listarPerfis(usuario.id_usuario)
      .then((lista) =>
        setOutroPerfil(
          lista.find(
            (p) =>
              p.id_usuario !== usuario.id_usuario &&
              (p.tipo === 'doadora' || p.tipo === 'beneficiaria')
          ) || null
        )
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!temCadastro) return;
    buscarPerfil(usuario.tipo, usuario.email, usuario.id_usuario)
      .then(setPerfil)
      .catch(() => {});
  }, []);

  const nomePerfil = perfil?.nome_doadora || perfil?.nome_beneficiaria || perfil?.nome_instituicao;

  // ---- Editar perfil ----
  function abrirEditar() {
    if (!temCadastro) {
      avisar('Editar perfil', 'Esta conta não possui um cadastro de doadora/beneficiária.');
      return;
    }
    if (!perfil) {
      avisar('Editar perfil', 'Não encontramos seus dados de cadastro para editar.');
      return;
    }
    setNome(perfil.nome_doadora || perfil.nome_beneficiaria || perfil.nome_instituicao || '');
    setTelefone(perfil.telefone_doadora || perfil.telefone_beneficiaria || perfil.telefone_instituicao || '');
    setCidade(perfil.cidade_doadora || perfil.cidade_beneficiaria || perfil.cidade_instituicao || '');
    setExtra(perfil.frequencia_doacao_doadora || perfil.tipo_necessidade_beneficiaria || '');
    setEditando(true);
  }

  async function salvarPerfil() {
    if (!nome) {
      avisar('Atenção', 'O nome não pode ficar vazio.');
      return;
    }
    setSalvando(true);
    try {
      const dados = ehInstituicao
        ? { nome, telefone, cidade }
        : ehDoadora
        ? { nome, telefone, cidade, frequencia: extra }
        : { nome, telefone, cidade, necessidade: extra };
      await atualizarPerfil(usuario.tipo, usuario.email, dados, usuario.id_usuario);

      setPerfil((p) => ({
        ...p,
        ...(ehInstituicao
          ? { nome_instituicao: nome, telefone_instituicao: telefone, cidade_instituicao: cidade }
          : ehDoadora
          ? {
              nome_doadora: nome,
              telefone_doadora: telefone,
              cidade_doadora: cidade,
              frequencia_doacao_doadora: extra,
            }
          : {
              nome_beneficiaria: nome,
              telefone_beneficiaria: telefone,
              cidade_beneficiaria: cidade,
              tipo_necessidade_beneficiaria: extra,
            }),
      }));
      setEditando(false);
      avisar('Pronto!', 'Seus dados foram atualizados.');
    } catch (erro) {
      avisar('Não foi possível salvar', erro.message);
    } finally {
      setSalvando(false);
    }
  }

  // ---- Alterar senha ----
  async function salvarSenha() {
    if (!senhaAtual || !novaSenha) {
      avisar('Atenção', 'Preencha a senha atual e a nova senha.');
      return;
    }
    setSalvando(true);
    try {
      await alterarSenha(usuario.id_usuario, senhaAtual, novaSenha);
      setAlterandoSenha(false);
      setSenhaAtual('');
      setNovaSenha('');
      avisar('Pronto!', 'Sua senha foi alterada com sucesso.');
    } catch (erro) {
      avisar('Não foi possível alterar', erro.message);
    } finally {
      setSalvando(false);
    }
  }

  // ---- Deletar conta ----
  async function deletar() {
    setSalvando(true);
    try {
      await deletarConta(usuario.id_usuario);
      setConfirmandoDelete(false);
      avisar('Conta apagada', 'Sua conta foi removida.');
      onSair();
    } catch (erro) {
      setSalvando(false);
      avisar('Não foi possível apagar', erro.message);
    }
  }

  const opcoes = [
    { icone: 'person-outline', titulo: 'Editar perfil', descricao: 'Atualize seu nome e dados', onPress: abrirEditar },
    { icone: 'lock-closed-outline', titulo: 'Alterar senha', descricao: 'Mude sua senha de acesso', onPress: () => setAlterandoSenha(true) },
    ...(usuario?.tipo === 'doadora' || usuario?.tipo === 'beneficiaria'
      ? [
          {
            icone: 'gift-outline',
            titulo: usuario.tipo === 'doadora' ? 'Doações que entreguei' : 'Doações que recebi',
            descricao: 'Veja o histórico e o status de cada entrega',
            onPress: () => navigation.navigate('HistoricoEntregas'),
          },
        ]
      : []),
    ...(outroPerfil
      ? [
          {
            icone: 'swap-horizontal-outline',
            titulo: `Trocar para ${outroPerfil.tipo === 'doadora' ? 'doadora' : 'beneficiária'}`,
            descricao: 'Use o app com o outro perfil deste e-mail',
            onPress: () => onTrocar(outroPerfil),
          },
        ]
      : usuario?.tipo === 'doadora' || usuario?.tipo === 'beneficiaria'
      ? [
          {
            icone: 'person-add-outline',
            titulo: `Usar também como ${usuario.tipo === 'doadora' ? 'beneficiária' : 'doadora'}`,
            descricao: 'Crie o outro perfil com o mesmo e-mail',
            onPress: () =>
              avisar(
                'Criar o outro perfil',
                'Saia da conta, toque em "Cadastre-se", escolha o outro perfil e preencha com o ' +
                  `mesmo e-mail (${usuario.email}) e a mesma senha. Depois, ao entrar, você escolhe com qual perfil quer usar o app.`
              ),
          },
        ]
      : []),
    { icone: 'notifications-outline', titulo: 'Notificações', descricao: 'Gerencie seus avisos', onPress: () => avisar('Notificações', 'Funcionalidade em breve!') },
    { icone: 'shield-checkmark-outline', titulo: 'Privacidade e dados', descricao: 'Controle seus dados (LGPD)', onPress: () => avisar('Privacidade e dados', 'Funcionalidade em breve!') },
    { icone: 'help-circle-outline', titulo: 'Ajuda e suporte', descricao: 'Tire suas dúvidas', onPress: () => avisar('Ajuda e suporte', 'Funcionalidade em breve!') },
  ];

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.cabecalho}>
        <View style={estilos.avatar}>
          <Ionicons name="person" size={42} color={cores.branco} />
        </View>
        <Text style={estilos.nome}>{nomePerfil || rotuloTipo(usuario?.tipo)}</Text>
        <Text style={estilos.email}>{usuario?.email || 'usuaria@email.com'}</Text>
      </View>

      <Text style={estilos.secao}>Configurações da conta</Text>
      {opcoes.map((opcao) => (
        <TouchableOpacity key={opcao.titulo} style={estilos.linha} onPress={opcao.onPress}>
          <View style={estilos.iconeBox}>
            <Ionicons name={opcao.icone} size={20} color={cores.rosa} />
          </View>
          <View style={estilos.linhaTextos}>
            <Text style={estilos.linhaTitulo}>{opcao.titulo}</Text>
            <Text style={estilos.linhaDesc}>{opcao.descricao}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#B9A6AF" />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={estilos.botaoSair} onPress={() => setConfirmando(true)}>
        <Ionicons name="log-out-outline" size={20} color={cores.rosa} />
        <Text style={estilos.botaoSairTexto}>Sair da conta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={estilos.botaoDeletar} onPress={() => setConfirmandoDelete(true)}>
        <Ionicons name="trash-outline" size={20} color="#B00020" />
        <Text style={estilos.botaoDeletarTexto}>Deletar minha conta</Text>
      </TouchableOpacity>

      <Modal visible={editando} transparent animationType="fade" onRequestClose={() => setEditando(false)}>
        <View style={estilos.fundoModal}>
          <View style={estilos.janela}>
            <Text style={estilos.janelaTitulo}>Editar perfil</Text>
            <View style={estilos.form}>
              <Campo rotulo="Nome completo" valor={nome} aoMudar={setNome} placeholder="Seu nome" />
              <Campo rotulo="Telefone" valor={telefone} aoMudar={setTelefone} placeholder="(51) 99999-9999" tipoTeclado="phone-pad" />
              <Campo rotulo="Cidade" valor={cidade} aoMudar={setCidade} placeholder="Sua cidade" />
              {!ehInstituicao && (
                <Campo
                  rotulo={ehDoadora ? 'Frequência de doação' : 'Tipo de necessidade'}
                  valor={extra}
                  aoMudar={setExtra}
                  placeholder={ehDoadora ? 'Ex.: Mensalmente' : 'Ex.: Absorventes'}
                />
              )}
            </View>

            <View style={estilos.janelaBotoes}>
              <TouchableOpacity style={[estilos.btn, estilos.btnCancelar]} onPress={() => setEditando(false)}>
                <Text style={estilos.btnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <Botao
                titulo={salvando ? 'Salvando...' : 'Salvar'}
                onPress={salvarPerfil}
                estilo={estilos.btn}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={alterandoSenha} transparent animationType="fade" onRequestClose={() => setAlterandoSenha(false)}>
        <View style={estilos.fundoModal}>
          <View style={estilos.janela}>
            <Text style={estilos.janelaTitulo}>Alterar senha</Text>
            <View style={estilos.form}>
              <Campo rotulo="Senha atual" valor={senhaAtual} aoMudar={setSenhaAtual} placeholder="Sua senha atual" senha />
              <Campo rotulo="Nova senha" valor={novaSenha} aoMudar={setNovaSenha} placeholder="Crie uma nova senha" senha />
            </View>

            <View style={estilos.janelaBotoes}>
              <TouchableOpacity
                style={[estilos.btn, estilos.btnCancelar]}
                onPress={() => {
                  setAlterandoSenha(false);
                  setSenhaAtual('');
                  setNovaSenha('');
                }}
              >
                <Text style={estilos.btnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <Botao
                titulo={salvando ? 'Salvando...' : 'Salvar'}
                onPress={salvarSenha}
                estilo={estilos.btn}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmando} transparent animationType="fade" onRequestClose={() => setConfirmando(false)}>
        <View style={estilos.fundoModal}>
          <View style={estilos.janela}>
            <Ionicons name="log-out-outline" size={36} color={cores.rosa} />
            <Text style={estilos.janelaTitulo}>Sair da conta</Text>
            <Text style={estilos.janelaTexto}>Deseja realmente sair da sua conta?</Text>

            <View style={estilos.janelaBotoes}>
              <TouchableOpacity style={[estilos.btn, estilos.btnCancelar]} onPress={() => setConfirmando(false)}>
                <Text style={estilos.btnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[estilos.btn, estilos.btnSair]}
                onPress={() => {
                  setConfirmando(false);
                  onSair();
                }}
              >
                <Text style={estilos.btnSairTexto}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmandoDelete} transparent animationType="fade" onRequestClose={() => setConfirmandoDelete(false)}>
        <View style={estilos.fundoModal}>
          <View style={estilos.janela}>
            <Ionicons name="trash-outline" size={36} color="#B00020" />
            <Text style={estilos.janelaTitulo}>Deletar conta</Text>
            <Text style={estilos.janelaTexto}>
              Esta ação é permanente. Todos os seus dados serão apagados. Deseja continuar?
            </Text>

            <View style={estilos.janelaBotoes}>
              <TouchableOpacity style={[estilos.btn, estilos.btnCancelar]} onPress={() => setConfirmandoDelete(false)}>
                <Text style={estilos.btnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[estilos.btn, estilos.btnDeletar]} onPress={deletar} disabled={salvando}>
                <Text style={estilos.btnSairTexto}>{salvando ? 'Apagando...' : 'Deletar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 20 },
  cabecalho: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: cores.rosa,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nome: { fontSize: 20, fontWeight: 'bold', color: cores.texto },
  email: { fontSize: 14, color: cores.textoClaro, marginTop: 4 },
  secao: { fontSize: 16, fontWeight: 'bold', color: cores.texto, marginBottom: 12 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.branco,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  iconeBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD6E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linhaTextos: { flex: 1 },
  linhaTitulo: { fontSize: 15, fontWeight: '600', color: cores.texto },
  linhaDesc: { fontSize: 13, color: cores.textoClaro, marginTop: 2 },
  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: cores.branco,
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: cores.rosa,
  },
  botaoSairTexto: { fontSize: 16, fontWeight: 'bold', color: cores.rosa },
  botaoDeletar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#B00020',
  },
  botaoDeletarTexto: { fontSize: 16, fontWeight: 'bold', color: '#B00020' },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 30,
  },
  janela: {
    backgroundColor: cores.branco,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  janelaTitulo: { fontSize: 18, fontWeight: 'bold', color: cores.texto, marginTop: 8 },
  janelaTexto: { fontSize: 14, color: cores.textoClaro, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  form: { width: '100%', marginTop: 16, marginBottom: 4 },
  janelaBotoes: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnCancelar: { backgroundColor: '#F0E4EA' },
  btnCancelarTexto: { color: cores.texto, fontWeight: '600' },
  btnSair: { backgroundColor: cores.rosa },
  btnDeletar: { backgroundColor: '#B00020' },
  btnSairTexto: { color: cores.branco, fontWeight: 'bold' },
});
