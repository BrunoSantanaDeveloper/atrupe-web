# Teste: Controle de Aba Limite de Crédito no Modal Cliente

## Objetivo
Testar se a aba "Limite de crédito" no modal de novo/editar cliente é mostrada/ocultada corretamente baseado no plano do usuário.

## Funcionalidade Testada
- **Feature**: `credit_limit` (Gestão de limite de crédito)
- **Localização**: Cadastros > Clientes > Novo Cliente ou Editar Cliente
- **Comportamento**: Aba aparece apenas se o plano incluir `credit_limit` nas features

## Cenários de Teste

### Cenário 1: Plano com Limite de Crédito (LITE)
**Plano**: LITE
**Features esperadas**: `credit_limit` presente

**Passos**:
1. Faça login com usuário do plano LITE
2. Acesse: Cadastros > Clientes
3. Clique em "Novo cliente" ou edite um cliente existente
4. Observe as abas disponíveis no modal

**Resultado esperado**:
- ✅ Deve aparecer 4 abas: "Informações gerais", "Endereço", "Responsáveis", "Limite de crédito"
- ✅ Aba "Limite de crédito" deve ser funcional e acessível
- ✅ Validação deve incluir campos da aba creditLimit
- ✅ Submit deve processar dados de creditLimit normalmente

### Cenário 2: Plano sem Limite de Crédito (START/TRIAL)
**Plano**: START ou TRIAL
**Features esperadas**: `credit_limit` ausente

**Passos**:
1. Faça login com usuário do plano START ou TRIAL
2. Acesse: Cadastros > Clientes
3. Clique em "Novo cliente" ou edite um cliente existente
4. Observe as abas disponíveis no modal

**Resultado esperado**:
- ✅ Deve aparecer apenas 3 abas: "Informações gerais", "Endereço", "Responsáveis"
- ❌ Aba "Limite de crédito" NÃO deve aparecer
- ✅ Validação deve funcionar apenas para as abas visíveis
- ✅ Submit deve funcionar sem processar creditLimit

## Validações Específicas

### Validação de Formulário
- **LITE**: Valida todas as abas incluindo creditLimit
- **START/TRIAL**: Valida apenas general, addresses, responsibilities

### Processamento no Submit
- **LITE**: Inclui creditLimit no payload enviado ao backend
- **START/TRIAL**: Remove/exclui creditLimit do payload

### Limpeza do Formulário
- **LITE**: Reseta com valores padrão incluindo creditLimit
- **START/TRIAL**: Reseta apenas com valores básicos

## Implementação Técnica

### Hook Utilizado
```typescript
const { hasFinancialModule } = usePlanFeatures()
```

### Controle de Exibição
```typescript
// NewClientForm.tsx
{showCreditLimit && (
  <TabsTrigger value="creditLimit" className="w-full">
    Limite de crédito
  </TabsTrigger>
)}
```

### Validação Condicional
```typescript
const handleValidateAllTabs = async () => {
  const tabs = ['general', 'addresses', 'responsibilities']
  if (hasFinancialModule('credit_limit')) {
    tabs.push('creditLimit')
  }
  // ... resto da validação
}
```

### Processamento Condicional
```typescript
if (hasFinancialModule('credit_limit')) {
  formData.creditLimit = {
    ...data.creditLimit,
    conditions: extractConditions(data?.creditLimit?.paymentMethods),
  }
} else {
  delete formData.creditLimit
}
```

## Arquivos Modificados
1. `src/app/(app-sidebar)/cadastros/clientes/components/NewClient/index.tsx` - Modal principal
2. `src/app/(app-sidebar)/cadastros/clientes/components/NewClient/NewClientForm.tsx` - Componente das abas

## Observações Técnicas
- Prop `showCreditLimit` controla renderização da aba
- Validação ajustada dinamicamente baseada no plano
- Submit processa creditLimit apenas quando disponível
- Função de reset limpa dados conforme plano
- Mantém compatibilidade com funcionalidade existente 