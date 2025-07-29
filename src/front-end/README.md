## 📚 Como Usar

### 1. Instalar Dependências
```bash
cd front-end
npm install
```

### 2. Configurar API
Edite `config/apiConfig.ts` com a URL do seu back-end:
```typescript
const API_CONFIG = {
  BASE_URL: 'http://SEU_IP:3000', // Substitua pelo IP do seu back-end
  // ...
};
```

### 3. Executar
```bash
npm start
```

## 🔧 Configurações Recomendadas

### Back-End
Certifique-se de que seu back-end está configurado com:
- CORS habilitado para o IP do front-end
- Endpoints de autenticação funcionando
- Validação de dados server-side

### Desenvolvimento
- Use um IP fixo para desenvolvimento
- Configure variáveis de ambiente adequadamente
- Teste em dispositivos físicos para melhor performance

## 🎯 Próximos Passos

1. **Implementar upload de imagens** para moradias
2. **Adicionar sistema de chat** entre usuários
3. **Implementar notificações push**
4. **Adicionar mapas interativos** com geolocalização
5. **Sistema de avaliações** para moradias
6. **Filtros avançados** na busca
7. **Modo escuro** para a interface

## 🐛 Resolução de Problemas

### Erro de Conexão
- Verifique se o back-end está rodando
- Confirme o IP na configuração
- Teste a conectividade de rede

### Problemas de Navegação
- Limpe o cache do Metro bundler
- Reinicie o simulador/emulador
- Verifique as dependências de navegação

### Erros de TypeScript
- Execute `npx tsc --noEmit` para verificar tipos
- Atualize as definições de tipos conforme necessário
