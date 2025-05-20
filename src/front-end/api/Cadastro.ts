import FormData from "../types/FormCadastro";

type SetFormData = (data: FormData) => void;

interface Navigation {
    navigate: (route: string) => void;
}

export default async function requisitaCadastro(
    formData: FormData,
    setFormData: SetFormData,
    isChecked: boolean,
    navigation: Navigation & { [key: string]: any }
): Promise<void | boolean> {
    if (!isChecked) {
        alert("Você deve concordar com os termos.");
        return;
    }

    // Validação de formato de email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert("Por favor, insira um email válido.");
        return false;
    }

    if (
        !formData.cpf ||
        !formData.genero ||
        !formData.telefone ||
        formData.telefone.length < 10 ||
        formData.telefone.length > 12
    ) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const { confirmarSenha, ...data } = formData;
        const res = await fetch(`${process.env.API_URL}/users/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            alert("Cadastro realizado com sucesso!");
            setFormData({
                nome: "",
                email: "",
                senha: "",
                confirmarSenha: "",
                cpf: "",
                genero: "",
                telefone: "",
            });
            // @ts-expect-error setChecked is not passed as parameter
            setChecked(false);
            navigation.navigate("Login");
        } else {
            const errorData = await res.json();
            alert(`Erro: ${errorData.message || res.statusText}`);
        }
    } catch (error) {
        console.error(error);
        alert("Erro ao tentar cadastrar.");
    }
}