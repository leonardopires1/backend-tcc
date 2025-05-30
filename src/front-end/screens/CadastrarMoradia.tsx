import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function App() {
  const [nomeRepublica, setNomeRepublica] = useState('');
  const [cep, setCep] = useState('');

  const handleCriarMoradia = () => {
    console.log('Criar moradia:', { nomeRepublica, cep });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <View style={styles.background}>
        <View style={styles.card}>
          <Text style={styles.title}>Cadastrar Moradia</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="nome da república"
              placeholderTextColor="#A0A0A0"
              value={nomeRepublica}
              onChangeText={setNomeRepublica}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="CEP"
              placeholderTextColor="#A0A0A0"
              value={cep}
              onChangeText={setCep}
              keyboardType="numeric"
              maxLength={8}
            />
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleCriarMoradia}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>criar moradia</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'left',
    marginBottom: 40,
    lineHeight: 38,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#333',
    borderWidth: 0,
  },
  button: {
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    paddingVertical: 18,
    marginTop: 40,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#A0A0A0',
    fontWeight: '500',
  },
});