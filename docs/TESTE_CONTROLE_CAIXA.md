# 🧪 Teste - Controle de Caixa

## 📋 Implementação Realizada

### ✅ **Modificações Feitas:**

1. **Página Controle de Caixa** (`src/app/(app-sidebar)/financeiro/controle-de-caixa/page.tsx`)
   - ✅ Adicionado `FeatureGate` com feature `cash_control`
   - ✅ Mantido `PermissionGate` existente para controle de usuário
   - ✅ Dupla validação: plano + permissão

2. **Switch "Controle de Caixa"** (`src/app/(app-sidebar)/configuracoes/financeiro/contas-bancarias/components/BankAccountsTable/NewBankAccount/index.tsx`)
   - ✅ Condicionalmente renderizado baseado em `hasFinancialModule('cash')`
   - ✅ Oculto para planos START/TRIAL
   - ✅ Visível apenas no plano LITE

### 🔧 **Lógica Implementada:**

```typescript
// Página de controle de caixa
<FeatureGate features={['cash_control']} showUpgradeMessage>
  <PermissionGate
    permissions={['financial:cash_control:view']}
    fallback={<div>Você não tem permissão...</div>}
  >
    <CashControl searchParams={searchParams} />
  </PermissionGate>
</FeatureGate>

// Switch em contas bancárias
const { hasFinancialModule } = usePlanFeatures()

{hasFinancialModule('cash') && (
  <FormSwitch<FormType>
    name="cashControl"
    label="Controle de Caixa"
    className="w-full"
  />
)}
```

## 🧪 **Cenários de Teste**

### **Cenário 1: Empresa com Plano LITE (Acesso Completo)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "LITE",
    "features": ["cash_control", ...]
  }
}
```

#### **Comportamento Esperado:**
1. **Página `/financeiro/controle-de-caixa`** → ✅ Funciona normalmente
2. **Switch "Controle de Caixa"** → ✅ Visível ao criar/editar conta bancária
3. **Funcionalidades completas** → ✅ Todas as features do controle de caixa

### **Cenário 2: Empresa com Plano START/TRIAL (Sem Acesso)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "START",
    "features": ["bank_accounts_limited", ...] // SEM cash_control
  }
}
```

#### **Comportamento Esperado:**
1. **Página `/financeiro/controle-de-caixa`** → ❌ Tela de upgrade
2. **Switch "Controle de Caixa"** → ❌ Oculto no formulário de conta bancária
3. **Experiência consistente** → ❌ Funcionalidade não disponível

## 🔍 **Como Testar**

### **Teste 1: Plano LITE**
1. **Login** com empresa LITE
2. **Navegar** para `/financeiro/controle-de-caixa` → Deve funcionar
3. **Ir para Configurações** → `/configuracoes/financeiro/contas-bancarias`
4. **Clicar "Nova conta"** → Switch "Controle de Caixa" deve estar visível
5. **Testar funcionalidades** → Controle de caixa deve funcionar normalmente

### **Teste 2: Plano START/TRIAL**
1. **Login** com empresa START/TRIAL
2. **Navegar** para `/financeiro/controle-de-caixa` → Tela de upgrade
3. **Ir para Configurações** → `/configuracoes/financeiro/contas-bancarias`
4. **Clicar "Nova conta"** → Switch "Controle de Caixa" deve estar oculto
5. **Verificar consistência** → Sem referências ao controle de caixa

### **Teste 3: Permissões de Usuário (LITE)**
1. **Empresa LITE** com usuário sem permissão `financial:cash_control:view`
2. **Navegar** para `/financeiro/controle-de-caixa`
3. **Resultado esperado** → "Você não tem permissão para acessar esta página"
4. **Switch ainda visível** → Porque empresa tem a feature, mas usuário sem permissão

## ✅ **Critérios de Sucesso**

### **Funcionalidade:**
1. ✅ `hasFinancialModule('cash')` retorna `true` apenas para LITE
2. ✅ Página de controle de caixa funciona no LITE
3. ✅ Página mostra upgrade no START/TRIAL
4. ✅ Switch oculto para planos sem a feature
5. ✅ Switch visível no plano LITE
6. ✅ Permissões de usuário ainda funcionam

### **UX/UI:**
7. ✅ Tela de upgrade bem formatada
8. ✅ Formulário não quebra sem o switch
9. ✅ Experiência consistente entre páginas
10. ✅ Não há erros JavaScript

## 🎯 **Impacto por Plano**

### **LITE (Controle Total):**
- ✅ **Página de controle de caixa** acessível
- ✅ **Switch visível** em contas bancárias
- ✅ **Funcionalidade completa** de controle de caixa
- ✅ **Controle granular** por usuário via permissões

### **START/TRIAL (Bloqueado):**
- ❌ **Página bloqueada** com tela de upgrade
- ❌ **Switch oculto** para evitar confusão
- ❌ **Funcionalidade não disponível**
- 💡 **Incentivo para upgrade** através da limitação

## 🔗 **Integração com Outras Features**

### **Features Relacionadas:**
- `accounts_payable` - Contas a pagar (já implementado)
- `accounts_receivable` - Contas a receber (já implementado)
- `pdv` - Frente de caixa/PDV (próximo)
- `bank_accounts_limited` vs `bank_accounts_full` - Contas bancárias

### **Consistência:**
- Todas as funcionalidades financeiras seguem o mesmo padrão
- FeatureGate + PermissionGate para dupla validação
- UX consistente com telas de upgrade elegantes

## 🐛 **Debug e Verificação**

### **Console do Navegador:**
```javascript
// Verificar feature de controle de caixa
const { hasFinancialModule } = usePlanFeatures()
console.log('Has cash control:', hasFinancialModule('cash'))

// Verificar features da empresa
console.log('Company features:', session?.company?.plan?.features)
console.log('Has cash_control feature:', session?.company?.plan?.features?.includes('cash_control'))
```

### **Elementos no DOM:**
- **LITE**: Switch deve existir no DOM
- **START/TRIAL**: Switch NÃO deve existir no DOM
- **Formulário**: Deve manter estrutura correta sem o switch

## 📌 **Observações Importantes**

### **Diferença de Comportamento:**
- **Controle de Caixa**: Funcionalidade completamente bloqueada nos planos limitados
- **Contas Bancárias**: Ainda funcionam, mas com limitações (sem controle de caixa)

### **Impacto no Formulário:**
- Switch oculto não quebra a estrutura do formulário
- Valores padrão são mantidos quando switch não está presente
- Validação do formulário continua funcionando

## 🎯 **Resultado Esperado**

Após esta implementação:

- **LITE**: Controle total sobre caixa, incluindo configuração em contas bancárias
- **START/TRIAL**: Funcionalidade bloqueada com incentivo para upgrade
- **Consistência**: Comportamento alinhado com outras features financeiras
- **Segurança**: Dupla validação (plano + permissão) mantida 