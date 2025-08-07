# Mapeamento Completo - Hook usePlanFeatures

## 📋 Visão Geral

Este documento mapeia **absolutamente todos** os usos do hook `usePlanFeatures` no projeto, categorizando por tipo de uso, funções utilizadas e propósito. O objetivo é criar um plano de ação abrangente para migração e padronização.

## 🔍 Análise do Hook

### **Funções Exportadas pelo Hook:**

```typescript
return {
  planName,                    // Nome do plano atual
  hasFeature,                  // Verifica uma feature específica
  hasAnyFeature,              // Verifica se tem qualquer uma das features
  hasAllFeatures,             // Verifica se tem todas as features
  canManageSectors,           // Pode gerenciar setores
  canManageSalesOrders,       // Pode gerenciar ordens de venda
  canManageRejectionReasons,  // Pode gerenciar motivos de rejeição
  canManageBudgetStatus,      // Pode gerenciar status de orçamento
  hasFinancialModule,         // Tem módulo financeiro (função parametrizada)
  canManageBankAccounts,      // Pode gerenciar contas bancárias
  canManageBankTaxTransfer,   // Pode gerenciar transferências bancárias
  canManageProducts,          // Pode gerenciar produtos
  canManageProductionStages,  // Pode gerenciar estágios de produção
  canManageClients,           // Pode gerenciar clientes
  canManageSuppliers,         // Pode gerenciar fornecedores
  canManageDeliverySchedule,  // Pode gerenciar agenda de entrega
  canManageMultipleCompanies, // Pode gerenciar múltiplas empresas
}
```

### **⚠️ Funções NÃO Implementadas mas Usadas no Código:**

```typescript
// Estas funções são chamadas no código mas não existem no hook:
getRejectionReasonsType     // Usado em 2 arquivos
getSalesOrdersType          // Usado em 2 arquivos  
getDeliveryScheduleType     // Usado em 2 arquivos
getClientsType              // Usado em 1 arquivo
getBudgetStatusType         // Usado em 2 arquivos
getProductsType             // Usado em 1 arquivo
getProductionStagesType     // Usado em 2 arquivos
getSuppliersType            // Usado em 1 arquivo
getBankTaxTransferType      // Usado em 1 arquivo
getUserLimit                // Usado em 1 arquivo
getBankAccountsType         // Usado em 2 arquivos
```

---

## 📂 Mapeamento Completo por Arquivo

### **1. Componentes de Layout**

#### `src/components/layout/SidebarComponent.tsx`
- **Linha:** 53, 97
- **Funções Usadas:** Desestruturação completa do hook
- **Propósito:** Controlar visibilidade de menus da sidebar
- **Padrão:** Uso extensivo de múltiplas funções
- **Prioridade:** 🔥 ALTA (impacta navegação global)

#### `src/components/common/FeatureGate.tsx`
- **Linha:** 3, 20
- **Funções Usadas:** `hasAnyFeature`, `hasAllFeatures`
- **Propósito:** Componente central de controle de features
- **Padrão:** Uso das funções genéricas de verificação
- **Prioridade:** 🔥 CRÍTICA (componente base)

---

### **2. Tabelas e Listagens (5 arquivos)**

#### `src/app/(app-sidebar)/vendas/orcamentos/components/QuotationsTable/QuotationsData.tsx`
- **Linha:** 72
- **Funções Usadas:** `getBudgetStatusType` ❌ (não implementada)
- **Propósito:** Controlar colunas de status na tabela de orçamentos
- **Padrão:** Função não implementada
- **Prioridade:** 🔥 ALTA (tabela principal)

#### `src/app/(app-sidebar)/vendas/ordens-de-servico/components/OrdersTable/OrdersData.tsx`
- **Linha:** 61
- **Funções Usadas:** `getSalesOrdersType` ❌ (não implementada)
- **Propósito:** Controlar funcionalidades da tabela de OS
- **Padrão:** Função não implementada
- **Prioridade:** 🔥 ALTA (tabela principal)

#### `src/app/(app-sidebar)/producao/agenda-de-entrega/components/DeliveryScheduleTable/DeliveryScheduleData.tsx`
- **Linha:** 85
- **Funções Usadas:** `getDeliveryScheduleType` ❌ (não implementada)
- **Propósito:** Controlar funcionalidades da agenda de entrega
- **Padrão:** Função não implementada
- **Prioridade:** 🟡 MÉDIA

#### `src/app/(app-sidebar)/configuracoes/financeiro/contas-bancarias/components/BankAccountsTable/BankAccountsData.tsx`
- **Linha:** 49
- **Funções Usadas:** `getBankAccountsType` ❌ (não implementada)
- **Propósito:** Controlar funcionalidades das contas bancárias
- **Padrão:** Função não implementada
- **Prioridade:** 🟡 MÉDIA

#### `src/app/(app-sidebar)/configuracoes/empresa-e-sistema/colaboradores-e-usuarios/components/TableData.tsx`
- **Linha:** 70
- **Funções Usadas:** `getUserLimit` ❌ (não implementada)
- **Propósito:** Controlar limite de usuários
- **Padrão:** Função não implementada
- **Prioridade:** 🔥 ALTA (controle de limite de plano)

---

### **3. Formulários e Modais (8 arquivos)**

#### `src/app/(app-sidebar)/cadastros/clientes/components/NewClient/index.tsx`
- **Linha:** 67
- **Funções Usadas:** `hasFinancialModule`
- **Propósito:** Mostrar/ocultar campos financeiros no form de cliente
- **Padrão:** Uso da função parametrizada corretamente
- **Prioridade:** 🟡 MÉDIA

#### `src/app/(app-sidebar)/configuracoes/produtos/components/NewProduct.tsx`
- **Linha:** 89
- **Funções Usadas:** `getProductsType` ❌, `getProductionStagesType` ❌
- **Propósito:** Controlar funcionalidades do formulário de produtos
- **Padrão:** Funções não implementadas
- **Prioridade:** 🟡 MÉDIA

#### `src/app/(app-sidebar)/vendas/orcamentos/components/NewQuotation.tsx`
- **Linha:** 112
- **Funções Usadas:** `canManageMultipleCompanies`
- **Propósito:** Mostrar seletor de empresas
- **Padrão:** Uso da função implementada
- **Prioridade:** 🟡 MÉDIA

#### `src/app/(app-sidebar)/configuracoes/financeiro/configuracoes-de-pagamento/condicoes-de-pagamento/components/NewPaymentCondition/index.tsx`
- **Linha:** 64
- **Funções Usadas:** `getBankTaxTransferType` ❌
- **Propósito:** Controlar configurações de pagamento
- **Padrão:** Função não implementada
- **Prioridade:** 🟡 MÉDIA

#### `src/app/(app-sidebar)/configuracoes/vendas/series-de-venda/components/EditItem/index.tsx`
- **Linha:** 71
- **Funções Usadas:** `planName`
- **Propósito:** Exibir informações do plano
- **Padrão:** Uso simples da propriedade
- **Prioridade:** 🟢 BAIXA

#### `src/app/(app-sidebar)/configuracoes/empresa-e-sistema/setores/components/Actions/Edit/index.tsx`
- **Linha:** 68
- **Funções Usadas:** `getProductionStagesType` ❌
- **Propósito:** Controlar configurações de setores
- **Padrão:** Função não implementada
- **Prioridade:** 🟡 MÉDIA

#### `src/app/(app-sidebar)/configuracoes/empresa-e-sistema/components/CompanyInfo/NewCompanyInfo.tsx`
- **Linha:** 301
- **Funções Usadas:** `canManageMultipleCompanies`
- **Propósito:** Permitir criação de múltiplas empresas
- **Padrão:** Uso da função implementada
- **Prioridade:** 🟡 MÉDIA

#### `src/app/(app-sidebar)/configuracoes/financeiro/contas-bancarias/components/BankAccountsTable/NewBankAccount/index.tsx`
- **Linha:** 83
- **Funções Usadas:** `hasFinancialModule`
- **Propósito:** Controlar criação de contas bancárias
- **Padrão:** Uso da função parametrizada
- **Prioridade:** 🟡 MÉDIA

---

### **4. Ações e Dialogs (3 arquivos)**

#### `src/app/(app-sidebar)/vendas/orcamentos/[quotationId]/components/QuotationActions/RejectQuotation.tsx`
- **Linha:** 61
- **Funções Usadas:** `getRejectionReasonsType` ❌
- **Propósito:** Controlar motivos de rejeição de orçamentos
- **Padrão:** Função não implementada
- **Prioridade:** 🔥 ALTA (funcionalidade core)

#### `src/app/(app-sidebar)/vendas/ordens-de-servico/[orderId]/components/OrderActions/CancelOrder.tsx`
- **Linha:** 61
- **Funções Usadas:** `getRejectionReasonsType` ❌
- **Propósito:** Controlar motivos de cancelamento de OS
- **Padrão:** Função não implementada
- **Prioridade:** 🔥 ALTA (funcionalidade core)

#### `src/app/(app-sidebar)/configuracoes/empresa-e-sistema/cargos/components/Actions/Permissions/index.tsx`
- **Linha:** 53
- **Funções Usadas:** Importa mas uso específico não identificado
- **Propósito:** Controlar permissões de cargos
- **Padrão:** Uso não claro
- **Prioridade:** 🟡 MÉDIA

---

### **5. Páginas de Configuração (3 arquivos)**

#### `src/app/(app-sidebar)/configuracoes/vendas/components/SalesSettingsClient.tsx`
- **Linha:** 23
- **Funções Usadas:** `getRejectionReasonsType` ❌, `getBudgetStatusType` ❌
- **Propósito:** Controlar acesso às configurações de vendas
- **Padrão:** Funções não implementadas
- **Prioridade:** 🔥 ALTA (controla acesso a configurações)

#### `src/app/(app-sidebar)/configuracoes/financeiro/FinanceSettingsClient.tsx`
- **Linha:** 26
- **Funções Usadas:** `hasFinancialModule`
- **Propósito:** Controlar acesso às configurações financeiras
- **Padrão:** Uso da função parametrizada
- **Prioridade:** 🔥 ALTA (controla acesso a configurações)

#### `src/app/(app-sidebar)/configuracoes/financeiro/contas-bancarias/components/BankAccounts.tsx`
- **Linha:** 19
- **Funções Usadas:** `getBankAccountsType` ❌
- **Propósito:** Controlar funcionalidades das contas bancárias
- **Padrão:** Função não implementada
- **Prioridade:** 🟡 MÉDIA

---

### **6. Layouts Dinâmicos (2 arquivos)**

#### `src/app/(app-sidebar)/cadastros/clientes/[id]/layout.tsx`
- **Linha:** 32
- **Funções Usadas:** `getClientsType` ❌
- **Propósito:** Controlar abas disponíveis no layout de cliente
- **Padrão:** Função não implementada
- **Prioridade:** 🟡 MÉDIA

#### `src/app/(app-sidebar)/cadastros/fornecedores/[id]/layout.tsx`
- **Linha:** 34
- **Funções Usadas:** `getSuppliersType` ❌
- **Propósito:** Controlar abas disponíveis no layout de fornecedor
- **Padrão:** Função não implementada
- **Prioridade:** 🟡 MÉDIA

---

### **7. Componentes de Produção (1 arquivo)**

#### `src/app/(app-sidebar)/producao/agenda-de-entrega/components/DeliverySchedule.tsx`
- **Linha:** 33
- **Funções Usadas:** `getDeliveryScheduleType` ❌
- **Propósito:** Controlar funcionalidades da agenda de entrega
- **Padrão:** Função não implementada
- **Prioridade:** 🟡 MÉDIA

---

## 🚨 Problemas Críticos Identificados

### **1. Funções Não Implementadas (11 funções)**

| Função | Usos | Arquivos Afetados | Impacto |
|--------|------|-------------------|---------|
| `getRejectionReasonsType` | 3 | RejectQuotation, CancelOrder, SalesSettings | 🔥 CRÍTICO |
| `getSalesOrdersType` | 2 | OrdersData, ?? | 🔥 ALTO |
| `getBudgetStatusType` | 2 | QuotationsData, SalesSettings | 🔥 ALTO |
| `getDeliveryScheduleType` | 2 | DeliveryScheduleData, DeliverySchedule | 🟡 MÉDIO |
| `getProductionStagesType` | 2 | NewProduct, Edit/index | 🟡 MÉDIO |
| `getBankAccountsType` | 2 | BankAccountsData, BankAccounts | 🟡 MÉDIO |
| `getClientsType` | 1 | clientes/[id]/layout | 🟡 MÉDIO |
| `getProductsType` | 1 | NewProduct | 🟡 MÉDIO |
| `getSuppliersType` | 1 | fornecedores/[id]/layout | 🟡 MÉDIO |
| `getBankTaxTransferType` | 1 | NewPaymentCondition | 🟡 MÉDIO |
| `getUserLimit` | 1 | TableData (usuários) | 🔥 CRÍTICO |

### **2. Inconsistências de Nomenclatura**

- Hook usa `canManageRejectionReasons()` mas código chama `getRejectionReasonsType()`
- Hook usa `canManageBudgetStatus()` mas código chama `getBudgetStatusType()`
- Padrões diferentes: `canManage*` vs `get*Type`

### **3. Funções Parametrizadas**

Apenas `hasFinancialModule(module)` está implementada como parametrizada, mas é usada corretamente.

---

## 🎯 Plano de Ação

### **Fase 1: Correção de Funções Críticas (Prioridade 🔥)**

#### **1.1. Implementar Funções Ausentes no Hook**

```typescript
// Adicionar ao hook usePlanFeatures.ts:

const getRejectionReasonsType = () => {
  if (hasFeature('quotation_rejection_reasons')) return 'full'
  return 'none'
}

const getUserLimit = () => {
  const limits = session?.company?.limits
  return limits?.max_users || 0
}

const getBudgetStatusType = () => {
  if (hasFeature('quotation_status_configuration')) return 'full'
  return 'basic'
}

const getSalesOrdersType = () => {
  if (hasFeature('basic_service_orders')) return 'basic'
  return 'none'
}

// ... implementar todas as outras funções
```

#### **1.2. Atualizar Export do Hook**

```typescript
return {
  // Existentes...
  
  // Novas funções críticas
  getRejectionReasonsType,
  getUserLimit,
  getBudgetStatusType,
  getSalesOrdersType,
  getDeliveryScheduleType,
  getProductionStagesType,
  getBankAccountsType,
  getClientsType,
  getProductsType,
  getSuppliersType,
  getBankTaxTransferType,
}
```

### **Fase 2: Padronização de Uso (Prioridade 🟡)**

#### **2.1. Criar Constantes para Tipos**

```typescript
// src/consts/planTypes.ts
export const PLAN_TYPES = {
  REJECTION_REASONS: {
    NONE: 'none',
    BASIC: 'basic', 
    FULL: 'full'
  },
  BUDGET_STATUS: {
    NONE: 'none',
    BASIC: 'basic',
    FULL: 'full'
  }
  // etc...
} as const
```

#### **2.2. Migrar Usos Individuais**

**Prioridade por arquivo:**
1. **SidebarComponent.tsx** - Navegação global
2. **QuotationsData.tsx** - Tabela principal
3. **RejectQuotation.tsx** - Funcionalidade core
4. **SalesSettingsClient.tsx** - Controle de acesso
5. **TableData.tsx** - Limite de usuários
6. Demais arquivos por ordem de impacto

### **Fase 3: Migração para Nova API (Prioridade 🔄)**

#### **3.1. Adaptar Hook para Nova Estrutura**

```typescript
// Compatibilidade com estrutura atual E nova API
const hasFeature = (feature: string) => {
  // Estrutura atual
  if (session?.company?.plan?.features) {
    return session.company.plan.features.includes(feature)
  }
  
  // Nova estrutura da API (quando implementada)
  if (session?.company?.plan?.planFeatures) {
    return session.company.plan.planFeatures.some(
      pf => pf.feature.key === feature
    )
  }
  
  return false
}
```

#### **3.2. Implementar Sistema de Limites**

```typescript
const getUserLimit = () => {
  // Estrutura atual
  if (session?.company?.limits?.max_users) {
    return session.company.limits.max_users
  }
  
  // Nova estrutura da API
  if (session?.company?.plan?.planLimits) {
    const userLimit = session.company.plan.planLimits.find(
      pl => pl.limit.key === 'max_users'
    )
    return userLimit?.value || 0
  }
  
  return 0
}
```

---

## 📋 Checklist de Implementação

### **Correções Imediatas (Esta Sprint)**
- [ ] Implementar 11 funções ausentes no hook
- [ ] Corrigir exports do hook
- [ ] Testar funcionalidades críticas (rejeição, limites, status)
- [ ] Validar SidebarComponent e tabelas principais

### **Padronização (Próxima Sprint)**
- [ ] Criar constantes de tipos de plano
- [ ] Migrar SidebarComponent para usar constantes
- [ ] Migrar tabelas principais (Quotations, Orders)
- [ ] Migrar configurações críticas (Sales, Finance)

### **Otimização (Sprint Futura)**
- [ ] Implementar compatibilidade com nova API
- [ ] Adicionar sistema de limites robusto
- [ ] Criar testes unitários para o hook
- [ ] Documentar padrões de uso

### **Validação e Testes**
- [ ] Testar cada função implementada
- [ ] Validar comportamento com diferentes planos
- [ ] Verificar limites de usuários
- [ ] Testar funcionalidades de rejeição/cancelamento

---

## 📊 Resumo de Impacto

**Total de arquivos afetados:** 24
**Funções ausentes críticas:** 11
**Arquivos com prioridade ALTA:** 8
**Arquivos com prioridade MÉDIA:** 14
**Arquivos com prioridade BAIXA:** 1

**Estimativa de esforço:**
- Implementação das funções: 2-3 dias
- Testes e validação: 1-2 dias
- Migração completa: 5-8 dias

---

## 🔍 Arquivos de Referência

- **Hook Principal**: `src/hooks/usePlanFeatures.ts`
- **Constantes Atuais**: `src/consts/features.ts`
- **Documentação**: `src/docs/plan-based-permissions-system.md`
- **Tipos da Sessão**: `src/lib/auth.ts`

---

*Mapeamento completo gerado em: ${new Date().toLocaleDateString('pt-BR')}*

**Este documento identifica TODOS os 24 usos do hook usePlanFeatures e revela 11 funções críticas não implementadas que estão causando erros silenciosos no sistema.**