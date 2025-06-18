# Teste: Controle de Features - Motivos de Rejeição e Cancelamento

## Funcionalidade Implementada

Sistema de controle de acesso aos motivos de rejeição e cancelamento baseado no plano da empresa:

- **LITE**: Acesso completo aos motivos (feature: `rejection_reasons_full`)
- **TRIAL**: Funcionalidade limitada (feature: `rejection_reasons_limited`) - permite rejeitar/cancelar SEM pedir motivo, mas não permite configurar motivos
- **START**: Funcionalidade bloqueada (sem features de motivos)

## Lógica por Tipo de Feature

### `rejection_reasons_full` (LITE)
- ✅ Item na lista de configurações
- ✅ Página de configuração acessível
- ✅ Botões de rejeitar/cancelar com modal pedindo motivo

### `rejection_reasons_limited` (TRIAL)
- ❌ Item oculto na lista de configurações
- ❌ Página de configuração bloqueada (tela de upgrade)
- ✅ Botões de rejeitar/cancelar funcionam DIRETO (sem modal de motivo)

### Sem features (START)
- ❌ Item oculto na lista de configurações
- ❌ Página de configuração bloqueada (tela de upgrade)
- ❌ Botões de rejeitar/cancelar completamente ocultos

## Cenários de Teste

### Cenário 1: Plano LITE (rejection_reasons_full)
**Teste**:
1. ✅ Acessar `/configuracoes/vendas` - item "Motivos de rejeição e cancelamento" visível
2. ✅ Clicar no item - página carrega normalmente
3. ✅ Acessar orçamento - botão "Rejeitar orçamento" visível
4. ✅ Clicar em rejeitar - modal abre pedindo motivo
5. ✅ Acessar ordem de serviço - botão "Cancelar venda" visível
6. ✅ Clicar em cancelar - modal abre pedindo motivo

### Cenário 2: Plano TRIAL (rejection_reasons_limited)
**Teste**:
1. ✅ Acessar `/configuracoes/vendas` - item "Motivos de rejeição e cancelamento" NÃO visível
2. ✅ Acessar diretamente `/configuracoes/vendas/motivos-de-rejeicao-e-cancelamento` - tela de upgrade
3. ✅ Acessar orçamento - botão "Rejeitar orçamento" visível
4. ✅ Clicar em rejeitar - rejeita DIRETO sem modal (sem pedir motivo)
5. ✅ Acessar ordem de serviço - botão "Cancelar venda" visível  
6. ✅ Clicar em cancelar - cancela DIRETO sem modal (sem pedir motivo)

### Cenário 3: Plano START (sem features)
**Teste**:
1. ✅ Acessar `/configuracoes/vendas` - item "Motivos de rejeição e cancelamento" NÃO visível
2. ✅ Acessar diretamente `/configuracoes/vendas/motivos-de-rejeicao-e-cancelamento` - tela de upgrade
3. ✅ Acessar orçamento - botão "Rejeitar orçamento" NÃO visível
4. ✅ Acessar ordem de serviço - botão "Cancelar venda" NÃO visível

## Comportamento Detalhado

### LITE: Experiência Completa
- **Configuração**: Acesso total para criar/editar/excluir motivos
- **Uso**: Modal com seleção obrigatória de motivo
- **UX**: Funcionalidade profissional completa

### TRIAL: Funcionalidade Simplificada  
- **Configuração**: Bloqueada (incentivo ao upgrade)
- **Uso**: Ação direta sem motivo (funcionalidade básica)
- **UX**: Permite a ação principal mas sem controle detalhado

### START: Bloqueio Total
- **Configuração**: Bloqueada
- **Uso**: Botões inexistentes
- **UX**: Funcionalidade não disponível

## Integração com Backend

```json
{
  "company": {
    "plan": {
      "features": [
        // LITE
        "rejection_reasons_full",
        
        // TRIAL  
        "rejection_reasons_limited",
        
        // START (sem features de motivos)
      ]
    }
  }
}
```

## Implementação Técnica

### Hook `usePlanFeatures`
```typescript
const getRejectionReasonsType = () => {
  if (hasFeature('rejection_reasons_full')) return 'full'     // LITE
  if (hasFeature('rejection_reasons_limited')) return 'limited' // TRIAL
  return 'none'                                               // START
}
```

### Lógica de Renderização
```typescript
// Lista de configurações: só mostra se 'full'
getRejectionReasonsType() === 'full'

// Página: só permite se 'full' 
features={['rejection_reasons_full']}

// Botões: oculta se 'none', mostra sempre se 'full' ou 'limited'
if (getRejectionReasonsType() === 'none') return null

// Comportamento do botão: modal se 'full', direto se 'limited'
if (getRejectionReasonsType() === 'limited') {
  // Ação direta sem modal
} else {
  // Modal com motivos
}
```

## Próximos Passos

Esta implementação pode ser expandida para outras funcionalidades relacionadas:
- Status de orçamento customizados
- Perfis de vendedor avançados
- Outras configurações de vendas 