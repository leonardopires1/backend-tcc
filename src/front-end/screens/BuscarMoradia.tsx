import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import React, { useState } from "react";
import Moradia from "../types/Moradia";
import MoradiaCard from "../components/MoradiaCard";
import { useMoradias } from "../hooks/useMoradias";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";

export default function BuscarMoradia({ navigation }: { navigation: any }) {
  const { moradias, loading, error, refreshMoradias } = useMoradias();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMoradias();
    setRefreshing(false);
  };

  const handleMoradiaPress = (moradia: Moradia) => {
    navigation.navigate("PerfilMoradia", { moradia });
  };

  if (loading && !refreshing) {
    return <Loading text="Carregando moradias..." />;
  }

  if (error && moradias.length === 0) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={refreshMoradias}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons
            onPress={() => navigation.navigate("Home")}
            name="chevron-back"
            size={24}
            color="black"
          />
        </TouchableOpacity>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Bauru, SP</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: -22.3156,
              longitude: -49.0709,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{ latitude: -22.3156, longitude: -49.0709 }}
              title="Bauru Centro"
            />
            {moradias.map((moradia, index) => (
              <Marker
                key={moradia.id}
                coordinate={{ 
                  latitude: -22.3156 + (index * 0.001), // Simular posições diferentes
                  longitude: -49.0709 + (index * 0.001) 
                }}
                title={moradia.nome}
                description={moradia.endereco}
                onCalloutPress={() => handleMoradiaPress(moradia)}
              />
            ))}
          </MapView>
        </View>

        <View style={styles.titleContainer}>
          {moradias.length > 0 ? (
            <Text style={styles.titleText}>
              Encontramos {moradias.length} repúblicas
            </Text>
          ) : (
            <Text style={styles.titleText}>
              Nenhuma república encontrada
            </Text>
          )}
        </View>

        {moradias.map((moradia: Moradia) => (
          <MoradiaCard 
            key={moradia.id} 
            moradia={moradia} 
            onPress={() => handleMoradiaPress(moradia)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  locationContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "500",
  },
  filterButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  markerImage: {
    width: 20,
    height: 20,
  },
  titleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
  },
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
});
