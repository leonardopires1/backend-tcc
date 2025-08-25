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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTarefas } from '../hooks/useTarefas';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import AddMembroModal from '../components/AddMembroModal';

interface Membro {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  genero: string;
}

interface moradia {
  id: number;
  nome: string;
  endereco: string;
  valorMensalidade: number;
  membros: Membro[];
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

export default function moradiaDashboard({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { tarefas, loading: tarefasLoading, error: tarefasError, refreshTarefas } = useTarefas();
  
  const [moradia, setmoradia] = useState<moradia | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMembroModal, setShowAddMembroModal] = useState(false);

  useEffect(() => {
    loadmoradiaData();
  }, []);

  const loadmoradiaData = async () => {
    try {
      setLoading(true);
      // Simulando dados da república - em produção isso viria de uma API
      const moradiaData: moradia = {
        id: 1,
        nome: "República Casa Verde",
        endereco: "Rua das Flores, 123 - Centro",
        valorMensalidade: 800,
        membros: [
          {
            id: 1,
            nome: "João Silva",
            email: "joao@email.com",
            telefone: "(11) 99999-1111",
            genero: "Masculino"
          },
          {
            id: 2,
            nome: "Maria Santos",
            email: "maria@email.com",
            telefone: "(11) 99999-2222",
            genero: "Feminino"
          },
          {
            id: 3,
            nome: "Pedro Costa",
            email: "pedro@email.com",
            telefone: "(11) 99999-3333",
            genero: "Masculino"
          }
        ],
        dono: {
          id: 1,
          nome: "Ana Proprietária",
          email: "ana@email.com"
        }
      };

      const contasData: Conta[] = [
        {
          id: 1,
          descricao: "Conta de Luz",
          valor: 120.50,
          tipo: "luz",
          vencimento: "30/04",
          pago: false,
          responsavel: "João Silva"
        },
        {
          id: 2,
          descricao: "Conta de Água",
          valor: 85.30,
          tipo: "agua",
          vencimento: "15/04",
          pago: true,
          responsavel: "Maria Santos"
        },
        {
          id: 3,
          descricao: "Internet",
          valor: 99.90,
          tipo: "internet",
          vencimento: "10/04",
          pago: false,
          responsavel: "Pedro Costa"
        }
      ];

      setmoradia(moradiaData);
      setContas(contasData);
    } catch (err) {
      setError('Erro ao carregar dados da república');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadmoradiaData(), refreshTarefas()]);
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

  const handleMembroAdicionado = () => {
    // Recarrega os dados da república para mostrar o novo membro
    loadmoradiaData();
  };

  if (loading || tarefasLoading) {
    return <Loading />;
  }

  if (error || tarefasError) {
    return <ErrorMessage message={error || tarefasError || 'Erro desconhecido'} onRetry={loadmoradiaData} />;
  }

  if (!moradia) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="home-outline" size={64} color="#CCC" />
          <Text style={styles.errorText}>Você não faz parte de nenhuma república</Text>
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
        <Text style={styles.headerTitle}>República</Text>
        <TouchableOpacity>
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
            <View style={styles.moradiaIconContainer}>
              <Ionicons name="home" size={32} color="#0073FF" />
            </View>
            <View style={styles.moradiaInfo}>
              <Text style={styles.moradiaNome}>{moradia.nome}</Text>
              <Text style={styles.moradiaEndereco}>{moradia.endereco}</Text>
              <Text style={styles.moradiaValor}>
                Mensalidade: {formatCurrency(moradia.valorMensalidade)}
              </Text>
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
                {formatCurrency(totalContasPendentes / moradia.membros.length)}
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
          {tarefasPendentes.slice(0, 3).map((tarefa) => (
            <View key={tarefa.id} style={styles.tarefaCard}>
              <TouchableOpacity
                style={styles.tarefaCheckbox}
                onPress={() => handleMarcarTarefaConcluida(tarefa.id)}
              >
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.tarefaInfo}>
                <Text style={styles.tarefaTitulo}>{tarefa.nome}</Text>
                <Text style={styles.tarefaResponsavel}>
                  {tarefa.atribuicoes && tarefa.atribuicoes.length > 0 
                    ? `Responsável: Usuário ${tarefa.atribuicoes[0].usuarioId}`
                    : 'Sem responsável'
                  }
                </Text>
              </View>
              <View style={styles.tarefaPrazo}>
                <Text style={styles.tarefaPrazoTexto}>
                  {new Date(tarefa.criadoEm).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Membros */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Membros</Text>
            <Text style={styles.membroCount}>{moradia.membros.length}/4</Text>
          </View>
          <View style={styles.membrosGrid}>
            {moradia.membros.map((membro) => (
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
            {moradia.membros.length < 4 && (
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
        moradiaId={moradia?.id || 1}
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
    alignItems: 'center',
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
  },
  tarefaInfo: {
    flex: 1,
  },
  tarefaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tarefaResponsavel: {
    fontSize: 14,
    color: '#666',
  },
  tarefaPrazo: {
    alignItems: 'flex-end',
  },
  tarefaPrazoTexto: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
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
