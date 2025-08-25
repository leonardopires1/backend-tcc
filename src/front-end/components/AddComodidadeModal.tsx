import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddComodidade: (texto: string) => Promise<void>;
}

export const AddRegraComodidadeModal: React.FC<Props> = ({ visible, onClose, onAddComodidade }) => {
  const [comodidade, setComodidade] = useState('');
  const [loadingComodidade, setLoadingComodidade] = useState(false);
  const disable = loadingComodidade;

  const handleAddComodidade = async () => {
    if (!comodidade.trim() || disable) return;
    setLoadingComodidade(true);
    await onAddComodidade(comodidade.trim());
    setComodidade('');
    setLoadingComodidade(false);
  };


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <Text style={styles.title}>Gerenciar</Text>
          <Text style={styles.subtitle}>Adicione novas regras</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Nova Regra</Text>
              <View style={styles.row}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Silêncio após 22h"
                  value={comodidade}
                  onChangeText={setComodidade}
                  editable={!disable}
                />
                <TouchableOpacity style={[styles.addBtn, (!comodidade.trim() || loadingComodidade) && styles.addBtnDisabled]} disabled={!comodidade.trim() || loadingComodidade} onPress={handleAddComodidade}>
                  {loadingComodidade ? <ActivityIndicator size="small" color={COLORS.WHITE} /> : <Text style={styles.addBtnText}>+</Text>}
                </TouchableOpacity>
              </View>
            </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={disable}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: SPACING.LG,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.LG,
  },
  title: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    marginBottom: SPACING.LG,
  },
  section: {
    marginBottom: SPACING.LG,
  },
  label: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: BORDER_RADIUS.LG,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 10,
    fontSize: FONT_SIZES.MD,
    marginRight: SPACING.SM,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: COLORS.WHITE,
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeBtn: {
    backgroundColor: COLORS.BLACK,
    borderRadius: BORDER_RADIUS.LG,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  closeText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: '600',
  },
});

export default AddRegraComodidadeModal;