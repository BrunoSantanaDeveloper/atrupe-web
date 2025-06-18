# Teste: Controle de Limite de Crédito por Plano

## Objetivo
Testar se o item "Limite de crédito" nas configurações financeiras é mostrado/ocultado corretamente baseado no plano do usuário.

## Funcionalidade Testada
- **Feature**: `credit_limit` (Gestão de limite de crédito)
- **Localização**: Configurações > Financeiro > Limite de crédito
- **Comportamento**: Item aparece apenas se o plano incluir `credit_limit` nas features

## Cenários de Teste

### Cenário 1: Plano com Limite de Crédito (LITE)
**Plano**: LITE
**Features esperadas**: `credit_limit` presente

**Passos**:
1. Faça login com usuário do plano LITE
2. Acesse: Configurações > Financeiro
3. Procure pelo item "Limite de crédito"

**Resultado esperado**:
- ✅ Item "Limite de crédito" deve aparecer na lista
- ✅ Deve ter ícone de seta para cima (IconFoldUp)
- ✅ Descrição: "Defina o padrão de limite de crédito para os clientes"
- ✅ Deve ter componente CreditLimit como CTA (botão/modal)

### Cenário 2: Plano sem Limite de Crédito (START/TRIAL)
**Plano**: START ou TRIAL
**Features esperadas**: `credit_limit` ausente

**Passos**:
1. Faça login com usuário do plano START ou TRIAL
2. Acesse: Configurações > Financeiro
3. Procure pelo item "Limite de crédito"

**Resultado esperado**:
- ❌ Item "Limite de crédito" NÃO deve aparecer na lista
- ✅ Outros itens devem permanecer: Bancos e contas, Configurações de pagamento, Plano de contas, Despesas fixas, Folha de pagamento

## Implementação Técnica

### Hook Utilizado
```typescript
const { hasFinancialModule } = usePlanFeatures()
```

### Lógica de Controle
```typescript
...(hasFinancialModule('credit_limit')
  ? [
      {
        title: 'Limite de crédito',
        icon: IconFoldUp,
        description: 'Defina o padrão de limite de crédito para os clientes',
        cta: <CreditLimit />,
      },
    ]
  : [])
```

### Mapeamento de Features
- **Plano LITE**: Inclui `credit_limit`
- **Plano START/TRIAL**: Exclui `credit_limit`

## Arquivos Modificados
1. `src/app/(app-sidebar)/configuracoes/financeiro/page.tsx` - Componente servidor
2. `src/app/(app-sidebar)/configuracoes/financeiro/FinanceSettingsClient.tsx` - Componente cliente com lógica

## Observações
- A funcionalidade usa spread operator para inclusão condicional
- Mantém ordem dos itens na lista
- Não afeta outros itens financeiros
- Usa método `hasFinancialModule('credit_limit')` já existente no hook 