import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import { avisar } from '../utils/avisar';
import { login } from '../services/api';
import { cores } from '../theme';

export default function LoginScreen({ onEntrar, navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);

  async function entrar() {
    if (!email || !senha) {
      avisar('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }
    setEntrando(true);
    try {
      const resposta = await login(email, senha);
      onEntrar(resposta.usuario);
    } catch (erro) {
      avisar('Não foi possível entrar', erro.message);
    } finally {
      setEntrando(false);
    }
  }

  function esqueceuSenha() {
    avisar('Esqueceu a senha?', 'Enviaremos um link de recuperação para o seu e-mail.');
  }

  return (
    <LinearGradient colors={['#E6007E', '#9B0E5F']} style={estilos.fundo}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={estilos.centro}>
        <View style={estilos.logo}>
          <Ionicons name="heart" size={28} color={cores.branco} />
          <Text style={estilos.logoTexto}>Connected Woman</Text>
        </View>

        <View style={estilos.cartao}>
          <Text style={estilos.titulo}>Login</Text>

          <Campo
            rotulo="E-mail"
            valor={email}
            aoMudar={setEmail}
            placeholder="seuemail@gmail.com"
            tipoTeclado="email-address"
          />
          <Campo
            rotulo="Senha"
            valor={senha}
            aoMudar={setSenha}
            placeholder="Sua senha"
            senha
          />

          <TouchableOpacity onPress={esqueceuSenha}>
            <Text style={estilos.esqueceu}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <View style={estilos.linhaBotoes}>
            <Botao
              titulo={entrando ? 'Entrando...' : 'Entrar como doadora'}
              onPress={entrar}
              estilo={estilos.botaoMetade}
            />
            <Botao
              titulo={entrando ? 'Entrando...' : 'Entrar como beneficiária'}
              onPress={entrar}
              estilo={estilos.botaoMetade}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')} style={estilos.linkCadastro}>
            <Text style={estilos.textoCadastro}>
              Não tem conta? <Text style={estilos.cadastreSe}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  centro: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logoTexto: { color: cores.branco, fontSize: 22, fontWeight: 'bold' },
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: 16,
    padding: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: cores.texto,
    textAlign: 'center',
    marginBottom: 20,
  },
  esqueceu: {
    color: cores.rosa,
    textAlign: 'right',
    marginBottom: 20,
    fontWeight: '600',
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoMetade: { flex: 1 },
  linkCadastro: { marginTop: 18, alignItems: 'center' },
  textoCadastro: { color: cores.textoClaro, fontSize: 14 },
  cadastreSe: { color: cores.rosa, fontWeight: 'bold' },
});
