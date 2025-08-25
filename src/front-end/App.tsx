import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Loading } from "./components/common/Loading";
import { AppErrorBoundary } from "./components/common/ErrorBoundary";

// Screens
import Cadastro from "./screens/Cadastro";
import Login from "./screens/Login";
import Home from "./screens/Home";
import BuscarMoradia from "./screens/BuscarMoradia";
import BoasVindas from "./screens/BoasVindas";
import CadastrarMoradia from "./screens/CadastrarMoradia";
import PerfilMoradia from "./screens/PerfilMoradia";
import MinhasMoradias from "./screens/MinhasMoradias";
import { Profile } from "./screens/Profile";
import ForgotPassword from "./screens/ForgotPassword";
import RepublicaDashboard from "./screens/MoradiaDashboard";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading text="Carregando..." />;
  }

  const screenOptions = {
    headerShown: false,
    title: "",
    headerTransparent: true,
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Home" : "Login"}
        screenOptions={screenOptions}
      >
        {isAuthenticated ? (
          // Authenticated Stack
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="BuscarMoradia" component={BuscarMoradia} />
            <Stack.Screen
              name="CadastrarMoradia"
              component={CadastrarMoradia}
            />
            <Stack.Screen name="PerfilMoradia" component={PerfilMoradia} />
            <Stack.Screen name="MinhasMoradias" component={MinhasMoradias} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="RepublicaDashboard" component={RepublicaDashboard} />
            <Stack.Screen name="BoasVindas" component={BoasVindas} />
          </>
        ) : (
          // Unauthenticated Stack
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Cadastro" component={Cadastro} />
            <Stack.Screen name="BoasVindas" component={BoasVindas} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </AppErrorBoundary>
  );
};

export default App;
export { Stack };
