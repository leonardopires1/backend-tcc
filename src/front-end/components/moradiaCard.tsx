import { Image, StyleSheet, Text, View } from "react-native";
import Moradia from "../types/Moradia";

export default function MoradiaCard({ moradia }: { moradia: Moradia }) {
  console.log(moradia);
  return (
    <View key={moradia.id} style={styles.moradiaCard}>
      <Image
      source={{
        uri: "../assets/svgs/icon.svg",
      }}
      style={styles.moradiaImage}
      resizeMode="cover"
      />
      <View style={styles.moradiaInfo}>
      <Text style={styles.moradiaName}>{moradia.nome || "Nome não disponível"}</Text>
      <Text style={styles.moradiaDescription}>{moradia.descricao || "Descrição não disponível"}</Text>
      <Text style={styles.moradiaName}>Endereço</Text>
      <Text style={styles.moradiaDescription}>{moradia.endereco || "Endereço não disponível"}</Text>
      </View>
    </View>)
}

const styles = StyleSheet.create({
  moradiaCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  moradiaImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  moradiaInfo: {
    flex: 1,
    marginLeft: 16,
  },
  moradiaName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  moradiaDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
  },
  vacanciesText: {
    fontSize: 14,
    marginBottom: 2,
  },
  residentsText: {
    fontSize: 14,
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: "flex-start",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
  },
  priceWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
  },

})