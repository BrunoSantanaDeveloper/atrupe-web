# 🧪 Teste - Controle de Ordens de Serviço

## 📋 Implementação Realizada

### ✅ **Modificações Feitas:**

1. **Hook `usePlanFeatures` atualizado** (`src/hooks/usePlanFeatures.ts`)
   - ✅ Adicionado método `getSalesOrdersType()`
   - ✅ Retorna `'full'` para LITE, `'limited'` para START/TRIAL

2. **Tabela de Ordens modificada** (`src/app/(app-sidebar)/vendas/ordens-de-servico/components/OrdersTable/OrdersData.tsx`)
   - ✅ Importado `usePlanFeatures`
   - ✅ Coluna "Fase atual" condicionalmente renderizada
   - ✅ ColSpan ajustado dinamicamente (5 ou 4 colunas)
   - ✅ TableSkeleton ajustado para número correto de colunas

### 🔧 **Lógica Implementada:**

```typescript
// Verificar tipo de acesso às ordens
const { getSalesOrdersType } = usePlanFeatures()
const salesOrdersType = getSalesOrdersType()
const showCurrentPhase = salesOrdersType === 'full'

// Ajustar número de colunas
const totalColumns = showCurrentPhase ? 5 : 4

// Header da tabela
<TableHeader>
  <TableRow>
    <TableHead>Referência</TableHead>
    <TableHead>Valor</TableHead>
    <TableHead>Vendedor</TableHead>
    {showCurrentPhase && <TableHead>Fase atual</TableHead>}
    <TableHead></TableHead>
  </TableRow>
</TableHeader>

// Body da tabela
{showCurrentPhase && (
  <TableCell>
    <Badge>{order.status}</Badge>
  </TableCell>
)}
```

## 🧪 **Cenários de Teste**

### **Cenário 1: Empresa com Plano LITE (Acesso Completo)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "LITE",
    "features": ["sales_orders_full", ...]
  }
}
```

#### **Comportamento Esperado:**
1. **Colunas da tabela**: Referência | Valor | Vendedor | **Fase atual** | Ações
2. **Total de colunas**: 5
3. **Coluna "Fase atual"**: ✅ Deve aparecer
4. **Badge de status**: ✅ Deve mostrar fase/status da ordem
5. **ColSpan**: 5 colunas nos headers de grupo

### **Cenário 2: Empresa com Plano START/TRIAL (Acesso Limitado)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "TRIAL",
    "features": ["sales_orders_limited", ...]
  }
}
```

#### **Comportamento Esperado:**
1. **Colunas da tabela**: Referência | Valor | Vendedor | Ações
2. **Total de colunas**: 4
3. **Coluna "Fase atual"**: ❌ NÃO deve aparecer
4. **Badge de status**: ❌ NÃO deve ser renderizado
5. **ColSpan**: 4 colunas nos headers de grupo

## 🔍 **Como Testar**

### **Teste 1: Plano LITE (Completo)**
1. **Login** com empresa que tem plano LITE
2. **Navegar** para `/vendas/ordens-de-servico`
3. **Verificar tabela**:
   - ✅ Header deve ter coluna "Fase atual"
   - ✅ Cada linha deve mostrar badge com status
   - ✅ Total de 5 colunas
4. **Inspecionar DOM**: Headers de grupo devem ter `colSpan={5}`

### **Teste 2: Plano TRIAL (Limitado)**
1. **Login** com empresa que tem plano TRIAL
2. **Navegar** para `/vendas/ordens-de-servico`
3. **Verificar tabela**:
   - ❌ Header NÃO deve ter coluna "Fase atual"
   - ❌ Linhas NÃO devem mostrar badge de status
   - ✅ Total de 4 colunas
4. **Inspecionar DOM**: Headers de grupo devem ter `colSpan={4}`

### **Teste 3: Responsividade**
1. **Verificar** se tabela mantém alinhamento
2. **Verificar** se não há "quebras" visuais
3. **Verificar** se skeleton carrega com número correto de colunas

## 🐛 **Debug e Verificação**

### **Console do Navegador:**
```javascript
// Verificar features disponíveis
console.log('Features:', session?.company?.plan?.features)

// Verificar tipo de ordens de serviço
const { getSalesOrdersType } = usePlanFeatures()
console.log('Sales orders type:', getSalesOrdersType())

// Verificar se deve mostrar fase atual
console.log('Show current phase:', getSalesOrdersType() === 'full')
```

### **Developer Tools:**
- **Elements**: Verificar se coluna "Fase atual" está/não está no DOM
- **Count columns**: Contar `<th>` no header da tabela
- **Check colSpan**: Verificar valor do colSpan nos headers de grupo

## ✅ **Critérios de Sucesso**

### **✅ Funcionamento Correto:**
1. ✅ `getSalesOrdersType()` retorna valor correto ('full' ou 'limited')
2. ✅ Coluna "Fase atual" aparece apenas para plano LITE
3. ✅ Coluna "Fase atual" está oculta para planos START/TRIAL
4. ✅ ColSpan ajustado corretamente (5 para LITE, 4 para START/TRIAL)
5. ✅ Badge de status renderizado apenas quando apropriado
6. ✅ TableSkeleton usa número correto de colunas
7. ✅ Layout da tabela mantém-se alinhado

### **❌ Problemas Possíveis:**
- Coluna não sendo ocultada/mostrada
- ColSpan incorreto causando desalinhamento
- Badge de status ainda aparecendo quando não deveria
- Skeleton com número errado de colunas
- Layout quebrado da tabela

## 🔄 **Estrutura da Tabela por Plano**

### **Plano LITE (5 colunas)**
| Referência | Valor | Vendedor | **Fase atual** | Ações |
|------------|-------|----------|----------------|-------|
| Cliente A  | R$ 100| João     | **Em andamento** | 👁️ 🖨️ |
| Cliente B  | R$ 200| Maria    | **Finalizado**   | 👁️ 🖨️ |

### **Plano START/TRIAL (4 colunas)**
| Referência | Valor | Vendedor | Ações |
|------------|-------|----------|-------|
| Cliente A  | R$ 100| João     | 👁️ 🖨️ |
| Cliente B  | R$ 200| Maria    | 👁️ 🖨️ |

## 🎯 **Impacto Visual**

### **Para usuários TRIAL:**
- ✅ **Ainda podem ver** todas as ordens de serviço
- ✅ **Ainda podem acessar** detalhes e imprimir
- ❌ **Não veem** informação sobre fase/status atual
- 💡 **Incentivo sutil** para upgrade (informação "faltando")

### **Para usuários LITE:**
- ✅ **Experiência completa** com todas as informações
- ✅ **Visibilidade total** do processo de trabalho
- ✅ **Controle completo** sobre fases das ordens

## 🚀 **Próximos Passos**

Após validar este teste:
1. **Implementar outros controles** (venda rápida, módulos financeiros)
2. **Adicionar tooltip informativo** explicando limitação
3. **Criar analytics** para medir impacto na conversão
4. **Implementar outras limitações de vendas** (motivos de rejeição, status)

---

**🧪 Status:** Implementação concluída, pronta para teste!

### 📝 **Resumo da Implementação:**
- ✅ **Controle não invasivo**: Funcionalidade mantida, apenas coluna oculta
- ✅ **Layout responsivo**: ColSpan ajustado automaticamente  
- ✅ **Performance otimizada**: Renderização condicional
- ✅ **UX mantida**: Não quebra fluxo de trabalho 