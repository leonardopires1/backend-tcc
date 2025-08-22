import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

// callback de seleção
interface ImageAsset {
  uri: string;
  fileName?: string;
  type: string;
}

interface ImagePickerResponse {
  didCancel?: boolean;
  errorCode?: string;
  assets?: ImageAsset[];
}

export const Profile = ({ navigation }: { navigation: any }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          logout();
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  const handleCadastrarMoradia = () => {
    navigation.navigate("CadastrarMoradia");
  };

  const handleProcurarRepublica = () => {
    navigation.navigate("BuscarMoradia");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#076df2" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Blue header with curved bottom */}
        <View style={styles.header}>
          {/* Curved bottom shape */}
          <View style={styles.curveContainer}>
            <View style={styles.curve} />
          </View>
        </View>

        {/* Profile picture */}
        <View style={styles.profileImageContainer}>
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {user?.nome ? getInitials(user.nome) : "US"}
            </Text>
          </View>
        </View>

        {/* Profile information */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.nome || "Usuário"}</Text>
          <Text style={styles.profileEmail}>
            {user?.email || "email@exemplo.com"}
          </Text>

          {user?.telefone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{user.telefone}</Text>
            </View>
          )}

          {user?.cpf && (
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={16} color="#666" />
              <Text style={styles.infoText}>
                CPF:{" "}
                {user.cpf.replace(
                  /(\d{3})(\d{3})(\d{3})(\d{2})/,
                  "$1.***.***-$4"
                )}
              </Text>
            </View>
          )}

          {user?.genero && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <Text style={styles.infoText}>
                {user.genero === "M"
                  ? "Masculino"
                  : user.genero === "F"
                  ? "Feminino"
                  : user.genero}
              </Text>
            </View>
          )}

          <Text style={styles.statusMessage}>
            {user?.moradiaId
              ? `Você faz parte de uma moradia (ID: ${user.moradiaId})`
              : "Você ainda não faz parte de nenhuma moradia."}
          </Text>

          <Text style={styles.statusMessage}>
            {user?.moradiasDono && user.moradiasDono.length > 0
              ? `Você é dono de ${user.moradiasDono.length} moradias`
              : "Você ainda não tem moradia cadastrada."}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handleCadastrarMoradia}
          >
            <Ionicons
              name="home-outline"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonText}>Cadastrar Moradia</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>ou</Text>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={handleProcurarRepublica}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color="#076df2"
              style={styles.buttonIcon}
            />
            <Text style={styles.secondaryButtonText}>Procurar República</Text>
          </TouchableOpacity>

          {/* Additional options */}
          <View style={styles.additionalOptions}>
            <TouchableOpacity style={styles.optionButton} activeOpacity={0.7}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.optionText}>Editar Perfil</Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={20} color="#666" />
              <Text style={styles.optionText}>Notificações</Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={20} color="#666" />
              <Text style={styles.optionText}>Configurações</Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} activeOpacity={0.7}>
              <Ionicons name="help-circle-outline" size={20} color="#666" />
              <Text style={styles.optionText}>Ajuda</Text>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "#076df2",
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  curveContainer: {
    height: 50,
    width: "100%",
    position: "absolute",
    bottom: -25,
    overflow: "hidden",
  },
  curve: {
    backgroundColor: "#076df2",
    height: 100,
    width: "140%",
    marginLeft: "-20%",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  profileImageContainer: {
    alignSelf: "center",
    marginTop: -60,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: "white",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#076df2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
  profileInfo: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 16,
  },
  profileName: {
    color: "#076df2",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  profileEmail: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  infoText: {
    color: "#666",
    fontSize: 14,
    marginLeft: 8,
  },
  statusMessage: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
  buttonContainer: {
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginTop: 32,
  },
  primaryButton: {
    backgroundColor: "#076df2",
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "white",
    borderColor: "#076df2",
    borderWidth: 2,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#076df2",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  orText: {
    color: "#888",
    fontSize: 16,
    marginVertical: 16,
  },
  additionalOptions: {
    width: "100%",
    marginTop: 32,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
});
