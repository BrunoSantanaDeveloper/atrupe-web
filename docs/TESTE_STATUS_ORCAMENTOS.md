# 🧪 Teste - Controle de Status de Orçamentos

## 📋 Implementação Realizada

### ✅ **Modificações Feitas:**

1. **Hook `usePlanFeatures` atualizado** (`src/hooks/usePlanFeatures.ts`)
   - ✅ Adicionado método `getBudgetStatusType()`
   - ✅ Retorna `'full'` para LITE, `'limited'` para START/TRIAL

2. **Lista de Configurações de Vendas modificada** (`src/app/(app-sidebar)/configuracoes/vendas/components/SalesSettingsClient.tsx`)
   - ✅ Item "Status de orçamento" condicionalmente renderizado
   - ✅ Usa spread operator para incluir/excluir baseado na feature

3. **Página de Status de Orçamento protegida** (`src/app/(app-sidebar)/configuracoes/vendas/status-de-orcamento/page.tsx`)
   - ✅ `FeatureGate` com feature `budget_status_full`
   - ✅ Fallback elegante com design premium
   - ✅ Botão para upgrade

4. **Tabela de Orçamentos modificada** (`src/app/(app-sidebar)/vendas/orcamentos/components/QuotationsTable/QuotationsData.tsx`)
   - ✅ Coluna "Status" condicionalmente renderizada
   - ✅ Ajuste dinâmico do colSpan (7 vs 6 colunas)

### 🔧 **Lógica Implementada:**

#### **Lista de Configurações de Vendas:**
```typescript
const { getBudgetStatusType } = usePlanFeatures()

const allSettings = [
  {
    category: 'Vendas',
    items: [
      // Outros itens sempre visíveis...
      
      // Status de orçamento - apenas se for plano full
      ...(getBudgetStatusType() === 'full'
        ? [
            {
              title: 'Status de orçamento',
              icon: IconStatusChange,
              description: 'Defina status para acompanhamento das propostas.',
              link: `${defaultPath}/status-de-orcamento`,
            },
          ]
        : []),
    ],
  },
]
```

#### **Página de Status de Orçamento:**
```typescript
<FeatureGate
  features={['budget_status_full']}
  fallback={<PremiumPageFallback />}
>
  <Main /> // Página normal
</FeatureGate>
```

#### **Tabela de Orçamentos:**
```typescript
const { getBudgetStatusType } = usePlanFeatures()
const showStatusColumn = getBudgetStatusType() === 'full'

// Cabeçalho da tabela
{showStatusColumn && <TableHead>Status</TableHead>}

// Dados da tabela
{showStatusColumn && (
  <TableCell>
    <QuotationTagDropdown />
  </TableCell>
)}

// ColSpan dinâmico
colSpan={showStatusColumn ? 7 : 6}
```

## 🧪 **Cenários de Teste**

### **Cenário 1: Empresa com Plano LITE (Acesso Total)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "LITE",
    "features": ["budget_status_full", ...]
  }
}
```

#### **Comportamento Esperado:**
1. **Lista de Configurações de Vendas** → ✅ Item "Status de orçamento" deve aparecer
2. **Clicar em "Status de orçamento"** → ✅ Deve abrir página normalmente
3. **Tabela de Orçamentos** → ✅ Coluna "Status" deve estar visível
4. **Funcionalidade dos Status** → ✅ Deve permitir criar/editar/excluir status

#### **Validações:**
- [ ] Item "Status de orçamento" aparece na lista de configurações
- [ ] Página de status carrega sem bloqueios
- [ ] Coluna "Status" está presente na tabela
- [ ] Dropdown de status funciona normalmente
- [ ] Possível criar novos status
- [ ] Possível editar status existentes
- [ ] Possível excluir status

---

### **Cenário 2: Empresa com Plano START/TRIAL (Limitado)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "START", // ou "TRIAL"
    "features": ["budget_status_limited", ...]
  }
}
```

#### **Comportamento Esperado:**
1. **Lista de Configurações de Vendas** → ❌ Item "Status de orçamento" deve estar oculto
2. **Acesso direto via URL** → ❌ Deve mostrar tela de upgrade
3. **Tabela de Orçamentos** → ❌ Coluna "Status" deve estar oculta
4. **Coluna "Fase atual"** → ✅ Deve permanecer visível (não afetada)

#### **Validações:**
- [ ] Item "Status de orçamento" não aparece na lista
- [ ] URL `/configuracoes/vendas/status-de-orcamento` mostra tela de upgrade
- [ ] Tela de upgrade tem design adequado
- [ ] Botão "Fazer Upgrade" redireciona corretamente
- [ ] Coluna "Status" não aparece na tabela de orçamentos
- [ ] Tabela mantém layout correto (6 colunas vs 7)
- [ ] Outras colunas permanecem funcionais

---

### **Cenário 3: Validação de ColSpan Dinâmico**

#### **Estado Inicial:**
Alternar entre planos LITE e START/TRIAL

#### **Comportamento Esperado:**
1. **LITE** → Header de grupo com `colSpan={7}`
2. **START/TRIAL** → Header de grupo com `colSpan={6}`
3. **Layout** → Tabela deve manter alinhamento correto

#### **Validações:**
- [ ] ColSpan se ajusta dinamicamente
- [ ] Header de agrupamento por data não quebra
- [ ] Alinhamento da tabela permanece correto
- [ ] Não há espaços em branco extras

---

### **Cenário 4: Teste de Funcionalidades Relacionadas**

#### **Comportamento Esperado:**
1. **Fase atual** → ✅ Sempre deve funcionar (independente do plano)
2. **Status do orçamento (OPEN, DONE, etc.)** → ✅ Sistema nativo sempre funciona
3. **Tags/Status personalizados** → ❌ Apenas LITE pode configurar

#### **Validações:**
- [ ] Badges de fase atual (Digitação, Vencido, etc.) sempre aparecem
- [ ] Funcionalidade de status do sistema permanece
- [ ] Apenas configuração de status customizados é bloqueada

## 🚀 **Comandos de Teste**

### **Setup Inicial:**
```bash
# Certificar que backend está mockando features corretamente
npm run dev
```

### **Teste LITE:**
```bash
# 1. Login com empresa LITE
# 2. Navegar para /configuracoes/vendas
# 3. Verificar presença do item "Status de orçamento"
# 4. Clicar e verificar funcionamento
# 5. Navegar para /vendas/orcamentos
# 6. Verificar coluna "Status" presente
```

### **Teste START/TRIAL:**
```bash
# 1. Login com empresa START/TRIAL
# 2. Navegar para /configuracoes/vendas
# 3. Verificar ausência do item "Status de orçamento"
# 4. Tentar acesso direto via URL
# 5. Verificar tela de upgrade
# 6. Navegar para /vendas/orcamentos
# 7. Verificar coluna "Status" oculta
```

## ✅ **Checklist de Validação**

### **Configurações de Vendas:**
- [ ] Item aparece/desaparece conforme plano
- [ ] Lista mantém ordem correta
- [ ] Outros itens não são afetados

### **Página de Status:**
- [ ] FeatureGate funciona corretamente
- [ ] Tela de upgrade bem formatada
- [ ] Botão de upgrade funcional
- [ ] Acesso normal no plano LITE

### **Tabela de Orçamentos:**
- [ ] Coluna "Status" condicional
- [ ] ColSpan dinâmico correto
- [ ] Layout não quebra
- [ ] Funcionalidade preservada

### **Integração:**
- [ ] Não afeta outras funcionalidades
- [ ] Performance não prejudicada
- [ ] UI/UX consistente

---

## 📌 **Observações Importantes**

1. **Diferença entre Status do Sistema vs Status Personalizados:**
   - Status do sistema (`OPEN`, `DONE`, etc.) sempre funcionam
   - Status personalizados/configuráveis são limitados por plano

2. **Impacto Visual:**
   - Tabela mantém boa aparência mesmo sem a coluna
   - Header de agrupamento se ajusta dinamicamente

3. **Funcionalidades Relacionadas:**
   - Fase atual (badges do sistema) sempre funciona
   - Apenas configuração de tags customizadas é restrita

Este teste garante que o controle de status de orçamentos funciona conforme esperado em ambos os planos! 🎯 