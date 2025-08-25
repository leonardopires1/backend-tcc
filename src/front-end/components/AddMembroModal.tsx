import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HttpService from '../services/httpService';
import API_CONFIG from '../config/apiConfig';

interface User {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  genero: string;
  moradiaId?: number;
  moradia?: {
    id: number;
    nome: string;
    endereco: string;
  };
}

interface AddMembroModalProps {
  visible: boolean;
  onClose: () => void;
  onMembroAdicionado: () => void;
  moradiaId: number;
}

export default function AddMembroModal({ 
  visible, 
  onClose, 
  onMembroAdicionado, 
  moradiaId 
}: AddMembroModalProps) {
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [userFound, setUserFound] = useState<User | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const formatCpf = (text: string) => {
    // Remove tudo que não é dígito
    const numbers = text.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a máscara XXX.XXX.XXX-XX
    const formatted = limitedNumbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    
    return formatted;
  };

  const handleCpfChange = (text: string) => {
    const formatted = formatCpf(text);
    setCpf(formatted);
    
    // Reset search state quando CPF muda
    if (searchPerformed) {
      setSearchPerformed(false);
      setUserFound(null);
    }
  };

  const buscarUsuarioPorCpf = async () => {
    if (!cpf) {
      Alert.alert('Erro', 'Por favor, digite o CPF do usuário');
      return;
    }

    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      Alert.alert('Erro', 'CPF deve ter 11 dígitos');
      return;
    }

    setLoading(true);
    setSearchPerformed(false);
    setUserFound(null);

    try {
      const response = await HttpService.get(API_CONFIG.ENDPOINTS.USERS.BY_CPF(cpfNumbers));
      
      if (response.ok && response.data) {
        setUserFound(response.data as User);
      } else {
        setUserFound(null);
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error);
      setUserFound(null);
    } finally {
      setLoading(false);
      setSearchPerformed(true);
    }
  };

  const adicionarMembro = async () => {
    if (!userFound) return;

    // Verificar se o usuário já está em uma moradia
    if (userFound.moradiaId) {
      Alert.alert(
        'Erro',
        `Este usuário já faz parte de uma moradia: ${userFound.moradia?.nome || 'Moradia não identificada'}`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await HttpService.patch(
        API_CONFIG.ENDPOINTS.MORADIAS.ADD_MEMBER(moradiaId, userFound.id),
        {}
      );

      if (response.ok) {
        Alert.alert(
          'Sucesso',
          `${userFound.nome} foi adicionado(a) à república!`,
          [
            {
              text: 'OK',
              onPress: () => {
                resetModal();
                onMembroAdicionado();
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', response.error || 'Erro ao adicionar membro');
      }
    } catch (error: any) {
      console.error('Erro ao adicionar membro:', error);
      Alert.alert('Erro', 'Erro ao adicionar membro à república');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setCpf('');
    setUserFound(null);
    setSearchPerformed(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Adicionar Membro</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Campo CPF */}
            <Text style={styles.label}>CPF do usuário</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                value={cpf}
                onChangeText={handleCpfChange}
                keyboardType="numeric"
                maxLength={14}
                editable={!loading}
              />
              <TouchableOpacity
                style={[styles.searchButton, loading && styles.searchButtonDisabled]}
                onPress={buscarUsuarioPorCpf}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="search" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Resultado da busca */}
            {searchPerformed && !loading && (
              <View style={styles.resultContainer}>
                {userFound ? (
                  <View style={styles.userCard}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userInitial}>
                        {userFound.nome.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{userFound.nome}</Text>
                      <Text style={styles.userEmail}>{userFound.email}</Text>
                      <Text style={styles.userPhone}>{userFound.telefone}</Text>
                      {userFound.moradiaId && (
                        <Text style={styles.userStatus}>
                          ⚠️ Já faz parte de: {userFound.moradia?.nome || 'Uma moradia'}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={styles.noUserCard}>
                    <Ionicons name="person-outline" size={48} color="#CCC" />
                    <Text style={styles.noUserText}>Usuário não encontrado</Text>
                  </View>
                )}
              </View>
            )}

            {/* Botões de ação */}
            {userFound && !userFound.moradiaId && (
              <TouchableOpacity
                style={[styles.addButton, loading && styles.addButtonDisabled]}
                onPress={adicionarMembro}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Adicionar à República</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#0073FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
  },
  searchButtonDisabled: {
    backgroundColor: '#CCC',
  },
  resultContainer: {
    marginBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0073FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
  },
  noUserCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  noUserText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#CCC',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
});
