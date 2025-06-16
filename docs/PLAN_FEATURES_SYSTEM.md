# Sistema de Controle de Features por Plano

Este sistema permite controlar o acesso a funcionalidades baseado nas **features** disponíveis no plano ativo do usuário, sem depender do nome do plano.

## Componentes Principais

### 1. `usePlanFeatures` Hook

Hook que fornece acesso às informações do plano do usuário:

```tsx
const { hasFeature } = usePlanFeatures()
```

### 2. `FeatureGate` Component

Componente que controla renderização baseado em features específicas:

```tsx
<FeatureGate
  features={['multiple_companies']}
  requireAll={true}
  showUpgradeMessage={true}
  fallback={<DisabledButton />}
>
  <EnabledButton />
</FeatureGate>
```

## Exemplos de Uso

### Controlar Botão de Adicionar Empresa

```tsx
export function AddCompanyButton() {
  const { hasFeature } = usePlanFeatures()
  const canAddMultipleCompanies = hasFeature('multiple_companies')

  if (!canAddMultipleCompanies) {
    return (
      <FeatureGate features={['multiple_companies']} showUpgradeMessage={true}>
        <Button disabled>Feature não disponível</Button>
      </FeatureGate>
    )
  }

  return <Button>Adicionar Empresa</Button>
}
```

### Verificar Feature Específica

```tsx
export function AdvancedFeature() {
  return (
    <FeatureGate features={['advanced_reports']}>
      <AdvancedReportsComponent />
    </FeatureGate>
  )
}
```

### Verificar Múltiplas Features

```tsx
export function PremiumFeature() {
  return (
    <FeatureGate
      features={['api_access', 'white_label']}
      requireAll={true}
      showUpgradeMessage={true}
    >
      <PremiumComponent />
    </FeatureGate>
  )
}
```

## Configuração no Backend

O backend deve retornar as features no formato:

```json
{
  "company": {
    "plan": {
      "name": "TRIAL",
      "active": true,
      "features": ["basic_reports", "single_company", "limited_storage"]
    }
  }
}
```

## Lógica de Controle de Empresas

O sistema funciona da seguinte forma:

### Features para Empresas

- **Sem `multiple_companies`**: Permite apenas 1 empresa
- **Com `multiple_companies`**: Permite múltiplas empresas
- **Com `unlimited_companies`**: Permite empresas ilimitadas

### Exemplos de Features por Plano

**Plano Básico/Trial:**

```json
"features": ["basic_reports", "limited_storage"]
```

_Resultado: 1 empresa apenas_

**Plano Intermediário:**

```json
"features": ["basic_reports", "multiple_companies", "standard_storage"]
```

_Resultado: múltiplas empresas_

**Plano Avançado:**

```json
"features": ["advanced_reports", "unlimited_companies", "api_access"]
```

_Resultado: empresas ilimitadas_

## Implementação no Componente

No `NewCompanyInfo.tsx`, a implementação verifica:

1. **Modo de edição**: Sem restrições
2. **`hasFeature('multiple_companies')` = false**: Mostra FeatureGate com upgrade message
3. **Feature disponível**: Botão habilitado

## Vantagens desta Abordagem

- ✅ **Simples**: Apenas um hook para gerenciar features
- ✅ **Flexível**: Controle granular por feature específica
- ✅ **Escalável**: Fácil adicionar novas features sem complexidade extra
- ✅ **Backend-driven**: O backend define completamente as capabilities
- ✅ **Sem hardcode**: Não há referências diretas a nomes de planos no código
- ✅ **Performance**: Não faz consultas desnecessárias à API
