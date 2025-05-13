import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Checkbox from "expo-checkbox";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons"; // Para ícones
import Modal from "react-native-modal"; // Para o modal do Picker (gênero)

export default function Cadastro() {
  const [isChecked, setChecked] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const [showGenderModal, setShowGenderModal] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    genero: "",
    dataNascimento: "",
    telefone: "",
  });

  const handleChange = (field: keyof typeof formData, value: string): void => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // Fecha depois de selecionar
    if (selectedDate) {
      setDatePickerDate(selectedDate);
      const formattedDate = format(selectedDate, "dd/MM/yyyy");
      handleChange("dataNascimento", formattedDate);
    }
  };

  async function requisitaCadastro() {
    if (!isChecked) {
      alert("Você deve concordar com os termos para continuar.");
      return;
    }

    if (
      !formData.nome ||
      !formData.email ||
      !formData.senha ||
      !formData.confirmarSenha ||
      !formData.cpf ||
      !formData.genero ||
      !formData.dataNascimento ||
      !formData.telefone ||
      formData.telefone.length < 10 ||
      formData.telefone.length > 12
    ) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      const { confirmarSenha, ...data } = formData;
      const res = await fetch("http://127.0.0.1:3001/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Cadastro realizado com sucesso!");
        console.log("Cadastro realizado com sucesso:", data);
        setFormData({
          nome: "",
          email: "",
          senha: "",
          confirmarSenha: "",
          cpf: "",
          genero: "",
          dataNascimento: "",
          telefone: "",
        });
        setChecked(false);
      } else {
        const errorData = await res.json();
        console.error("Erro ao cadastrar:", errorData);
        alert(
          `Erro ao cadastrar: ${
            errorData.message || res.statusText || "Erro desconhecido"
          }`
        );
      }
    } catch (error) {
      console.error("Erro ao realizar o cadastro:", error);
      alert("Ocorreu um erro ao tentar realizar o cadastro. Tente novamente.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Cadastre-se</Text>

            <TextInput
              style={styles.input}
              placeholder="nome"
              placeholderTextColor="#999"
              value={formData.nome}
              onChangeText={(text) => handleChange("nome", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={formData.senha}
              onChangeText={(text) => handleChange("senha", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="confirmar senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={formData.confirmarSenha}
              onChangeText={(text) => handleChange("confirmarSenha", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="CPF"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={formData.cpf}
              onChangeText={(text) => handleChange("cpf", text)}
            />

            {/* Campo de data de nascimento */}
            <View style={styles.inputWithIcon}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color="#999"
                style={styles.icon}
              />
              <Pressable
                style={styles.inputPressable}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={{
                    color: formData.dataNascimento ? "#000" : "#999",
                    fontSize: 16,
                  }}
                >
                  {formData.dataNascimento || "Data de nascimento"}
                </Text>
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={datePickerDate}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="telefone"
              placeholderTextColor="#999"
              value={formData.telefone}
              onChangeText={(text) => handleChange("telefone", text)}
              keyboardType="phone-pad"
            />

            {/* Campo de gênero */}
            <View style={styles.inputWithIcon}>
              <Ionicons
                name="person-outline"
                size={24}
                color="#999"
                style={styles.icon}
              />
              <Pressable
                style={styles.inputPressable}
                onPress={() => setShowGenderModal(true)}
              >
                <Text
                  style={{
                    color: formData.genero ? "#000" : "#999",
                    fontSize: 16,
                  }}
                >
                  {formData.genero || "Selecione o gênero"}
                </Text>
              </Pressable>
            </View>

            <Modal
              isVisible={showGenderModal}
              onBackdropPress={() => setShowGenderModal(false)}
              onBackButtonPress={() => setShowGenderModal(false)}
            >
              <View style={styles.modalContent}>
                {["Masculino", "Feminino", "Outro"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.modalOption}
                    onPress={() => {
                      handleChange("genero", option);
                      setShowGenderModal(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Modal>

            <View style={styles.checkboxContainer}>
              <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? "#00E676" : undefined}
              />
              <Text style={styles.checkboxLabel}>
                Eu concordo em vender minha alma para o diabo
              </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={requisitaCadastro}>
              <Text style={styles.buttonText}>cadastrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00E676",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: "white",
    marginTop: 150,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#00E676",
    marginBottom: 30,
    marginTop: 20,
  },
  input: {
    width: "90%",
    height: 55,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    justifyContent: "center",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    height: 55,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  inputPressable: {
    flex: 1,
    justifyContent: "center",
    height: "100%",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  checkbox: {
    marginRight: 10,
    borderRadius: 4,
    width: 24,
    height: 24,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#999",
  },
  button: {
    width: "90%",
    height: 55,
    backgroundColor: "#00E676",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
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
    color: "#333",
    textAlign: "center",
  },
});
