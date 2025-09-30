import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTarefas } from '../hooks/useTarefas';
import { useImages, ImageFile } from '../hooks/useImages';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import AddMembroModal from '../components/AddMembroModal';
import MoradiaImage from '../components/common/MoradiaImage';
import { useMoradias } from '../hooks/useMoradias';
import HttpService from '../services/httpService';
import API_CONFIG from '../config/apiConfig';
import Moradia from '../types/Moradia';

interface Morador {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  genero: string;
}

interface MoradiaDetalhada extends Moradia {
  moradores: Morador[];
  dono: {
    id: number;
    nome: string;
    email: string;
  };
}

interface Conta {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'agua' | 'luz' | 'internet' | 'gas' | 'outros';
  vencimento: string;
  pago: boolean;
  responsavel: string;
}

export default function MoradiaDashboard({ navigation }: { navigation: any }) {
  const { user, refreshUserData } = useAuth();
  const { 
    isUploading, 
    uploadProgress, 
    uploadMoradiaImage, 
    showImagePickerOptions 
  } = useImages();

  const [moradiaData, setMoradiaData] = useState<MoradiaDetalhada | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMembroModal, setShowAddMembroModal] = useState(false);

  // Hook de tarefas com moradiaId
  const { tarefas, loading: tarefasLoading, error: tarefasError, refreshTarefas } = useTarefas(moradiaData?.id);

  useEffect(() => {
    console.log('🏠 MoradiaDashboard montado, usuário:', { 
      id: user?.id, 
      nome: user?.nome, 
      moradiaId: user?.moradiaId 
    });
    loadMoradiaData();
  }, [user]);

  const loadMoradiaData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.moradiaId) {
        console.log('👤 Usuário não tem moradiaId, tentando buscar moradia do usuário...');
        await refreshUserData();
        
        // Tentar buscar moradia do usuário através de endpoint específico
        try {
          const userMoradiaResponse = await HttpService.get<MoradiaDetalhada[]>(
            API_CONFIG.ENDPOINTS.MORADIAS.BY_USER
          );
          
          if (userMoradiaResponse.ok && userMoradiaResponse.data && userMoradiaResponse.data.length > 0) {
            setMoradiaData(userMoradiaResponse.data[0]);
            console.log('✅ Moradia encontrada através do usuário:', userMoradiaResponse.data[0].nome);
            return;
          }
        } catch (err) {
          console.log('⚠️ Erro ao buscar moradia do usuário, usuário pode não ter moradia');
        }
        
        setMoradiaData(null);
        setError(null); // Não é erro, usuário só não tem moradia
        return;
      }

      console.log('🏠 Buscando dados da moradia:', user.moradiaId);

      // Buscar dados da moradia com moradores
      const moradiaResponse = await HttpService.get<MoradiaDetalhada>(
        API_CONFIG.ENDPOINTS.MORADIAS.BY_ID(user.moradiaId)
      );

      if (moradiaResponse.ok && moradiaResponse.data) {
        console.log('📱 Dados da moradia recebidos:', {
          id: moradiaResponse.data.id,
          nome: moradiaResponse.data.nome,
          imagemUrl: moradiaResponse.data.imagemUrl,
          hasImage: !!moradiaResponse.data.imagemUrl
        });
        
        // Se os moradores não vieram com os dados detalhados, buscar separadamente
        let moradiaCompleta = moradiaResponse.data;
        
        if (!moradiaCompleta.moradores || moradiaCompleta.moradores.length === 0) {
          console.log('🔍 Moradores não encontrados, adicionando usuário atual...');
          
          // Adicionar pelo menos o usuário atual como morador
          const moradoresComUsuario: Morador[] = [
            {
              id: user.id,
              nome: user.nome,
              email: user.email,
              telefone: user.telefone,
              genero: user.genero
            }
          ];
          
          moradiaCompleta.moradores = moradoresComUsuario;
        }
        
        setMoradiaData(moradiaCompleta);
        console.log('✅ Dados da moradia carregados:', {
          nome: moradiaCompleta.nome,
          imagemUrl: moradiaCompleta.imagemUrl,
          hasImage: !!moradiaCompleta.imagemUrl,
          imagemUrlType: typeof moradiaCompleta.imagemUrl,
          fullData: moradiaCompleta
        });
      } else {
        throw new Error(moradiaResponse.error || 'Erro ao carregar dados da moradia');
      }

      // Buscar contas pendentes (simulado por enquanto)
      await loadContasPendentes();

    } catch (err: any) {
      console.error('❌ Erro ao carregar dados da moradia:', err);
      setError(err.message || 'Erro ao carregar dados da moradia');
    } finally {
      setLoading(false);
    }
  };

  const loadContasPendentes = async () => {
    try {
      // Por enquanto, dados simulados - substituir por API real quando disponível
      const contasSimuladas: Conta[] = [
        {
          id: 1,
          descricao: 'Conta de Luz',
          valor: 150.50,
          tipo: 'luz',
          vencimento: '15/12/2024',
          pago: false,
          responsavel: 'João Silva'
        },
        {
          id: 2,
          descricao: 'Internet',
          valor: 89.90,
          tipo: 'internet',
          vencimento: '20/12/2024',
          pago: false,
          responsavel: 'Maria Santos'
        },
        {
          id: 3,
          descricao: 'Água',
          valor: 78.30,
          tipo: 'agua',
          vencimento: '10/12/2024',
          pago: true,
          responsavel: 'Pedro Costa'
        }
      ];
      
      setContas(contasSimuladas);
      console.log('✅ Contas carregadas:', contasSimuladas.length);
    } catch (err) {
      console.warn('⚠️ Erro ao carregar contas, usando dados padrão');
      setContas([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadMoradiaData(), refreshTarefas()]);
    setRefreshing(false);
  };

  const getIconForConta = (tipo: string) => {
    switch (tipo) {
      case 'luz':
        return 'flash';
      case 'agua':
        return 'water';
      case 'internet':
        return 'wifi';
      case 'gas':
        return 'flame';
      default:
        return 'receipt';
    }
  };

  const getColorForConta = (tipo: string) => {
    switch (tipo) {
      case 'luz':
        return '#FFC107';
      case 'agua':
        return '#2196F3';
      case 'internet':
        return '#9C27B0';
      case 'gas':
        return '#FF5722';
      default:
        return '#666';
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const handleMarcarTarefaConcluida = (tarefaId: number) => {
    Alert.alert(
      'Confirmar',
      'Deseja marcar esta tarefa como concluída?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => console.log('Tarefa marcada como concluída') }
      ]
    );
  };

  const handleMembroAdicionado = async () => {
    // Recarrega os dados da moradia para mostrar o novo membro
    console.log('🔄 Recarregando dados após adicionar membro...');
    await loadMoradiaData();
  };

  const handleAdicionarMembro = async (usuarioId: number) => {
    try {
      if (!moradiaData?.id) return;
      
      console.log('➕ Adicionando membro à moradia:', { moradiaId: moradiaData.id, usuarioId });
      
      const response = await HttpService.post(
        API_CONFIG.ENDPOINTS.MORADIAS.ADD_MEMBER(moradiaData.id, usuarioId),
        {},
        true
      );

      if (response.ok) {
        console.log('✅ Membro adicionado com sucesso');
        Alert.alert('Sucesso', 'Membro adicionado à moradia com sucesso!');
        await loadMoradiaData(); // Recarregar dados
        return true;
      } else {
        console.log('❌ Erro ao adicionar membro:', response.error);
        Alert.alert('Erro', response.error || 'Erro ao adicionar membro');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erro ao adicionar membro:', error);
      Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
      return false;
    }
  };

  // Função para alterar foto da moradia
  const handleChangeImage = () => {
    if (!moradiaData?.id) return;
    
    showImagePickerOptions(async (image: ImageFile) => {
      try {
        const uploadResult = await uploadMoradiaImage(moradiaData.id, image);
        
        if (uploadResult.success) {
          Alert.alert('Sucesso', 'Foto da moradia atualizada com sucesso!');
          // Recarregar dados da moradia para mostrar a nova imagem
          await loadMoradiaData();
        } else {
          Alert.alert('Erro', uploadResult.error || 'Erro ao fazer upload da imagem');
        }
      } catch (error) {
        console.error('Erro no upload da imagem:', error);
        Alert.alert('Erro', 'Erro ao fazer upload da imagem');
      }
    });
  };

  if (loading || tarefasLoading) {
    return <Loading />;
  }

  if (error || tarefasError) {
    return <ErrorMessage message={error || tarefasError || 'Erro desconhecido'} onRetry={loadMoradiaData} />;
  }

  if (!moradiaData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Moradia</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="home-outline" size={64} color="#CCC" />
          <Text style={styles.errorText}>Você não faz parte de nenhuma moradia</Text>
          <Text style={styles.errorSubtext}>
            Entre em uma moradia existente ou crie uma nova para começar
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('CadastrarMoradia')}
          >
            <Text style={styles.createButtonText}>Criar Nova Moradia</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tarefasPendentes = tarefas?.filter(t => 
    // Verifica se há atribuições e se alguma não está concluída
    t.atribuicoes ? t.atribuicoes.some(a => !a.concluida) : true
  ) || [];
  const contasPendentes = contas.filter(c => !c.pago);
  const totalContasPendentes = contasPendentes.reduce((total, conta) => total + conta.valor, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moradia</Text>
        <TouchableOpacity onPress={() => console.log('⚙️ Configurações clicadas')}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Info da República */}
        <View style={styles.moradiaCard}>
          <View style={styles.moradiaHeader}>
            <View style={styles.moradiaImageContainer}>
              <TouchableOpacity onPress={handleChangeImage} style={styles.imageButton}>
                <MoradiaImage 
                  moradiaId={moradiaData.id}
                  hasImage={!!moradiaData.imagemUrl}
                  style={styles.moradiaImage}
                />
                <View style={styles.imageOverlay}>
                  <Ionicons name="camera" size={20} color="#FFF" />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.moradiaInfo}>
              <Text style={styles.moradiaNome}>{moradiaData.nome}</Text>
              <Text style={styles.moradiaEndereco}>{moradiaData.endereco}</Text>
              <Text style={styles.moradiaValor}>
                Mensalidade: {formatCurrency(moradiaData.valorMensalidade)}
              </Text>
              {isUploading && (
                <View style={styles.uploadProgressContainer}>
                  <Text style={styles.uploadProgressText}>Atualizando foto...</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Resumo Financeiro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
          <View style={styles.resumoFinanceiro}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Contas Pendentes</Text>
              <Text style={[styles.resumoValor, { color: '#FF5252' }]}>
                {formatCurrency(totalContasPendentes)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Por Pessoa</Text>
              <Text style={styles.resumoValor}>
                {moradiaData.moradores ? 
                  formatCurrency(totalContasPendentes / moradiaData.moradores.length) :
                  formatCurrency(0)
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Lista de Contas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lista de Contas</Text>
            <TouchableOpacity>
              <Text style={styles.verTodos}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {contas.slice(0, 3).map((conta) => (
            <View key={conta.id} style={styles.contaCard}>
              <View style={[styles.contaIconContainer, { backgroundColor: getColorForConta(conta.tipo) + '15' }]}>
                <Ionicons 
                  name={getIconForConta(conta.tipo) as keyof typeof Ionicons.glyphMap} 
                  size={20} 
                  color={getColorForConta(conta.tipo)} 
                />
              </View>
              <View style={styles.contaInfo}>
                <Text style={styles.contaDescricao}>{conta.descricao}</Text>
                <Text style={styles.contaResponsavel}>Responsável: {conta.responsavel}</Text>
              </View>
              <View style={styles.contaValores}>
                <Text style={styles.contaValor}>{formatCurrency(conta.valor)}</Text>
                <Text style={styles.contaVencimento}>{conta.vencimento}</Text>
                <View style={[styles.statusBadge, conta.pago ? styles.statusPago : styles.statusPendente]}>
                  <Text style={[styles.statusText, conta.pago ? styles.statusTextPago : styles.statusTextPendente]}>
                    {conta.pago ? 'Pago' : 'Pendente'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Lista de Tarefas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lista de Tarefas</Text>
            <TouchableOpacity>
              <Text style={styles.verTodos}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {tarefasPendentes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>Nenhuma tarefa encontrada</Text>
              <Text style={styles.emptyStateSubtext}>Crie uma nova tarefa para começar</Text>
            </View>
          ) : (
            tarefasPendentes.slice(0, 3).map((tarefa) => {
              const atribuicaoAtiva = tarefa.atribuicoes?.find(a => !a.concluida);
              const responsavel = atribuicaoAtiva?.usuario;
              
              return (
                <View key={tarefa.id} style={styles.tarefaCard}>
                  <TouchableOpacity
                    style={styles.tarefaCheckbox}
                    onPress={() => handleMarcarTarefaConcluida(tarefa.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  </TouchableOpacity>
                  
                  <View style={styles.tarefaContent}>
                    <View style={styles.tarefaHeader}>
                      <Text style={styles.tarefaTitulo}>{tarefa.nome}</Text>
                      <Text style={styles.tarefaData}>
                        {new Date(tarefa.criadoEm).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    
                    {tarefa.descricao && (
                      <Text style={styles.tarefaDescricao} numberOfLines={2}>
                        {tarefa.descricao}
                      </Text>
                    )}
                    
                    <View style={styles.tarefaFooter}>
                      {responsavel ? (
                        <View style={styles.responsavelContainer}>
                          <View style={styles.responsavelAvatar}>
                            <Text style={styles.responsavelInicial}>
                              {responsavel.nome.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.responsavelNome}>
                            {responsavel.nome}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.semResponsavelContainer}>
                          <Ionicons name="person-outline" size={16} color="#999" />
                          <Text style={styles.semResponsavelTexto}>Sem responsável</Text>
                        </View>
                      )}
                      
                      <View style={styles.statusContainer}>
                        <View style={[styles.statusBadge, styles.statusPendente]}>
                          <Text style={[styles.statusText, styles.statusTextPendente]}>
                            Pendente
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Membros */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Membros</Text>
            <Text style={styles.membroCount}>{moradiaData.moradores?.length || 0}/4</Text>
          </View>
          <View style={styles.membrosGrid}>
            {moradiaData.moradores?.map((membro: Morador) => (
              <View key={membro.id} style={styles.membroCard}>
                <View style={styles.membroAvatar}>
                  <Text style={styles.membroInicial}>
                    {membro.nome.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.membroNome} numberOfLines={1}>
                  {membro.nome}
                </Text>
                <Text style={styles.membroTelefone} numberOfLines={1}>
                  {membro.telefone}
                </Text>
              </View>
            ))}
            {/* Vaga disponível */}
            {(moradiaData.moradores?.length || 0) < 4 && (
              <TouchableOpacity 
                style={[styles.membroCard, styles.vagaDisponivel]}
                onPress={() => setShowAddMembroModal(true)}
              >
                <View style={[styles.membroAvatar, styles.vagaAvatar]}>
                  <Ionicons name="add" size={24} color="#999" />
                </View>
                <Text style={styles.vagaTexto}>Adicionar membro</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={24} color="#0073FF" />
            <Text style={styles.actionButtonText}>Lançar nova conta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="list-outline" size={24} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Criar nova tarefa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para adicionar membro */}
      <AddMembroModal
        visible={showAddMembroModal}
        onClose={() => setShowAddMembroModal(false)}
        onMembroAdicionado={handleMembroAdicionado}
        moradiaId={moradiaData?.id || 1}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#0073FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  moradiaCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moradiaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moradiaIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  moradiaImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    position: 'relative',
  },
  imageButton: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  moradiaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  uploadProgressContainer: {
    marginTop: 8,
  },
  uploadProgressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0073FF',
    borderRadius: 2,
  },
  moradiaInfo: {
    flex: 1,
  },
  moradiaNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  moradiaEndereco: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  moradiaValor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0073FF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  verTodos: {
    fontSize: 14,
    color: '#0073FF',
    fontWeight: '500',
  },
  resumoFinanceiro: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resumoValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  contaCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contaInfo: {
    flex: 1,
  },
  contaDescricao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contaResponsavel: {
    fontSize: 14,
    color: '#666',
  },
  contaValores: {
    alignItems: 'flex-end',
  },
  contaValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  contaVencimento: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusPago: {
    backgroundColor: '#E8F5E8',
  },
  statusPendente: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextPago: {
    color: '#4CAF50',
  },
  statusTextPendente: {
    color: '#FF9800',
  },
  tarefaCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tarefaCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tarefaContent: {
    flex: 1,
  },
  tarefaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tarefaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  tarefaData: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  tarefaDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  tarefaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responsavelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  responsavelAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0073FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  responsavelInicial: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  responsavelNome: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  semResponsavelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  semResponsavelTexto: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  membrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  membroCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vagaDisponivel: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
  },
  membroAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0073FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  vagaAvatar: {
    backgroundColor: '#F5F5F5',
  },
  membroInicial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  membroNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  membroTelefone: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  vagaTexto: {
    fontSize: 12,
    color: '#0073FF',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  membroCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
});
