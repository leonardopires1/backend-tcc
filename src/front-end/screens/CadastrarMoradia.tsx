import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { COLORS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useMoradias } from '../hooks/useMoradias';

export default function CadastrarMoradia({ navigation }: { navigation: any }) {
  const [nomeRepublica, setNomeRepublica] = useState('');
  const [cep, setCep] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); 
  const { createMoradia } = useMoradias();

  // Função para formatar CEP automaticamente
  const formatCEP = (text: string) => {
    // Remove tudo que não for número
    const cleanedText = text.replace(/\D/g, '');
    // Limita a 8 dígitos
    const limitedText = cleanedText.substring(0, 8);
    // Formata no padrão XXXXX-XXX
    if (limitedText.length > 5) {
      return `${limitedText.substring(0, 5)}-${limitedText.substring(5)}`;
    }
    return limitedText;
  };

  const handleCriarMoradia = async () => {
    if (isLoading) return; // Previne múltiplos cliques
    
    // Fecha o teclado antes de processar
    Keyboard.dismiss();
    
    const userId = user ? user.id : null;

    if (!nomeRepublica.trim()) {
      alert('Por favor, informe o nome da moradia.');
      return;
    }

    if (!cep.trim()) {
      alert('Por favor, informe o CEP.');
      return;
    }

    // Remove formatação do CEP para validação
    const cleanCEP = cep.replace(/\D/g, '');
    const cepRegex = /^[0-9]{8}$/;
    if (!cepRegex.test(cleanCEP)) {
      alert('CEP inválido. Deve conter 8 dígitos numéricos.');
      return;
    }

    if (!userId) {
      alert('Usuário não autenticado. Por favor, faça login.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await createMoradia({
        nome: nomeRepublica.trim(),
        endereco: `CEP: ${cleanCEP}`, // Formatando o CEP como parte do endereço
        donoId: userId,
      });

      if (res.success) {
        alert('Moradia cadastrada com sucesso!');
        setNomeRepublica('');
        setCep('');
        navigation.navigate('PerfilMoradia'); 
      } else {
        const errorData = await res.message;
        alert(errorData || 'Erro ao cadastrar moradia. Tente novamente.');
      }
    } catch (error) {
      alert('Erro ao cadastrar moradia. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.background}>
          <View style={styles.card}>
            <Text style={styles.title}>Cadastrar Moradia</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="nome da moradia"
                placeholderTextColor="#A0A0A0"
                value={nomeRepublica}
                onChangeText={setNomeRepublica}
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="CEP (ex: 12345-678)"
                placeholderTextColor="#A0A0A0"
                value={cep}
                onChangeText={(text) => setCep(formatCEP(text))}
                keyboardType="numeric"
                maxLength={9} // Aumentado para acomodar a formatação
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleCriarMoradia}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, isLoading && styles.buttonTextDisabled]}>
                {isLoading ? 'criando...' : 'criar moradia'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
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
    color: COLORS.PRIMARY,
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
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 18,
    marginTop: 40,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#C0C0C0',
  },
});