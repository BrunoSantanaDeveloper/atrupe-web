# Plano de Ação - Adaptação de Uso do Hook usePlanFeatures

## 📋 Visão Geral

Este documento define como adaptar todos os usos do hook `usePlanFeatures` **SEM modificar o hook**, convertendo funções inexistentes para usar as funções disponíveis que retornam `true/false`.

## 🔍 Hook Atual - Funções Disponíveis

### **Funções que Existem no Hook:**

```typescript
return {
  // Básicas
  planName,                    // string
  hasFeature,                  // (feature: string) => boolean
  hasAnyFeature,              // (features: string[]) => boolean  
  hasAllFeatures,             // (features: string[]) => boolean

  // Específicas (todas retornam boolean)
  canManageSectors,           // () => boolean
  canManageMultipleCompanies, // () => boolean
  canManageSalesOrders,       // () => boolean
  canManageRejectionReasons,  // () => boolean
  canManageBudgetStatus,      // () => boolean
  hasFinancialModule,         // (module) => boolean
  canManageBankAccounts,      // () => boolean
  canManageBankTaxTransfer,   // () => boolean
  canManageProducts,          // () => boolean
  canManageProductionStages,  // () => boolean
  canManageClients,           // () => boolean
  canManageSuppliers,         // () => boolean
  canManageDeliverySchedule,  // () => boolean
}
```

## 🚨 Funções Inexistentes - Conversões Necessárias

### **Mapeamento de Conversões:**

| Função Inexistente | Conversão para Função Existente | Lógica de Valores |
|-------------------|----------------------------------|-------------------|
| `getRejectionReasonsType()` | `canManageRejectionReasons()` | `true` → `'full'`, `false` → `'none'` |
| `getUserLimit()` | `session?.company?.limits?.max_users \|\| 0` | Acessar diretamente da sessão |
| `getBudgetStatusType()` | `canManageBudgetStatus()` | `true` → `'full'`, `false` → `'none'` |
| `getSalesOrdersType()` | `canManageSalesOrders()` | `true` → `'full'`, `false` → `'none'` |
| `getDeliveryScheduleType()` | `canManageDeliverySchedule()` | `true` → `'full'`, `false` → `'none'` |
| `getProductionStagesType()` | `canManageProductionStages()` | `true` → `'full'`, `false` → `'none'` |
| `getBankAccountsType()` | `canManageBankAccounts()` | `true` → `'full'`, `false` → `'none'` |
| `getClientsType()` | `canManageClients()` | `true` → `'full'`, `false` → `'basic'` |
| `getProductsType()` | `canManageProducts()` | `true` → `'full'`, `false` → `'basic'` |
| `getSuppliersType()` | `canManageSuppliers()` | `true` → `'full'`, `false` → `'basic'` |
| `getBankTaxTransferType()` | `canManageBankTaxTransfer()` | `true` → `'full'`, `false` → `'none'` |

## 📂 Plano de Conversão por Arquivo

### **Prioridade 🔥 CRÍTICA**

#### 1. `src/components/layout/SidebarComponent.tsx`
**Linhas:** 96-97
```typescript
// ANTES:
const { getUserLimit, getRejectionReasonsType, hasFinancialModule } = usePlanFeatures()

// DEPOIS:  
const { hasFinancialModule } = usePlanFeatures()
const { data: session } = useSession()
const getUserLimit = () => session?.company?.limits?.max_users || 0
// getRejectionReasonsType não é usado neste arquivo (apenas importado)
```

#### 2. `src/app/(app-sidebar)/vendas/orcamentos/[quotationId]/components/QuotationActions/RejectQuotation.tsx`
**Linha:** 61
```typescript
// ANTES:
const { getRejectionReasonsType } = usePlanFeatures()

// DEPOIS:
const { canManageRejectionReasons } = usePlanFeatures()

// E nos usos (linhas 85, 91, 125):
// ANTES: getRejectionReasonsType() === 'none'
// DEPOIS: !canManageRejectionReasons()

// ANTES: getRejectionReasonsType() === 'limited'  
// DEPOIS: canManageRejectionReasons()
```

#### 3. `src/app/(app-sidebar)/vendas/ordens-de-servico/[orderId]/components/OrderActions/CancelOrder.tsx`
**Linha:** 61
```typescript
// Mesma conversão do RejectQuotation.tsx
const { canManageRejectionReasons } = usePlanFeatures()

// Conversões de uso:
// getRejectionReasonsType() === 'none' → !canManageRejectionReasons()
// getRejectionReasonsType() === 'limited' → canManageRejectionReasons()
```

#### 4. `src/app/(app-sidebar)/configuracoes/vendas/components/SalesSettingsClient.tsx`
**Linha:** 23
```typescript
// ANTES:
const { getRejectionReasonsType, getBudgetStatusType } = usePlanFeatures()

// DEPOIS:
const { canManageRejectionReasons, canManageBudgetStatus } = usePlanFeatures()

// Conversões de uso:
// getRejectionReasonsType() !== 'none' → canManageRejectionReasons()  
// getBudgetStatusType() !== 'none' → canManageBudgetStatus()
```

#### 5. `src/app/(app-sidebar)/configuracoes/empresa-e-sistema/colaboradores-e-usuarios/components/TableData.tsx`
**Linha:** 70
```typescript
// ANTES:
const { getUserLimit } = usePlanFeatures()

// DEPOIS:
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
const getUserLimit = () => session?.company?.limits?.max_users || 0
```

### **Prioridade 🔥 ALTA**

#### 6. `src/app/(app-sidebar)/vendas/orcamentos/components/QuotationsTable/QuotationsData.tsx`
**Linha:** 72
```typescript
// ANTES:
const { getBudgetStatusType } = usePlanFeatures()

// DEPOIS:
const { canManageBudgetStatus } = usePlanFeatures()

// Conversões de uso:
// getBudgetStatusType() !== 'none' → canManageBudgetStatus()
```

#### 7. `src/app/(app-sidebar)/vendas/ordens-de-servico/components/OrdersTable/OrdersData.tsx`
**Linha:** 61  
```typescript
// ANTES:
const { getSalesOrdersType } = usePlanFeatures()

// DEPOIS:
const { canManageSalesOrders } = usePlanFeatures()

// Conversões de uso:
// getSalesOrdersType() !== 'none' → canManageSalesOrders()
```

### **Prioridade 🟡 MÉDIA**

#### 8-24. Arquivos Restantes

Seguir o mesmo padrão de conversão conforme tabela de mapeamento:

- `src/app/(app-sidebar)/producao/agenda-de-entrega/components/DeliveryScheduleTable/DeliveryScheduleData.tsx`
- `src/app/(app-sidebar)/configuracoes/financeiro/contas-bancarias/components/BankAccountsTable/BankAccountsData.tsx`
- E todos os outros 16 arquivos...

## 🔧 Padrões de Conversão

### **1. Conversão de Imports**

```typescript
// ANTES:
const { getFunctionType } = usePlanFeatures()

// DEPOIS: 
const { canManageFunction } = usePlanFeatures()
```

### **2. Conversão de Verificações**

```typescript
// Verificar se tem funcionalidade:
// ANTES: getFunctionType() !== 'none'
// DEPOIS: canManageFunction()

// Verificar se NÃO tem funcionalidade:
// ANTES: getFunctionType() === 'none'  
// DEPOIS: !canManageFunction()

// Verificar nível específico:
// ANTES: getFunctionType() === 'limited'
// DEPOIS: canManageFunction() // (sempre true se tem a feature)
```

### **3. Conversão de Limites**

```typescript
// Para getUserLimit:
// ANTES: const { getUserLimit } = usePlanFeatures()
// DEPOIS: 
import { useSession } from 'next-auth/react'
const { data: session } = useSession()  
const getUserLimit = () => session?.company?.limits?.max_users || 0
```

### **4. Conversão de Valores de Retorno**

```typescript
// Quando o código espera string mas agora temos boolean:
const getTypeAsString = (canManageFunction: boolean) => {
  return canManageFunction ? 'full' : 'none'
}

// Ou inline:
const typeLevel = canManageFunction() ? 'full' : 'none'
```

## 📋 Sequência de Implementação

### **Fase 1: Arquivos Críticos (Esta Sprint)**
1. SidebarComponent.tsx
2. RejectQuotation.tsx  
3. CancelOrder.tsx
4. SalesSettingsClient.tsx
5. TableData.tsx

### **Fase 2: Tabelas Principais (Próxima Sprint)**  
6. QuotationsData.tsx
7. OrdersData.tsx
8. DeliveryScheduleData.tsx

### **Fase 3: Formulários e Configurações**
9-24. Restantes arquivos por ordem de impacto

## ⚠️ Funcionalidades Para Implementar no Hook Posteriormente

### **Funções Que Deveriam Existir no Hook:**

```typescript
// Estas funções são necessárias mas não implementadas:
// (Para implementar em sprint futura)

const getRejectionReasonsType = () => {
  if (hasFeature('quotation_require_rejection_reason')) return 'full'
  if (canManageRejectionReasons()) return 'limited'
  return 'none'
}

const getUserLimit = () => {
  return session?.company?.limits?.max_users || 0
}

const getBudgetStatusType = () => {
  if (hasFeature('quotation_status_column')) return 'full'
  if (canManageBudgetStatus()) return 'basic'
  return 'none'
}

// ... e todas as outras 8 funções
```

### **Features Que Faltam para Lógica Completa:**

```typescript
// Features que não estão sendo verificadas mas deveriam:
- 'quotation_require_rejection_reason'  // Para modal obrigatório
- 'quotation_status_column'            // Para coluna de status  
- 'service_order_current_phase'        // Para fases de OS
- 'delivery_stage_status_change'       // Para mudança de status
- 'bank_account_cash_control_switch'   // Para switch de caixa
- 'credit_limit_configuration'         // Para limite de crédito
```

## ✅ Checklist de Conversão por Arquivo

### **Críticos - Fazer Primeiro**
- [ ] SidebarComponent.tsx - Converter getUserLimit e remover getRejectionReasonsType
- [ ] RejectQuotation.tsx - Converter getRejectionReasonsType → canManageRejectionReasons
- [ ] CancelOrder.tsx - Converter getRejectionReasonsType → canManageRejectionReasons  
- [ ] SalesSettingsClient.tsx - Converter 2 funções → can* equivalentes
- [ ] TableData.tsx - Converter getUserLimit → session direct access

### **Alta Prioridade**  
- [ ] QuotationsData.tsx - Converter getBudgetStatusType
- [ ] OrdersData.tsx - Converter getSalesOrdersType
- [ ] FinanceSettingsClient.tsx - Já usa hasFinancialModule (OK)

### **Média Prioridade - Fazer em Batch**
- [ ] 16 arquivos restantes - Aplicar conversões conforme tabela

## 🎯 Resultado Esperado

Após implementação:
- **0 funções inexistentes** sendo chamadas
- **24 arquivos funcionais** usando apenas funções disponíveis  
- **Funcionalidades core** operando corretamente
- **Base limpa** para futuras implementações no hook

---

## 📚 Arquivos de Referência

- **Hook Original**: `src/hooks/usePlanFeatures.ts` (NÃO modificar)
- **Mapeamento Completo**: `src/docs/useplanfeatures-comprehensive-mapping.md`
- **Auth Session**: `src/lib/auth.ts` (para acessar limits)

---

*Plano criado em: ${new Date().toLocaleDateString('pt-BR')}*

**Este plano mantém o hook intacto e adapta todos os 24 usos para funcionar apenas com as funções disponíveis.**