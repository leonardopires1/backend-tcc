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
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useMoradias } from '../hooks/useMoradias';

export default function CadastrarMoradia({ navigation }: { navigation: any }) {
  const [nomeRepublica, setNomeRepublica] = useState('');
  const [cep, setCep] = useState('');
  const [mensalidade, setMensalidade] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string; cep?: string; mensalidade?: string }>({});
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

  // Função para formatar valor monetário
  const formatMoney = (text: string) => {
    // Remove tudo que não for número
    const cleanedText = text.replace(/\D/g, '');
    
    if (cleanedText === '') return '';
    
    // Converte para número e divide por 100 para obter os centavos
    const value = parseInt(cleanedText) / 100;
    
    // Formata como moeda brasileira
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para obter o valor numérico da mensalidade
  const getMensalidadeValue = (formattedValue: string) => {
    const cleanedValue = formattedValue.replace(/\D/g, '');
    if (cleanedValue === '') return 0;
    return parseInt(cleanedValue) / 100;
  };

  const handleCriarMoradia = async () => {
    if (isLoading) return;
    Keyboard.dismiss();
    const userId = user ? user.id : null;
    let newErrors: { nome?: string; cep?: string; mensalidade?: string } = {};
    
    if (!nomeRepublica.trim()) {
      newErrors.nome = 'Informe o nome da moradia.';
    }
    
    if (!cep.trim()) {
      newErrors.cep = 'Informe o CEP.';
    }
    
    const cleanCEP = cep.replace(/\D/g, '');
    const cepRegex = /^[0-9]{8}$/;
    if (cep && !cepRegex.test(cleanCEP)) {
      newErrors.cep = 'CEP inválido. Deve conter 8 dígitos.';
    }
    
    if (!mensalidade.trim()) {
      newErrors.mensalidade = 'Informe o valor da mensalidade.';
    } else {
      const valorMensalidade = getMensalidadeValue(mensalidade);
      if (valorMensalidade <= 0) {
        newErrors.mensalidade = 'O valor da mensalidade deve ser maior que zero.';
      }
    }
    if (!userId) {
      alert('Usuário não autenticado. Faça login.');
      return;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setIsLoading(true);
    try {
      const res = await createMoradia({
        nome: nomeRepublica.trim(),
        endereco: `CEP: ${cleanCEP}`,
        valorMensalidade: getMensalidadeValue(mensalidade),
        donoId: userId,
      });
      if (res.success) {
        alert('Moradia cadastrada com sucesso!');
        setNomeRepublica('');
        setCep('');
        setMensalidade('');
        navigation.navigate('Home');
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.backWrapper}>
            <TouchableOpacity style={styles.unifiedBackBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.unifiedBackText}>Voltar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}> 
            <Text style={styles.title}>Cadastrar Moradia</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome da moradia</Text>
              <TextInput
                style={[styles.input, errors.nome && styles.inputError]}
                placeholder="Digite o nome da moradia"
                value={nomeRepublica}
                onChangeText={setNomeRepublica}
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>CEP</Text>
              <TextInput
                style={[styles.input, errors.cep && styles.inputError]}
                placeholder="Ex: 12345-678"
                value={cep}
                onChangeText={(text) => setCep(formatCEP(text))}
                keyboardType="numeric"
                maxLength={9}
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mensalidade</Text>
              <TextInput
                style={[styles.input, errors.mensalidade && styles.inputError]}
                placeholder="Ex: R$ 500,00"
                value={mensalidade}
                onChangeText={(text) => setMensalidade(formatMoney(text))}
                keyboardType="numeric"
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {errors.mensalidade && <Text style={styles.errorText}>{errors.mensalidade}</Text>}
            </View>
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleCriarMoradia}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? <ActivityIndicator size="small" color={COLORS.GRAY_DARK} /> : 'Cadastrar'}
              </Text>
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
    backgroundColor: COLORS.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.XL,
    justifyContent: 'center',
  },
  backWrapper: {
    position: 'absolute',
    top: SPACING.LG,
    left: SPACING.MD,
    zIndex: 10,
  },
  unifiedBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef5ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dbeafe'
  },
  unifiedBackText: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: COLORS.WHITE,
  },
  title: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.XL,
  },
  inputContainer: {
    marginBottom: SPACING.LG,
  },
  label: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  input: {
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    fontSize: FONT_SIZES.MD,
    borderWidth: 1,
    borderColor: 'transparent',
    color: COLORS.TEXT_PRIMARY,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SM,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.LG,
    paddingVertical: SPACING.LG,
    alignItems: 'center',
    marginTop: SPACING.XL,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.GRAY_LIGHT,
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
});