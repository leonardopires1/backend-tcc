import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Cadastro from "./screens/Cadastro";
import Login from "./screens/Login";
import Home from "./screens/Home";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BuscarMoradia from "./screens/BuscarMoradia";
import BoasVindas from "./screens/BoasVindas";
import CadastrarMoradia from "./screens/CadastrarMoradia";
import PerfilMoradia from "./screens/PerfilMoradia";
import { Profile } from "./screens/Profile";

const Stack = createNativeStackNavigator();

const App = () => {
  const [userToken, setUserToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let token: string | null = null;
      try {
        token = await AsyncStorage.getItem("userToken");
      } catch (e) {
        // Restoring token failed
      }
      setUserToken(token);
    };

    bootstrapAsync();
  }, []);

  return (
    <NavigationContainer>
      {userToken ? (
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Cadastro" component={Cadastro} options={{ title: '', headerTransparent: true, headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ title: '', headerTransparent: true, headerShown: false }} />
          <Stack.Screen name="BuscarMoradia" component={BuscarMoradia} options={{ title: '', headerTransparent: true, headerShown: false }} />
          <Stack.Screen name="BoasVindas" component={BoasVindas} options={{ title: '', headerTransparent: true, headerShown: false }} />
          <Stack.Screen name="CadastrarMoradia" component={CadastrarMoradia} options={{ title: '', headerTransparent: true, headerShown: false }} />
          <Stack.Screen name="PerfilMoradia" component={PerfilMoradia} options={{ title: '', headerTransparent: true, headerShown: false }} />
          <Stack.Screen name="Profile" component={Profile} options={{ title: '', headerTransparent: true, headerShown: false }} />
        </Stack.Navigator>
      ) : (
        <>
          <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Cadastro" component={Cadastro} options={{ title: '', headerTransparent: true, headerShown: false }} />
            <Stack.Screen name="Login" component={Login} options={{ title: '', headerTransparent: true, headerShown: false }} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="BuscarMoradia" component={BuscarMoradia} options={{ title: '', headerTransparent: true, headerShown: false }} />
            <Stack.Screen name="BoasVindas" component={BoasVindas} options={{ title: '', headerTransparent: true, headerShown: false }} />
            <Stack.Screen name="CadastrarMoradia" component={CadastrarMoradia} options={{ title: '', headerTransparent: true, headerShown: false }} />
            <Stack.Screen name="PerfilMoradia" component={PerfilMoradia} options={{ title: '', headerTransparent: true, headerShown: false }} />
            <Stack.Screen name="Profile" component={Profile} options={{ title: '', headerTransparent: true, headerShown: false }} />
          </Stack.Navigator>
        </>
      )}
    </NavigationContainer>
  );
};

export default App;

export { Stack };
