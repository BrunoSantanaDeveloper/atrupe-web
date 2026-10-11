# Matriz de planos — quais chaves de recurso formam cada plano

> **Decisões de 10/10/2026** (plano de implementação dos planos, 4.2 e 4.10). Valem sobre a matriz abaixo, escrita em 08/10:
>
> - `quotation_require_rejection_reason` continua aposentada (inativa no catálogo desde 30/09) e não entra no LITE.
> - Setores (`sectors_configuration`) fica no START, como decidido em 29/09 e já gravado no seed.
> - `basic_management`, `basic_quotations` e `basic_service_orders` não existem: nenhuma tela pede e a API não usa.
> - O limite de crédito completo (o bloqueio do orçamento e da O.S. pelo limite) é a chave `credit_limit_enforcement`; o plano e a regra estão a decidir. O cadastro do limite continua em `credit_limit_configuration` (LITE).
> - `can_bill_on_delivery_and_checkout` está no catálogo sem plano, até a decisão da Agenda de entrega.
> - A API monta o pacote: as chaves e os limites vêm do login e de `GET /subscriptions/session`. A simulação do front (`NEXT_PUBLIC_DEV_FEATURES`, `DEV_PLAN_NAME` e `DEV_IGNORE_BLOCK`) saiu; para conferir um plano, entre com a conta de teste dele.

Escrito em 08/10/2026 para o backend (Bruno) poder cadastrar os cinco planos e criar contas de cada um. Fonte: as chaves que as telas do front pedem hoje, a lista do LITE que já existe na API e os conceitos de PRO, ELITE e FULL. **Onde está escrito "a confirmar", a decisão é do dono do produto.**

## Como funciona

O sistema **não pergunta o nome do plano**: cada tela pergunta por uma **chave de recurso** (ex.: `cost_base`). O plano é o **pacote de chaves** que a API entrega no login, em `company.plan.features`, mais os **limites** em `company.plan.limits` (ex.: `max_users`). Trocar o pacote de uma conta muda o que ela vê, sem mexer no código. O nome do plano (`company.plan.name`) só aparece na tela de assinatura e no convite de upgrade.

**Planos são cumulativos:** cada um tem tudo o que o anterior tem, mais as chaves da sua linha. A API precisa devolver **a lista completa** (não só as chaves novas do plano).

**Hoje na API de desenvolvimento:** só START e LITE existem com preço; PRO, ELITE e FULL aparecem como "não definido" e a lista de chaves vem vazia. A simulação que o front fazia pela variável local `NEXT_PUBLIC_DEV_FEATURES` saiu em 10/10/2026 (nota no topo).

## A matriz

| Plano | Chaves que entram (além das do plano anterior) | Limites |
|---|---|---|
| **START** | nenhuma — tudo o que não depende de chave é START: empresa e sistema, orçamentos, ordens de serviço, financeiro básico, produtos sem composição, clientes e fornecedores simplificados, variações de produto | `max_users: 3` · 1 CNPJ |
| **LITE** | `sectors_configuration` · `quotation_quick_sale` · `quotation_status_configuration` · `quotation_status_column` · `quotation_rejection_reasons` · `quotation_require_rejection_reason` · `service_order_cancellation_reason` · `service_order_current_phase` · `pdf_show_item_details` · `accounts_receivable` · `accounts_payable` · `cash_control` · `bank_account_cash_control_switch` · `pdv_screen` · `bank_account_creation` · `bank_account_delete` · `bank_account_provision` · `credit_limit_configuration` · `payment_condition_operator_fee` · `payment_difference` · `product_composition` · `product_production_stages` · `delivery_production_tabs` · `delivery_production_stages` · `delivery_stage_status_change` · `client_additional_tabs` · `supplier_additional_tabs` · `client_responsible_management` · `multiple_companies` (mais de um CNPJ) · `transaction_cancel_reasons` (motivo ao cancelar lançamento) | `max_users: 3` |
| **PRO** | `cost_base` (Base de custos, materiais, processos, composição com custo, **rateio por item BC-8**) · `pricing_center` (Precificação) · `basic_management` · `basic_quotations` · `basic_service_orders` | `max_users: 3` |
| **ELITE** | `production_manager` (Gerenciador, Projetos, Configurações › Produção, frota) · `productivity_tracking` (Produtividade) | `max_users: 3` |
| **FULL** | `stock_control` (Estoque) · `invoice_entry` (Entrada de nota) · limite de crédito completo (`financial_settings:credit_limits`, hoje desligado "até o FULL") · baixa de material e alteração de venda em produção (ganchos no gerenciador, sem chave ainda) | `max_users: 3` |

## Decisões do dono do produto (08/10/2026)

- **Usuários: 3 em todos os planos, inclusive o LITE, por enquanto.** O valor dos planos e se usuários extras serão pagos à parte ficam para mais à frente. (O LITE do legado tinha 5; muda para 3.)
- **Rateio por item (BC-8): PRO**, junto com a Base de custos.
- **Mais de um CNPJ (`multiple_companies`): LITE.**
- **Motivo ao cancelar lançamento (`transaction_cancel_reasons`): LITE.**
- **Faturar na entrega e na frente de caixa (`can_bill_on_delivery_and_checkout`): acompanha o gerenciador de entrega.** Vai para o plano em que a Agenda de entrega estiver; se a agenda entrar no START, pode ser START. Decidir junto com a agenda do START (depois do gerenciador do ELITE).
- **Módulo de nota fiscal (`nota_fiscal`): contratação à parte de qualquer plano**, como no legado. Não entra em nenhum pacote.
- `basic_management`, `basic_quotations`, `basic_service_orders`: existem no front sem tela que as peça. Confirmar com o Bruno se a API as usa; se não, saem.

## O que a API precisa fazer

1. **Cadastrar os cinco planos** com preço (`/plan/public/modules` já lista módulos; os planos PRO, ELITE e FULL precisam existir com valor).
2. **Montar `company.plan.features` no login** com a lista completa do plano da conta, cumulativa, e `company.plan.limits.max_users`.
3. **Conferir a chave no servidor**, não só na tela (SEG-2, SEG-6): cada rota do contrato da API diz qual chave exige; empresa sem a chave recebe 403 (ou lista vazia, onde o contrato diz).
4. **Trocar de plano sem recadastro:** subir de plano só acrescenta chaves; descer esconde telas, mas não apaga dados (regra do produto: migração de plano sem recadastro).
5. **Contas de teste:** uma conta por plano no ambiente de desenvolvimento, com dados fictícios (SEG-5), para o dono do produto aprovar cada versão.

## O que ainda falta decidir

1. O valor de cada plano e se usuários além de 3 serão pagos à parte.
2. Em que plano fica a Agenda de entrega do START (e, com ela, o faturar na entrega).
