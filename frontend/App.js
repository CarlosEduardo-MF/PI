//o que depois vai virar html

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

// Login e Cadastro
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

// ícone de perfil no topo
function BotaoPerfil({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={estilos.perfilBtn}>
      <Ionicons name="person-circle-outline" size={28} color={cores.branco} />
    </TouchableOpacity>
  );
}

// abas do app
function Abas() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerStyle: { backgroundColor: cores.rosa },
        headerTintColor: cores.branco,
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <BotaoPerfil onPress={() => navigation.navigate('Perfil')} />,
        tabBarActiveTintColor: cores.rosa,
        tabBarInactiveTintColor: '#B9A6AF',
        tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 10 },
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

// abas + tela de Perfil por cima
function FluxoApp({ usuario, onSair }) {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Abas" component={Abas} options={{ headerShown: false }} />
      <AppStack.Screen
        name="Perfil"
        options={{
          title: 'Perfil',
          headerStyle: { backgroundColor: cores.rosa },
          headerTintColor: cores.branco,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {(props) => <PerfilScreen {...props} usuario={usuario} onSair={onSair} />}
      </AppStack.Screen>
    </AppStack.Navigator>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {usuario ? (
        <FluxoApp usuario={usuario} onSair={() => setUsuario(null)} />
      ) : (
        <FluxoLogin onEntrar={setUsuario} />
      )}
    </NavigationContainer>
  );
}

const estilos = StyleSheet.create({
  perfilBtn: {
    marginRight: 14,
  },
});
