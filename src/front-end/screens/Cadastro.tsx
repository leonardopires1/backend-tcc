import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useValidation, commonValidationRules } from "../hooks/useValidation";
import { Loading } from "../components/common/Loading";
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from "../constants";

interface FormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  cpf: string;
  genero: string;
  telefone: string;
}

export default function Cadastro({ navigation }: { navigation: any }) {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    genero: "",
    telefone: "",
  });
  
  const [isChecked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();

  const validationRules = {
    nome: commonValidationRules.name,
    email: commonValidationRules.email,
    senha: commonValidationRules.password,
    confirmarSenha: commonValidationRules.confirmPassword(formData.senha),
    cpf: commonValidationRules.cpf,
    genero: [{ required: true, message: "Por favor, selecione um gênero" }],
    telefone: commonValidationRules.phone,
  };

  const { errors, validate, validateSingleField, clearFieldError } = useValidation(validationRules);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      clearFieldError(field);
    }
  };

  const handleBlur = (field: keyof FormData) => {
    validateSingleField(field, formData[field]);
  };

  const formatCPF = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    if (match) {
      return [match[1], match[2], match[3], match[4]]
        .filter(Boolean)
        .join('.')
        .replace(/\.(\d{2})$/, '-$1');
    }
    return text;
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (match) {
      const formatted = `${match[1] ? `(${match[1]}` : ''}${match[1] && match[1].length === 2 ? ') ' : ''}${match[2]}${match[2] && match[3] ? '-' : ''}${match[3]}`;
      return formatted;
    }
    return text;
  };

  const handleCadastro = async () => {
    if (!isChecked) {
      Alert.alert("Erro", "Você deve concordar com os termos e condições.");
      return;
    }

    if (!validate(formData)) {
      Alert.alert("Erro", "Por favor, corrija os erros no formulário.");
      return;
    }

    setLoading(true);

    try {
      // Preparar dados para envio (removendo formatação)
      const dataToSend = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove formatação do CPF
        telefone: formData.telefone.replace(/\D/g, ''), // Remove formatação do telefone
        genero: formData.genero.charAt(0).toUpperCase() + formData.genero.slice(1) // Capitaliza primeira letra
      };
      
      console.log('Dados sendo enviados:', dataToSend);
      
      const result = await register(dataToSend);
      
      if (result.success) {
        Alert.alert(
          "Sucesso", 
          "Cadastro realizado com sucesso! Você pode fazer login agora.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login")
            }
          ]
        );
      } else {
        Alert.alert("Erro", result.message || "Erro ao criar conta");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { label: "Masculino", value: "masculino" },
    { label: "Feminino", value: "feminino" },
    { label: "Não-binário", value: "não-binário" },
    { label: "Outro", value: "outro" },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {loading && <Loading overlay text="Criando conta..." />}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.unifiedBackBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.unifiedBackText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Criar Conta</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.form}>
          {/* Nome */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={[styles.input, errors.nome && styles.inputError]}
              placeholder="Digite seu nome completo"
              value={formData.nome}
              onChangeText={(text) => handleChange('nome', text)}
              onBlur={() => handleBlur('nome')}
              editable={!loading}
            />
            {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Digite seu email"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text.toLowerCase())}
              onBlur={() => handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* CPF */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={[styles.input, errors.cpf && styles.inputError]}
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChangeText={(text) => handleChange('cpf', formatCPF(text))}
              onBlur={() => handleBlur('cpf')}
              keyboardType="numeric"
              maxLength={14}
              editable={!loading}
            />
            {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}
          </View>

          {/* Telefone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={[styles.input, errors.telefone && styles.inputError]}
              placeholder="(11) 99999-9999"
              value={formData.telefone}
              onChangeText={(text) => handleChange('telefone', formatPhone(text))}
              onBlur={() => handleBlur('telefone')}
              keyboardType="phone-pad"
              maxLength={15}
              editable={!loading}
            />
            {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
          </View>

          {/* Gênero */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gênero</Text>
            <View style={styles.genderContainer}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderOption,
                    formData.genero === option.value && styles.genderOptionSelected
                  ]}
                  onPress={() => handleChange('genero', option.value)}
                  disabled={loading}
                >
                  <Text style={[
                    styles.genderOptionText,
                    formData.genero === option.value && styles.genderOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.genero && <Text style={styles.errorText}>{errors.genero}</Text>}
          </View>

          {/* Senha */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.senha && styles.inputError]}
                placeholder="Digite sua senha"
                value={formData.senha}
                onChangeText={(text) => handleChange('senha', text)}
                onBlur={() => handleBlur('senha')}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={COLORS.GRAY} 
                />
              </TouchableOpacity>
            </View>
            {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
          </View>

          {/* Confirmar Senha */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.confirmarSenha && styles.inputError]}
                placeholder="Confirme sua senha"
                value={formData.confirmarSenha}
                onChangeText={(text) => handleChange('confirmarSenha', text)}
                onBlur={() => handleBlur('confirmarSenha')}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={COLORS.GRAY} 
                />
              </TouchableOpacity>
            </View>
            {errors.confirmarSenha && <Text style={styles.errorText}>{errors.confirmarSenha}</Text>}
          </View>

          {/* Terms and Conditions */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={isChecked}
              onValueChange={setChecked}
              color={isChecked ? COLORS.PRIMARY : undefined}
              disabled={loading}
            />
            <Text style={styles.checkboxText}>
              Eu concordo com os{" "}
              <Text style={styles.linkText}>termos e condições</Text> e{" "}
              <Text style={styles.linkText}>política de privacidade</Text>
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleCadastro}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Já tem uma conta?{" "}
              <Text 
                style={[styles.linkText, loading && styles.linkDisabled]}
                onPress={() => !loading && navigation.navigate("Login")}
              >
                Faça login
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: SPACING.XL,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.LG,
    paddingTop: SPACING.XXL,
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
  title: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  placeholder: {
    width: 40,
  },
  form: {
    paddingHorizontal: SPACING.MD,
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
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
    padding: SPACING.MD,
    fontSize: FONT_SIZES.MD,
  },
  eyeButton: {
    padding: SPACING.MD,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  genderOption: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.XL,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  },
  genderOptionSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  genderOptionText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  genderOptionTextSelected: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  errorText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.ERROR,
    marginTop: SPACING.XS,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.LG,
  },
  checkboxText: {
    flex: 1,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.SM,
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  linkDisabled: {
    color: COLORS.GRAY,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    alignItems: 'center',
    marginBottom: SPACING.LG,
    ...SHADOWS.MEDIUM,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.GRAY,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
  },
});
