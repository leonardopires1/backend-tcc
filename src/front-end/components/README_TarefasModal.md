# Modal de Tarefas - Documentação

Este modal foi criado baseado na imagem fornecida e consome a API de tarefas do backend. Ele permite gerenciar tarefas domésticas de uma moradia específica.

## Arquivos Criados

### 1. `/types/Tarefa.ts`
Define as interfaces TypeScript para:
- `Tarefa`: Estrutura da tarefa
- `AtribuicaoTarefa`: Atribuição de tarefa para usuário
- `CreateTarefaDto`: Dados para criar tarefa
- `UpdateTarefaDto`: Dados para atualizar tarefa

### 2. `/services/tarefaService.ts`
Service para comunicação com a API de tarefas:
- `getAllTarefas()`: Busca todas as tarefas
- `getTarefaById(id)`: Busca tarefa por ID
- `createTarefa(data)`: Cria nova tarefa
- `updateTarefa(id, data)`: Atualiza tarefa
- `deleteTarefa(id)`: Remove tarefa
- `atribuirTarefasAoUsuario(idUsuario, idTarefas)`: Atribui tarefas ao usuário

### 3. `/hooks/useTarefas.ts`
Hook customizado para gerenciar estado das tarefas:
- Carregamento automático das tarefas
- Filtro por moradia
- Estados de loading e error
- Funções para CRUD de tarefas

### 4. `/components/TarefasModal.tsx`
Componente modal principal com:
- Interface baseada na imagem fornecida
- Categorias predefinidas de tarefas domésticas
- Formulário para criar novas tarefas
- Lista de tarefas existentes
- Funcionalidades de editar/excluir

## Como Usar

### Importação
```tsx
import TarefasModal from '../components/TarefasModal';
```

### Uso Básico
```tsx
const [modalVisible, setModalVisible] = useState(false);
const moradiaId = 1; // ID da moradia
const moradiaNome = "Casa Compartilhada";

return (
  <View>
    <TouchableOpacity onPress={() => setModalVisible(true)}>
      <Text>Abrir Tarefas</Text>
    </TouchableOpacity>

    <TarefasModal
      isVisible={modalVisible}
      onClose={() => setModalVisible(false)}
      moradiaId={moradiaId}
      moradiaNome={moradiaNome}
    />
  </View>
);
```

## Props do TarefasModal

| Prop | Tipo | Obrigatório | Descrição |
|------|------|------------|-----------|
| `isVisible` | `boolean` | ✅ | Controla visibilidade do modal |
| `onClose` | `() => void` | ✅ | Função chamada ao fechar modal |
| `moradiaId` | `number` | ✅ | ID da moradia para filtrar tarefas |
| `moradiaNome` | `string` | ❌ | Nome da moradia (padrão: "Moradia") |

## Funcionalidades

### ✅ Criação de Tarefas
- Formulário com nome e descrição
- Categorias predefinidas para facilitar criação
- Validação de campos obrigatórios

### ✅ Listagem de Tarefas
- Exibe todas as tarefas da moradia
- Mostra nome, descrição e data de criação
- Estado vazio quando não há tarefas

### ✅ Exclusão de Tarefas
- Botão de excluir em cada tarefa
- Confirmação antes de excluir
- Atualização automática da lista

### ✅ Interface Responsiva
- Design baseado na imagem fornecida
- Animações suaves
- Suporte a scroll horizontal e vertical
- Estados de loading e erro

### ✅ Categorias Predefinidas
- 🧹 Limpeza Geral
- 🍳 Cozinha
- 🚿 Banheiro
- 👕 Lavanderia
- 📦 Organização
- 🔧 Manutenção

## API Integration

O modal consome os seguintes endpoints da API:

- `GET /tarefas-usuario` - Lista todas as tarefas
- `POST /tarefas-usuario` - Cria nova tarefa
- `PATCH /tarefas-usuario/:id` - Atualiza tarefa
- `DELETE /tarefas-usuario/:id` - Remove tarefa
- `PATCH /tarefas-usuario/:id/atribuir` - Atribui tarefas ao usuário

## Dependências

Certifique-se de ter as seguintes dependências instaladas:
- `react-native-modal`: Para o componente de modal
- `@react-native-async-storage/async-storage`: Para token de autenticação

## Exemplo Completo

Veja o arquivo `/components/ExemploUsoTarefasModal.tsx` para um exemplo completo de implementação.

## Personalização

Para personalizar o visual, modifique o objeto `styles` no arquivo `TarefasModal.tsx`. As cores principais são:
- Azul principal: `#007AFF`
- Cinza claro: `#F8F9FA`
- Cinza médio: `#6C757D`
- Branco: `#FFF`

## Notas Importantes

1. O modal filtra automaticamente as tarefas pela `moradiaId` fornecida
2. Todas as operações são assíncronas e mostram estados de loading
3. Erros são tratados e exibidos ao usuário
4. O token de autenticação é gerenciado automaticamente pelo httpService
5. O modal é responsivo e funciona em diferentes tamanhos de tela
