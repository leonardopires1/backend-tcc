import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get('window');

interface ProfileOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  showChevron?: boolean;
}

const ProfileOption: React.FC<ProfileOptionProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  color = "#666",
  showChevron = true,
}) => (
  <TouchableOpacity style={styles.optionCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.optionIconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={styles.optionContent}>
      <Text style={styles.optionTitle}>{title}</Text>
      {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
    </View>
    {showChevron && <Ionicons name="chevron-forward" size={20} color="#CCC" />}
  </TouchableOpacity>
);

interface InfoCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon, color }) => (
  <View style={styles.infoCard}>
    <View style={[styles.infoIconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4");
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };

  const getStatusInfo = () => {
    if (user?.moradiaId) {
      return {
        status: "Membro de República",
        description: "Você faz parte de uma república",
        color: "#4CAF50",
        icon: "home" as keyof typeof Ionicons.glyphMap
      };
    } else if (user?.moradiasDono && user.moradiasDono.length > 0) {
      return {
        status: "Proprietário",
        description: `Dono de ${user.moradiasDono.length} moradia${user.moradiasDono.length > 1 ? 's' : ''}`,
        color: "#FF9800",
        icon: "business" as keyof typeof Ionicons.glyphMap
      };
    } else {
      return {
        status: "Sem República",
        description: "Procure ou cadastre uma moradia",
        color: "#999",
        icon: "search" as keyof typeof Ionicons.glyphMap
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0073FF" />

      {/* Header com gradiente */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.nome ? getInitials(user.nome) : "US"}
              </Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.nome || "Usuário"}</Text>
            <Text style={styles.profileEmail}>{user?.email || "email@exemplo.com"}</Text>
            
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
              <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Informações Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          <View style={styles.infoGrid}>
            {user?.telefone && (
              <InfoCard
                title="Telefone"
                value={formatPhone(user.telefone)}
                icon="call"
                color="#4CAF50"
              />
            )}
            {user?.cpf && (
              <InfoCard
                title="CPF"
                value={formatCpf(user.cpf)}
                icon="card"
                color="#2196F3"
              />
            )}
            {user?.genero && (
              <InfoCard
                title="Gênero"
                value={user.genero === "M" ? "Masculino" : user.genero === "F" ? "Feminino" : user.genero}
                icon="person"
                color="#9C27B0"
              />
            )}
          </View>
        </View>

        {/* Status da Moradia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status de Moradia</Text>
          <View style={styles.statusCard}>
            <View style={[styles.statusIconContainer, { backgroundColor: statusInfo.color + '15' }]}>
              <Ionicons name={statusInfo.icon} size={28} color={statusInfo.color} />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>{statusInfo.status}</Text>
              <Text style={styles.statusDescription}>{statusInfo.description}</Text>
            </View>
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.optionsContainer}>
            <ProfileOption
              icon="home-outline"
              title="Cadastrar Moradia"
              subtitle="Crie uma nova república"
              onPress={() => navigation.navigate("CadastrarMoradia")}
              color="#0073FF"
            />
            <ProfileOption
              icon="search-outline"
              title="Buscar Moradia"
              subtitle="Encontre uma república"
              onPress={() => navigation.navigate("BuscarMoradia")}
              color="#4CAF50"
            />
            {user?.moradiaId && (
              <ProfileOption
                icon="people-outline"
                title="Minha República"
                subtitle="Acesse o painel da sua república"
                onPress={() => navigation.navigate("RepublicaDashboard")}
                color="#673AB7"
              />
            )}
          </View>
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <View style={styles.optionsContainer}>
            <ProfileOption
              icon="person-outline"
              title="Editar Perfil"
              subtitle="Atualize suas informações"
              onPress={() => {/* TODO: Implementar */}}
              color="#FF9800"
            />
            <ProfileOption
              icon="notifications-outline"
              title="Notificações"
              subtitle="Gerencie suas preferências"
              onPress={() => {/* TODO: Implementar */}}
              color="#9C27B0"
            />
            <ProfileOption
              icon="shield-checkmark-outline"
              title="Privacidade e Segurança"
              subtitle="Configurações de conta"
              onPress={() => {/* TODO: Implementar */}}
              color="#607D8B"
            />
            <ProfileOption
              icon="help-circle-outline"
              title="Ajuda e Suporte"
              subtitle="Central de ajuda"
              onPress={() => {/* TODO: Implementar */}}
              color="#795548"
            />
          </View>
        </View>

        {/* Botão de Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutCard} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={24} color="#F44336" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#0073FF",
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0073FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: width * 0.42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContent: {
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 12,
  },
  bottomSpacing: {
    height: 40,
  },
  // Estilos antigos mantidos para compatibilidade (não utilizados no novo design)
  headerTop: {
    display: 'none',
  },
  curveContainer: {
    display: 'none',
  },
  curve: {
    display: 'none',
  },
  profileImageContainer: {
    display: 'none',
  },
  profileImage: {
    display: 'none',
  },
  avatarFallback: {
    display: 'none',
  },
  infoRow: {
    display: 'none',
  },
  infoText: {
    display: 'none',
  },
  statusMessage: {
    display: 'none',
  },
  buttonContainer: {
    display: 'none',
  },
  primaryButton: {
    display: 'none',
  },
  primaryButtonText: {
    display: 'none',
  },
  secondaryButton: {
    display: 'none',
  },
  secondaryButtonText: {
    display: 'none',
  },
  buttonIcon: {
    display: 'none',
  },
  orText: {
    display: 'none',
  },
  additionalOptions: {
    display: 'none',
  },
  optionButton: {
    display: 'none',
  },
  optionText: {
    display: 'none',
  },
});
