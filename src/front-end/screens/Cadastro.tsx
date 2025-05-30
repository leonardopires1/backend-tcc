import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";

export default function Cadastro({ navigation }: { navigation: any }) {
  const [step, setStep] = useState(1); // controla as etapas
  const [isChecked, setChecked] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    genero: "",
    telefone: "",
  });

  const handleChange = (field: keyof typeof formData, value: string): void => {
    setFormData({ ...formData, [field]: value });
  };

  async function requisitaCadastro() {
    if (!isChecked) {
      alert("Você deve concordar com os termos.");
      return;
    }

    // Validação de formato de email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Por favor, insira um email válido.");
      return false;
    }

    if (
      !formData.cpf ||
      !formData.genero ||
      !formData.telefone ||
      formData.telefone.length < 10 ||
      formData.telefone.length > 12
    ) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      const { confirmarSenha, ...data } = formData;
      const res = await fetch(`${process.env.API_URL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Cadastro realizado com sucesso!");
        setFormData({
          nome: "",
          email: "",
          senha: "",
          confirmarSenha: "",
          cpf: "",
          genero: "",
          telefone: "",
        });
        setChecked(false);
        navigation.navigate("Login");
      } else {
        const errorData = await res.json();
        alert(`Erro: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao tentar cadastrar.");
    }
  }

  function renderStepOne() {
    return (
      <>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#999"
          value={formData.nome}
          onChangeText={(text) => handleChange("nome", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={formData.senha}
          onChangeText={(text) => handleChange("senha", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={formData.confirmarSenha}
          onChangeText={(text) => handleChange("confirmarSenha", text)}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (
              formData.nome &&
              formData.email &&
              formData.senha &&
              formData.confirmarSenha
            ) {
              if (formData.senha !== formData.confirmarSenha) {
                alert("As senhas não coincidem.");
              } else {
                setStep(2);
              }
            } else {
              alert("Preencha todos os campos.");
            }
          }}
        >
          <Text style={styles.buttonText}>Próxima</Text>
        </TouchableOpacity>
      </>
    );
    
  }

  function renderStepTwo() {
    return (
      <>
        <TouchableOpacity style={styles.backArrow} onPress={() => setStep(1)}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="CPF"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={formData.cpf}
          onChangeText={(text) => handleChange("cpf", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={formData.telefone}
          onChangeText={(text) => handleChange("telefone", text)}
        />
        <Pressable
          style={styles.inputWithIcon}
          onPress={() => setShowGenderModal(true)}
        >
          <Ionicons name="person-outline" size={24} color="#999" />
          <Text
            style={{
              marginLeft: 10,
              fontSize: 16,
              color: formData.genero ? "#000" : "#999",
            }}
          >
            {formData.genero || "Selecione o gênero"}
          </Text>
        </Pressable>

        <Modal
          isVisible={showGenderModal}
          onBackdropPress={() => setShowGenderModal(false)}
        >
          <View style={styles.modalContent}>
            {["Masculino", "Feminino", "Outro"].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => {
                  handleChange("genero", g);
                  setShowGenderModal(false);
                }}
                style={styles.modalOption}
              >
                <Text style={styles.modalOptionText}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Modal>

        <View style={styles.checkboxContainer}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? "#076DF2" : undefined}
          />
          <Text style={styles.checkboxLabel}>Concordo com os termos</Text>
        </View>

        <View style={styles.rowButtons}>

          <TouchableOpacity
            style={[styles.button, styles.halfButton]}
            onPress={requisitaCadastro}
          >
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Cadastro</Text>
        {step === 1 ? renderStepOne() : renderStepTwo()}

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Já tem uma conta? Entre</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#076DF2",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#076DF2",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#555",
  },
  button: {
    backgroundColor: "#076DF2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    backgroundColor: "#ccc",
    borderRadius: 10,
  },
  secondaryButtonText: {
    fontWeight: "bold",
    color: "#333",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 18,
    textAlign: "center",
  },
  loginLink: {
    textAlign: "center",
    marginTop: 20,
    color: "#076DF2",
    fontWeight: "bold",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  halfButton: {
    flex: 1,
  },
  backArrow: {
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 1,
  padding: 22,
  color: "#076DF2",
},

});
