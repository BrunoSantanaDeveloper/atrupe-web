# Cores de estado

## Purpose

Fazer a cor significar sempre a mesma coisa: um estado de domínio tem um único
tom, rótulo e ícone em todo o sistema; dinheiro é neutro; a cor nunca é o
único sinal.

## ADDED Requirements

### Requirement: Dicionário único de estados

O sistema SHALL manter um dicionário único que associa cada estado de domínio
a um rótulo, um tom (`success`, `neutral`, `warning`, `error`, `info`, `brand`)
e um ícone; badges, abas, filtros e textos de status SHALL derivar dele.

#### Scenario: Mesmo estado em telas diferentes

- **WHEN** uma movimentação PENDING aparece na lista "A receber", no "Fluxo
  financeiro" e no detalhe do cliente
- **THEN** nas três telas ela mostra o mesmo rótulo, a mesma cor e o mesmo
  ícone

#### Scenario: Estado sem entrada

- **WHEN** a API devolve um estado que não está no dicionário
- **THEN** a interface mostra o rótulo "Desconhecido" em tom neutro, nunca o
  valor cru do enum (ex.: "OVERDUE")

### Requirement: Tom por família de estado

Estados SHALL mapear para tons assim: pago, recebido, aprovado, autorizado,
ativo, concluído e fechado (estado normal de caixa e folha) → `success`;
pendente, rascunho, em aberto, não realizado, inativo, arquivado → `neutral`;
provisionado, parcial, aguardando aprovação, reaberto, vence hoje,
contingência → `warning`; atrasado, vencido, rejeitado, cancelado, bloqueado,
inutilizado → `error`; em andamento, em digitação, enviado, processando →
`info`.

#### Scenario: Atrasado versus pendente

- **WHEN** a lista mostra uma parcela vencida e uma a vencer
- **THEN** a vencida usa o tom de erro com rótulo "Atrasada" e a a vencer usa
  o tom neutro com rótulo "Pendente"; não compartilham ícone nem cor

#### Scenario: Fechamento normal

- **WHEN** um caixa ou uma folha é fechado normalmente
- **THEN** o estado "Fechado" usa o tom de sucesso, não o de aviso

### Requirement: Estado nunca só pela cor

Todo estado SHALL ser identificável sem cor: por rótulo de texto ou, no mínimo,
por ícone distinto acompanhado de dica.

#### Scenario: Cartão de tarefa no quadro de produção

- **WHEN** um cartão indica o tipo de tarefa por uma barra colorida
- **THEN** o tipo também aparece como texto ou ícone com nome no cartão

#### Scenario: Ponto de status em etapa

- **WHEN** uma etapa mostra um ponto colorido sobre o ícone do setor
- **THEN** há um rótulo de texto do estado ao lado ou uma dica com o nome do
  estado acessível por teclado

### Requirement: Dinheiro é neutro

Valores monetários SHALL ser exibidos na cor de texto primária; valores
negativos SHALL ser exibidos no tom de erro com sinal de menos; verde SHALL
aparecer apenas em variações positivas apresentadas ao lado de variações
negativas (com seta ou sinal); descontos SHALL NOT usar o tom de aviso;
resultados negativos SHALL NOT ser verdes.

#### Scenario: Lista de orçamentos

- **WHEN** a lista mostra os totais de orçamentos aprovados e rejeitados
- **THEN** todos os totais estão na cor primária; o estado é mostrado pelo
  badge, não pela cor do valor

#### Scenario: Resultado por setor negativo

- **WHEN** um setor tem resultado de −R$ 1.200,00
- **THEN** o valor aparece em tom de erro com o sinal, nunca em verde

#### Scenario: Variação de período

- **WHEN** um KPI compara com o período anterior
- **THEN** a variação aparece em verde (positiva) ou vermelho (negativa) com
  seta, e o valor principal continua em cor primária

### Requirement: Cores de ação não são cores de estado

Botões de criação SHALL usar a cor primária da marca; vermelho SHALL ser
reservado a ações destrutivas e estados de erro; verde de sucesso SHALL NOT
ser usado como cor de acento de módulo (abas, paginação, botão primário).

#### Scenario: Nova despesa

- **WHEN** o usuário vê o botão "Nova despesa"
- **THEN** o botão usa a cor primária da marca e um ícone indica o tipo; o
  vermelho fica para "Excluir" e "Cancelar movimentação"

#### Scenario: Módulo de nota fiscal

- **WHEN** a lista de notas fiscais mostra abas, paginação e botão primário
- **THEN** usam a cor da marca, igual aos outros módulos; o verde de sucesso
  aparece só no badge "Autorizada"
