import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { useTarefas } from '../hooks/useTarefas';
import { Tarefa } from '../types/Tarefa';

interface TarefasModalProps {
  isVisible: boolean;
  onClose: () => void;
  moradiaId: number;
  moradiaNome?: string;
}

const TarefasModal: React.FC<TarefasModalProps> = ({
  isVisible,
  onClose,
  moradiaId,
  moradiaNome = 'Moradia',
}) => {
  const { tarefas, loading, createTarefa, deleteTarefa, error } = useTarefas(moradiaId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [novaTarefaNome, setNovaTarefaNome] = useState('');
  const [novaTarefaDescricao, setNovaTarefaDescricao] = useState('');
  const [creating, setCreating] = useState(false);

  // Categorias predefinidas de tarefas domésticas
  const categoriasTarefas = [
    { nome: 'Limpeza Geral', icone: '🧹' },
    { nome: 'Cozinha', icone: '🍳' },
    { nome: 'Banheiro', icone: '🚿' },
    { nome: 'Lavanderia', icone: '👕' },
    { nome: 'Organização', icone: '📦' },
    { nome: 'Manutenção', icone: '🔧' },
  ];

  const handleCreateTarefa = async () => {
    if (!novaTarefaNome.trim()) {
      Alert.alert('Erro', 'Nome da tarefa é obrigatório');
      return;
    }

    setCreating(true);
    const tarefaData = {
      nome: novaTarefaNome,
      idMoradia: moradiaId,
      ...(novaTarefaDescricao.trim() && { descricao: novaTarefaDescricao }),
    };
    
    const sucesso = await createTarefa(tarefaData);

    if (sucesso) {
      setNovaTarefaNome('');
      setNovaTarefaDescricao('');
      setShowCreateForm(false);
      Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
    }
    setCreating(false);
  };

  const handleDeleteTarefa = (tarefa: Tarefa) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir a tarefa "${tarefa.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteTarefa(tarefa.id),
        },
      ]
    );
  };

  const handleCreateFromCategory = (categoria: string) => {
    setNovaTarefaNome(categoria);
    setShowCreateForm(true);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      propagateSwipe={true}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tarefas da {moradiaNome}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Title */}
        <Text style={styles.mainTitle}>Regras e comodidades</Text>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categoriasTarefas.map((categoria, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryCard}
                onPress={() => handleCreateFromCategory(categoria.nome)}
              >
                <Text style={styles.categoryIcon}>{categoria.icone}</Text>
                <Text style={styles.categoryText}>{categoria.nome}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Add Task Section */}
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Adicionar tarefa ou comodidade</Text>
          
          {!showCreateForm ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Text style={styles.addButtonText}>+ Nova tarefa</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.createForm}>
              <TextInput
                style={styles.input}
                placeholder="Nome da tarefa"
                value={novaTarefaNome}
                onChangeText={setNovaTarefaNome}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descrição (opcional)"
                value={novaTarefaDescricao}
                onChangeText={setNovaTarefaDescricao}
                multiline
                numberOfLines={3}
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowCreateForm(false);
                    setNovaTarefaNome('');
                    setNovaTarefaDescricao('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.createButton]}
                  onPress={handleCreateTarefa}
                  disabled={creating}
                >
                  {creating ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.createButtonText}>Criar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Tasks List */}
        <Text style={styles.sectionTitle}>Criar uma regra ou comodidade</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Carregando tarefas...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
            {tarefas.map((tarefa) => (
              <View key={tarefa.id} style={styles.taskCard}>
                <View style={styles.taskContent}>
                  <Text style={styles.taskName}>{tarefa.nome}</Text>
                  {tarefa.descricao && (
                    <Text style={styles.taskDescription}>{tarefa.descricao}</Text>
                  )}
                  <Text style={styles.taskDate}>
                    Criada em: {new Date(tarefa.criadoEm).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTarefa(tarefa)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {tarefas.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Nenhuma tarefa cadastrada ainda.{'\n'}
                  Crie a primeira tarefa para sua moradia!
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.publishButton}>
            <Text style={styles.publishButtonText}>Publicar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    fontSize: 20,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 30,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  addSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  createForm: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  cancelButtonText: {
    color: '#6C757D',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  tasksList: {
    paddingHorizontal: 20,
    maxHeight: 300,
  },
  taskCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
    color: '#ADB5BD',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6C757D',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC3545',
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6C757D',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  publishButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TarefasModal;
