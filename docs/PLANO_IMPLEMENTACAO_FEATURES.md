# Plano de Implementação - Controle de Features por Plano

## 1. Análise da Tabela de Features

### Módulos Identificados e Distribuição por Planos

#### **Empresas e Sistemas**
- **Lite (5 usuários)**: 
  - ✅ 5 usuários máximo
  - ✅ Cadastro de CNPJs adicionais
  - ✅ Setores

- **Start/Trial (3 usuários)**:
  - ✅ 3 usuários máximo
  - ❌ Cadastro de CNPJs adicionais (bloqueado)
  - ❌ Setores (bloqueado)

#### **Vendas**
- **Lite**: 
  - ✅ Ordens de serviço completo
  - ✅ Venda rápida
  - ✅ Motivos de rejeição e cancelamento completo
  - ✅ Status de orçamentos completo

- **Start/Trial**:
  - ✅ Ordens de serviço (ocultar coluna "Fase atual")
  - ❌ Venda rápida (bloqueado)
  - ✅ Motivos de rejeição e cancelamento (limitações: ocultar configuração, não exibir modais de rejeição/cancelamento)
  - ✅ Status de orçamentos (limitações: ocultar configuração e coluna "Status")

#### **Produção**
- **Lite**: ✅ Agenda de entrega completa
- **Start/Trial**: ✅ Agenda de entrega (limitações: ocultar abas "Produção" e "Todos os ativos", apenas botão "Finalizar serviço")

#### **Financeiro**
- **Lite**:
  - ✅ A receber
  - ✅ A pagar  
  - ✅ Controle de caixa
  - ✅ PDV
  - ✅ Bancos e contas
  - ✅ Repasse de taxas bancárias
  - ✅ Limite de crédito

- **Start/Trial**:
  - ❌ A receber (bloqueado)
  - ❌ A pagar (bloqueado)
  - ❌ Controle de caixa (bloqueado, ocultar switch "Controle de caixa", movimentações no caixa "Empresa")
  - ❌ PDV (bloqueado)
  - ✅ Bancos e contas (limitações: ocultar botão "Nova conta")
  - ✅ Repasse de taxas bancárias (limitações: desabilitar campos "Taxa operadora" e "Repasse da taxa")
  - ❌ Limite de crédito (bloqueado)

#### **Produtos**
- **Lite**: 
  - ✅ Cadastro de produtos completo
  - ✅ Etapas de produção completas

- **Start/Trial**: 
  - ✅ Cadastro de produtos (limitações: ocultar botão "Adicionar composição")
  - ✅ Etapas de produção (limitações: ocultar seção "Etapas de produção")

#### **Cadastros**
- **Lite**:
  - ✅ Clientes completo
  - ✅ Fornecedores completo

- **Start/Trial**:
  - ✅ Clientes (limitações: ocultar abas "Orçamentos", "Ordens de serviço" e "Financeiro")
  - ✅ Fornecedores (limitações: ocultar abas "Orçamentos", "Ordens de serviço" e "Financeiro")

## 2. Mapeamento de Features para o Sistema

### Features Principais Identificadas

```typescript
const PLAN_FEATURES = {
  // Limitações de usuários
  'user_limit_5': ['LITE'], 
  'user_limit_3': ['START', 'TRIAL'], 
  
  // Empresas e Sistemas
  'additional_cnpj': ['LITE'], // CNPJs adicionais
  'sectors_management': ['LITE'], // Setores
  
  // Vendas
  'sales_orders_full': ['LITE'], // Ordens de serviço completas
  'sales_orders_limited': ['START', 'TRIAL'], // Ordens de serviço sem coluna "Fase atual"
  'quick_sale': ['LITE'], // Venda rápida
  'rejection_reasons_full': ['LITE'], // Motivos de rejeição completos
  'rejection_reasons_limited': ['START', 'TRIAL'], // Motivos limitados
  'budget_status_full': ['LITE'], // Status de orçamentos completo
  'budget_status_limited': ['START', 'TRIAL'], // Status limitado
  
  // Produção
  'delivery_schedule_full': ['LITE'], // Agenda de entrega completa
  'delivery_schedule_limited': ['START', 'TRIAL'], // Agenda limitada
  
  // Financeiro
  'accounts_receivable': ['LITE'], // A receber
  'accounts_payable': ['LITE'], // A pagar
  'cash_control': ['LITE'], // Controle de caixa
  'pdv': ['LITE'], // PDV
  'bank_accounts_full': ['LITE'], // Bancos e contas completo
  'bank_accounts_limited': ['START', 'TRIAL'], // Bancos limitado
  'bank_tax_transfer_full': ['LITE'], // Repasse de taxas completo
  'bank_tax_transfer_limited': ['START', 'TRIAL'], // Repasse limitado
  'credit_limit': ['LITE'], // Limite de crédito
  
  // Produtos
  'products_full': ['LITE'], // Cadastro de produtos completo
  'products_limited': ['START', 'TRIAL'], // Produtos sem composição
  'production_stages_full': ['LITE'], // Etapas de produção completas
  'production_stages_limited': ['START', 'TRIAL'], // Etapas limitadas
  
  // Cadastros
  'clients_full': ['LITE'], // Clientes completo
  'clients_limited': ['START', 'TRIAL'], // Clientes sem abas financeiras
  'suppliers_full': ['LITE'], // Fornecedores completo
  'suppliers_limited': ['START', 'TRIAL'], // Fornecedores sem abas financeiras
}
```

## 3. Responsabilidades

### 3.1 Backend

#### **Responsabilidades Principais:**
1. **Configuração de Features por Plano**
2. **Estrutura de Dados**
3. **Endpoints de Validação**
4. **Base de Dados**

### 3.2 Frontend

#### **Responsabilidades Principais:**
1. **Controle de Renderização**
2. **Validação de Acesso**
3. **Gestão de Estado**

## 4. Plano de Implementação Frontend

### 4.1 Fase 1: Preparação da Infraestrutura (1-2 dias)

#### **Extensão do Hook `usePlanFeatures`**
```typescript
export function usePlanFeatures() {
  const { data: session } = useSession()

  const hasFeature = (feature: string) => {
    if (!session?.company?.plan?.features) return false
    return session.company.plan.features.includes(feature)
  }

  const getUserLimit = () => {
    if (hasFeature('user_limit_5')) return 5
    if (hasFeature('user_limit_3')) return 3
    return 0
  }

  // Empresas e Sistemas
  const canManageAdditionalCNPJ = () => hasFeature('additional_cnpj')
  const canManageSectors = () => hasFeature('sectors_management')

  // Vendas
  const getSalesOrdersType = () => {
    if (hasFeature('sales_orders_full')) return 'full'
    if (hasFeature('sales_orders_limited')) return 'limited'
    return 'none'
  }
  
  const canUseQuickSale = () => hasFeature('quick_sale')
  
  const getRejectionReasonsType = () => {
    if (hasFeature('rejection_reasons_full')) return 'full'
    if (hasFeature('rejection_reasons_limited')) return 'limited'
    return 'none'
  }

  const getBudgetStatusType = () => {
    if (hasFeature('budget_status_full')) return 'full'
    if (hasFeature('budget_status_limited')) return 'limited'
    return 'none'
  }

  // Produção
  const getDeliveryScheduleType = () => {
    if (hasFeature('delivery_schedule_full')) return 'full'
    if (hasFeature('delivery_schedule_limited')) return 'limited'
    return 'none'
  }

  // Financeiro
  const hasFinancialModule = (module: 'receivable' | 'payable' | 'cash' | 'pdv' | 'credit_limit') => {
    const moduleMap = {
      receivable: 'accounts_receivable',
      payable: 'accounts_payable', 
      cash: 'cash_control',
      pdv: 'pdv',
      credit_limit: 'credit_limit'
    }
    return hasFeature(moduleMap[module])
  }

  const getBankAccountsType = () => {
    if (hasFeature('bank_accounts_full')) return 'full'
    if (hasFeature('bank_accounts_limited')) return 'limited'
    return 'none'
  }

  const getBankTaxTransferType = () => {
    if (hasFeature('bank_tax_transfer_full')) return 'full'
    if (hasFeature('bank_tax_transfer_limited')) return 'limited'
    return 'none'
  }

  // Produtos
  const getProductsType = () => {
    if (hasFeature('products_full')) return 'full'
    if (hasFeature('products_limited')) return 'limited'
    return 'none'
  }

  const getProductionStagesType = () => {
    if (hasFeature('production_stages_full')) return 'full'
    if (hasFeature('production_stages_limited')) return 'limited'
    return 'none'
  }

  // Cadastros
  const getClientsType = () => {
    if (hasFeature('clients_full')) return 'full'
    if (hasFeature('clients_limited')) return 'limited'
    return 'none'
  }

  const getSuppliersType = () => {
    if (hasFeature('suppliers_full')) return 'full'
    if (hasFeature('suppliers_limited')) return 'limited'
    return 'none'
  }

  return {
    hasFeature,
    hasAnyFeature,
    hasAllFeatures,
    getUserLimit,
    // Empresas e Sistemas
    canManageAdditionalCNPJ,
    canManageSectors,
    // Vendas
    getSalesOrdersType,
    canUseQuickSale,
    getRejectionReasonsType,
    getBudgetStatusType,
    // Produção
    getDeliveryScheduleType,
    // Financeiro
    hasFinancialModule,
    getBankAccountsType,
    getBankTaxTransferType,
    // Produtos
    getProductsType,
    getProductionStagesType,
    // Cadastros
    getClientsType,
    getSuppliersType,
  }
}
```

#### **Criação do Componente `FeatureGate`**
```typescript
interface FeatureGateProps {
  features: string[]
  requireAll?: boolean
  showUpgradeMessage?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function FeatureGate({
  features,
  requireAll = false,
  showUpgradeMessage = false,
  fallback,
  children
}: FeatureGateProps) {
  const { hasFeature, hasAllFeatures, hasAnyFeature } = usePlanFeatures()
  
  const hasAccess = requireAll 
    ? hasAllFeatures(features)
    : hasAnyFeature(features)

  if (hasAccess) {
    return <>{children}</>
  }

  if (showUpgradeMessage) {
    return <UpgradeMessage />
  }

  return fallback ? <>{fallback}</> : null
}
```

### 4.2 Fase 2: Implementação Módulo Empresas (2-3 dias)

#### **Implementações Práticas de Exemplo**

```typescript
// Exemplo 1: Controle de CNPJs Adicionais
export function AdditionalCNPJSection() {
  const { canManageAdditionalCNPJ } = usePlanFeatures()
  
  if (!canManageAdditionalCNPJ()) {
    return (
      <div className="opacity-50">
        <p>CNPJs adicionais disponível apenas no plano Lite</p>
        <Button disabled>Adicionar CNPJ</Button>
      </div>
    )
  }
  
  return <AddCNPJForm />
}

// Exemplo 2: Venda Rápida
export function QuickSaleButton() {
  const { canUseQuickSale } = usePlanFeatures()
  
  return (
    <FeatureGate features={['quick_sale']} showUpgradeMessage>
      <Button>Venda Rápida</Button>
    </FeatureGate>
  )
}

// Exemplo 3: Ordens de Serviço com Limitações
export function ServiceOrdersTable() {
  const { getSalesOrdersType } = usePlanFeatures()
  const orderType = getSalesOrdersType()
  
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          {orderType === 'full' && <th>Fase Atual</th>}
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {/* dados da tabela */}
      </tbody>
    </table>
  )
}

// Exemplo 4: Módulos Financeiros
export function FinancialModules() {
  const { hasFinancialModule } = usePlanFeatures()
  
  return (
    <div>
      {hasFinancialModule('receivable') ? (
        <ModuleCard title="A Receber" href="/financial/receivable" />
      ) : (
        <BlockedModuleCard title="A Receber" plan="LITE" />
      )}
      
      {hasFinancialModule('payable') ? (
        <ModuleCard title="A Pagar" href="/financial/payable" />
      ) : (
        <BlockedModuleCard title="A Pagar" plan="LITE" />
      )}
    </div>
  )
}
```

### 4.3 Fase 3: Implementação Módulo Financeiro (3-4 dias)

#### **Navegação Financeira**
```typescript
export function FinancialNavigation() {
  return (
    <nav>
      <NavItem href="/financial/flow">Fluxo Financeiro</NavItem>
      
      <FeatureGate features={['accounts_receivable']}>
        <NavItem href="/financial/receivable">A Receber</NavItem>
      </FeatureGate>
      
      <FeatureGate features={['accounts_payable']}>
        <NavItem href="/financial/payable">A Pagar</NavItem>
      </FeatureGate>
      
      <FeatureGate features={['cash_control']}>
        <NavItem href="/financial/cash">Controle de Caixa</NavItem>
      </FeatureGate>
      
      <FeatureGate features={['bank_accounts']}>
        <NavItem href="/financial/banks">Bancos e Contas</NavItem>
      </FeatureGate>
    </nav>
  )
}
```

### 4.4 Fase 4: Controle de Usuários (2 dias)

#### **Verificação de Limite de Usuários**
```typescript
export function AddUserButton() {
  const { getUserLimit } = usePlanFeatures()
  const currentUserCount = useUserCount()
  
  const canAddUser = currentUserCount < getUserLimit()
  
  if (!canAddUser) {
    return (
      <Button disabled title={`Limite de ${getUserLimit()} usuários atingido`}>
        Adicionar Usuário
      </Button>
    )
  }
  
  return <Button>Adicionar Usuário</Button>
}
```

## 5. Cronograma de Implementação

### **Semana 1:**
- **Dias 1-2**: Preparação da infraestrutura
- **Dias 3-5**: Implementação módulo Empresas

### **Semana 2:**
- **Dias 1-4**: Implementação módulo Financeiro
- **Dia 5**: Testes e ajustes

### **Semana 3:**
- **Dias 1-2**: Implementação módulo Produtos
- **Dias 3-4**: Controle de usuários
- **Dia 5**: Mensagens de upgrade

## 6. Considerações Técnicas

### **Performance:**
- Cache das features na sessão do usuário
- Evitar re-renderizações desnecessárias
- Lazy loading de componentes premium

### **UX/UI:**
- Mensagens claras sobre limitações
- Call-to-action para upgrade
- Fallbacks elegantes para features indisponíveis

### **Segurança:**
- Validação dupla (frontend + backend)
- Logs de tentativas de acesso não autorizado

## 7. Métricas de Sucesso

### **KPIs a Monitorar:**
- Taxa de conversão para planos superiores
- Tentativas de acesso a features premium
- Satisfação do usuário com limitações
- Performance do sistema após implementação

Este plano garante uma implementação robusta e escalável do sistema de controle de features, mantendo a simplicidade do hook `usePlanFeatures` existente e expandindo suas capacidades conforme necessário. 