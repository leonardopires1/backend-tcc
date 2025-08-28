import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, title, description, onPress, color }) => (
  <TouchableOpacity style={[styles.actionCard, { borderLeftColor: color }]} onPress={onPress}>
    <View style={styles.actionContent}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </View>
  </TouchableOpacity>
);

export default function Home({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Verifica se o usuário é membro de uma república
  const isMembro = user?.moradiaId !== null && user?.moradiaId !== undefined;
  
  console.log('🏠 Home - User data:', { 
    userId: user?.id, 
    moradiaId: user?.moradiaId, 
    isMembro 
  });

  const quickActions = [
    {
      icon: 'search' as keyof typeof Ionicons.glyphMap,
      title: 'Buscar Moradia',
      description: 'Encontre a moradia ideal para você',
      onPress: () => navigation.navigate("BuscarMoradia"),
      color: '#4CAF50',
    },
    {
      icon: 'add-circle' as keyof typeof Ionicons.glyphMap,
      title: 'Cadastrar Moradia',
      description: 'Anuncie sua moradia',
      onPress: () => navigation.navigate("CadastrarMoradia"),
      color: '#2196F3',
    },
    {
      icon: 'home' as keyof typeof Ionicons.glyphMap,
      title: 'Minhas Moradias',
      description: 'Gerencie as moradias que você cadastrou',
      onPress: () => navigation.navigate('MinhasMoradias'),
      color: '#FF9800',
    },
    ...(isMembro ? [{
      icon: 'people' as keyof typeof Ionicons.glyphMap,
      title: 'Minha Moradia',
      description: 'Acesse o painel da sua moradia',
      onPress: () => navigation.navigate("MoradiaDashboard"),
      color: '#673AB7',
    }] : []),
    {
      icon: 'person' as keyof typeof Ionicons.glyphMap,
      title: 'Meu Perfil',
      description: 'Gerencie suas informações',
      onPress: () => navigation.navigate("Profile"),
      color: '#9C27B0',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Bem-vindo ao seu app!</Text>
          <Text style={styles.welcomeSubtitle}>
            Gerencie suas moradias e encontre companheiros de casa
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              icon={action.icon}
              title={action.title}
              description={action.description}
              onPress={action.onPress}
              color={action.color}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeCard: {
    backgroundColor: '#0073FF',
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
  },
});
