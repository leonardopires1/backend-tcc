# RoomMate Landing Page

Uma landing page moderna e responsiva para o aplicativo mobile RoomMate - sistema de gestão de moradias compartilhadas.

## 🎨 Design

A landing page utiliza a mesma paleta de cores do aplicativo mobile:
- **Primary Blue**: #0073FF
- **Success Green**: #4CAF50  
- **Error Red**: #FF5252
- **Warning Orange**: #FF9800
- **Grays**: #333333, #666666, #999999
- **Background**: #F8F9FA

## ✨ Características

### 🚀 Performance
- Design responsivo e mobile-first
- Otimizada para velocidade de carregamento
- Imagens lazy loading
- Scroll otimizado com debounce

### 🎭 Animações
- Animações suaves de entrada
- Efeito parallax nos elementos flutuantes
- Contadores animados nas estatísticas
- Efeito de hover em cards e botões
- Animação de digitação no título principal

### 📱 Experiência do Usuário
- Navegação sticky com efeito blur
- Menu hamburger responsivo
- Scroll suave entre seções
- Feedback visual em todos os botões
- Formulário de contato funcional

### 🎨 Elementos Visuais
- Mockup de telefone com interface do app
- Cards flutuantes com animação
- Gradientes sutis usando as cores do app
- Ícones consistentes com o design system
- Sombras e bordas arredondadas modernas

## 📄 Estrutura

### Seções incluídas:
1. **Hero Section** - Apresentação principal com CTA
2. **Features** - Recursos principais do aplicativo
3. **How It Works** - Como funciona em 3 passos
4. **Screenshots** - Mockups das telas principais
5. **Download** - Links para download nas stores
6. **Contact** - Formulário de contato e informações
7. **Footer** - Links e informações adicionais

## 🛠 Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Styles avançados com Grid e Flexbox
- **JavaScript ES6** - Interatividade moderna
- **Google Fonts** - Tipografia (Inter)
- **BoxIcons** - Ícones consistentes

## 📱 Responsividade

- **Desktop**: 1200px+ (layout em grid)
- **Tablet**: 768px-1199px (adaptações de grid)
- **Mobile**: <768px (layout single column)

## 🎯 SEO e Acessibilidade

- Meta tags otimizadas
- Open Graph para redes sociais
- Estrutura semântica HTML5
- Alt text para imagens
- Contraste adequado nas cores

## 🚀 Como usar

1. Abra o arquivo `index.html` em qualquer navegador
2. Para desenvolvimento, use um servidor local:
   ```bash
   # Com Python
   python -m http.server 8000
   
   # Com Node.js (http-server)
   npx http-server
   
   # Com VS Code Live Server extension
   ```

## 📦 Assets Necessários

Para completar a landing page, adicione na pasta `assets/`:
- `google-play.png` - Badge da Google Play Store
- `app-store.png` - Badge da App Store
- `preview.jpg` - Imagem de preview para redes sociais

## 🎨 Customização

### Cores
Todas as cores estão definidas em variáveis CSS no início do arquivo `styles.css`:

```css
:root {
    --primary-blue: #0073FF;
    --success-green: #4CAF50;
    --error-red: #FF5252;
    --warning-orange: #FF9800;
    /* ... */
}
```

### Conteúdo
- Textos podem ser editados diretamente no HTML
- Estatísticas no hero podem ser atualizadas
- Links de download devem ser configurados
- Informações de contato precisam ser atualizadas

## 🎉 Easter Eggs

- **Konami Code**: Digite ↑↑↓↓←→←→BA para uma surpresa
- **Animação de digitação**: O título principal tem efeito typewriter
- **Efeito ripple**: Clique nos botões para ver o efeito

## 📈 Próximos Passos

1. Adicionar imagens reais do aplicativo
2. Configurar links de download das stores
3. Integrar com sistema de analytics
4. Adicionar formulário de newsletter
5. Implementar sistema de blog/notícias
6. Adicionar mais idiomas (i18n)

---

Desenvolvido com ❤️ para o projeto RoomMate
