// PerfilScreen.js
// Tela de Perfil / Configurações da conta.
// Mostra os dados da usuária, uma lista de opções de configuração e
// o botão "Sair da conta" (logout), que abre uma confirmação antes de sair.

import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { avisar } from '../utils/avisar';
import { cores } from '../theme';

// Opções de configuração (por enquanto são só visuais)
const OPCOES = [
  { icone: 'person-outline', titulo: 'Editar perfil', descricao: 'Atualize seu nome, foto e dados' },
  { icone: 'lock-closed-outline', titulo: 'Alterar senha', descricao: 'Mude sua senha de acesso' },
  { icone: 'notifications-outline', titulo: 'Notificações', descricao: 'Gerencie seus avisos' },
  { icone: 'shield-checkmark-outline', titulo: 'Privacidade e dados', descricao: 'Controle seus dados (LGPD)' },
  { icone: 'help-circle-outline', titulo: 'Ajuda e suporte', descricao: 'Tire suas dúvidas' },
];

// onSair chega pelo App.js e é o que realmente desloga a usuária
export default function PerfilScreen({ onSair }) {
  // Controla se a janelinha de confirmação de saída está aberta
  const [confirmando, setConfirmando] = useState(false);

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      {/* Cabeçalho com os dados da usuária */}
      <View style={estilos.cabecalho}>
        <View style={estilos.avatar}>
          <Ionicons name="person" size={42} color={cores.branco} />
        </View>
        <Text style={estilos.nome}>Usuária Connected Woman</Text>
        <Text style={estilos.email}>usuaria@email.com</Text>
      </View>

      {/* Lista de opções de configuração */}
      <Text style={estilos.secao}>Configurações da conta</Text>
      {OPCOES.map((opcao) => (
        <TouchableOpacity
          key={opcao.titulo}
          style={estilos.linha}
          onPress={() => avisar(opcao.titulo, 'Funcionalidade em breve!')}
        >
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

      {/* Botão de sair (logout) */}
      <TouchableOpacity style={estilos.botaoSair} onPress={() => setConfirmando(true)}>
        <Ionicons name="log-out-outline" size={20} color={cores.rosa} />
        <Text style={estilos.botaoSairTexto}>Sair da conta</Text>
      </TouchableOpacity>

      {/* Janela de confirmação de saída (funciona na web e no celular) */}
      <Modal
        visible={confirmando}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmando(false)}
      >
        <View style={estilos.fundoModal}>
          <View style={estilos.janela}>
            <Ionicons name="log-out-outline" size={36} color={cores.rosa} />
            <Text style={estilos.janelaTitulo}>Sair da conta</Text>
            <Text style={estilos.janelaTexto}>Deseja realmente sair da sua conta?</Text>

            <View style={estilos.janelaBotoes}>
              <TouchableOpacity
                style={[estilos.btn, estilos.btnCancelar]}
                onPress={() => setConfirmando(false)}
              >
                <Text style={estilos.btnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[estilos.btn, estilos.btnSair]}
                onPress={() => {
                  setConfirmando(false);
                  onSair(); // volta para a tela de login
                }}
              >
                <Text style={estilos.btnSairTexto}>Sair</Text>
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
  // Estilos da janela de confirmação
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
  janelaBotoes: { flexDirection: 'row', gap: 12, width: '100%' },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnCancelar: { backgroundColor: '#F0E4EA' },
  btnCancelarTexto: { color: cores.texto, fontWeight: '600' },
  btnSair: { backgroundColor: cores.rosa },
  btnSairTexto: { color: cores.branco, fontWeight: 'bold' },
});
