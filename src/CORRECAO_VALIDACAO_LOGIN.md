# 🔧 Correção do Erro de Validação no Login (BadRequestException)

## Problema Identificado
```
ERROR [AllExceptionsFilter] POST /auth/signin
BadRequestException: Bad Request Exception
    at ValidationPipe.exceptionFactory
```

O erro indica que o `ValidationPipe` do NestJS está rejeitando os dados enviados para o endpoint `/auth/signin` porque não atendem às regras de validação.

## Causa Raiz
O `SignInDto` no backend não tinha validações apropriadas usando decorators do `class-validator`.

## Soluções Implementadas

### ✅ **1. Adicionada Validação no SignInDto**
**Arquivo**: `src/back-end/src/auth/auth.controller.ts`

#### **Antes:**
```typescript
class SignInDto {
  email: string;
  senha: string;
}
```

#### **Depois:**
```typescript
class SignInDto {
  @ApiProperty({ description: 'Email do usuário', example: 'usuario@email.com' })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ description: 'Senha do usuário', example: 'minhasenha123' })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  senha: string;
}
```

### ✅ **2. Melhorado ValidationPipe para Debugging**
**Arquivo**: `src/back-end/src/main.ts`

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  disableErrorMessages: false, // Habilitado para debugging
  exceptionFactory: (errors) => {
    console.log('🚨 Validation errors:', JSON.stringify(errors, null, 2));
    return new BadRequestException({
      message: 'Dados de entrada inválidos',
      errors: errors.map(error => ({
        field: error.property,
        constraints: error.constraints,
        value: error.value,
      })),
    });
  },
}));
```

### ✅ **3. Melhorado Logging no Front-end**
**Arquivo**: `src/front-end/contexts/AuthContext.tsx`

```typescript
const loginData = {
  email: email.trim().toLowerCase(),
  senha: password,
};

console.log('🔐 Tentando fazer login com:', { 
  email: loginData.email, 
  senhaLength: password.length 
});
```

### ✅ **4. Melhorado Tratamento de Erros de Validação**
**Front-end**: Captura e exibe mensagens específicas de validação do backend

```typescript
// Se a resposta tem uma estrutura de erro de validação
if (response.error) {
  const error = response.error as any;
  if (error && typeof error === 'object') {
    if (Array.isArray(error.message)) {
      errorMessage = error.message.join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
  }
}
```

### ✅ **5. Adicionado Logging no Backend**
**Arquivo**: `src/back-end/src/auth/auth.controller.ts`

```typescript
console.log('🔐 Dados recebidos no signin:', { 
  email: signInDto.email, 
  senhaLength: signInDto.senha?.length || 0,
  hasEmail: !!signInDto.email,
  hasSenha: !!signInDto.senha 
});
```

## Como Debugar Agora

### 📊 **Logs no Console**
Agora você verá logs detalhados para identificar problemas:

1. **Front-end**: Dados sendo enviados
2. **Backend**: Dados recebidos e erros de validação
3. **ValidationPipe**: Erros específicos de cada campo

### 🔍 **Possíveis Problemas e Soluções**

#### **1. Email vazio ou inválido**
- **Erro**: `Email é obrigatório` ou `Email deve ter um formato válido`
- **Solução**: Verificar se o campo email está preenchido e com formato correto

#### **2. Senha vazia**
- **Erro**: `Senha é obrigatória`
- **Solução**: Verificar se o campo senha está preenchido

#### **3. Campos extras**
- **Erro**: `property X should not exist`
- **Solução**: `forbidNonWhitelisted: true` rejeita campos não definidos no DTO

#### **4. Tipo incorreto**
- **Erro**: `Senha deve ser uma string`
- **Solução**: Verificar se os dados estão sendo enviados com tipos corretos

### 🎯 **Teste da Correção**

Para testar se está funcionando:

1. **Teste com dados válidos**:
   ```json
   {
     "email": "usuario@email.com",
     "senha": "minhasenha123"
   }
   ```

2. **Teste com dados inválidos**:
   ```json
   {
     "email": "email-invalido",
     "senha": ""
   }
   ```

3. **Verificar logs**:
   - Front-end: `🔐 Tentando fazer login com:`
   - Backend: `🔐 Dados recebidos no signin:`
   - Validação: `🚨 Validation errors:`

## Resultado Esperado

- ✅ **Dados válidos**: Login processado normalmente
- ❌ **Dados inválidos**: Mensagens de erro específicas e claras
- 📊 **Debugging**: Logs detalhados para identificar problemas
- 🎯 **UX melhorada**: Usuário recebe feedback específico sobre o que corrigir
