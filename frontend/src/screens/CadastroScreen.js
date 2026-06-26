// CadastroScreen.js
// Tela de cadastro. No topo tem um seletor "Quero doar" / "Preciso de ajuda".
// Dependendo da opção escolhida, mostra o formulário de Doadora ou de Beneficiária.

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Campo from "../components/Campo";
import Seletor from "../components/Seletor";
import Botao from "../components/Botao";
import { avisar } from "../utils/avisar";
import { cores } from "../theme";

// Listas de opções dos seletores
const CIDADES = [
  "Porto Alegre",
  "Canoas",
  "São Leopoldo",
  "Novo Hamburgo",
  "Gravataí",
  "Sapucaia do Sul",
  "Esteio",
  "Viamão",
];
const FREQUENCIAS = [
  "Semanalmente",
  "Quinzenalmente",
  "Mensalmente",
  "Quando possível",
];
const NECESSIDADES = [
  "Absorventes",
  "Coletor menstrual",
  "Calcinha absorvente",
  "Itens de higiene",
  "Outro",
];

export default function CadastroScreen({ onEntrar }) {
  // perfil controla qual formulário aparece: 'doadora' ou 'beneficiaria'
  const [perfil, setPerfil] = useState("doadora");

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [necessidade, setNecessidade] = useState("");

  const ehDoadora = perfil === "doadora";

  function cadastrar() {
    // Validação simples: só verifica se o nome foi preenchido.
    if (!nome) {
      avisar("Atenção", "Por favor, preencha o seu nome completo.");
      return;
    }
    avisar("Cadastro concluído!", `Seja bem-vinda, ${nome}!`);
    onEntrar(); //entra no app
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      {/* Seletor Doar / Preciso de ajuda */}
      <View style={estilos.abas}>
        <TouchableOpacity
          style={[estilos.aba, ehDoadora && estilos.abaAtiva]}
          onPress={() => setPerfil("doadora")}
        >
          <Ionicons
            name="heart"
            size={16}
            color={ehDoadora ? cores.branco : cores.rosa}
          />
          <Text style={[estilos.abaTexto, ehDoadora && estilos.abaTextoAtivo]}>
            Quero doar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[estilos.aba, !ehDoadora && estilos.abaAtiva]}
          onPress={() => setPerfil("beneficiaria")}
        >
          <Ionicons
            name="hand-left"
            size={16}
            color={!ehDoadora ? cores.branco : cores.rosa}
          />
          <Text style={[estilos.abaTexto, !ehDoadora && estilos.abaTextoAtivo]}>
            Preciso de ajuda
          </Text>
        </TouchableOpacity>
      </View>

      {/* Título e descrição mudam conforme o perfil */}
      <Text style={estilos.titulo}>
        {ehDoadora ? "Cadastro de Doadora" : "Cadastro de Beneficiária"}
      </Text>
      <Text style={estilos.descricao}>
        {ehDoadora
          ? "Sua doação pode transformar a vida de uma mulher. Preencha os dados abaixo para começar a fazer a diferença."
          : "Você não está sozinha. Preencha os dados abaixo e conectaremos você com uma doadora na sua região."}
      </Text>

      {/* Campos iguais para os dois perfis */}
      <Campo
        rotulo="Nome completo"
        valor={nome}
        aoMudar={setNome}
        placeholder="Seu nome"
      />
      <Campo
        rotulo="E-mail"
        valor={email}
        aoMudar={setEmail}
        placeholder="fulano@gmail.com"
        tipoTeclado="email-address"
      />
      <Campo
        rotulo="Telefone"
        valor={telefone}
        aoMudar={setTelefone}
        placeholder="(51) 99999-9999"
        tipoTeclado="phone-pad"
      />
      <Seletor
        rotulo="Cidade"
        valor={cidade}
        aoEscolher={setCidade}
        opcoes={CIDADES}
        placeholder="Selecione sua cidade"
      />

      {/* O último campo muda: doadora -> frequência | beneficiária -> tipo de necessidade */}
      {ehDoadora ? (
        <Seletor
          rotulo="Frequência de doação"
          valor={frequencia}
          aoEscolher={setFrequencia}
          opcoes={FREQUENCIAS}
          placeholder="Com que frequência pode doar?"
        />
      ) : (
        <Seletor
          rotulo="Tipo de necessidade"
          valor={necessidade}
          aoEscolher={setNecessidade}
          opcoes={NECESSIDADES}
          placeholder="Selecione o tipo de ajuda"
        />
      )}

      <Botao titulo="Cadastrar" onPress={cadastrar} estilo={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.rosaClaro },
  conteudo: { padding: 20 },
  abas: {
    flexDirection: "row",
    backgroundColor: cores.branco,
    borderRadius: 30,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  aba: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 26,
  },
  abaAtiva: { backgroundColor: cores.rosa },
  abaTexto: { color: cores.rosa, fontWeight: "600", fontSize: 13 },
  abaTextoAtivo: { color: cores.branco },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: 6,
  },
  descricao: {
    fontSize: 14,
    color: cores.textoClaro,
    marginBottom: 20,
    lineHeight: 20,
  },
});
