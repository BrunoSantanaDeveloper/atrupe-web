# 📋 Solicitação: Implementação Sistema de Features por Plano - Backend

## 🎯 Contexto

Estamos implementando um **sistema de controle de features baseado no plano da empresa**. O frontend já possui a infraestrutura pronta com o hook `usePlanFeatures` e precisa receber do backend uma lista das features disponíveis para o usuário logado.

## 📊 Estrutura de Dados Necessária

O backend deve retornar as features no **response do login**, seguindo esta estrutura:

```json
{
  "id": "usuario-uuid",
  "name": "Nome do Usuário", 
  "email": "usuario@email.com",
  "avatar": "url-do-avatar-do-funcionario",
  "role": "Nome do Cargo",
  "employeeId": "funcionario-uuid",
  "isAdmin": true,
  "permissions": [
    "client:create",
    "client:view"
  ],
  "company": {
    "id": "empresa-uuid",
    "name": "Nome Fantasia da Empresa",
    "legalName": "Razão Social da Empresa", 
    "logo": "url-da-logo",
    "favicon": "url-do-favicon",
    "subscription": "LITE",
    "trialEndsAt": "2024-12-31T23:59:59.000Z",
    "features": [
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
    ]
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🔧 Features Mapeadas por Plano

### **Plano LITE** (5 usuários) - Mais Completo
```json
"features": [
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
]
```

### **Plano START/TRIAL** (3 usuários) - Limitado
```json
"features": [
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
```

## 📋 Detalhamento das Limitações por Feature

### **Empresas e Sistemas**
- `user_limit_5` / `user_limit_3`: Controle de quantidade máxima de usuários
- `additional_cnpj`: Cadastro de CNPJs adicionais (LITE) vs Bloqueado (START/TRIAL)
- `sectors_management`: Gestão de setores (LITE) vs Bloqueado (START/TRIAL)

### **Vendas**
- `sales_orders_full` vs `sales_orders_limited`: Ordens completas vs Ocultar coluna "Fase atual"
- `quick_sale`: Venda rápida (LITE) vs Bloqueado (START/TRIAL)
- `rejection_reasons_full` vs `limited`: Completo vs Ocultar configuração e modais
- `budget_status_full` vs `limited`: Completo vs Ocultar configuração e coluna "Status"

### **Produção**
- `delivery_schedule_full` vs `limited`: Completa vs Ocultar abas "Produção"/"Todos os ativos"

### **Financeiro**
- `accounts_receivable`, `accounts_payable`, `cash_control`, `pdv`, `credit_limit`: Apenas LITE
- `bank_accounts_full` vs `limited`: Completo vs Ocultar botão "Nova conta"
- `bank_tax_transfer_full` vs `limited`: Completo vs Desabilitar campos específicos

### **Produtos**
- `products_full` vs `limited`: Completo vs Ocultar botão "Adicionar composição"
- `production_stages_full` vs `limited`: Completo vs Ocultar seção "Etapas de produção"

### **Cadastros**
- `clients_full` vs `limited`: Completo vs Ocultar abas "Orçamentos", "Ordens de serviço", "Financeiro"
- `suppliers_full` vs `limited`: Completo vs Ocultar abas "Orçamentos", "Ordens de serviço", "Financeiro"

## 🎯 Responsabilidades do Backend

### 1. **Estrutura de Dados**
- [ ] Criar tabela `plan_features` com mapping plano → features
- [ ] Adicionar campo `features` na resposta do login
- [ ] Definir features padrão para cada tipo de plano (LITE, START, TRIAL)

### 2. **Lógica de Negócio**
- [ ] Implementar método para buscar features baseado no plano ativo
- [ ] Validar acesso a endpoints baseado nas features do usuário
- [ ] Criar middleware de validação de features

### 3. **Endpoints e Validação**
- [ ] Modificar endpoint de login para incluir features
- [ ] Criar endpoint `/api/plan/features` (opcional, para refresh)
- [ ] Implementar validação em endpoints críticos

### 4. **Migration e Dados Existentes**
- [ ] Migration para tabela `plan_features`
- [ ] Seed com features iniciais por plano
- [ ] Atualização de empresas existentes com planos corretos

## 📋 Solicitação de Plano de Ação

**Por favor, elabore um plano detalhado contendo:**

### ✅ **Análise Técnica**
1. Como será implementada a tabela `plan_features`?
2. Qual a melhor abordagem para o mapping plano → features?
3. Como tratar empresas existentes na migration?

### ✅ **Estrutura do Banco**
1. Schema da tabela `plan_features`
2. Relacionamento com tabela de empresas
3. Script de migration completo

### ✅ **Implementação da Lógica**
1. Como buscar features do plano ativo?
2. Como validar acesso em endpoints específicos?
3. Middleware de validação de features

### ✅ **Modificações nos Endpoints**
1. Alterações necessárias no endpoint de login
2. Novos endpoints para gestão de features (se necessário)
3. Endpoints que precisarão de validação de features

### ✅ **Cronograma de Desenvolvimento**
1. Estimativa de tempo por tarefa
2. Ordem de implementação sugerida
3. Marcos de entrega e testes

### ✅ **Considerações de Segurança**
1. Como garantir que features não sejam burladas?
2. Validação dupla (frontend + backend)
3. Logs de tentativas de acesso não autorizado

### ✅ **Testes e Validação**
1. Cenários de teste para diferentes planos
2. Validação de migration de dados existentes
3. Testes de performance com as novas validações

## 🚀 Próximos Passos

Após receber este plano:
1. **Frontend iniciará implementação** com base nas features definidas
2. **Coordenação de esforços** entre frontend e backend
3. **Testes integrados** assim que backend estiver pronto

## 📌 Observações Importantes

- O **frontend já está preparado** para consumir o array `features`
- A implementação deve ser **retrocompatível** com dados existentes
- Priorizar **performance** - verificação de features será frequente
- Considerar **cache** das features na sessão para evitar consultas desnecessárias
- **LITE é o plano mais completo**, START/TRIAL são limitados

**Aguardamos o plano detalhado para sincronizar os desenvolvimentos! 🤝** 