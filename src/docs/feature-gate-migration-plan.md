# Plano de Ação - Migração FeatureGate e usePlanFeatures

## 📋 Visão Geral

Este documento mapeia todos os usos atuais do `FeatureGate` e `usePlanFeatures` no projeto e define um plano de ação para atualizar essas implementações conforme as novas APIs de assinatura e planos.

## 🔍 Mapeamento Atual

### 📂 FeatureGate - 6 Arquivos Identificados

#### **1. Páginas Financeiras** - Padrão simples com showUpgradeMessage

- `src/app/(app-sidebar)/financeiro/a-pagar/page.tsx:15`
  ```tsx
  <FeatureGate features={['accounts_payable']} showUpgradeMessage>
  ```
- `src/app/(app-sidebar)/financeiro/a-receber/page.tsx:15`
  ```tsx
  <FeatureGate features={['accounts_receivable']} showUpgradeMessage>
  ```
- `src/app/(app-sidebar)/financeiro/frente-de-caixa/page.tsx:17`
  ```tsx
  <FeatureGate features={['pdv']} showUpgradeMessage>
  ```
- `src/app/(app-sidebar)/financeiro/controle-de-caixa/page.tsx:17`
  ```tsx
  <FeatureGate features={['cash_control']} showUpgradeMessage>
  ```

#### **2. Páginas de Configuração** - Padrão avançado com fallback customizado

- `src/app/(app-sidebar)/configuracoes/vendas/status-de-orcamento/page.tsx:22`
  ```tsx
  <FeatureGate
    features={['budget_status_full']}
    fallback={<CustomUpgradeComponent />}
  >
  ```
- `src/app/(app-sidebar)/configuracoes/vendas/motivos-de-rejeicao-e-cancelamento/page.tsx:27`
  ```tsx
  <FeatureGate
    features={['quotation_rejection_reasons', 'service_order_cancellation_reason']}
    requireAll={false}
    fallback={<CustomUpgradeComponent />}
  >
  ```

### 📂 usePlanFeatures - 25+ Arquivos Identificados

#### **Categorias de Uso:**

1. **Sidebar Navigation** (1 arquivo)

   - `SidebarComponent.tsx` - Controla visibilidade de menus

2. **Tabelas e Listagens** (5 arquivos)

   - `QuotationsData.tsx`, `OrdersData.tsx`, `DeliveryScheduleData.tsx`
   - Controla colunas e ações disponíveis

3. **Formulários** (8 arquivos)

   - `NewClient/index.tsx`, `NewProduct.tsx`, `NewQuotation.tsx`
   - Controla campos e funcionalidades disponíveis

4. **Configurações** (10 arquivos)

   - `SalesSettingsClient.tsx`, `FinanceSettingsClient.tsx`
   - Controla acesso a configurações específicas

5. **Ações de Contexto** (3 arquivos)
   - `RejectQuotation.tsx`, `CancelOrder.tsx`, `Edit/index.tsx`
   - Controla ações específicas disponíveis

## 📋 Features Identificadas em Uso

### **Features Financeiras:**

- `accounts_payable` - Contas a pagar
- `accounts_receivable` - Contas a receber
- `cash_control` - Controle de caixa
- `pdv` - Frente de caixa/PDV

### **Features de Vendas:**

- `quotation_rejection_reasons` - Motivos de rejeição
- `service_order_cancellation_reason` - Motivos de cancelamento
- `budget_status_full` - Status de orçamento completo
- `quotation_quick_sale` - Venda rápida

### **Features de Sistema:**

- `sectors_configuration` - Configuração de setores
- `multiple_companies` - Múltiplas empresas
- `client_additional_tabs` - Abas adicionais de cliente
- `supplier_additional_tabs` - Abas adicionais de fornecedor

## 🎯 Problemas Identificados

### **1. Features Inconsistentes**

Algumas features usadas no código não correspondem às definidas no hook:

- `budget_status_full` → deveria ser `quotation_status_configuration`
- `pdv` → existe no hook como `pdv_screen`

### **2. Padrões Diferentes**

- Algumas pages usam `showUpgradeMessage={true}`
- Outras usam `fallback` customizado
- Falta de consistência na experiência do usuário

### **3. Estrutura da Sessão**

- Hook acessa `session.company.plan.features`
- Nova API retorna estrutura diferente
- Necessário validar como dados passam pelo `/api/auth`

## 🔄 Plano de Ação

### **Fase 1: Padronização (Sem Breaking Changes)**

#### **1.1. Padronizar Features Names**

- [ ] Mapear todas as features usadas vs definidas no hook
- [ ] Criar constantes centralizadas para features
- [ ] Atualizar todas as referências inconsistentes

#### **1.2. Padronizar Padrões de UX**

- [ ] Definir padrão único para upgrade messages
- [ ] Criar componente reutilizável para fallbacks
- [ ] Aplicar padrão consistente em todas as pages

### **Fase 2: Validação e Testes**

#### **2.1. Validar Estrutura da Sessão**

- [ ] Verificar como dados passam pelo `/api/auth`
- [ ] Confirmar estrutura de `session.company.plan.features`
- [ ] Documentar transformações necessárias

#### **2.2. Testes de Regressão**

- [ ] Testar cada page com FeatureGate
- [ ] Validar comportamento com diferentes planos
- [ ] Verificar fallbacks e upgrade flows

### **Fase 3: Migração para Nova API**

#### **3.1. Atualizar Hook**

- [ ] Adaptar `usePlanFeatures` para nova estrutura da API
- [ ] Manter compatibilidade backward
- [ ] Adicionar logging para debug

#### **3.2. Atualizar Interfaces**

- [ ] Criar interfaces TypeScript para nova estrutura
- [ ] Atualizar tipos de session se necessário
- [ ] Documentar mudanças de breaking changes

## 📝 Ações Específicas por Arquivo

### **Priority 1 - Features Inconsistentes**

#### `configuracoes/vendas/status-de-orcamento/page.tsx`

```diff
- features={['budget_status_full']}
+ features={['quotation_status_configuration']}
```

#### `financeiro/frente-de-caixa/page.tsx`

```diff
- features={['pdv']}
+ features={['pdv_screen']}
```

### **Priority 2 - Padronização de UX**

#### Criar `UpgradeFallback` Component

```tsx
// src/components/common/UpgradeFallback.tsx
export function UpgradeFallback({
  title,
  description,
  redirectTo = '/assinatura/contratar',
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <FeaturedIcon Icon={IconLock} />
      <h3>{title}</h3>
      <p>{description}</p>
      <Button asChild>
        <Link href={redirectTo}>Fazer Upgrade</Link>
      </Button>
    </div>
  )
}
```

#### Aplicar em todas as pages

```tsx
<FeatureGate
  features={['feature_name']}
  fallback={
    <UpgradeFallback
      title="Funcionalidade Bloqueada"
      description="Esta funcionalidade não está incluída no seu plano atual."
    />
  }
>
```

### **Priority 3 - Centralização de Features**

#### Criar Constants

```tsx
// src/consts/features.ts
export const FEATURES = {
  FINANCIAL: {
    ACCOUNTS_PAYABLE: 'accounts_payable',
    ACCOUNTS_RECEIVABLE: 'accounts_receivable',
    CASH_CONTROL: 'cash_control',
    PDV_SCREEN: 'pdv_screen',
  },
  SALES: {
    QUOTATION_STATUS: 'quotation_status_configuration',
    REJECTION_REASONS: 'quotation_rejection_reasons',
    QUICK_SALE: 'quotation_quick_sale',
  },
  // etc...
} as const
```

## ✅ Checklist de Implementação

### **Análise e Mapeamento**

- [x] Mapear todos os usos de FeatureGate
- [x] Mapear todos os usos de usePlanFeatures
- [x] Identificar features inconsistentes
- [x] Documentar padrões atuais

### **Padronização**

- [ ] Criar constantes de features centralizadas
- [ ] Criar componente UpgradeFallback reutilizável
- [ ] Corrigir features inconsistentes
- [ ] Aplicar padrão UX consistente

### **Validação**

- [ ] Verificar estrutura da sessão via `/api/auth`
- [ ] Testar comportamento com diferentes planos
- [ ] Validar todos os fallbacks e upgrade flows

### **Migração**

- [ ] Adaptar hook para nova estrutura da API
- [ ] Atualizar interfaces TypeScript
- [ ] Testar compatibilidade com nova API
- [ ] Documentar breaking changes

## 🔍 Arquivos de Referência

- **Hook**: `src/hooks/usePlanFeatures.ts`
- **Componente**: `src/components/common/FeatureGate.tsx`
- **Documentação**: `src/docs/plan-based-permissions-system.md`
- **API Auth**: `src/app/api/auth/[...nextauth]/route.ts`

---

_Plano criado em: ${new Date().toLocaleDateString('pt-BR')}_

## 📊 Resumo de Impacto

**Total de arquivos afetados:** ~30
**FeatureGate direto:** 6 arquivos
**usePlanFeatures:** 25+ arquivos
**Features únicas identificadas:** 15+
**Prioridade:** Alta (impacta UX do usuário final)
