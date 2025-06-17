# 🧪 Teste - Controle de Módulos Financeiros (A Pagar e A Receber)

## 📋 Implementação Realizada

### ✅ **Modificações Feitas:**

1. **Hook `usePlanFeatures` atualizado** (`src/hooks/usePlanFeatures.ts`)
   - ✅ Adicionado método `hasFinancialModule()`
   - ✅ Controla acesso aos módulos: 'receivable', 'payable', 'cash', 'pdv', 'credit_limit'

2. **Página A Pagar modificada** (`src/app/(app-sidebar)/financeiro/a-pagar/page.tsx`)
   - ✅ Substituído `PermissionGate` por `FeatureGate`
   - ✅ Controle baseado na feature `accounts_payable`
   - ✅ Tela de upgrade automática para planos sem acesso

3. **Página A Receber modificada** (`src/app/(app-sidebar)/financeiro/a-receber/page.tsx`)
   - ✅ Substituído `PermissionGate` por `FeatureGate`
   - ✅ Controle baseado na feature `accounts_receivable`
   - ✅ Tela de upgrade automática para planos sem acesso

### 🔧 **Lógica Implementada:**

```typescript
// Hook usePlanFeatures
const hasFinancialModule = (
  module: 'receivable' | 'payable' | 'cash' | 'pdv' | 'credit_limit',
) => {
  const moduleMap = {
    receivable: 'accounts_receivable',
    payable: 'accounts_payable',
    cash: 'cash_control',
    pdv: 'pdv',
    credit_limit: 'credit_limit',
  }
  return hasFeature(moduleMap[module])
}

// Uso nas páginas
<FeatureGate features={['accounts_payable']} showUpgradeMessage>
  <Transactions searchParams={searchParams} type="payable" />
</FeatureGate>

<FeatureGate features={['accounts_receivable']} showUpgradeMessage>
  <Transactions searchParams={searchParams} type="receivable" />
</FeatureGate>
```

## 🧪 **Cenários de Teste**

### **Cenário 1: Empresa com Plano LITE (Acesso Completo)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "LITE",
    "features": ["accounts_receivable", "accounts_payable", ...]
  }
}
```

#### **Comportamento Esperado:**
- ✅ `/financeiro/a-pagar` - Funciona normalmente
- ✅ `/financeiro/a-receber` - Funciona normalmente

### **Cenário 2: Empresa com Plano START/TRIAL (Sem Acesso)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "START",
    "features": ["bank_accounts_limited", ...] // SEM accounts_receivable/payable
  }
}
```

#### **Comportamento Esperado:**
- ❌ `/financeiro/a-pagar` - Tela de upgrade
- ❌ `/financeiro/a-receber` - Tela de upgrade

## 🔍 **Como Testar**

### **Teste 1: Plano LITE**
1. Login com empresa LITE
2. Navegar para `/financeiro/a-pagar` → Deve funcionar
3. Navegar para `/financeiro/a-receber` → Deve funcionar

### **Teste 2: Plano START/TRIAL**
1. Login com empresa START/TRIAL
2. Navegar para `/financeiro/a-pagar` → Tela de upgrade
3. Navegar para `/financeiro/a-receber` → Tela de upgrade

## 🐛 **Debug e Verificação**

### **Console do Navegador:**
```javascript
// Verificar features disponíveis
console.log('Features:', session?.company?.plan?.features)

// Verificar acesso aos módulos financeiros
const { hasFinancialModule } = usePlanFeatures()
console.log('Can access payable:', hasFinancialModule('payable'))
console.log('Can access receivable:', hasFinancialModule('receivable'))

// Verificar features específicas
console.log('Has accounts_payable:', session?.company?.plan?.features?.includes('accounts_payable'))
console.log('Has accounts_receivable:', session?.company?.plan?.features?.includes('accounts_receivable'))
```

### **Developer Tools:**
- **Network**: Verificar se não há chamadas desnecessárias quando bloqueado
- **Elements**: Verificar se FeatureGate renderiza tela de upgrade corretamente
- **Application**: Verificar dados da sessão e features

## ✅ **Critérios de Sucesso**

1. ✅ `hasFinancialModule('payable')` retorna `true` apenas para LITE
2. ✅ `hasFinancialModule('receivable')` retorna `true` apenas para LITE
3. ✅ Páginas carregam normalmente no plano LITE
4. ✅ Páginas mostram tela de upgrade nos planos START/TRIAL
5. ✅ Tela de upgrade tem design adequado
6. ✅ Não há erros de JavaScript

## 🎯 **Resultado Esperado**

- **LITE**: Acesso total aos módulos financeiros
- **START/TRIAL**: Módulos bloqueados com incentivo para upgrade

## 🎯 **Checklist de Validação**

### **Hook usePlanFeatures:**
- [ ] Método `hasFinancialModule()` funciona corretamente
- [ ] Retorna `true`/`false` baseado nas features do plano
- [ ] Suporta todos os módulos mapeados

### **Página A Pagar:**
- [ ] FeatureGate aplicado corretamente
- [ ] Tela de upgrade aparece para planos sem acesso
- [ ] Funciona normalmente no plano LITE
- [ ] Não há erros de JavaScript

### **Página A Receber:**
- [ ] FeatureGate aplicado corretamente
- [ ] Tela de upgrade aparece para planos sem acesso
- [ ] Funciona normalmente no plano LITE
- [ ] Não há erros de JavaScript

### **Integração:**
- [ ] Não afeta outras funcionalidades
- [ ] Menu de navegação se adapta adequadamente
- [ ] Performance não é prejudicada
- [ ] Experiência do usuário é consistente

---

## 🎉 **Resultado Esperado**

Após implementar este controle:

- ✅ **Plano LITE**: Acesso total aos módulos de contas a pagar e a receber
- ❌ **Planos START/TRIAL**: Módulos bloqueados com tela de upgrade elegante  
- 📈 **Conversão**: Incentivo claro para upgrade através da limitação funcional
- 🎯 **UX**: Experiência diferenciada baseada no valor do plano

Este teste garante que o controle financeiro seja um diferencial claro entre os planos! 🚀 