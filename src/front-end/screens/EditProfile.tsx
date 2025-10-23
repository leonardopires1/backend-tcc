import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { validateCPF as validateCPFUtil } from '../hooks/useValidation';

interface EditProfileProps {
  navigation: any;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  genero: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  genero?: string;
}

export const EditProfile: React.FC<EditProfileProps> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    cpf: user?.cpf || '',
    genero: user?.genero || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Detecta se houve mudanças no formulário
  useEffect(() => {
    const hasChanged = 
      formData.nome !== (user?.nome || '') ||
      formData.email !== (user?.email || '') ||
      formData.telefone !== (user?.telefone || '') ||
      formData.cpf !== (user?.cpf || '') ||
      formData.genero !== (user?.genero || '');
    
    setHasChanges(hasChanged);
  }, [formData, user]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpa erro do campo ao digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatCpf = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Formata: 000.000.000-00
    return limited
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatTelefone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Formata: (00) 00000-0000 ou (00) 0000-0000
    if (limited.length <= 10) {
      return limited
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return limited
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Valida nome
    if (!formData.nome || formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.nome.trim().length > 100) {
      newErrors.nome = 'Nome deve ter no máximo 100 caracteres';
    }

    // Valida email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    // Valida telefone
    const telefoneNumbers = formData.telefone.replace(/\D/g, '');
    if (!telefoneNumbers || telefoneNumbers.length === 0) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (telefoneNumbers.length < 10 || telefoneNumbers.length > 11) {
      newErrors.telefone = 'Telefone deve ter 10 ou 11 dígitos';
    }

    // Valida CPF
    const cpfError = validateCPFUtil(formData.cpf);
    if (cpfError) {
      newErrors.cpf = cpfError;
    }

    // Valida gênero
    if (!formData.genero) {
      newErrors.genero = 'Selecione um gênero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    if (!hasChanges) {
      Alert.alert('Aviso', 'Nenhuma alteração foi feita');
      return;
    }

    setIsLoading(true);

    try {
      // Remove formatação do CPF e telefone antes de enviar
      const updateData = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        telefone: formData.telefone.replace(/\D/g, ''),
        cpf: formData.cpf.replace(/\D/g, ''),
        genero: formData.genero,
      };

      const result = await updateProfile(updateData);

      if (result.success) {
        Alert.alert(
          'Sucesso',
          'Perfil atualizado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erro', result.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Descartar alterações?',
        'Você tem alterações não salvas. Deseja descartar?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0073FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo *</Text>
              <View style={[styles.inputContainer, errors.nome && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChangeText={(value) => handleChange('nome', value)}
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
              {errors.nome && (
                <Text style={styles.errorText}>{errors.nome}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail *</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu e-mail"
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Telefone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone *</Text>
              <View style={[styles.inputContainer, errors.telefone && styles.inputError]}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  value={formatTelefone(formData.telefone)}
                  onChangeText={(value) => handleChange('telefone', value.replace(/\D/g, ''))}
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
              {errors.telefone && (
                <Text style={styles.errorText}>{errors.telefone}</Text>
              )}
            </View>

            {/* CPF */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF *</Text>
              <View style={[styles.inputContainer, errors.cpf && styles.inputError]}>
                <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  value={formatCpf(formData.cpf)}
                  onChangeText={(value) => handleChange('cpf', value.replace(/\D/g, ''))}
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={14}
                />
              </View>
              {errors.cpf && (
                <Text style={styles.errorText}>{errors.cpf}</Text>
              )}
            </View>

            {/* Gênero */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gênero *</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.genero === 'M' && styles.genderButtonActive,
                  ]}
                  onPress={() => handleChange('genero', 'M')}
                >
                  <Ionicons
                    name="male"
                    size={20}
                    color={formData.genero === 'M' ? '#FFF' : '#666'}
                  />
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.genero === 'M' && styles.genderButtonTextActive,
                    ]}
                  >
                    Masculino
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.genero === 'F' && styles.genderButtonActive,
                  ]}
                  onPress={() => handleChange('genero', 'F')}
                >
                  <Ionicons
                    name="female"
                    size={20}
                    color={formData.genero === 'F' ? '#FFF' : '#666'}
                  />
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.genero === 'F' && styles.genderButtonTextActive,
                    ]}
                  >
                    Feminino
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.genero === 'Outro' && styles.genderButtonActive,
                  ]}
                  onPress={() => handleChange('genero', 'Outro')}
                >
                  <Ionicons
                    name="transgender"
                    size={20}
                    color={formData.genero === 'Outro' ? '#FFF' : '#666'}
                  />
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.genero === 'Outro' && styles.genderButtonTextActive,
                    ]}
                  >
                    Outro
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.genero && (
                <Text style={styles.errorText}>{errors.genero}</Text>
              )}
            </View>

            {/* Informação sobre campos obrigatórios */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={18} color="#666" />
              <Text style={styles.infoText}>
                Todos os campos marcados com * são obrigatórios
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Botões de ação */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || isLoading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>Salvar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#0073FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  headerRight: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#F44336',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 14,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 6,
    marginLeft: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  genderButtonActive: {
    backgroundColor: '#0073FF',
    borderColor: '#0073FF',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  genderButtonTextActive: {
    color: '#FFF',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0073FF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCC',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 6,
  },
});
