import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Moradia from "../types/Moradia";
import { Ionicons } from "@expo/vector-icons";
import { useMoradias } from "../hooks/useMoradias";
import MoradiaImage from "../components/common/MoradiaImage";
import { useComodidades } from "../hooks/useComodidades";
import { useAuth } from "../contexts/AuthContext";
import AddComodidadeModal from "../components/AddComodidadeModal";
import SelectRegrasModal from "../components/SelectRegrasModal";
import { useRegras } from "../hooks/useRegras";
import API_CONFIG from "../config/apiConfig";

export default function PerfilMoradia({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  // Verificação de segurança para route.params
  const { moradia, id } = route?.params || {};

  // Priorizar moradia passada diretamente, senão usar id para buscar
  const moradiaId = moradia?.id || id;

  console.log("Dados recebidos:", { moradia, id, moradiaId });

  const { moradias } = useMoradias();
  const { user } = useAuth();
  const [dataMoradia, setDataMoradia] = useState<Moradia | undefined>(moradia);
  const [donoMoradia, setDonoMoradia] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false); // modal antigo (comodidade/regra manual)
  const [modalRegrasVisible, setModalRegrasVisible] = useState(false); // seleção de regras pré-definidas
  const [updating, setUpdating] = useState(false);
  const { comodidades, addComodidade, removeComodidade } =
    useComodidades(moradiaId);
  const {
    regras,
    regrasVinculadas,
    loading: loadingRegras,
    loadingVinculadas,
    fetchRegrasVinculadas,
    vincularRegra,
    desvincularRegra,
  } = useRegras();

  // Carrega a moradia (direta ou por id)
  useEffect(() => {
    if (moradia) {
      setDataMoradia(moradia);
      return;
    }
    if (moradiaId && moradias.length > 0) {
      const moradiaEncontrada = moradias.find((m) => m.id === moradiaId);
      setDataMoradia(moradiaEncontrada);
    }
  }, [moradia, moradiaId, moradias]);

  const avaliarDono = useCallback(() => {
    const donoFromId = !!(
      dataMoradia?.donoId &&
      user?.id &&
      dataMoradia.donoId === user.id
    );
    const donoFromObject = !!(
      dataMoradia?.dono?.id &&
      user?.id &&
      dataMoradia.dono?.id === user.id
    );
    const isOwner = donoFromId || donoFromObject;
    setDonoMoradia(isOwner);
    if (__DEV__) {
      console.log("[PerfilMoradia] avaliarDono", {
        moradiaId: dataMoradia?.id,
        donoId: dataMoradia?.donoId,
        donoObj: dataMoradia?.dono,
        userId: user?.id,
        isOwner,
      });
    }
  }, [dataMoradia?.donoId, dataMoradia?.dono, user?.id]);

  useEffect(() => {
    avaliarDono();
  }, [avaliarDono]);

  // Carrega regras vinculadas quando tiver moradia
  useEffect(() => {
    if (dataMoradia?.id) {
      fetchRegrasVinculadas(dataMoradia.id);
    }
  }, [dataMoradia?.id]);

  const handleSelectRegra = async (regraId: number) => {
    if (!dataMoradia || regrasVinculadas.some((r) => r.regraId === regraId))
      return;
    setUpdating(true);
    await vincularRegra(dataMoradia.id, regraId);
    setUpdating(false);
  };

  const handleRemoveRegra = async (regraId: number) => {
    if (!dataMoradia) return;
    setUpdating(true);
    await desvincularRegra(dataMoradia.id, regraId);
    setUpdating(false);
  };

  const handleAddComodidade = async (texto: string) => {
    if (!dataMoradia) return;
    setUpdating(true);
    await addComodidade(dataMoradia.id, texto, "");
    setUpdating(false);
  };

  const handleRemoveComodidade = async (idComodidade: number) => {
    if (updating) return;
    setUpdating(true);
    await removeComodidade(idComodidade);
    setUpdating(false);
  };

  // Se não há moradia nem ID, mostrar erro
  if (!moradia && !moradiaId) {
    console.error("Nem moradia nem ID fornecidos");
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Moradia não encontrada</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("BuscarMoradia")}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log(dataMoradia);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.unifiedBackBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#2563eb" />
            <Text style={styles.unifiedBackText}>Voltar</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.heartButton}>
            <Text style={styles.heartIcon}>♡</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <MoradiaImage
            moradiaId={moradiaId}
            hasImage={!!dataMoradia?.imagemUrl}
            style={styles.heroImage}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <Text style={styles.title}>
            {dataMoradia?.nome || "Nome da República"}
          </Text>
          <Text style={styles.subtitle}>
            {dataMoradia?.descricao || "Descrição da república"}
          </Text>

          {/* Rules and Amenities */}
          <Text style={styles.sectionTitle}>Regras e comodidades</Text>

          {donoMoradia && (
            <View style={{ marginBottom: 16 }}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => setModalVisible(true)}
                disabled={updating}
              >
                <Text style={styles.contactButtonText}>
                  {updating ? "Atualizando..." : "Adicionar comodidade"}
                </Text>
              </TouchableOpacity>
              <View style={{ height: 12 }} />
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => setModalRegrasVisible(true)}
                disabled={updating}
              >
                <Text style={styles.contactButtonText}>
                  {updating ? "Atualizando..." : "Vincular regra pré-definida"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Comodidades (via hook) */}
          {comodidades.length
            ? comodidades.map((c) => (
                <View style={styles.amenityItem} key={`comodidade-${c.id}`}>
                  <View style={styles.amenityIcon}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                  <Text style={[styles.amenityText, { flex: 1 }]}>
                    {c.nome}
                  </Text>
                  {donoMoradia && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveComodidade(c.id)}
                      disabled={updating}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#dc2626"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            : null}

          {/* Regras vinculadas */}
          {loadingVinculadas ? (
            <Text style={{ color: "#666", marginBottom: 16 }}>
              Carregando regras...
            </Text>
          ) : (
            regrasVinculadas.map((rv) => (
              <View style={styles.amenityItem} key={`regra-${rv.regraId}`}>
                <View
                  style={[styles.amenityIcon, { backgroundColor: "#2563eb" }]}
                >
                  <Text style={styles.checkIcon}>R</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.amenityText}>{rv.titulo}</Text>
                  {rv.descricao ? (
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      {rv.descricao}
                    </Text>
                  ) : null}
                </View>
                {donoMoradia && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveRegra(rv.regraId)}
                    disabled={updating}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color="#dc2626"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}

          {/* Empty state para visitante */}
          {!donoMoradia &&
            !updating &&
            !loadingVinculadas &&
            comodidades.length === 0 &&
            regrasVinculadas.length === 0 && (
              <View style={styles.emptyBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={28}
                  color="#6b7280"
                  style={{ marginBottom: 8 }}
                />
                <Text style={styles.emptyTitle}>Nada por aqui ainda</Text>
                <Text style={styles.emptySubtitle}>
                  Esta república ainda não cadastrou regras ou comodidades.
                </Text>
              </View>
            )}

          {/* Rooms */}

          {/* Location */}
          <Text style={styles.sectionTitle}>Localização</Text>
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapText}>Mapa da localização</Text>
              <Text style={styles.mapSubtext}>
                {dataMoradia?.endereco || "Endereço não informado"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Contact Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Entrar em contato</Text>
        </TouchableOpacity>
      </View>
      {donoMoradia && (
        <>
          <AddComodidadeModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onAddComodidade={handleAddComodidade}
          />
          <SelectRegrasModal
            visible={modalRegrasVisible}
            onClose={() => setModalRegrasVisible(false)}
            regras={regras}
            loading={loadingRegras}
            // SelectRegrasModal espera number[]
            selectedIds={regrasVinculadas.map((r) => r.regraId)}
            onSelect={handleSelectRegra}
          />
        </>
      )}

      {/* Modal de Tarefas
      {dataMoradia && (
        <TarefasModal
          isVisible={tarefasModalVisible}
          onClose={() => setTarefasModalVisible(false)}
          moradiaId={dataMoradia.id}
          moradiaNome={dataMoradia.nome}
        />
      )} */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#ffffff",
  },
  unifiedBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef5ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  unifiedBackText: {
    color: "#2563eb",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  emptyBox: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: "#000000",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  heartButton: {
    padding: 8,
  },
  heartIcon: {
    fontSize: 20,
    color: "#000000",
  },
  imageContainer: {
    width: "100%",
    height: 250,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  rating: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginRight: 12,
  },
  ratingText: {
    fontSize: 14,
    color: "#666666",
  },
  adminContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4a5568",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  adminTime: {
    fontSize: 14,
    color: "#666666",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
    marginTop: 10,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  amenityIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkIcon: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  amenityText: {
    fontSize: 16,
    color: "#000000",
  },
  roomItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  roomText: {
    fontSize: 16,
    color: "#000000",
    flex: 1,
  },
  chevron: {
    fontSize: 18,
    color: "#666666",
  },
  mapContainer: {
    height: 200,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 20,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 4,
  },
  mapSubtext: {
    fontSize: 14,
    color: "#999999",
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
    marginBottom: 24,
  },
  contactButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666666",
    marginBottom: 20,
    textAlign: "center",
  },
  backButtonText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "600",
  },
  manageTarefasButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f8ff",
    borderColor: "#2563eb",
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  manageTarefasText: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
  },
  manageTarefasArrow: {
    fontSize: 18,
    color: "#2563eb",
    fontWeight: "bold",
  },
  removeButton: {
    padding: 6,
  },
});
