import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Keyboard,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useMoradias } from '../hooks/useMoradias';
import { useRegras } from '../hooks/useRegras';
import { useImages, ImageFile } from '../hooks/useImages';
import SelectRegrasModal from '../components/SelectRegrasModal';

export default function CadastrarMoradia({ navigation }: { navigation: any }) {
  const [nomeMoradia, setNomeMoradia] = useState('');
  const [cep, setCep] = useState('');
  const [mensalidade, setMensalidade] = useState('');
  const [selectedRegrasIds, setSelectedRegrasIds] = useState<number[]>([]);
  const [regrasModalVisible, setRegrasModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string; cep?: string; mensalidade?: string }>({});
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { user, refreshUserData } = useAuth();
  const { createMoradia } = useMoradias();
  const { regras, loading: loadingRegras } = useRegras();
  const { 
    isUploading, 
    uploadProgress, 
    uploadMoradiaImage, 
    showImagePickerOptions 
  } = useImages();

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

  // Função para selecionar/desselecionar regras
  const handleToggleRegra = (regraId: number) => {
    setSelectedRegrasIds(prev => 
      prev.includes(regraId) 
        ? prev.filter(id => id !== regraId)
        : [...prev, regraId]
    );
  };

  // Função para selecionar imagem
  const handleSelectImage = () => {
    showImagePickerOptions((image: ImageFile) => {
      setSelectedImage(image);
    });
  };

  // Função para remover imagem selecionada
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setUploadedImageUrl(null);
  };

  const handleCriarMoradia = async () => {
    if (isLoading) return;
    Keyboard.dismiss();
    const userId = user ? user.id : null;
    let newErrors: { nome?: string; cep?: string; mensalidade?: string } = {};
    
    if (!nomeMoradia.trim()) {
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
        nome: nomeMoradia.trim(),
        endereco: `CEP: ${cleanCEP}`,
        valorMensalidade: getMensalidadeValue(mensalidade),
        donoId: userId,
        regras: { id: selectedRegrasIds },
      } as any);
      
      if (res.success) {
        let finalImageUrl = uploadedImageUrl;
        
        // Se há uma imagem selecionada e ainda não foi feito upload
        if (selectedImage && !uploadedImageUrl && res.data?.id) {
          try {
            const uploadResult = await uploadMoradiaImage(res.data.id, selectedImage);
            if (uploadResult.success) {
              finalImageUrl = uploadResult.imageUrl || null;
            } else {
              // Upload falhou, mas moradia foi criada - mostrar warning
              Alert.alert(
                'Moradia Criada',
                'Moradia criada com sucesso, mas houve erro no upload da imagem. Você pode adicionar a imagem depois.',
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            console.error('Erro no upload da imagem:', error);
            Alert.alert(
              'Moradia Criada',
              'Moradia criada com sucesso, mas houve erro no upload da imagem. Você pode adicionar a imagem depois.',
              [{ text: 'OK' }]
            );
          }
        }
        
        if (!selectedImage || finalImageUrl) {
          alert('Moradia cadastrada com sucesso!');
        }
        
        // Atualizar o contexto de autenticação para refletir que o usuário agora faz parte de uma moradia
        await refreshUserData();
        
        setNomeMoradia('');
        setCep('');
        setMensalidade('');
        setSelectedRegrasIds([]);
        setSelectedImage(null);
        setUploadedImageUrl(null);
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
        {/* Header fixo */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.unifiedBackBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.unifiedBackText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cadastrar Moradia</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome da moradia</Text>
              <TextInput
                style={[styles.input, errors.nome && styles.inputError]}
                placeholder="Digite o nome da moradia"
                value={nomeMoradia}
                onChangeText={setNomeMoradia}
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

            {/* Seção de Foto da Moradia */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Foto da Moradia (Opcional)</Text>
              
              {selectedImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={handleRemoveImage}
                    disabled={isLoading || isUploading}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.ERROR} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={handleSelectImage}
                  disabled={isLoading || isUploading}
                >
                  <Ionicons name="camera-outline" size={32} color={COLORS.PRIMARY} />
                  <Text style={styles.imagePickerText}>Adicionar foto da moradia</Text>
                  <Text style={styles.imagePickerSubtext}>Toque para selecionar uma imagem</Text>
                </TouchableOpacity>
              )}
              
              {isUploading && (
                <View style={styles.uploadProgressContainer}>
                  <Text style={styles.uploadProgressText}>Fazendo upload da imagem...</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                  </View>
                  <Text style={styles.uploadProgressPercentage}>{uploadProgress}%</Text>
                </View>
              )}
            </View>

            {/* Seção de Regras */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Regras da Moradia (Opcional)</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setRegrasModalVisible(true)}
                disabled={isLoading}
              >
                <Text style={styles.selectButtonText}>
                  {selectedRegrasIds.length === 0 
                    ? 'Selecionar regras predefinidas' 
                    : `${selectedRegrasIds.length} regra(s) selecionada(s)`
                  }
                </Text>
                <Text style={styles.selectButtonIcon}>›</Text>
              </TouchableOpacity>
              
              {/* Lista de regras selecionadas */}
              {selectedRegrasIds.length > 0 && (
                <View style={styles.selectedRegrasContainer}>
                  {selectedRegrasIds.map(id => {
                    const regra = regras.find(r => r.id === id);
                    return regra ? (
                      <View key={id} style={styles.selectedRegraItem}>
                        <Text style={styles.selectedRegraText}>{regra.titulo}</Text>
                        <TouchableOpacity
                          onPress={() => handleToggleRegra(id)}
                          style={styles.removeRegraButton}
                        >
                          <Text style={styles.removeRegraText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null;
                  })}
                </View>
              )}
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
      
      {/* Modal de Seleção de Regras */}
      <SelectRegrasModal
        visible={regrasModalVisible}
        onClose={() => setRegrasModalVisible(false)}
        regras={regras}
        loading={loadingRegras}
        selectedIds={selectedRegrasIds}
        onSelect={handleToggleRegra}
      />
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
    paddingTop: SPACING.MD,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    minHeight: 60,
  },
  unifiedBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef5ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
    flex: 0,
  },
  unifiedBackText: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  headerTitle: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 70, // Aproximadamente a largura do botão voltar para centralizar o título
    flex: 0,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: COLORS.WHITE,
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
  selectButton: {
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
  },
  selectButtonIcon: {
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: 'bold',
  },
  selectedRegrasContainer: {
    marginTop: SPACING.SM,
  },
  selectedRegraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.SM,
    marginBottom: SPACING.XS,
  },
  selectedRegraText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    flex: 1,
  },
  removeRegraButton: {
    backgroundColor: '#fee2e2',
    borderRadius: BORDER_RADIUS.SM,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.SM,
  },
  removeRegraText: {
    fontSize: 16,
    color: COLORS.ERROR,
    fontWeight: 'bold',
  },
  // Estilos para upload de imagem
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: SPACING.SM,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.MD,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePickerButton: {
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.XL,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'dashed',
    minHeight: 120,
  },
  imagePickerText: {
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    marginTop: SPACING.SM,
  },
  imagePickerSubtext: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
    textAlign: 'center',
  },
  uploadProgressContainer: {
    marginTop: SPACING.MD,
    paddingHorizontal: SPACING.SM,
  },
  uploadProgressText: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.XS,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 2,
  },
  uploadProgressPercentage: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});