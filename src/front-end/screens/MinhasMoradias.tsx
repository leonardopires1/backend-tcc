import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useMoradias } from '../hooks/useMoradias';
import { useAuth } from '../contexts/AuthContext';
import Moradia from '../types/Moradia';

interface Props {
  navigation: any;
}

const MinhasMoradias: React.FC<Props> = ({ navigation }) => {
  const { moradias, loading, error, fetchByDono } = useMoradias();
  const { user } = useAuth();

  const [ownedMoradias, setOwnedMoradias] = useState<Moradia[]>([]);
  const [loadingOwned, setLoadingOwned] = useState(false);

  // Função para buscar moradias onde sou dono
  const loadOwnedMoradias = async () => {
    if (!user?.id) return;
    
    setLoadingOwned(true);
    try {
      // Buscar diretamente as moradias por dono
      const owned = await fetchByDono(user.id);
      
      if (__DEV__) {
        console.log('[MinhasMoradias] Moradias por dono endpoint:', owned.length);
        owned.forEach(m => console.log(`- ID: ${m.id}, Nome: ${m.nome}, donoId: ${m.donoId || m.dono?.id}`));
      }
      
      setOwnedMoradias(owned);
    } catch (error) {
      console.error('Erro ao buscar moradias por dono:', error);
      // Fallback: filtrar das moradias gerais
      const filtered = moradias.filter(m => 
        (m.donoId && m.donoId === user.id) || 
        (m.dono?.id && m.dono.id === user.id)
      );
      setOwnedMoradias(filtered);
    } finally {
      setLoadingOwned(false);
    }
  };

  // Lista final das moradias onde sou dono
  const minhasMoradias = ownedMoradias;

  // Carregar moradias onde sou dono
  useEffect(() => {
    loadOwnedMoradias();
  }, [user?.id]);

  // Refresh das moradias
  const handleRefresh = async () => {
    await loadOwnedMoradias();
  };

  const renderItem = ({ item }: { item: Moradia }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PerfilMoradia', { id: item.id })}
    >
      <Text style={styles.cardTitle}>{item.nome}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={2}>{item.descricao}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>ID: {item.id}</Text>
        {item.endereco ? <Text style={styles.metaText} numberOfLines={1}>{item.endereco}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.unifiedBackBtn}>
          <Text style={styles.unifiedBackIcon}>‹</Text>
          <Text style={styles.unifiedBackText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Minhas Repúblicas</Text>
      </View>
      {(loading || loadingOwned) && <Text style={styles.statusText}>Carregando...</Text>}
      {error && !loading && <Text style={[styles.statusText, { color: '#dc2626' }]}>Erro ao carregar</Text>}
      {!loading && !loadingOwned && minhasMoradias.length === 0 && (
        <Text style={styles.statusText}>Você ainda não possui nenhuma república cadastrada.</Text>
      )}
      <FlatList
        data={minhasMoradias}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshing={loading || loadingOwned}
        onRefresh={handleRefresh}
      />
      <View style={styles.footer}> 
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CadastrarMoradia')}> 
          <Text style={styles.addButtonText}>Cadastrar nova república</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
  unifiedBackBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef5ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#dbeafe', marginRight: 12 },
  unifiedBackIcon: { color: '#2563eb', fontSize: 18, fontWeight: '600' },
  unifiedBackText: { color: '#2563eb', fontSize: 14, fontWeight: '600', marginLeft: 4 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  statusText: { textAlign: 'center', marginTop: 24, color: '#6b7280', paddingHorizontal: 24 },
  card: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#4b5563', marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 12, color: '#6b7280', maxWidth: '55%' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  addButton: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

export default MinhasMoradias;
