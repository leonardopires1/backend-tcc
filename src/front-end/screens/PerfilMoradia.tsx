import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Moradia from '../types/Moradia';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

export default function PerfilMoradia({ route, navigation }: { route: any, navigation: any }) {
  const { id } = route.params;
  console.log(id);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://192.168.0.22:3000/moradias/${id}`);
      const data = await res.json(); // nome, descricao, endereco, dono, regras, comodidades
      setDataMoradia(data);
    };
    
    fetchData();
  }, []);
  
  const [dataMoradia, setDataMoradia] = useState<Moradia | undefined>()

  console.log(dataMoradia);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons onPress={() => navigation.navigate("BuscarMoradia")} name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ver outras repúblicas</Text>
          <TouchableOpacity style={styles.heartButton}>
            <Text style={styles.heartIcon}>♡</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/01.jpg')} // Using require for image source
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <Text style={styles.title}>{dataMoradia?.nome || 'Nome da República'}</Text>
          <Text style={styles.subtitle}>{dataMoradia?.descricao || 'Descrição da república'}</Text>

          {/* Administrator */}
          <View style={styles.adminContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {dataMoradia?.dono?.nome
                  ? dataMoradia.dono.nome.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                  : 'AB'}
              </Text>
            </View>
            <View style={styles.adminInfo}>
              <Text style={styles.adminName}>
                Proprietário: {dataMoradia?.dono?.nome || 'Nome do dono'}
              </Text>
            </View>
          </View>

          {/* Rules and Amenities */}
          <Text style={styles.sectionTitle}>Regras e comodidades</Text>
          {dataMoradia?.comodidades?.map((item: string, idx: number) => (
            <View style={styles.amenityItem} key={idx}>
              <View style={styles.amenityIcon}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.amenityText}>{item}</Text>
            </View>
          ))}


          {/* Location */}
          <Text style={styles.sectionTitle}>Localização</Text>
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapText}>Mapa da localização</Text>
              <Text style={styles.mapSubtext}>{dataMoradia?.endereco || 'Endereço não informado'}</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    marginTop: 25,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  heartButton: {
    padding: 8,
  },
  heartIcon: {
    fontSize: 20,
    color: '#000000',
  },
  imageContainer: {
    width: '100%',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  rating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
  },
  adminContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a5568',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  adminTime: {
    fontSize: 14,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    marginTop: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amenityIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkIcon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  amenityText: {
    fontSize: 16,
    color: '#000000',
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  roomText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  chevron: {
    fontSize: 18,
    color: '#666666',
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 20,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#999999',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 24    ,
  },
  contactButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
