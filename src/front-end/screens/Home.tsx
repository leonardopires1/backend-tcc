import { Link } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Home({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo à Home!</Text>
      <Text style={styles.subtitle}>Aqui está o conteúdo da sua Home.</Text>
      <TouchableOpacity>
        <Button onPress={() => navigation.navigate("BuscarMoradia")} color="black" title="Buscar Moradia" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Button onPress={() => navigation.navigate("BoasVindas")} color="black" title="Tela de boas vindas" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Button onPress={() => navigation.navigate("CadastrarMoradia")} color="black" title="Cadastrar moradia" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Button onPress={() => navigation.navigate("PerfilMoradia")} color="black" title="Perfil moradia" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Button onPress={() => navigation.navigate("Profile")} color="black" title="Profile" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  
});
