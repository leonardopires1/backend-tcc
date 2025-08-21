# Google Maps Integration - Guia Completo

Este guia mostra como usar os serviços da API do Google Maps em seu projeto React Native com Expo.

## 📋 Pré-requisitos

1. **Conta no Google Cloud Platform**
2. **API Key do Google Maps configurada**
3. **Projeto React Native com Expo**

## 🚀 Configuração Inicial

### 1. Obter API Key

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Vá para "APIs e Serviços" > "Biblioteca"
4. Ative as seguintes APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Geocoding API**
   - **Places API**
   - **Directions API**
   - **Distance Matrix API**

5. Vá para "APIs e Serviços" > "Credenciais"
6. Clique em "Criar Credenciais" > "Chave de API"
7. Configure as restrições da API key conforme necessário

### 2. Configurar API Key no Projeto

Edite o arquivo `config/googleMapsConfig.ts` e substitua `'SUA_API_KEY_AQUI'` pela sua API key:

```typescript
API_KEY: __DEV__ 
  ? 'AIzaSyBOti4mM-6x9WDnZIjIeyoA6z_gqfCOXqY' // Sua API key aqui
  : process.env.GOOGLE_MAPS_API_KEY || '',
```

**⚠️ Importante**: Para produção, use variáveis de ambiente para proteger sua API key.

## 📚 Como Usar

### 1. Hook useGoogleMaps

```typescript
import { useGoogleMaps } from '../hooks/useGoogleMaps';

const MyComponent = () => {
  const {
    loading,
    geocodeAddress,
    reverseGeocode,
    searchPlaces,
    findNearbyPlaces,
    getDirections,
    getDistanceMatrix,
    isConfigured,
  } = useGoogleMaps();

  // Verificar se está configurado
  if (!isConfigured()) {
    return <Text>Google Maps não configurado</Text>;
  }

  // Usar as funções...
};
```

### 2. Geocodificação (Endereço → Coordenadas)

```typescript
const searchAddress = async () => {
  const coordinates = await geocodeAddress('Rua Augusta, 123, São Paulo');
  if (coordinates) {
    console.log('Lat:', coordinates.latitude, 'Lng:', coordinates.longitude);
  }
};
```

### 3. Geocodificação Reversa (Coordenadas → Endereço)

```typescript
const getAddressFromCoords = async () => {
  const address = await reverseGeocode({
    latitude: -23.5505,
    longitude: -46.6333
  });
  if (address) {
    console.log('Endereço:', address.formatted_address);
  }
};
```

### 4. Buscar Lugares

```typescript
const searchRestaurants = async () => {
  const places = await searchPlaces('restaurante', currentLocation, 1000);
  console.log('Restaurantes encontrados:', places);
};
```

### 5. Lugares Próximos

```typescript
const findNearbyGasStations = async () => {
  const places = await findNearbyPlaces(currentLocation, 2000, 'gas_station');
  console.log('Postos próximos:', places);
};
```

### 6. Calcular Rota

```typescript
const calculateRoute = async () => {
  const route = await getDirections(origin, destination);
  if (route && route.routes.length > 0) {
    console.log('Rota calculada:', route.routes[0]);
  }
};
```

### 7. Calcular Distância

```typescript
const calculateDistance = async () => {
  const matrix = await getDistanceMatrix([origin], [destination]);
  if (matrix && matrix.rows[0].elements[0].status === 'OK') {
    const element = matrix.rows[0].elements[0];
    console.log('Distância:', element.distance.text);
    console.log('Tempo:', element.duration.text);
  }
};
```

### 8. Componente de Autocomplete

```typescript
import { PlacesAutocomplete } from '../components/common/PlacesAutocomplete';

<PlacesAutocomplete
  placeholder="Digite um endereço..."
  onPlaceSelected={(place) => {
    console.log('Local selecionado:', place);
    // place contém: description, place_id, geometry
  }}
  currentLocation={currentLocation}
  radius={2000}
  types="address"
  country="br"
/>
```

## 🗺️ Integração com React Native Maps

```typescript
import MapView, { Marker, Polyline } from 'react-native-maps';

<MapView
  style={styles.map}
  initialRegion={{
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }}
  showsUserLocation={true}
>
  {/* Marcador para lugar selecionado */}
  {selectedPlace && (
    <Marker
      coordinate={{
        latitude: selectedPlace.geometry.location.lat,
        longitude: selectedPlace.geometry.location.lng,
      }}
      title={selectedPlace.name}
    />
  )}
  
  {/* Rota */}
  {routeCoordinates.length > 0 && (
    <Polyline
      coordinates={routeCoordinates}
      strokeColor="#007AFF"
      strokeWidth={3}
    />
  )}
</MapView>
```

## 🔧 Tipos Disponíveis para Busca

### Places Types
- `restaurant` - Restaurantes
- `gas_station` - Postos de gasolina
- `hospital` - Hospitais
- `pharmacy` - Farmácias
- `school` - Escolas
- `bank` - Bancos
- `atm` - Caixas eletrônicos
- `shopping_mall` - Shopping centers
- `supermarket` - Supermercados
- `gym` - Academias

### Address Types
- `address` - Endereços em geral
- `establishment` - Estabelecimentos
- `geocode` - Todas as localizações
- `(regions)` - Regiões geográficas
- `(cities)` - Cidades

## 💡 Dicas e Boas Práticas

### 1. Limitação de Uso
- Monitore o uso da API no Google Cloud Console
- Configure limites de cota para evitar custos inesperados
- Use cache quando possível para reduzir chamadas

### 2. Performance
- Use debounce no autocomplete (já implementado)
- Limite o número de resultados retornados
- Use raio apropriado para buscas próximas

### 3. Segurança
- **NUNCA** exponha sua API key no código em produção
- Use restrições de API no Google Cloud Console
- Configure restrições por domínio/app para mobile

### 4. Tratamento de Erros
- Sempre trate erros de rede
- Implemente fallbacks para quando a API estiver indisponível
- Valide se a API key está configurada antes de usar

### 5. Configuração para Produção

Para produção, configure variáveis de ambiente:

```typescript
// Em expo, use app.config.js
export default {
  expo: {
    extra: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },
};

// No código
import Constants from 'expo-constants';
const API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;
```

## 🚫 Limitações

1. **Geocoding API**: 50 requests/segundo
2. **Places API**: Varia por tipo de request
3. **Directions API**: 50 requests/segundo
4. **Distance Matrix API**: 100 elementos por query

## 📝 Exemplo Completo

Veja o arquivo `screens/GoogleMapsExampleScreen.tsx` para um exemplo completo de implementação com:
- Mapa interativo
- Autocomplete de endereços
- Busca de lugares próximos
- Cálculo de rotas
- Cálculo de distâncias

## 🆘 Solução de Problemas

### Erro: "API key not configured"
- Verifique se substituiu 'SUA_API_KEY_AQUI' pela sua API key real
- Confirme se a API key está ativa no Google Cloud Console

### Erro: "This API project is not authorized"
- Verifique se ativou todas as APIs necessárias no Google Cloud Console
- Confirme se a API key tem permissões para as APIs que está tentando usar

### Autocomplete não funciona
- Verifique se a Places API está ativada
- Confirme se a API key não tem restrições que impeçam o uso

### Mapas não carregam
- Verifique se o Maps SDK está ativado para Android/iOS
- Para Android, adicione a API key no app.json do Expo

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "SUA_API_KEY_AQUI"
        }
      }
    }
  }
}
```
