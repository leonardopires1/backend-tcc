import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Cadastro from "./screens/Cadastro";
import Login from "./screens/Login";
import Home from "./screens/Home";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BuscarMoradia from "./screens/BuscarMoradia";

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
        <Stack.Navigator initialRouteName="BuscarMoradia">
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Cadastro" component={Cadastro} options={{title: '', headerTransparent: true, headerShown: false}} />
          <Stack.Screen name="Login" component={Login} options={{title: '', headerTransparent: true, headerShown: false}}/>
          <Stack.Screen name="BuscarMoradia" component={BuscarMoradia} options={{title: '', headerTransparent: true, headerShown: false}} />
        </Stack.Navigator>
      ) : (
        <>
          <Stack.Navigator initialRouteName="BuscarMoradia">
            <Stack.Screen name="Cadastro" component={Cadastro} options={{title: '', headerTransparent: true, headerShown: false}}/>
            <Stack.Screen name="Login" component={Login} options={{title: '', headerTransparent: true, headerShown: false}}/>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="BuscarMoradia" component={BuscarMoradia} options={{title: '', headerTransparent: true, headerShown: false}}/>
          </Stack.Navigator>
        </>
      )}
    </NavigationContainer>
  );
};

export default App;

export { Stack };
