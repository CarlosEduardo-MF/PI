// App.js
// Este é o arquivo principal. Ele controla a navegação do app:
//
//  - Se a usuária NÃO está logada  -> mostra as telas de Login e Cadastro.
//  - Se a usuária ESTÁ logada      -> mostra o app com abas embaixo
//                                     (Início, Sobre, Como Funciona, Pontos, Educação),
//                                     um ícone de Perfil no topo (configurações da conta)
//                                     e, dentro do Perfil, o botão de "Sair" (logout).

import { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { cores } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import InicioScreen from './src/screens/InicioScreen';
import SobreScreen from './src/screens/SobreScreen';
import PontosColetaScreen from './src/screens/PontosColetaScreen';
import EducacaoScreen from './src/screens/EducacaoScreen';
import ForumScreen from './src/screens/ForumScreen';
import PerfilScreen from './src/screens/PerfilScreen';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ---- Fluxo de quem NÃO está logada: Login e Cadastro ----
function FluxoLogin({ onEntrar }) {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => <LoginScreen {...props} onEntrar={onEntrar} />}
      </AuthStack.Screen>
      <AuthStack.Screen
        name="Cadastro"
        options={{
          title: 'Criar conta',
          headerStyle: { backgroundColor: cores.rosa },
          headerTintColor: cores.branco,
        }}
      >
        {(props) => <CadastroScreen {...props} onEntrar={onEntrar} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

// ---- Ícone de Perfil que aparece no topo (leva para a tela de Perfil) ----
function BotaoPerfil({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={estilos.perfilBtn}>
      <Ionicons name="person-circle-outline" size={28} color={cores.branco} />
    </TouchableOpacity>
  );
}

// ---- As abas do app (Início, Sobre, etc.) ----
function Abas() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        // Cor do topo (header)
        headerStyle: { backgroundColor: cores.rosa },
        headerTintColor: cores.branco,
        headerTitleStyle: { fontWeight: 'bold' },
        // Ícone de perfil no canto direito do topo -> abre a tela de Perfil
        headerRight: () => <BotaoPerfil onPress={() => navigation.navigate('Perfil')} />,
        // Cores da barra de abas
        tabBarActiveTintColor: cores.rosa,
        tabBarInactiveTintColor: '#B9A6AF',
        tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 10 },
        // Escolhe o ícone de cada aba pelo nome da rota
        tabBarIcon: ({ color, size }) => {
          const icones = {
            Início: 'home',
            Sobre: 'information-circle',
            Pontos: 'location',
            Educação: 'book',
            Fórum: 'chatbubbles',
          };
          return <Ionicons name={icones[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={InicioScreen} />
      <Tab.Screen name="Sobre" component={SobreScreen} />
      <Tab.Screen name="Pontos" component={PontosColetaScreen} options={{ title: 'Pontos de Coleta' }} />
      <Tab.Screen name="Educação" component={EducacaoScreen} />
      <Tab.Screen name="Fórum" component={ForumScreen} />
    </Tab.Navigator>
  );
}

// ---- Fluxo de quem ESTÁ logada: as abas + a tela de Perfil por cima ----
function FluxoApp({ onSair }) {
  return (
    <AppStack.Navigator>
      {/* As abas (sem header próprio do stack, pois as abas já têm o seu) */}
      <AppStack.Screen name="Abas" component={Abas} options={{ headerShown: false }} />
      {/* A tela de Perfil abre por cima das abas */}
      <AppStack.Screen
        name="Perfil"
        options={{
          title: 'Perfil',
          headerStyle: { backgroundColor: cores.rosa },
          headerTintColor: cores.branco,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {(props) => <PerfilScreen {...props} onSair={onSair} />}
      </AppStack.Screen>
    </AppStack.Navigator>
  );
}

// ---- App principal ----
export default function App() {
  // logado guarda se a usuária entrou ou não.
  // Começa como false (mostra a tela de login).
  const [logado, setLogado] = useState(false);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {logado ? (
        <FluxoApp onSair={() => setLogado(false)} />
      ) : (
        <FluxoLogin onEntrar={() => setLogado(true)} />
      )}
    </NavigationContainer>
  );
}

const estilos = StyleSheet.create({
  perfilBtn: {
    marginRight: 14,
  },
});
