import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function BoasVindas() {
  return (
    <View style={styles.container}>
      {/* Ícone de voltar */}
      <Text style={styles.backArrow}>{'‹'}</Text>

      {/* Logo/Ícone */}
      <View style={styles.logo}>
        <Text style={styles.logoEyes}>👀</Text>
      </View>

      {/* Título */}
      <Text style={styles.title}>
        Administre sua moradia{'\n'}da melhor forma possível!
      </Text>

      {/* Subtítulo */}
      <Text style={styles.subtitle}>
        Problemas com a gestão do seu lar?{'\n'}
        Não mais! Bem-vindo ao <Text style={styles.highlight}>roommate</Text>!
      </Text>

      {/* Botão */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Comece com duas semanas grátis</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    alignSelf: 'flex-start',
    marginBottom: 40,
  },
  logo: {
    marginBottom: 40,
  },
  logoEyes: {
    fontSize: 80, // substituindo o logo visual com emoji por simplicidade
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E7EFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#1E7EFF',
  },
  button: {
    backgroundColor: '#1E7EFF',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
