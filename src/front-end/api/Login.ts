import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function requisitaLogin(email: string, senha: string, manterConectado: boolean, navigation: any) {
    // Verifica se os campos estão vazios
    if (!email.trim() || !senha.trim()) {
      alert("Por favor, preencha todos os campos.");
      return false;
    }

    // Simulação de requisição de login
    const access_token = await fetch(`${process.env.API_URL}/auth/signin`, {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({
      email,
      senha
      }),
    });

    if (access_token.ok && manterConectado) {
      const data = await access_token.json();

      if (data.access_token) {
        try {
          await AsyncStorage.setItem("userToken", data.access_token);
          alert("Login bem-sucedido!");
          // Navegar para a próxima tela ou realizar outra ação
          return navigation.navigate("Home");
          
        } catch (e) {
          console.error("Failed to save the token", e);
          alert("Falha ao salvar informações de login.");
          return false;
        }
      } else {
        alert("Token de acesso não encontrado na resposta.");
        return false;
      }
    } else {
      const errorData = await access_token
        .json()
        .catch(() => ({ message: "Erro desconhecido" }));
      alert(`Falha no login: ${errorData.message || access_token.statusText}`);
      return false;
    }
  }