import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TarefasModal from './TarefasModal';

interface ExemploUsoTarefasModalProps {
  moradiaId: number;
  moradiaNome: string;
}

const ExemploUsoTarefasModal: React.FC<ExemploUsoTarefasModalProps> = ({
  moradiaId,
  moradiaNome,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.openButtonText}>
          Gerenciar Tarefas da {moradiaNome}
        </Text>
      </TouchableOpacity>

      <TarefasModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        moradiaId={moradiaId}
        moradiaNome={moradiaNome}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  openButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  openButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExemploUsoTarefasModal;
