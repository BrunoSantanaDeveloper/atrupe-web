# Teste: Filtro de Sidebar por Features do Plano

## Objetivo
Verificar se a sidebar filtra corretamente os itens de navegação baseado nas features do plano da empresa, além das permissões de usuário.

## Implementação
- **Arquivo**: `src/components/layout/SidebarComponent.tsx`
- **Hook utilizado**: `usePlanFeatures()`
- **Métodos**: `canManageSectors()`, `getUserLimit()`, `getRejectionReasonsType()`

## Funcionalidade
O componente `SidebarComponent` agora verifica:
1. **Permissões do usuário** (existente)
2. **Features do plano** (novo)

### Features Controladas

#### 1. **Setores**
- **Controle**: `canManageSectors()`
- **Path**: `/setores`
- **Comportamento**: Visível apenas se feature `sectors_management` estiver presente

#### 2. **Colaboradores e Usuários**
- **Controle**: `getUserLimit() > 0`
- **Path**: `/colaboradores-e-usuarios`
- **Comportamento**: Visível apenas se há limite de usuários definido (features `user_limit_3` ou `user_limit_5`)

#### 3. **PDV/Frente de Caixa**
- **Controle**: `hasFinancialModule('pdv')`
- **Path**: `/frente-de-caixa`
- **Comportamento**: Visível apenas se feature `pdv` estiver presente

#### 4. **Controle de Caixa**
- **Controle**: `hasFinancialModule('cash')`
- **Path**: `/controle-de-caixa`
- **Comportamento**: Visível apenas se feature `cash_control` estiver presente

#### 5. **A Receber**
- **Controle**: `hasFinancialModule('receivable')`
- **Path**: `/a-receber`
- **Comportamento**: Visível apenas se feature `accounts_receivable` estiver presente

#### 6. **A Pagar**
- **Controle**: `hasFinancialModule('payable')`
- **Path**: `/a-pagar`
- **Comportamento**: Visível apenas se feature `accounts_payable` estiver presente

#### 7. **Motivos de Rejeição e Cancelamento**
- **Controle**: `getRejectionReasonsType() !== 'none'`
- **Path**: `/motivos-de-rejeicao-e-cancelamento`
- **Comportamento**: Visível apenas se features `rejection_reasons_full` ou `rejection_reasons_limited` estiverem presentes

## Cenários de Teste

### Cenário 1: Plano LITE (Acesso Completo)
**Features esperadas**: `["sectors_management", "user_limit_5", "pdv", "cash_control", "accounts_receivable", "accounts_payable", "rejection_reasons_full", ...]`

**Esperado**: Todos os itens controlados devem aparecer na sidebar
- ✅ "Setores" deve aparecer
- ✅ "Colaboradores e usuários" deve aparecer
- ✅ "PDV" deve aparecer
- ✅ "Controle de caixa" deve aparecer
- ✅ "A receber" deve aparecer
- ✅ "A pagar" deve aparecer
- ✅ "Motivos de rejeição e cancelamento" deve aparecer (quando implementado)

### Cenário 2: Plano START/TRIAL (Acesso Limitado)
**Features esperadas**: `["user_limit_3", "sales_orders_limited", ...]`

**Esperado**: Apenas itens com features correspondentes devem aparecer
- ❌ "Setores" não deve aparecer (sem `sectors_management`)
- ✅ "Colaboradores e usuários" deve aparecer (tem `user_limit_3`)
- ❌ "PDV" não deve aparecer (sem `pdv`)
- ❌ "Controle de caixa" não deve aparecer (sem `cash_control`)
- ❌ "A receber" não deve aparecer (sem `accounts_receivable`)
- ❌ "A pagar" não deve aparecer (sem `accounts_payable`)
- ❌ "Motivos de rejeição e cancelamento" não deve aparecer (sem features de rejeição)

### Cenário 3: Plano sem Limite de Usuários
**Features esperadas**: `["some_other_feature"]` (sem user_limit_X)

**Esperado**: 
- ❌ "Colaboradores e usuários" não deve aparecer

## Como Testar

### 1. **Simular Plano LITE**:
```javascript
// No mock ou sessão, definir:
features: [
  "sectors_management",
  "user_limit_5", 
  "rejection_reasons_full",
  // ... outras features
]
```

### 2. **Simular Plano START/TRIAL**:
```javascript
// No mock ou sessão, definir:
features: [
  "user_limit_3", 
  "sales_orders_limited",
  // ... outras features
  // (sem "sectors_management", "rejection_reasons_full")
]
```

### 3. **Verificar na UI**:
- Fazer login com cada tipo de plano
- Navegar para "Configurações"
- Observar quais sub-itens aparecem ou não

## Estrutura da Verificação

### Lógica Implementada
```typescript
const checkItemAccess = (item: NavigationItem): boolean => {
  // 1. Verifica permissões primeiro
  if (!checkPermission(item.permission)) {
    return false
  }

  // 2. Verifica features específicas
  if (item.path?.includes('/setores')) {
    return canManageSectors()
  }

  // Controle de Colaboradores e Usuários - baseado no limite de usuários
  if (item.path?.includes('/colaboradores-e-usuarios')) {
    return getUserLimit() > 0
  }

  // Controle de PDV/Frente de Caixa
  if (item.path?.includes('/frente-de-caixa')) {
    return hasFinancialModule('pdv')
  }

  // Controle de Controle de Caixa
  if (item.path?.includes('/controle-de-caixa')) {
    return hasFinancialModule('cash')
  }

  // Controle de A Receber
  if (item.path?.includes('/a-receber')) {
    return hasFinancialModule('receivable')
  }

  // Controle de A Pagar
  if (item.path?.includes('/a-pagar')) {
    return hasFinancialModule('payable')
  }

  // Controle de Motivos de Rejeição e Cancelamento
  if (item.path?.includes('/motivos-de-rejeicao-e-cancelamento')) {
    return getRejectionReasonsType() !== 'none'
  }

  return true
}
```

### Filtragem da Navegação
```typescript
const filteredNavigation = mainNavigation
  .map((item) => ({
    ...item,
    children: item.children?.filter((child) => checkItemAccess(child)),
  }))
  .filter((item) => checkItemAccess(item) && (item.children?.length ?? 0) > 0)
```

## Expansão Futura

Para adicionar novos controles de features:

```typescript
// Exemplo para produtos
if (item.path?.includes('/produtos')) {
  return getProductsType() !== 'none'
}

// Exemplo para fornecedores
if (item.path?.includes('/fornecedores')) {
  return getSuppliersType() !== 'none'
}

// Exemplo para folha de pagamento
if (item.path?.includes('/folha-de-pagamento')) {
  return hasFinancialModule('payroll')
}
```

## Resultado Esperado
✅ Sidebar filtra itens baseado tanto em permissões quanto em features do plano
✅ Setores controlados por `canManageSectors()`
✅ Colaboradores controlados por `getUserLimit()`
✅ PDV controlado por `hasFinancialModule('pdv')`
✅ Controle de caixa controlado por `hasFinancialModule('cash')`
✅ A receber controlado por `hasFinancialModule('receivable')`
✅ A pagar controlado por `hasFinancialModule('payable')`
✅ Motivos de rejeição controlados por `getRejectionReasonsType()`
✅ Estrutura permite adicionar facilmente novos controles de features
✅ Mantém compatibilidade com sistema de permissões existente
✅ Filtragem funciona tanto para itens principais quanto sub-itens