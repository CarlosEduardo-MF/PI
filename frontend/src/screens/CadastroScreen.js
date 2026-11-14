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
import { cadastrarDoadora, cadastrarBeneficiaria, cadastrarInstituicao, login } from "../services/api";
import { cores } from "../theme";

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
  const [perfil, setPerfil] = useState("doadora");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [necessidade, setNecessidade] = useState("");
  const [salvando, setSalvando] = useState(false);

  const ehDoadora = perfil === "doadora";
  const ehInstituicao = perfil === "instituicao";

  async function cadastrar() {
    if (!nome) {
      avisar("Atenção", ehInstituicao ? "Preencha o nome da instituição." : "Por favor, preencha o seu nome completo.");
      return;
    }
    if (!email || !senha) {
      avisar("Atenção", "Preencha o e-mail e a senha para criar seu acesso.");
      return;
    }

    setSalvando(true);
    try {
      if (ehInstituicao) {
        await cadastrarInstituicao({ nome, email, telefone, cidade, senha });
      } else if (ehDoadora) {
        await cadastrarDoadora({ nome, email, telefone, cidade, frequencia, senha });
      } else {
        await cadastrarBeneficiaria({ nome, email, telefone, cidade, necessidade, senha });
      }

      const resposta = await login(email, senha);
      // entra no perfil que acabou de criar (o e-mail pode ter outro perfil mais antigo)
      const criado = (resposta.perfis || []).find((p) => p.tipo === perfil) || resposta.usuario;
      avisar("Cadastro concluído!", `Seja bem-vinda, ${nome}!`);
      onEntrar(criado);
    } catch (erro) {
      avisar("Não foi possível cadastrar", erro.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
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
          style={[estilos.aba, perfil === "beneficiaria" && estilos.abaAtiva]}
          onPress={() => setPerfil("beneficiaria")}
        >
          <Ionicons
            name="hand-left"
            size={16}
            color={perfil === "beneficiaria" ? cores.branco : cores.rosa}
          />
          <Text style={[estilos.abaTexto, perfil === "beneficiaria" && estilos.abaTextoAtivo]}>
            Preciso de ajuda
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[estilos.aba, ehInstituicao && estilos.abaAtiva]}
          onPress={() => setPerfil("instituicao")}
        >
          <Ionicons
            name="business"
            size={16}
            color={ehInstituicao ? cores.branco : cores.rosa}
          />
          <Text style={[estilos.abaTexto, ehInstituicao && estilos.abaTextoAtivo]}>
            Sou instituição
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={estilos.titulo}>
        {ehInstituicao
          ? "Cadastro de Instituição"
          : ehDoadora
          ? "Cadastro de Doadora"
          : "Cadastro de Beneficiária"}
      </Text>
      <Text style={estilos.descricao}>
        {ehInstituicao
          ? "Cadastre a sua instituição para indicar pontos de coleta. Cada ponto novo passa por uma aprovação da nossa equipe antes de aparecer no mapa."
          : ehDoadora
          ? "Sua doação pode transformar a vida de uma mulher. Preencha os dados abaixo para começar a fazer a diferença."
          : "Você não está sozinha. Preencha os dados abaixo e conectaremos você com uma doadora na sua região."}
      </Text>

      <Campo
        rotulo={ehInstituicao ? "Nome da instituição" : "Nome completo"}
        valor={nome}
        aoMudar={setNome}
        placeholder={ehInstituicao ? "Ex.: Casa da Mulher" : "Seu nome"}
      />
      <Campo
        rotulo="E-mail"
        valor={email}
        aoMudar={setEmail}
        placeholder="fulano@gmail.com"
        tipoTeclado="email-address"
      />
      <Campo
        rotulo="Senha"
        valor={senha}
        aoMudar={setSenha}
        placeholder="Crie uma senha"
        senha
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

      {ehInstituicao ? null : ehDoadora ? (
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

      <Botao
        titulo={salvando ? "Cadastrando..." : "Cadastrar"}
        onPress={cadastrar}
        estilo={{ marginTop: 8 }}
      />
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
  abaTexto: { color: cores.rosa, fontWeight: "600", fontSize: 12 },
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
