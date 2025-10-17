# Integração com Asaas - Fluxo de Assinatura

Este documento descreve o fluxo completo de integração com o Asaas para o processo de assinatura de planos.

## Fluxo Geral

```
1. Usuário preenche formulário de assinatura
   ↓
2. Frontend envia dados para /plan/subscription/checkout
   ↓
3. Backend cria/atualiza cliente no Asaas
   ↓
4. Backend cria checkout no Asaas
   ↓
5. Backend retorna URL do checkout
   ↓
6. Frontend redireciona usuário para checkout do Asaas
   ↓
7. Usuário realiza pagamento no Asaas
   ↓
8. Asaas redireciona para /assinatura/concluir
   ↓
9. Frontend chama /plan/subscription/complete
   ↓
10. Backend valida pagamento e cria assinatura
   ↓
11. Frontend atualiza sessão e redireciona para dashboard
```

## Endpoints do Backend

### 1. POST `/plan/subscription/checkout`

Cria um checkout no Asaas para o processo de assinatura.

**Request Body:**

```typescript
{
  selectedPlanId: string
  selectedModules: string[]
  additionalUsers: number
  customerData: {
    type: 'PF' | 'PJ'
    name?: string              // Para PF
    taxId?: string             // CPF para PF
    razaoSocial?: string       // Para PJ
    cnpj?: string              // Para PJ
    nomeResponsavel?: string   // Para PJ
    cpfResponsavel?: string    // Para PJ
    email: string
    phone?: string
    mobile: string
    zipCode: string
    state: string
    city: string
    neighborhood: string
    number: string
    street: string
    complement?: string
  }
  agreedToTerms: boolean
}
```

**Response:**

```typescript
{
  success: true,
  message: "Checkout criado com sucesso",
  data: {
    checkoutId: string        // ID do checkout no Asaas
    checkoutUrl: string       // URL para redirecionar o usuário
    expirationDate?: string   // Data de expiração do checkout
  }
}
```

**Ações no Backend:**

1. Validar dados recebidos
2. Calcular valor total da assinatura (plano + módulos + usuários adicionais)
3. Criar ou atualizar cliente no Asaas:

   ```
   POST https://www.asaas.com/api/v3/customers

   Headers:
   - access_token: $ASAAS_API_KEY

   Body:
   {
     name: string (nome completo ou razão social)
     email: string
     phone: string (opcional)
     mobilePhone: string
     cpfCnpj: string (CPF ou CNPJ)
     postalCode: string
     address: string (rua)
     addressNumber: string
     complement: string (opcional)
     province: string (bairro)
     city: string
     state: string (sigla - ex: SP, RJ)
     externalReference: string (ID da empresa no seu sistema)
   }
   ```

4. Criar checkout no Asaas:

   ```
   POST https://www.asaas.com/api/v3/paymentLinks

   Headers:
   - access_token: $ASAAS_API_KEY

   Body:
   {
     name: string (ex: "Assinatura Atrupe - Plano Premium")
     description: string (opcional)
     billingType: "UNDEFINED" (permite escolha no checkout)
     chargeType: "RECURRENT"
     subscriptionCycle: "MONTHLY"
     value: number (valor total em reais)
     dueDateLimitDays: 0
     notificationEnabled: true
     successUrl: "https://seu-dominio.com/assinatura/concluir"
   }
   ```

5. Salvar dados temporários do checkout (Redis ou DB):

   - checkoutId
   - customerId (ID do cliente no Asaas)
   - companyId (ID da empresa no sistema)
   - planId
   - modules
   - additionalUsers
   - totalValue
   - timestamp

6. Retornar URL do checkout

**Tratamento de Erros:**

- Cliente já existe: atualizar dados
- Erro na criação do checkout: retornar erro com mensagem clara

---

### 2. POST `/plan/subscription/complete`

Finaliza a assinatura após confirmação do pagamento.

**Request Body:**

```typescript
{
  checkoutId: string
  paymentId?: string      // ID do pagamento no Asaas (se disponível)
  paymentStatus?: string  // Status do pagamento (se disponível)
  planId: string
  modules: string[]
  additionalUsers: number
}
```

**Response:**

```typescript
{
  success: true,
  message: "Assinatura criada com sucesso",
  data: {
    subscriptionId: string
    features: string[]      // Features do plano + módulos
    nextDueDate: string
  }
}
```

**Ações no Backend:**

1. Recuperar dados temporários do checkout
2. Validar se o checkout existe e não expirou
3. Consultar status do pagamento no Asaas (se paymentId disponível):

   ```
   GET https://www.asaas.com/api/v3/payments/{paymentId}

   Headers:
   - access_token: $ASAAS_API_KEY
   ```

4. Criar assinatura no banco de dados:

   - Vincular empresa ao plano
   - Adicionar módulos contratados
   - Definir quantidade de usuários adicionais
   - Registrar forma de pagamento
   - Definir data de vencimento
   - Status inicial: "ACTIVE" ou "PENDING" (dependendo do status do pagamento)

5. Criar primeira cobrança/fatura no sistema (se necessário)

6. Enviar email de confirmação ao cliente

7. Registrar log de auditoria

8. Retornar features do plano para atualização da sessão

**Tratamento de Erros:**

- Checkout não encontrado: retornar erro
- Checkout expirado: retornar erro específico
- Pagamento não confirmado: aceitar mas marcar como pendente
- Erro ao criar assinatura: retornar erro e logar para análise

---

## Webhook do Asaas (Opcional mas Recomendado)

### POST `/webhooks/asaas`

Recebe notificações do Asaas sobre mudanças de status nos pagamentos.

**Request Body (enviado pelo Asaas):**

```typescript
{
  event: string  // Ex: "PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", etc.
  payment: {
    id: string
    customer: string
    subscription?: string
    billingType: string
    value: number
    netValue: number
    status: string
    dueDate: string
    invoiceUrl?: string
    externalReference?: string
  }
}
```

**Eventos Importantes:**

- `PAYMENT_CREATED`: Pagamento criado
- `PAYMENT_UPDATED`: Pagamento atualizado
- `PAYMENT_CONFIRMED`: Pagamento confirmado (PIX/Cartão)
- `PAYMENT_RECEIVED`: Pagamento recebido (Boleto)
- `PAYMENT_OVERDUE`: Pagamento vencido
- `PAYMENT_REFUNDED`: Pagamento estornado

**Ações no Backend:**

1. Validar assinatura do webhook (verificar origin/token)
2. Buscar assinatura pelo externalReference ou paymentId
3. Atualizar status do pagamento no banco
4. Atualizar status da assinatura se necessário
5. Enviar notificações ao cliente se necessário
6. Responder com status 200 para o Asaas

---

## Configurações Necessárias

### Variáveis de Ambiente

Adicionar no `.env`:

```bash
# Asaas
ASAAS_API_KEY=seu_token_aqui
ASAAS_ENVIRONMENT=sandbox # ou production
ASAAS_WEBHOOK_SECRET=seu_secret_aqui
```

### URLs de Retorno

- **Success URL**: `https://seu-dominio.com/assinatura/concluir`
- **Webhook URL**: `https://seu-dominio.com/webhooks/asaas`

Configurar no painel do Asaas:

1. Acessar Configurações > Integrações > Webhooks
2. Adicionar URL do webhook
3. Selecionar eventos de pagamento

---

## Tipos de Cobrança Asaas

O Asaas aceita os seguintes tipos de cobrança (`billingType`):

- **BOLETO**: Boleto bancário
- **CREDIT_CARD**: Cartão de crédito
- **PIX**: PIX
- **UNDEFINED**: Permite ao cliente escolher no checkout

Para assinaturas, recomenda-se usar `UNDEFINED` no checkout para dar flexibilidade ao cliente.

---

## Ciclo de Cobrança

Para assinaturas mensais, usar:

```typescript
{
  chargeType: "RECURRENT",
  subscriptionCycle: "MONTHLY"
}
```

Outros ciclos disponíveis:

- `WEEKLY`: Semanal
- `BIWEEKLY`: Quinzenal
- `MONTHLY`: Mensal
- `QUARTERLY`: Trimestral
- `SEMIANNUALLY`: Semestral
- `YEARLY`: Anual

---

## Fluxo de Dados Frontend

### 1. SessionStorage (Temporário)

Ao criar checkout, salvar em `sessionStorage`:

```typescript
{
  checkoutId: string
  planId: string
  planName: string
  modules: string[]
  additionalUsers: number
  totalValue: number
  timestamp: number
}
```

### 2. Limpeza

Limpar `sessionStorage` após:

- Sucesso na criação da assinatura
- Erro irrecuperável
- Expiração (30 minutos)

---

## Testes

### Ambiente Sandbox

Use cartões de teste do Asaas:

- **Aprovado**: 5162 3060 0748 4170
- **Negado**: 5162 3060 0748 4188

### Checklist de Testes

- [ ] Criar assinatura com PF
- [ ] Criar assinatura com PJ
- [ ] Testar pagamento com cartão
- [ ] Testar pagamento com PIX
- [ ] Testar pagamento com boleto
- [ ] Testar cancelamento no checkout
- [ ] Testar expiração de sessão
- [ ] Testar webhook de confirmação
- [ ] Testar webhook de vencimento
- [ ] Validar atualização de sessão após sucesso

---

## Referências

- [Documentação Asaas](https://docs.asaas.com/)
- [API Reference Asaas](https://docs.asaas.com/reference)
- [Webhooks Asaas](https://docs.asaas.com/reference/webhooks)

==================================================

Perfeito! Implementei toda a integração com Asaas para o processo de assinatura. Aqui está um resumo do que foi feito:
📋 Resumo da Implementação
✅ Arquivos Criados/Modificados
src/types/asaas.ts - Tipos TypeScript completos para integração com Asaas
Tipos para cliente, assinatura, checkout, pagamento e webhook
Interface para payload de checkout e respostas
src/app/(blank-layout-pages)/assinatura/page.tsx - Página de assinatura atualizada
Integra com endpoint /plan/subscription/checkout
Salva dados no sessionStorage antes de redirecionar
Redireciona para checkout do Asaas
Progress bar mostrando status
src/app/(blank-layout-pages)/assinatura/concluir/page.tsx - Nova página de finalização
Processa retorno do Asaas
Valida sessão e dados
Chama endpoint /plan/subscription/complete
Atualiza sessão do usuário
Telas de sucesso, erro e sessão expirada
Redireciona automaticamente para dashboard
ASAAS_INTEGRATION.md - Documentação completa
Fluxo detalhado da integração
Especificação dos endpoints do backend
Exemplos de requests/responses
Configuração de webhooks
Guia de testes
Referências da API Asaas
🔄 Fluxo Implementado

1. Usuário preenche formulário →
2. Frontend chama /plan/subscription/checkout →
3. Backend cria checkout no Asaas →
4. Frontend redireciona para Asaas →
5. Usuário paga no Asaas →
6. Asaas redireciona para /assinatura/concluir →
7. Frontend chama /plan/subscription/complete →
8. Backend cria assinatura →
9. Frontend atualiza sessão →
10. Redireciona para dashboard
    🛠️ O que o Backend precisa implementar
    Os seguintes endpoints precisam ser criados no backend:
    POST /plan/subscription/checkout
    Criar/atualizar cliente no Asaas
    Criar checkout (paymentLink) no Asaas
    Salvar dados temporários
    Retornar URL do checkout
    POST /plan/subscription/complete
    Validar checkout
    Verificar status do pagamento (opcional)
    Criar assinatura no banco
    Ativar plano e módulos
    Retornar features para sessão
    POST /webhooks/asaas (Opcional mas recomendado)
    Receber notificações de mudança de status
    Atualizar assinatura conforme status do pagamento
    📝 Variáveis de Ambiente Necessárias
    Adicionar no .env do backend:
    ASAAS_API_KEY=seu_token_aqui
    ASAAS_ENVIRONMENT=sandbox # ou production
    ASAAS_WEBHOOK_SECRET=seu_secret_aqui
    ✨ Funcionalidades Implementadas
    ✅ Formulário completo com validação (PF/PJ)
    ✅ Seleção de plano, módulos e usuários adicionais
    ✅ Cálculo automático do valor total
    ✅ Progress bar durante processo
    ✅ Redirecionamento para Asaas
    ✅ Página de retorno com validação de sessão
    ✅ Tratamento de erros e sessão expirada
    ✅ Atualização automática da sessão do usuário
    ✅ Feedback visual (sucesso/erro)
    ✅ Tipos TypeScript completos
    ✅ Documentação detalhada
    A implementação está pronta no frontend! Agora é só o backend implementar os endpoints conforme a documentação em ASAAS_INTEGRATION.md.
