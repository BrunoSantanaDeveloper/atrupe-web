# Sistema de Contratação de Planos - Documentação Técnica

## 📋 Visão Geral

Este documento descreve o sistema de contratação de planos da aplicação Atrupe, incluindo a estrutura atual do frontend, API endpoints e a nova especificação do backend.

## 🎯 Estrutura Atual do Frontend

### 1. Tipos e Interfaces

#### **Planos** (`src/types/plans.ts`)
```typescript
interface Plan {
  id: string
  name: string
  price: number
  description: string
  features: PlanFeature[]
  isSelected?: boolean
}
```

#### **Dados de Assinatura** (`src/types/subscription.ts`)
```typescript
interface CustomerData {
  personType: 'individual' | 'company'
  companyName?: string
  cnpj?: string
  responsibleName: string
  responsibleCpf: string
  email: string
  phone: string
  mobile: string
  address: {
    zipCode: string
    state: string
    city: string
    neighborhood: string
    street: string
    number: string
    complement?: string
  }
}

interface SubscriptionData {
  plan: Plan
  invoiceModule: boolean
  additionalUsers: number
  customer: CustomerData
  termsAccepted: boolean
  totalAmount: number
}
```

### 2. Componentes Principais

#### **Página de Contratação** (`src/app/(blank-layout-pages)/assinatura/contratar/page.tsx`)

Componentes utilizados:
- `CardPlano`: Seleção de planos
- `InvoiceModule`: Módulo de nota fiscal (R$ 70/mês)
- `AdditionalUsers`: Usuários adicionais (R$ 25/usuário/mês)
- `CustomerDataForm`: Formulário de dados do cliente
- `TermsModal`: Modal de termos de contratação

#### **Formulário de Dados do Cliente** (`src/components/common/subscription/CustomerDataForm.tsx`)

Campos coletados:
- **Pessoa Física/Jurídica**: Toggle para tipo de pessoa
- **Dados da empresa** (se PJ): Razão social, CNPJ
- **Responsável**: Nome completo, CPF
- **Contato**: Email, telefone, celular
- **Endereço**: CEP, estado, cidade, bairro, rua, número, complemento

### 3. Fluxo de Contratação Atual

1. **Seleção do Plano**: Usuário escolhe entre os planos disponíveis
2. **Configuração de Adicionais**: Módulo NF e usuários extras
3. **Preenchimento de Dados**: Dados pessoais/empresariais e endereço
4. **Aceitação de Termos**: Checkbox obrigatório
5. **Submissão**: Envio via `planSubscriptionRoute`

### 4. API Route Atual

**Endpoint**: `/plan/subscription` (definido em `src/actions/routes.ts:77`)

**Payload atual enviado**:
```typescript
{
  extraUsers: number,
  planPrice: number,
  totalAmount: number,
  billingType: 'CREDIT_CARD',
  isContractAccepted: boolean,
  cycle: 'MONTHLY',
  name: string,
  email: string,
  phone: string,
  mobilePhone: string,
  address: string,
  addressNumber: string,
  province: string,
  postalCode: string,
  complement?: string,
  city: string,
  neighborhood: string,
  cpf: string,
  // Se pessoa jurídica:
  cnpj?: string,
  companyName?: string
}
```

---

## 🚀 Nova Especificação da API

### 1. Endpoint de Contratação

**🎯 POST `/subscriptions`**

#### **Estrutura do Payload Atualizada**

```json
{
  "customer": {
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "document": "12.345.678/0001-90",
    "phone": "(11) 99999-9999",
    "address": "Rua das Flores",
    "addressNumber": "123",
    "complement": "Sala 45",
    "province": "Centro",
    "postalCode": "01234-567",
    "city": "São Paulo",
    "state": "SP"
  },
  "planId": "uuid-do-plano-lite",
  "additionalUsers": 2,
  "billingType": "BOLETO",
  "cycle": "MONTHLY",
  "additionalFeatures": [
    "quotation_advanced_export",
    "service_order_scheduling"
  ]
}
```

### 📋 Campos Obrigatórios

- **`customer`**: Dados completos do cliente para cobrança
- **`planId`**: UUID do plano escolhido (TRIAL/START/LITE/PRO/PREMIUM)
- **`billingType`**: `"BOLETO"` | `"CREDIT_CARD"` | `"PIX"`
- **`cycle`**: `"MONTHLY"` | `"YEARLY"`

### 📋 Campos Opcionais

- **`additionalUsers`**: Usuários extras além do limite do plano
- **`additionalFeatures`**: Features extras além das inclusas no plano

### 2. Consultar Assinatura Ativa

**🎯 GET `/subscriptions/active`**

#### **Request**
```http
GET /subscriptions/active
Authorization: Bearer {jwt_token}
```

#### **Response Example**
```json
{
  "id": "uuid-subscription",
  "companyId": "uuid-company",
  "planId": "uuid-plan",
  "customerId": "uuid-customer",
  "additionalUsers": 2,
  "status": "ACTIVE",
  "billingType": "BOLETO",
  "cycle": "MONTHLY",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z",
  "plan": {
    "id": "uuid-plan",
    "name": "Plano LITE",
    "planType": "LITE",
    "planFeatures": [
      {
        "feature": {
          "id": "uuid-feature",
          "key": "sectors_configuration",
          "name": "Configuração de Setores"
        }
      }
    ],
    "planLimits": [
      {
        "value": 5,
        "limit": {
          "id": "uuid-limit",
          "key": "max_users",
          "name": "Máximo de Usuários",
          "unit": "users"
        }
      }
    ]
  },
  "customer": {
    "id": "uuid-customer",
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "document": "12.345.678/0001-90"
  },
  "subscriptionFeatures": [
    {
      "isActive": true,
      "feature": {
        "key": "quotation_advanced_export",
        "name": "Exportação Avançada de Orçamentos"
      }
    }
  ]
}
```

### 3. Upgrade de Plano

**🎯 PATCH `/subscriptions/{id}/upgrade`**

#### **Request**
```http
PATCH /subscriptions/uuid-subscription-id/upgrade
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

#### **Payload**
```json
{
  "planId": "uuid-do-plano-premium"
}
```

#### **Response Example**
```json
{
  "id": "uuid-subscription",
  "companyId": "uuid-company",
  "planId": "uuid-do-plano-premium",
  "customerId": "uuid-customer",
  "additionalUsers": 2,
  "status": "ACTIVE",
  "billingType": "BOLETO",
  "cycle": "MONTHLY",
  "updatedAt": "2025-01-15T15:45:00.000Z",
  "plan": {
    "id": "uuid-do-plano-premium",
    "name": "Plano PREMIUM",
    "planType": "PREMIUM",
    "planFeatures": [
      // Todas as features do plano PREMIUM
    ],
    "planLimits": [
      {
        "value": 50,
        "limit": {
          "key": "max_users",
          "name": "Máximo de Usuários"
        }
      }
    ]
  }
}
```

### 4. Fluxo Típico de Uso

1. **Listar Planos Disponíveis**
   ```http
   GET /plans
   # Retorna todos os planos com features e limites
   ```

2. **Contratar Plano**
   ```http
   POST /subscriptions
   # Com payload completo mostrado anteriormente
   ```

3. **Verificar Subscription Ativa**
   ```http
   GET /subscriptions/active
   # Retorna detalhes da subscription atual
   ```

4. **Fazer Upgrade**
   ```http
   PATCH /subscriptions/{id}/upgrade
   # Body: {"planId": "uuid-plano-superior"}
   ```

### 📋 Dados Importantes

- **JWT obrigatório** em todas as rotas
- **companyId** extraído automaticamente do token
- **Features adicionais** mantidas após upgrade
- **Usuários adicionais** preservados no upgrade
- **Cobrança automática** via Asaas para mudanças

---

## 🔄 Alterações Necessárias no Frontend

### 1. **Atualizar Estrutura de Dados**

#### Modificar `src/types/subscription.ts` COMPLETAMENTE:

```typescript
// NOVA estrutura - substituir interface existente
interface CustomerData {
  name: string                    // era: responsibleName
  email: string                   // mantém
  document: string               // era: cpf OU cnpj (unificar)
  phone: string                  // mantém
  address: string                // era: address.street
  addressNumber: string          // era: address.number
  complement?: string            // era: address.complement
  province: string               // era: address.neighborhood
  postalCode: string             // era: address.zipCode
  city: string                   // era: address.city
  state: string                  // era: address.state
}

// REMOVER campos antigos não utilizados na nova API:
// - personType: 'individual' | 'company'
// - companyName?: string
// - cnpj?: string  
// - responsibleName: string
// - responsibleCpf: string
// - mobile: string (não usado na nova API)
// - address: { ... } (estrutura aninhada não usada)

// ADICIONAR novas interfaces para responses:
interface SubscriptionResponse {
  id: string
  companyId: string
  planId: string
  customerId: string
  additionalUsers: number
  status: "ACTIVE" | "INACTIVE" | "CANCELLED"
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX"
  cycle: "MONTHLY" | "YEARLY"
  createdAt: string
  updatedAt: string
  plan: {
    id: string
    name: string
    planType: "TRIAL" | "START" | "LITE" | "PRO" | "PREMIUM" | "ELITE" | "FULL"
    planFeatures: Array<{
      feature: {
        id: string
        key: string
        name: string
      }
    }>
    planLimits: Array<{
      value: number
      limit: {
        id: string
        key: string
        name: string
        unit: string
      }
    }>
  }
  customer: {
    id: string
    name: string
    email: string
    document: string
  }
  subscriptionFeatures: Array<{
    isActive: boolean
    feature: {
      key: string
      name: string
    }
  }>
}

interface PlanResponse {
  id: string
  name: string
  planType: string
  planFeatures: Array<{
    feature: {
      id: string
      key: string
      name: string
    }
  }>
  planLimits: Array<{
    value: number
    limit: {
      id: string
      key: string
      name: string
      unit: string
    }
  }>
}

// ATUALIZAR payload de contratação
interface SubscriptionPayload {
  customer: CustomerData
  planId: string
  additionalUsers?: number
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX"
  cycle: "MONTHLY" | "YEARLY"
  additionalFeatures?: string[]
}
```

### 2. **Modificar Formulário de Dados**

#### Atualizar `src/components/common/subscription/CustomerDataForm.tsx`:

```typescript
// PROBLEMA: Formulário atual coleta dados em estrutura diferente da API
// ATUAL: address.street, address.number, etc.
// NOVA API: address, addressNumber (campos separados)

// SOLUÇÃO: Adaptar campos do formulário OU manter e transformar no submit

// OPÇÃO 1: Manter formulário atual e transformar dados no handleSubmit
// OPÇÃO 2: Modificar formulário para alinhar com nova estrutura (recomendado)

// Mudanças necessárias no formulário:
// 1. Unificar CPF/CNPJ em um campo "document" 
// 2. Remover campo "mobile" (não usado na API)
// 3. Simplificar estrutura do endereço (sem nested address)
// 4. Adicionar seletor de billingType
// 5. Adicionar seletor de cycle (MONTHLY/YEARLY)

// Campos que MUDAM de nome:
// responsibleName -> name (no customer)
// responsibleCpf/cnpj -> document (unificado)  
// address.street -> address
// address.number -> addressNumber
// address.complement -> complement  
// address.neighborhood -> province
// address.zipCode -> postalCode
// address.city -> city (mantém)
// address.state -> state (mantém)
```

### 3. **Atualizar Schema de Validação**

#### Modificar `src/lib/validationSchemas.ts`:

```typescript
// ATUALIZAR subscriptionFormSchema para nova estrutura
export const subscriptionFormSchema = z.object({
  // Campos do cliente (nova estrutura)
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  document: z.string().min(11, "Documento inválido"), // CPF ou CNPJ unificado
  phone: z.string().min(10, "Telefone inválido"),
  
  // Endereço (estrutura simplificada)
  address: z.string().min(1, "Endereço é obrigatório"),
  addressNumber: z.string().min(1, "Número é obrigatório"), 
  complement: z.string().optional(),
  province: z.string().min(1, "Bairro é obrigatório"),
  postalCode: z.string().min(8, "CEP inválido"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  
  // Configurações da assinatura
  planId: z.string().uuid("Plan ID inválido"),
  additionalUsers: z.number().min(0).optional(),
  billingType: z.enum(["BOLETO", "CREDIT_CARD", "PIX"]),
  cycle: z.enum(["MONTHLY", "YEARLY"]),
  additionalFeatures: z.array(z.string()).optional(),
  
  // Campos de controle do formulário  
  termsAccepted: z.boolean().refine(val => val === true, "Aceite os termos")
})

// REMOVER campos antigos:
// - personType, companyName, cnpj, responsibleName, responsibleCpf, mobile
// - address: { ... } estrutura aninhada
```

### 4. **Atualizar Payload de Submissão**

#### Modificar `handleSubmit` em `src/app/(blank-layout-pages)/assinatura/contratar/page.tsx`:

```typescript
// ANTES (payload atual):
const payload = {
  extraUsers: data.additionalUsers || 0,
  planPrice: selectedPlan?.price || 0,
  totalAmount,
  billingType: 'CREDIT_CARD',
  isContractAccepted: data.termsAccepted,
  cycle: 'MONTHLY',
  name: data.responsibleName,
  email: data.email,
  phone: data.phone,
  mobilePhone: data.mobile,
  address: data.address.street,
  addressNumber: data.address.number,
  province: data.address.state,
  postalCode: data.address.zipCode,
  complement: data.address.complement,
  city: data.address.city,
  neighborhood: data.address.neighborhood,
  cpf: data.responsibleCpf,
  ...(data.personType === 'company' && {
    cnpj: (data as any).cnpj,
    companyName: (data as any).companyName,
  }),
}

// DEPOIS (nova estrutura):
const handleSubmit = async (data: SubscriptionFormData) => {
  // 1. Buscar planId se necessário
  const planData = await fetchPlanByName(selectedPlan.name)
  
  // 2. Novo payload alinhado com API
  const payload: SubscriptionPayload = {
    customer: {
      name: data.name,
      email: data.email,
      document: data.document,
      phone: data.phone,
      address: data.address,
      addressNumber: data.addressNumber,
      complement: data.complement,
      province: data.province,
      postalCode: data.postalCode,
      city: data.city,
      state: data.state
    },
    planId: planData.id,
    additionalUsers: data.additionalUsers,
    billingType: data.billingType,
    cycle: data.cycle,
    additionalFeatures: data.invoiceModule ? ["invoice_module"] : []
  }
  
  // 3. Usar nova rota
  const result = await createSubscription(payload)
}
```

### 5. **Atualizar Rotas da API**

#### Modificar `src/actions/routes.ts`:

```typescript
const defaultRoute: { [key: string]: string } = {
  // ... outras rotas existentes

  // ADICIONAR novas rotas de assinatura:
  subscriptionsRoute: '/subscriptions',
  activeSubscriptionRoute: '/subscriptions/active', 
  upgradeSubscriptionRoute: '/subscriptions', // + /{id}/upgrade via customPath
  plansRoute: '/plans',

  // MANTER rota antiga para compatibilidade (temporário):
  planSubscriptionRoute: '/plan/subscription',
  
  // ... resto das rotas
}
```

### 6. **Modificar Uso da Rota na Contratação**

#### Atualizar chamada em `page.tsx`:

```typescript
// ANTES:
const result = await createItem({
  route: 'planSubscriptionRoute',
  customPath: `/${selectedPlanId}/${session.company.id}`,
  data: payload,
})

// DEPOIS:  
const result = await createItem({
  route: 'subscriptionsRoute', 
  data: payload, // Novo payload estruturado
})
// Não precisa mais de customPath - companyId vem do JWT
```

---

## 🔧 Implementação Sugerida

### 1. **Criar Hook para Gerenciar Assinaturas**

```typescript
// src/hooks/useSubscriptions.ts
export function useSubscriptions() {
  const fetchPlans = async () => {
    const response = await api.get('/plans')
    return response.data
  }
  
  const fetchPlanByName = async (planName: string) => {
    const response = await api.get(`/plans?name=${planName}`)
    return response.data
  }
  
  const fetchActiveSubscription = async () => {
    const response = await api.get('/subscriptions/active')
    return response.data
  }
  
  const createSubscription = async (payload: SubscriptionPayload) => {
    const response = await api.post('/subscriptions', payload)
    return response.data
  }
  
  const upgradeSubscription = async (subscriptionId: string, planId: string) => {
    const response = await api.patch(`/subscriptions/${subscriptionId}/upgrade`, { planId })
    return response.data
  }
  
  return { 
    fetchPlans, 
    fetchPlanByName, 
    fetchActiveSubscription, 
    createSubscription, 
    upgradeSubscription 
  }
}
```

### 2. **Atualizar Componente de Contratação**

```typescript
// No componente de contratação
const { fetchPlanByName, createSubscription } = useSubscriptions()

const handleSubmit = async (data: SubscriptionFormData) => {
  // 1. Buscar planId do plano selecionado
  const planData = await fetchPlanByName(selectedPlan.name)
  
  // 2. Montar payload com nova estrutura
  const payload = {
    customer: {
      name: data.responsibleName,
      email: data.email,
      document: data.personType === 'company' ? data.cnpj : data.responsibleCpf,
      phone: data.phone,
      address: data.address.street,
      addressNumber: data.address.number,
      complement: data.address.complement,
      province: data.address.neighborhood,
      postalCode: data.address.zipCode,
      city: data.address.city,
      state: data.address.state
    },
    planId: planData.id,
    additionalUsers: data.additionalUsers,
    billingType: "CREDIT_CARD", // ou permitir seleção
    cycle: "MONTHLY", // ou permitir seleção
    additionalFeatures: data.invoiceModule ? ["invoice_module"] : []
  }
  
  // 3. Criar assinatura usando hook
  const result = await createSubscription(payload)
}
```

### 3. **Componente para Gerenciar Assinatura Atual**

```typescript
// src/components/subscription/CurrentSubscription.tsx
import { useSubscriptions } from '@/hooks/useSubscriptions'

export function CurrentSubscription() {
  const { fetchActiveSubscription, upgradeSubscription } = useSubscriptions()
  const [subscription, setSubscription] = useState(null)
  
  useEffect(() => {
    loadSubscription()
  }, [])
  
  const loadSubscription = async () => {
    try {
      const data = await fetchActiveSubscription()
      setSubscription(data)
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error)
    }
  }
  
  const handleUpgrade = async (newPlanId: string) => {
    try {
      await upgradeSubscription(subscription.id, newPlanId)
      loadSubscription() // Recarregar dados
      toast.success('Plano atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar plano')
    }
  }
  
  return (
    <Card>
      <div className="p-6">
        <h2>Assinatura Atual</h2>
        {subscription && (
          <div>
            <p><strong>Plano:</strong> {subscription.plan.name}</p>
            <p><strong>Status:</strong> {subscription.status}</p>
            <p><strong>Usuários Adicionais:</strong> {subscription.additionalUsers}</p>
            <p><strong>Ciclo:</strong> {subscription.cycle}</p>
            
            <div className="mt-4">
              <h3>Features Ativas:</h3>
              <ul>
                {subscription.plan.planFeatures.map(pf => (
                  <li key={pf.feature.id}>{pf.feature.name}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4">
              <h3>Features Adicionais:</h3>
              <ul>
                {subscription.subscriptionFeatures.map(sf => (
                  <li key={sf.feature.key}>
                    {sf.feature.name} - {sf.isActive ? 'Ativa' : 'Inativa'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
```

---

## ✅ Checklist de Implementação

### Estrutura de Dados
- [ ] Atualizar tipos em `src/types/subscription.ts`
- [ ] Modificar estrutura de dados do `CustomerData`
- [ ] Criar interfaces para novos tipos de response da API

### API e Rotas
- [ ] Atualizar `src/actions/routes.ts` com novas rotas
- [ ] Criar hook `useSubscriptions` completo
- [ ] Implementar funções para todos os endpoints
- [ ] Adicionar tratamento de erros específicos da API

### Componentes
- [ ] Modificar payload em `handleSubmit` da contratação
- [ ] Criar componente `CurrentSubscription` para visualizar assinatura
- [ ] Implementar componente de upgrade de plano
- [ ] Adicionar seletor de `billingType` e `cycle`
- [ ] Criar interface para gerenciar features adicionais

### Testes e Validação
- [ ] Testar integração com novo endpoint POST `/subscriptions`
- [ ] Testar consulta de assinatura ativa GET `/subscriptions/active`
- [ ] Testar upgrade de plano PATCH `/subscriptions/{id}/upgrade`
- [ ] Validar fluxo completo: contratação → consulta → upgrade
- [ ] Atualizar validações de formulário se necessário
- [ ] Verificar compatibilidade com componentes existentes

### UX/UI
- [ ] Implementar feedback visual para estados de loading
- [ ] Adicionar tratamento de erro específico para cada operação
- [ ] Criar páginas de sucesso para cada ação
- [ ] Implementar confirmações para upgrades de plano

---

## 🔍 Considerações de Migração

### **Compatibilidade**
- Manter campos antigos durante período de transição
- Implementar fallbacks para APIs antigas
- Testar thoroughly antes de deployment

### **Validações**
- Unificar validação de CPF/CNPJ no campo `document`
- Ajustar máscaras de input conforme necessário
- Validar se `planId` é obrigatório na nova API

### **UX/UI**
- Considerar adição de seletor de `billingType`
- Permitir seleção de `cycle` (Mensal/Anual)
- Implementar seleção de features adicionais

---

## 📚 Recursos de Referência

- **Tipos atuais**: `src/types/subscription.ts`, `src/types/plans.ts`
- **Página principal**: `src/app/(blank-layout-pages)/assinatura/contratar/page.tsx`
- **Componentes**: `src/components/common/subscription/`
- **Rotas de API**: `src/actions/routes.ts`
- **Validações**: `src/lib/validationSchemas.ts`

---

*Documentação gerada em: ${new Date().toLocaleDateString('pt-BR')}*