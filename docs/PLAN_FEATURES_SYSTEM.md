# Sistema de Controle de Features por Plano

Este sistema permite controlar o acesso a funcionalidades baseado nas **features** disponíveis no plano ativo do usuário, sem depender do nome do plano.

## Componentes Principais

### 1. `usePlanFeatures` Hook

Hook que fornece acesso às informações do plano do usuário:

```tsx
const { hasFeature } = usePlanFeatures()
```

### 2. `FeatureGate` Component (Opcional)

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

## Abordagens de Implementação

### Abordagem 1: Verificação Simples (Recomendada)
Controle direto com verificação da feature:

```tsx
export function AddCompanyButton() {
  const { hasFeature } = usePlanFeatures()
  const canAddMultipleCompanies = hasFeature('multiple_companies')
  
  if (!canAddMultipleCompanies) {
    return (
      <Button disabled title="Não disponível no plano atual">
        Adicionar empresa
      </Button>
    )
  }
  
  return <Button>Adicionar empresa</Button>
}
```

### Abordagem 2: Com FeatureGate (Para casos complexos)
Quando precisar de mensagens de upgrade ou fallbacks complexos:

```tsx
export function AdvancedFeature() {
  return (
    <FeatureGate 
      features={['advanced_reports']}
      showUpgradeMessage={true}
    >
      <AdvancedReportsComponent />
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
      "features": ["basic_reports", "limited_storage"]
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

## Implementação Real no NewCompanyInfo

A implementação atual usa a **Abordagem 1 (Simples)**:

```tsx
export function NewCompanyTriggerButton({ editMode, onOpenChange }) {
  const { hasFeature } = usePlanFeatures()

  if (editMode) {
    return <Button>Configurar</Button>
  }

  const canAddMultipleCompanies = hasFeature('multiple_companies')

  if (!canAddMultipleCompanies) {
    return (
      <Button disabled title="Não disponível no plano atual">
        Adicionar empresa
      </Button>
    )
  }

  return <Button>Adicionar empresa</Button>
}
```

## Vantagens desta Abordagem

- ✅ **Ultra simples**: Verificação direta da feature
- ✅ **Performance**: Sem componentes adicionais
- ✅ **Claro**: Lógica explícita e fácil de entender
- ✅ **Flexível**: Use FeatureGate apenas quando necessário
- ✅ **Backend-driven**: O backend controla tudo via features
- ✅ **Zero complexidade**: Código direto ao ponto
