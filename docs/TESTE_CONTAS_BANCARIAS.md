# 🧪 Teste - Contas Bancárias

## 📋 Implementação Realizada

### ✅ **Modificações Feitas:**

1. **Hook `usePlanFeatures` atualizado** (`src/hooks/usePlanFeatures.ts`)
   - ✅ Adicionado método `getBankAccountsType()`
   - ✅ Retorna `'full'` para LITE, `'limited'` para START/TRIAL

2. **Componente BankAccounts** (`src/app/(app-sidebar)/configuracoes/financeiro/contas-bancarias/components/BankAccounts.tsx`)
   - ✅ Botão "Nova conta" condicionalmente renderizado
   - ✅ Oculto para planos START/TRIAL
   - ✅ Visível apenas no plano LITE

3. **Componente BankAccountsData** (`src/app/(app-sidebar)/configuracoes/financeiro/contas-bancarias/components/BankAccountsTable/BankAccountsData.tsx`)
   - ✅ CTA na tela vazia condicionalmente renderizado
   - ✅ Mensagem adaptada baseada no plano
   - ✅ Botão de criação oculto para planos limitados

### 🔧 **Lógica Implementada:**

```typescript
// Hook usePlanFeatures
const getBankAccountsType = () => {
  if (hasFeature('bank_accounts_full')) return 'full'      // LITE
  if (hasFeature('bank_accounts_limited')) return 'limited' // START/TRIAL
  return 'none'
}

// Uso nos componentes
const { getBankAccountsType } = usePlanFeatures()
const canCreateBankAccount = getBankAccountsType() === 'full'

// Botão Nova conta (Topbar)
primaryCta={
  canCreateBankAccount ? (
    <PermissionGate permissions={['financial_settings:bank_accounts:create']}>
      <NewBankAccountDialog searchParams={searchParams} />
    </PermissionGate>
  ) : undefined
}

// CTA na tela vazia
cta={
  canCreateBankAccount ? (
    <NewBankAccountDialog searchParams={searchParams} />
  ) : undefined
}
```

## 🧪 **Cenários de Teste**

### **Cenário 1: Empresa com Plano LITE (Acesso Completo)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "LITE",
    "features": ["bank_accounts_full", ...]
  }
}
```

#### **Comportamento Esperado:**
1. **Botão "Nova conta"** → ✅ Visível no Topbar
2. **Funcionalidades completas** → ✅ Criar, editar, excluir contas
3. **Tela vazia** → ✅ Mostra CTA "Cadastre sua primeira conta"
4. **Edição de contas** → ✅ Funciona normalmente (incluindo switch Controle de Caixa se disponível)

### **Cenário 2: Empresa com Plano START/TRIAL (Limitado)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "START",
    "features": ["bank_accounts_limited", ...]
  }
}
```

#### **Comportamento Esperado:**
1. **Botão "Nova conta"** → ❌ Oculto no Topbar
2. **Visualização** → ✅ Pode ver contas existentes
3. **Edição** → ✅ Pode editar contas existentes (via permissões)
4. **Exclusão** → ✅ Pode excluir contas (via permissões)
5. **Tela vazia** → ❌ Sem CTA, mensagem "Nenhuma conta bancária cadastrada"

## 🔍 **Como Testar**

### **Teste 1: Plano LITE**
1. Login com empresa LITE
2. Navegar para `/configuracoes/financeiro/contas-bancarias`
3. Verificar botão "Nova conta" presente no Topbar
4. Testar criação de conta

### **Teste 2: Plano START/TRIAL**
1. Login com empresa START/TRIAL
2. Navegar para `/configuracoes/financeiro/contas-bancarias`
3. Verificar botão "Nova conta" ausente no Topbar
4. Se tela vazia, verificar mensagem sem CTA

## ✅ **Critérios de Sucesso**

1. ✅ `getBankAccountsType()` retorna valores corretos por plano
2. ✅ Botão "Nova conta" oculto para planos limitados
3. ✅ CTA na tela vazia adaptado por plano
4. ✅ Edição de contas continua funcionando
5. ✅ Visualização de contas não é afetada

## 🎯 **Resultado Esperado**

- **LITE**: Gestão completa de contas bancárias
- **START/TRIAL**: Visualização e edição, mas sem criação de novas contas
- **Estratégia**: Limitação de crescimento incentiva upgrade sem quebrar operações existentes

## 📊 **Resumo de Contas Bancárias**

| Funcionalidade | LITE | START/TRIAL |
|---------------|------|-------------|
| Visualizar contas | ✅ | ✅ |
| Editar contas | ✅ | ✅ (permissão) |
| Excluir contas | ✅ | ✅ (permissão) |
| **Criar contas** | **✅** | **❌ Limitado** |
| Controle de caixa | ✅ (se disponível) | ❌ Oculto |

A gestão bancária agora tem **controle equilibrado baseado em planos**! 🎯 