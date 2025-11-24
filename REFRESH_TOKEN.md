# Sistema de Renovação de Sessão Baseado em Atividade

## Visão Geral

O sistema de autenticação possui renovação automática de sessão baseada na atividade do usuário:

- **Validade da sessão**: 4 horas
- **Renovação baseada em atividade**: A sessão é renovada apenas se o usuário estiver ativo
- **Detecção de atividade**: Mouse, teclado, scroll, touch e cliques
- **Logout automático**: Se a sessão expirar, o usuário precisa fazer login novamente

## Como Funciona

### 1. Login Inicial

Quando o usuário faz login ([auth.ts:76-104](src/lib/auth.ts#L76-L104)):
- O backend retorna um `access_token` e `sessionId`
- A sessão tem validade de 4 horas (configurado em [auth.ts:45](src/lib/auth.ts#L45))
- Todos os dados do usuário e empresa são salvos na sessão

### 2. Monitoramento de Atividade

O componente `SessionActivityHandler` ([nextAuthProvider.tsx:19-73](src/contexts/nextAuthProvider.tsx#L19-L73)) monitora:
- **Eventos de atividade**: `mousedown`, `keydown`, `scroll`, `touchstart`, `click`
- **Última atividade**: Mantém timestamp da última interação do usuário

### 3. Renovação Automática da Sessão

A cada 5 minutos ([nextAuthProvider.tsx:51-63](src/contexts/nextAuthProvider.tsx#L51-L63)):
- Verifica se o usuário esteve ativo nos últimos 10 minutos
- Se SIM → Renova a sessão (chama `update()` do NextAuth)
- Se NÃO → Não faz nada, deixa a sessão expirar naturalmente

### 4. Comportamento na Expiração

Quando a sessão de 4 horas expira:
- NextAuth automaticamente invalida a sessão
- Na próxima requisição, o usuário é redirecionado para `/login`
- Nenhum dado sensível permanece no cliente

## Configurações Ajustáveis

### Tempo de Validade da Sessão

Alterar em [auth.ts:44-47](src/lib/auth.ts#L44-L47):

```typescript
session: {
  strategy: 'jwt',
  maxAge: 60 * 60 * 4, // 4 horas em segundos
},
```

### Intervalo de Verificação

Alterar em [nextAuthProvider.tsx:53-63](src/contexts/nextAuthProvider.tsx#L53-L63):

```typescript
refreshIntervalRef.current = setInterval(
  async () => {
    // ...
  },
  5 * 60 * 1000, // Verifica a cada 5 minutos
)
```

### Janela de Atividade

Alterar em [nextAuthProvider.tsx:57-59](src/contexts/nextAuthProvider.tsx#L57-L59):

```typescript
// Se o usuário esteve ativo nos últimos 10 minutos
if (timeSinceLastActivity < 10 * 60 * 1000) {
  await update()
}
```

### Eventos de Atividade

Alterar em [nextAuthProvider.tsx:31](src/contexts/nextAuthProvider.tsx#L31):

```typescript
const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
```

## Cenários de Uso

### Cenário 1: Usuário Ativo
```
00:00 - Login (sessão válida até 04:00)
00:05 - Usuário clica (atividade detectada)
00:10 - Sistema verifica: ativo nos últimos 10min → Renova sessão (válida até 04:10)
00:15 - Usuário digita (atividade detectada)
00:20 - Sistema verifica: ativo nos últimos 10min → Renova sessão (válida até 04:20)
... continua enquanto o usuário estiver ativo
```

### Cenário 2: Usuário Inativo
```
00:00 - Login (sessão válida até 04:00)
00:05 - Usuário clica (última atividade)
00:10 - Sistema verifica: ativo nos últimos 10min → Renova sessão
00:15 - (sem atividade)
00:20 - Sistema verifica: última atividade há 15min → NÃO renova
00:25 - Sistema verifica: última atividade há 20min → NÃO renova
04:00 - Sessão expira automaticamente
04:01 - Próxima requisição redireciona para /login
```

### Cenário 3: Usuário Volta Depois de Inativo
```
00:00 - Login (sessão válida até 04:00)
00:05 - Usuário clica (última atividade)
03:50 - Usuário volta e clica (atividade detectada - ainda dentro das 4h)
03:55 - Sistema verifica: ativo nos últimos 10min → Renova sessão (válida até 07:55)
```

## Vantagens desta Implementação

1. **Sem endpoint adicional**: Não requer rota `/auth/refresh` no backend
2. **Baseado em atividade real**: Renova apenas quando o usuário está usando
3. **Economia de recursos**: Não faz requisições desnecessárias ao backend
4. **Segurança**: Sessões inativas expiram naturalmente
5. **Simples**: Usa apenas funcionalidades nativas do NextAuth

## Segurança

- O token nunca é exposto além do necessário
- A renovação usa mecanismos internos do NextAuth
- Sessões inativas expiram automaticamente
- Logout automático em caso de problemas
- Detecção de atividade impede renovações desnecessárias

## Debug

Para verificar o funcionamento, adicione logs:

```typescript
// Em nextAuthProvider.tsx
console.log('Última atividade:', new Date(lastActivityRef.current))
console.log('Tempo desde última atividade:', timeSinceLastActivity / 1000 / 60, 'minutos')
```
