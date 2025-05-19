import { SafeAreaView, StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, StatusBar } from "react-native"
import { Ionicons, FontAwesome } from "@expo/vector-icons"
import MapView, { Marker } from "react-native-maps"
import React, { useEffect, useState } from "react"

export default function BuscarMoradia() {

interface Republica {
    id: number
    name: string
    description: string
    rating: number
    vacancies: number
    residents: number
    price: number
    image: string
}

const formatPrice = (price: number): string => {
    return price.toFixed(2).replace(".", ",")
}

  const [republicas, setRepublicas] = useState<Republica[]>([])

  useEffect(() => {
    const fetchRepublicas = async () => {
      const response = await fetch("https://api.example.com/republicas")
      const data = await response.json()
      setRepublicas(data)
    }
    fetchRepublicas()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Bauru, SP</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
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
            <Marker coordinate={{ latitude: -22.3156, longitude: -49.0709 }} title="Tenda Atacado - Bauru" />
            <Marker coordinate={{ latitude: -22.32, longitude: -49.0709 }} title="Graal Sem Limites">
              <View style={styles.customMarker}>
                <Image source={{ uri: "https://via.placeholder.com/20" }} style={styles.markerImage} />
              </View>
            </Marker>
          </MapView>
        </View>

        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Mais de dez repúblicas com vagas</Text>
        </View>

        {/* República Listings */}
        {republicas.map((republica) => (
          <View key={republica.id} style={styles.republicaCard}>
            <Image source={{ uri: republica.image }} style={styles.republicaImage} resizeMode="cover" />
            <View style={styles.republicaInfo}>
              <Text style={styles.republicaName}>{republica.name}</Text>
              <Text style={styles.republicaDescription}>{republica.description}</Text>

              <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={16} color="black" />
                <Text style={styles.ratingText}>{republica.rating}</Text>
              </View>

              <Text style={styles.vacanciesText}>{republica.vacancies} vagas disponíveis</Text>
              <Text style={styles.residentsText}>{republica.residents} moradores</Text>

              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>a partir de</Text>
                <View style={styles.priceWrapper}>
                  <Text style={styles.priceCurrency}>R$</Text>
                  <Text style={styles.priceValue}>{formatPrice(republica.price)}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
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
  republicaCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  republicaImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  republicaInfo: {
    flex: 1,
    marginLeft: 16,
  },
  republicaName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  republicaDescription: {
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
