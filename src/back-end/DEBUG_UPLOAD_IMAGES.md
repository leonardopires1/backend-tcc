# Debug do Sistema de Upload de Imagens

## Problemas Identificados e Soluções

### 1. **Campo imagemUrl no Backend** ✅
- **Status**: Corrigido
- **Problema**: O método `update` do service não estava considerando o campo `imagemUrl`
- **Solução**: Adicionado `imagemUrl` na desestruturação e na atualização dos dados

### 2. **Servir Arquivos Estáticos** ✅
- **Status**: Corrigido
- **Problema**: O NestJS não estava configurado para servir as imagens armazenadas
- **Solução**: Adicionado `useStaticAssets` no `main.ts` para servir arquivos da pasta `images`

### 3. **URL das Imagens** ✅
- **Status**: Melhorado
- **Problema**: O backend estava salvando apenas o caminho local do arquivo
- **Solução**: Agora constrói a URL completa para o frontend: `${baseUrl}/images/moradias/${filename}`

### 4. **Logs para Debug** ✅
- **Status**: Adicionado
- **Logs no Frontend**: 
  - Upload de imagem com detalhes do arquivo
  - Endpoint sendo chamado
  - Resposta do servidor
  - Dados da moradia carregados
- **Logs no Backend**:
  - Detalhes do arquivo recebido
  - URL da imagem construída
  - Resultado da atualização

### 5. **Endpoint de Debug** ✅
- **Status**: Criado
- **Endpoint**: `GET /moradias/:id/debug-image`
- **Uso**: Para verificar se a `imagemUrl` está sendo salva corretamente

## Como Testar

### 1. Verificar se a imagem está sendo salva
```bash
# Após fazer upload de uma imagem, chamar:
GET /moradias/{id}/debug-image
```

### 2. Verificar se a imagem está acessível
```bash
# Se a imagemUrl retornada for: http://localhost:3000/images/moradias/exemplo_1.jpg
# Acessar diretamente no navegador:
http://localhost:3000/images/moradias/exemplo_1.jpg
```

### 3. Logs para acompanhar
**Frontend (Console do navegador):**
```
🔄 Iniciando upload da imagem da moradia: {moradiaId, fileName}
📤 Fazendo upload para endpoint: /moradias/image-upload/1
📥 Resposta do upload: {response}
✅ Upload concluído com sucesso: {data}
📱 Dados da moradia recebidos: {imagemUrl, hasImage}
✅ Dados da moradia carregados: {nome, imagemUrl, hasImage}
```

**Backend (Console do servidor):**
```
📁 Upload de imagem recebido: {moradiaId, filename, originalName, path, size}
✅ Moradia atualizada com sucesso: {moradiaId, imagemUrl, filename}
```

## Fluxo Completo

### 1. Upload no CadastrarMoradia
1. Usuário seleciona imagem
2. Moradia é criada
3. Se há imagem selecionada, faz upload para `/moradias/image-upload/{id}`
4. Backend salva arquivo em `./images/moradias/`
5. Backend atualiza moradia com URL: `http://localhost:3000/images/moradias/{filename}`
6. Frontend recebe confirmação

### 2. Upload no MoradiaDashboard
1. Usuário toca na imagem da moradia
2. Seleciona nova imagem
3. Faz upload para `/moradias/image-upload/{id}`
4. Backend processa e atualiza
5. Frontend recarrega dados da moradia
6. Nova imagem é exibida

### 3. Visualização das Imagens
1. API retorna moradia com `imagemUrl`
2. Frontend verifica se `imagemUrl` existe
3. Se existe, exibe `<Image source={{ uri: imagemUrl }}`
4. Se não existe, exibe ícone padrão

## Variáveis de Ambiente Necessárias

```env
# No backend (.env)
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:8081

# Ou para produção
BASE_URL=https://seu-dominio.com
```

## Estrutura de Arquivos

```
back-end/
├── images/
│   ├── moradias/        # Imagens das moradias
│   └── avatars/         # Avatares dos usuários
├── src/
│   └── main.ts          # Configuração de arquivos estáticos
```

## Endpoints Relevantes

- `POST /moradias/image-upload/:id` - Upload de imagem
- `GET /moradias/:id` - Buscar moradia (inclui imagemUrl)
- `GET /moradias/:id/debug-image` - Debug da imagemUrl
- `GET /images/moradias/:filename` - Servir imagem estática

## Próximos Passos

1. **Testar o fluxo completo** de upload e visualização
2. **Verificar os logs** no console para identificar onde está parando
3. **Testar o endpoint de debug** para confirmar se a URL está sendo salva
4. **Verificar se as imagens são acessíveis** via URL direta
5. **Validar no frontend** se a imagemUrl está sendo recebida corretamente
