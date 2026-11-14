import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import { avisar } from '../utils/avisar';
import { login } from '../services/api';
import { cores } from '../theme';

const ROTULO_PERFIL = {
  doadora: 'doadora',
  beneficiaria: 'beneficiária',
  instituicao: 'instituição',
  admin: 'administradora',
};

export default function LoginScreen({ onEntrar, navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);
  // quando o mesmo e-mail tem mais de um perfil (doadora e beneficiária), a pessoa escolhe
  const [perfis, setPerfis] = useState(null);

  async function entrar() {
    if (!email || !senha) {
      avisar('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }
    setEntrando(true);
    try {
      const resposta = await login(email, senha);
      const lista = resposta.perfis && resposta.perfis.length > 0 ? resposta.perfis : [resposta.usuario];
      if (lista.length > 1) {
        setPerfis(lista);
      } else {
        onEntrar(lista[0]);
      }
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
          {perfis ? (
            <>
              <Text style={estilos.titulo}>Como você quer entrar?</Text>
              <Text style={estilos.dicaLogin}>
                Este e-mail tem mais de um perfil. Você pode trocar depois, no seu Perfil.
              </Text>
              {perfis.map((p) => (
                <Botao
                  key={p.id_usuario}
                  titulo={`Entrar como ${ROTULO_PERFIL[p.tipo] || p.tipo}`}
                  onPress={() => onEntrar(p)}
                  estilo={{ marginTop: 12 }}
                />
              ))}
              <TouchableOpacity onPress={() => setPerfis(null)} style={estilos.linkCadastro}>
                <Text style={estilos.cadastreSe}>Voltar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
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

          {/* o tipo da conta (doadora, beneficiária, instituição ou admin) é reconhecido pelo e-mail */}
          <Botao titulo={entrando ? 'Entrando...' : 'Entrar'} onPress={entrar} />
          <Text style={estilos.dicaLogin}>
            Doadoras, beneficiárias e instituições entram por aqui.
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')} style={estilos.linkCadastro}>
            <Text style={estilos.textoCadastro}>
              Não tem conta? <Text style={estilos.cadastreSe}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
            </>
          )}
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
  dicaLogin: { fontSize: 12, color: cores.textoClaro, textAlign: 'center', marginTop: 10 },
  linkCadastro: { marginTop: 18, alignItems: 'center' },
  textoCadastro: { color: cores.textoClaro, fontSize: 14 },
  cadastreSe: { color: cores.rosa, fontWeight: 'bold' },
});
