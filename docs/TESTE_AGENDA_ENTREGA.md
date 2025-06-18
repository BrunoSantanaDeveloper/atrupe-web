# Teste: Controle de Agenda de Entrega por Plano

## Objetivo
Verificar se o controle de funcionalidades da agenda de entrega está funcionando corretamente conforme o plano do usuário.

## Funcionalidade Implementada

### Plano LITE
- ✅ **Todas as abas disponíveis**: Produção, Entrega, Faturamento, Todos os ativos, Finalizados
- ✅ **Funcionalidades completas** da agenda de entrega

### Plano START/TRIAL  
- ❌ **Abas removidas**: "Produção" e "Todos os ativos"
- ✅ **Abas disponíveis**: Entrega, Faturamento, Finalizados
- ✅ **Funcionalidades limitadas** conforme especificação

## Cenários de Teste

### 1. Usuário com Plano LITE

**Pré-condições:**
- Usuário logado com plano LITE
- Session contém feature: `delivery_schedule_full`

**Passos:**
1. Acessar "Produção" → "Agenda de entrega"
2. Verificar abas disponíveis

**Resultado Esperado:**
- Deve exibir todas as 5 abas: "Produção", "Entrega", "Faturamento", "Todos os ativos", "Finalizados"
- Todas as abas devem ser funcionais
- Aba padrão deve ser "Todos os ativos"

### 2. Usuário com Plano START/TRIAL

**Pré-condições:**
- Usuário logado com plano START ou TRIAL
- Session contém feature: `delivery_schedule_limited`

**Passos:**
1. Acessar "Produção" → "Agenda de entrega"
2. Verificar abas disponíveis

**Resultado Esperado:**
- Deve exibir apenas 3 abas: "Entrega", "Faturamento", "Finalizados"
- **NÃO deve exibir**: "Produção" e "Todos os ativos"
- Aba padrão deve ser "Entrega" (fallback)

### 3. Redirecionamento de Aba Inválida (START/TRIAL)

**Pré-condições:**
- Usuário logado com plano START/TRIAL
- URL com parâmetro de aba removida: `?status=producao` ou `?status=todos`

**Passos:**
1. Acessar diretamente URL com aba removida
2. Verificar comportamento

**Resultado Esperado:**
- Deve redirecionar automaticamente para aba "Entrega"
- Não deve exibir erro ou aba inexistente

## Verificações Técnicas

### 1. Hook usePlanFeatures
```typescript
const { getDeliveryScheduleType } = usePlanFeatures()
const deliveryScheduleType = getDeliveryScheduleType()

// LITE: retorna 'full'
// START/TRIAL: retorna 'limited'
```

### 2. Filtro de Abas
```typescript
const filteredTabs =
  deliveryScheduleType === 'limited'
    ? tabs.filter((tab) => tab.tab !== 'producao' && tab.tab !== 'todos')
    : tabs
```

### 3. Validação de Aba Ativa
```typescript
const activeTab = (() => {
  const currentTab = searchParams?.status || 'todos'
  const tabExists = filteredTabs.some((tab) => tab.tab === currentTab)
  if (tabExists) return currentTab
  return deliveryScheduleType === 'limited' ? 'entrega' : 'todos'
})()
```

## Arquivos Modificados

- ✅ `src/hooks/usePlanFeatures.ts` - Adicionado método `getDeliveryScheduleType()`
- ✅ `src/app/(app-sidebar)/producao/agenda-de-entrega/components/DeliverySchedule.tsx` - Filtro de abas implementado

## Status dos Testes

- [ ] Teste 1: Plano LITE - Todas as abas
- [ ] Teste 2: Plano START/TRIAL - Abas limitadas  
- [ ] Teste 3: Redirecionamento de aba inválida
- [ ] Teste 4: Funcionalidade das abas restantes
- [ ] Teste 5: Navegação entre abas permitidas

## Observações

- A implementação remove apenas as abas específicas ("Produção" e "Todos os ativos")
- As demais funcionalidades da agenda de entrega permanecem inalteradas
- O redirecionamento automático evita URLs inválidas para usuários com plano limitado
- Pattern seguido: filtragem condicional baseada no tipo de plano 