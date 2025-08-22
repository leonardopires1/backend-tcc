import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../constants";
import { RegraPredefinida } from "../hooks/useRegras";

interface Props {
  visible: boolean;
  onClose: () => void;
  regras: RegraPredefinida[];
  selectedIds?: number[];
  onSelect: (regraId: number) => void;
  loading?: boolean;
}

const SelectRegrasModal: React.FC<Props> = ({
  visible,
  onClose,
  regras,
  selectedIds = [],
  onSelect,
  loading,
}) => {
  const [submitting, setSubmitting] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Adicionar Regras</Text>
          <Text style={styles.subtitle}>Selecione regras pré-definidas</Text>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.PRIMARY}
              style={{ marginVertical: SPACING.LG }}
            />
          ) : (
            <FlatList
              data={regras}
              keyExtractor={(item) => item.id.toString()}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[styles.item, isSelected && styles.itemSelected]}
                    onPress={() => !submitting && onSelect(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemHeader}>
                      <Text
                        style={[
                          styles.itemTitle,
                          isSelected && styles.itemTitleSelected,
                        ]}
                      >
                        {item.titulo}
                      </Text>
                      {isSelected && <Text style={styles.badge}>✓</Text>}
                    </View>
                    {item.descricao ? (
                      <Text style={styles.itemDesc}>{item.descricao}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.empty}>Nenhuma regra disponível</Text>
              }
            />
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: SPACING.LG,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.LG,
  },
  title: {
    fontSize: FONT_SIZES.XL,
    fontWeight: "bold",
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
    marginTop: 4,
  },
  item: {
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  itemSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY_LIGHT,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: FONT_SIZES.MD,
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
  },
  itemTitleSelected: {
    color: COLORS.PRIMARY,
  },
  itemDesc: {
    marginTop: 4,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  badge: {
    backgroundColor: COLORS.PRIMARY,
    color: COLORS.WHITE,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  empty: {
    textAlign: "center",
    color: COLORS.TEXT_SECONDARY,
    marginVertical: SPACING.MD,
  },
  closeBtn: {
    marginTop: SPACING.MD,
    backgroundColor: COLORS.BLACK,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.LG,
    alignItems: "center",
  },
  closeText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.MD,
    fontWeight: "600",
  },
});

export default SelectRegrasModal;
