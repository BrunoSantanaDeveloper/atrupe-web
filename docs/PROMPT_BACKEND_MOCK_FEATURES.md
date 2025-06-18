# 🚀 Solicitação: Mock de Features no Login - Backend

## 🎯 Objetivo

**Implementar temporariamente** um mock do array `features` no retorno do login, baseado no plano atual da empresa, para permitir que o frontend inicie os testes de implementação do sistema de controle de features.

## ⚡ Implementação Rápida (30-60 minutos)

### 1. **Modificar Response do Login**

Adicionar o array `features` no retorno do login baseado no campo `subscription` (ou similar) da empresa:

```json
{
  "id": "usuario-uuid",
  "name": "Nome do Usuário",
  "email": "usuario@email.com", 
  "avatar": "url-do-avatar",
  "role": "Nome do Cargo",
  "employeeId": "funcionario-uuid",
  "isAdmin": true,
  "permissions": ["client:create", "client:view"],
  "company": {
    "id": "empresa-uuid",
    "name": "Nome da Empresa",
    "legalName": "Razão Social", 
    "logo": "url-da-logo",
    "favicon": "url-do-favicon",
    "subscription": "LITE", // ou "START", "TRIAL"
    "trialEndsAt": "2024-12-31T23:59:59.000Z",
    "features": [
      // Array mockado baseado na subscription
    ]
  },
  "access_token": "token..."
}
```

### 2. **Lógica de Mock Simples**

```javascript
// Exemplo de implementação no backend
function getMockedFeatures(subscriptionType) {
  const FEATURES_MAP = {
    'LITE': [
      "user_limit_5",
      "additional_cnpj", 
      "sectors_management",
      "sales_orders_full",
      "quick_sale",
      "rejection_reasons_full",
      "budget_status_full",
      "delivery_schedule_full",
      "accounts_receivable",
      "accounts_payable", 
      "cash_control",
      "pdv",
      "bank_accounts_full",
      "bank_tax_transfer_full",
      "credit_limit",
      "products_full",
      "production_stages_full",
      "clients_full",
      "suppliers_full"
    ],
    
    'START': [
      "user_limit_3",
      "sales_orders_limited",
      "rejection_reasons_limited", 
      "budget_status_limited",
      "delivery_schedule_limited",
      "bank_accounts_limited",
      "bank_tax_transfer_limited",
      "products_limited",
      "production_stages_limited",
      "clients_limited",
      "suppliers_limited"
    ],
    
    'TRIAL': [
      "user_limit_3",
      "sales_orders_limited",
      "rejection_reasons_limited",
      "budget_status_limited", 
      "delivery_schedule_limited",
      "bank_accounts_limited",
      "bank_tax_transfer_limited",
      "products_limited",
      "production_stages_limited",
      "clients_limited",
      "suppliers_limited"
    ]
  };
  
  return FEATURES_MAP[subscriptionType] || FEATURES_MAP['START'];
}
```

## 📋 Checklist de Implementação

### ✅ **Tarefa 1: Identificar Campo do Plano**
- [ ] Localizar onde está armazenado o plano da empresa (subscription, plan_type, etc.)
- [ ] Verificar valores possíveis: `LITE`, `START`, `TRIAL`

### ✅ **Tarefa 2: Modificar Endpoint de Login**  
- [ ] Adicionar campo `features` no response da empresa
- [ ] Implementar função `getMockedFeatures(planType)`
- [ ] Testar retorno para cada tipo de plano

### ✅ **Tarefa 3: Validar Response**
- [ ] Garantir que o array `features` é sempre retornado
- [ ] Verificar se features corretas são retornadas por plano
- [ ] Testar com empresas de diferentes planos

## 🧪 Casos de Teste

### **Empresa com Plano LITE**
```json
"company": {
  "subscription": "LITE",
  "features": [
    "user_limit_5", 
    "additional_cnpj",
    "sectors_management",
    "sales_orders_full",
    "quick_sale",
    // ... todas as features do LITE
  ]
}
```

### **Empresa com Plano START/TRIAL**
```json
"company": {
  "subscription": "START", // ou "TRIAL"
  "features": [
    "user_limit_3",
    "sales_orders_limited", 
    "rejection_reasons_limited",
    "budget_status_limited",
    // ... apenas features limitadas
  ]
}
```

### **Empresa sem Plano Definido (Fallback)**
```json
"company": {
  "subscription": null,
  "features": [
    "user_limit_3",
    "sales_orders_limited",
    // ... features do START por padrão
  ]
}
```

## 💡 Implementação Sugerida

### **Opção 1: Hardcoded (Mais Rápido)**
```javascript
// No controller do login
const features = getMockedFeatures(company.subscription);
response.company.features = features;
```

### **Opção 2: Com Configuração**
```javascript
// Arquivo config/plan-features.js
export const PLAN_FEATURES = {
  LITE: [...],
  START: [...],
  TRIAL: [...]
};

// No controller
const features = PLAN_FEATURES[company.subscription] || PLAN_FEATURES.START;
```

## 🚨 Observações Importantes

### **⚠️ Temporário**
- Esta é uma implementação **temporária** para permitir desenvolvimento frontend
- Será substituída pela implementação completa com banco de dados

### **🔍 Compatibilidade** 
- Não quebra o funcionamento atual
- Apenas adiciona o campo `features` ao response existente
- Frontend continua funcionando normalmente

### **🎯 Prioridade**
- **ALTA**: Permitir frontend iniciar testes imediatamente  
- **RÁPIDO**: Implementação em menos de 1 hora
- **SEGURO**: Não afeta funcionalidades existentes

## 🕐 Cronograma

- **⏰ 0-15min**: Análise do código atual de login
- **⏰ 15-45min**: Implementação da lógica de mock
- **⏰ 45-60min**: Testes e validação

## 🧪 Como Testar

1. **Login com empresa LITE**: Verificar se retorna features completas
2. **Login com empresa START/TRIAL**: Verificar se retorna features limitadas  
3. **Login com empresa sem plano**: Verificar fallback para START
4. **Verificar estrutura**: Confirmar que `company.features` é array de strings

## 🚀 Próximo Passo

Após implementar este mock:
- **Frontend pode iniciar** implementação imediatamente
- **Backend pode trabalhar** na implementação completa em paralelo
- **Testes integrados** podem começar

**⚡ Urgência**: Esta implementação permitirá o frontend avançar sem esperar pela implementação completa do backend!

---

**💬 Resposta esperada:** "Mock implementado! Array features está sendo retornado no login baseado no subscription da empresa." 