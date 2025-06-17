# 🧪 Teste - Abas de Clientes e Fornecedores

## 📋 Implementação Realizada

### ✅ **Modificações Feitas:**

1. **Hook `usePlanFeatures` atualizado** (`src/hooks/usePlanFeatures.ts`)
   - ✅ Adicionado método `getClientsType()`
   - ✅ Adicionado método `getSuppliersType()`
   - ✅ Retorna `'full'` para LITE, `'limited'` para START/TRIAL

2. **Layout de Clientes** (`src/app/(app-sidebar)/cadastros/clientes/[id]/layout.tsx`)
   - ✅ Abas "Orçamentos", "Ordens de serviço" e "Financeiro" condicionalmente renderizadas
   - ✅ Aba "Cadastro" sempre visível
   - ✅ Controle baseado em `getClientsType()`

3. **Layout de Fornecedores** (`src/app/(app-sidebar)/cadastros/fornecedores/[id]/layout.tsx`)
   - ✅ Abas "Orçamentos", "Ordens de serviço" e "Financeiro" condicionalmente renderizadas
   - ✅ Aba "Cadastro" sempre visível
   - ✅ Controle baseado em `getSuppliersType()`

### 🔧 **Lógica Implementada:**

```typescript
// Hook usePlanFeatures
const getClientsType = () => {
  if (hasFeature('clients_full')) return 'full'      // LITE
  if (hasFeature('clients_limited')) return 'limited' // START/TRIAL
  return 'none'
}

const getSuppliersType = () => {
  if (hasFeature('suppliers_full')) return 'full'      // LITE
  if (hasFeature('suppliers_limited')) return 'limited' // START/TRIAL
  return 'none'
}

// Uso nos layouts
const { getClientsType } = usePlanFeatures()
const showAdvancedTabs = getClientsType() === 'full'

const allTabs = [
  { tab: 'cadastro', label: 'Cadastro' },           // Sempre visível
  { tab: 'orcamentos', label: 'Orçamentos' },       // LITE only
  { tab: 'ordens', label: 'Ordens de serviço' },    // LITE only
  { tab: 'financeiro', label: 'Financeiro' },       // LITE only
]

const tabs = showAdvancedTabs
  ? allTabs
  : allTabs.filter((tab) => tab.tab === 'cadastro')
```

## 🧪 **Cenários de Teste**

### **Cenário 1: Empresa com Plano LITE (Acesso Completo)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "LITE",
    "features": ["clients_full", "suppliers_full", ...]
  }
}
```

#### **Comportamento Esperado:**
1. **Abas de Clientes** → ✅ Todas as 4 abas visíveis
   - Cadastro, Orçamentos, Ordens de serviço, Financeiro
2. **Abas de Fornecedores** → ✅ Todas as 4 abas visíveis
   - Cadastro, Orçamentos, Ordens de serviço, Financeiro
3. **Contadores** → ✅ Badges com contagem funcionam normalmente
4. **Navegação** → ✅ Pode acessar todas as abas

### **Cenário 2: Empresa com Plano START/TRIAL (Limitado)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "START",
    "features": ["clients_limited", "suppliers_limited", ...]
  }
}
```

#### **Comportamento Esperado:**
1. **Abas de Clientes** → ❌ Apenas aba "Cadastro" visível
2. **Abas de Fornecedores** → ❌ Apenas aba "Cadastro" visível
3. **Abas ocultas** → ❌ Orçamentos, Ordens de serviço, Financeiro não aparecem
4. **URL direta** → ❌ Tentativa de acesso direto a abas ocultas deve ser tratada

## 🔍 **Como Testar**

### **Teste 1: Plano LITE (Completo)**
1. **Login** com empresa LITE
2. **Navegar** para `/cadastros/clientes` → selecionar um cliente
3. **Verificar abas**:
   - ✅ "Cadastro" presente
   - ✅ "Orçamentos" presente (com contador se houver)
   - ✅ "Ordens de serviço" presente (com contador se houver)
   - ✅ "Financeiro" presente
4. **Testar navegação** → Todas as abas devem funcionar
5. **Repetir para fornecedores** → `/cadastros/fornecedores`

### **Teste 2: Plano START/TRIAL (Limitado)**
1. **Login** com empresa START/TRIAL
2. **Navegar** para `/cadastros/clientes` → selecionar um cliente
3. **Verificar abas**:
   - ✅ "Cadastro" presente e funcional
   - ❌ "Orçamentos" NÃO deve aparecer
   - ❌ "Ordens de serviço" NÃO deve aparecer
   - ❌ "Financeiro" NÃO deve aparecer
4. **Testar acesso direto** → URLs como `/clientes/123/orcamentos` devem ser tratadas
5. **Repetir para fornecedores** → `/cadastros/fornecedores`

### **Teste 3: Comportamento de URLs**
1. **Plano LITE** → Todas as URLs de abas devem funcionar
2. **Plano START/TRIAL** → URLs de abas limitadas devem:
   - Redirecionar para "Cadastro"
   - Mostrar mensagem de limitação
   - Ou retornar 404 (dependendo da implementação)

## ✅ **Critérios de Sucesso**

### **Funcionalidade:**
1. ✅ `getClientsType()` retorna valores corretos por plano
2. ✅ `getSuppliersType()` retorna valores corretos por plano
3. ✅ Abas limitadas ocultas para planos START/TRIAL
4. ✅ Aba "Cadastro" sempre visível
5. ✅ Contadores de abas funcionam quando visíveis
6. ✅ Layout das abas não quebra

### **UX/UI:**
7. ✅ TabsList adapta-se ao número de abas
8. ✅ Não há espaços em branco onde abas foram removidas
9. ✅ Navegação por abas funciona corretamente
10. ✅ Experiência consistente entre clientes e fornecedores

## 🎯 **Impacto por Plano**

### **LITE (Acesso Total):**
- ✅ **Gestão completa** de clientes e fornecedores
- ✅ **Acesso a orçamentos** vinculados
- ✅ **Controle de ordens** de serviço
- ✅ **Gestão financeira** integrada

### **START/TRIAL (Limitado):**
- ✅ **Cadastro básico** mantido
- ❌ **Sem integração comercial** (orçamentos/ordens)
- ❌ **Sem controle financeiro** integrado
- 💡 **Incentivo para upgrade** (funcionalidades comerciais limitadas)

## 🔗 **Diferencial Comercial**

### **Limitações Estratégicas:**
- **Orçamentos**: Sem visibilidade do histórico comercial
- **Ordens de serviço**: Sem controle de trabalhos realizados
- **Financeiro**: Sem gestão de contas a receber/pagar por cliente

### **Funcionalidades Preservadas:**
- **Cadastro**: Informações básicas de contato
- **Edição**: Capacidade de manter dados atualizados
- **Consulta**: Visualização de informações essenciais

## 🐛 **Debug e Verificação**

### **Console do Navegador:**
```javascript
// Verificar tipos de acesso
const { getClientsType, getSuppliersType } = usePlanFeatures()
console.log('Clients type:', getClientsType())
console.log('Suppliers type:', getSuppliersType())

// Verificar features da empresa
console.log('Company features:', session?.company?.plan?.features)
console.log('Has clients_full:', session?.company?.plan?.features?.includes('clients_full'))
console.log('Has suppliers_full:', session?.company?.plan?.features?.includes('suppliers_full'))
```

### **Elementos no DOM:**
- **LITE**: 4 abas devem existir no TabsList
- **START/TRIAL**: Apenas 1 aba (Cadastro) deve existir
- **Layout**: TabsList deve manter estrutura correta

## 📌 **Observações Importantes**

### **Estratégia de Limitação:**
- **Não bloqueia cadastro**: Funcionalidade básica preservada
- **Remove integrações**: Impede workflows comerciais avançados
- **Incentivo sutil**: Limitação percebida ao tentar usar integração

### **Impacto Operacional:**
- **Empresas START/TRIAL**: Cadastro básico, sem histórico comercial
- **Empresas LITE**: Gestão integrada completa
- **Migração**: Ao fazer upgrade, abas aparecem automaticamente

## 🚀 **Integração com Sistema**

### **Módulos Relacionados:**
- **Orçamentos**: Depende das abas estarem visíveis
- **Ordens de serviço**: Integração limitada por plano
- **Financeiro**: Conexão com contas a receber/pagar

### **Consistência:**
- Mesmo padrão de outras implementações
- Controle baseado em features do plano
- UX coerente com limitações comerciais

## 🎯 **Resultado Esperado**

Após esta implementação:

- **LITE**: Gestão integrada completa de clientes e fornecedores
- **START/TRIAL**: Cadastro básico sem integrações comerciais
- **Diferencial claro**: Workflows comerciais incentivam upgrade
- **Operação preservada**: Funcionalidade essencial mantida

## 📊 **Resumo de Abas**

| Aba | LITE | START/TRIAL | Impacto |
|-----|------|-------------|---------|
| **Cadastro** | ✅ | ✅ | Sempre disponível |
| **Orçamentos** | ✅ | ❌ | Histórico comercial |
| **Ordens de serviço** | ✅ | ❌ | Controle de trabalhos |
| **Financeiro** | ✅ | ❌ | Gestão de recebíveis |

As abas de clientes e fornecedores agora têm **controle estratégico baseado em planos**! 🎯 