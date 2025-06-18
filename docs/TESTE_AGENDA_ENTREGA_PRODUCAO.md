# Teste: Controle de Etapas de Produção na Agenda de Entrega

## Funcionalidade
Controlar a exibição dos botões de etapas de produção na agenda de entrega baseado no tipo de plano do usuário.

## Regras de Negócio
- **Planos LITE (full)**: Mostram todas as abas (Produção, Entrega, Faturamento, Todos, Finalizados) e botões de etapas de produção
- **Planos START/TRIAL (limited)**: Mostram apenas abas de Entrega, Faturamento e Finalizados. Não mostram botões de etapas de produção

## Testes

### 1. Teste com Plano LITE (full)
**Cenário**: Usuário com plano LITE acessa a agenda de entrega
**Resultado esperado**:
- ✅ Mostra todas as 5 abas (Produção, Entrega, Faturamento, Todos, Finalizados)
- ✅ Aba padrão é "Todos"
- ✅ Na tabela, mostra botões coloridos das etapas de produção
- ✅ Botão "Finalizar serviço" aparece apenas quando etapas estão concluídas

### 2. Teste com Plano START/TRIAL (limited)
**Cenário**: Usuário com plano START/TRIAL acessa a agenda de entrega
**Resultado esperado**:
- ✅ Mostra apenas 3 abas (Entrega, Faturamento, Finalizados)
- ✅ Aba padrão é "Entrega"
- ✅ Na tabela, NÃO mostra botões de etapas de produção
- ✅ Botão "Finalizar serviço" sempre disponível (independente das etapas)

## Componentes Modificados
- `DeliverySchedule.tsx`: Controle de abas exibidas e aba padrão
- `DeliveryScheduleData.tsx`: Controle de botões de etapas de produção
- `usePlanFeatures.ts`: Método `getDeliveryScheduleType()`

## Como Testar
1. Modificar o plano no mock do backend:
   - Para plano LITE: incluir feature `delivery_schedule_full` 
   - Para plano START/TRIAL: remover a feature `delivery_schedule_full`
2. Acessar `/producao/agenda-de-entrega`
3. Verificar abas disponíveis e comportamento da tabela
4. Testar navegação entre abas
5. Verificar exibição dos botões de etapas na coluna "Produção" 