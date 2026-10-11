# Telas de financeiro e caixa

## Purpose

Movimentações, fluxo, despesas fixas, folha, caixa e PDV mostram status por
texto, dinheiro neutro e uma ação principal óbvia.

## ADDED Requirements

### Requirement: Linha de movimentação completa

Listas de movimentações (a pagar, a receber, fluxo) SHALL mostrar por linha
descrição e pessoa, vencimento, status por badge, valor numérico neutro e
conta/forma; SHALL NOT ter colunas sem cabeçalho, status por ícone de
polegar ou ponto, nem valor colorido por tipo.

#### Scenario: Parcela atrasada

- **WHEN** uma parcela venceu ontem
- **THEN** a linha mostra o badge "Atrasada" (tom de erro) e o vencimento;
  uma parcela a vencer mostra "Pendente" (neutro)

### Requirement: Receber e pagar com rótulo

A ação de receber ou pagar SHALL ser um botão com rótulo ("Receber",
"Pagar") em linha; as demais ações (parcelas, observações, recibo,
compensar, cancelar) SHALL ficar no menu "⋯"; o detalhe SHALL abrir em
painel lateral ao clicar na linha, e nenhuma ação do painel SHALL abrir um
diálogo sobre ele.

#### Scenario: Receber a partir da lista

- **WHEN** o usuário clica em "Receber" numa linha
- **THEN** o painel de recebimento abre com os dados da parcela; ao
  confirmar, a linha passa a "Recebida"

#### Scenario: Cancelar movimentação

- **WHEN** o usuário escolhe "Cancelar movimentação" no menu
- **THEN** vê a confirmação destrutiva com "Manter movimentação" e "Cancelar
  movimentação"; se não puder cancelar, o item do menu está desabilitado
  com o motivo

### Requirement: Um lançamento, um botão

As páginas de movimentações SHALL ter uma única ação primária "Novo
lançamento" (ou "Nova despesa"/"Nova receita" pré-selecionada) na cor da
marca; o tipo SHALL ser escolhido por controle segmentado; "Marcar como
pago" SHALL ser um checkbox; parcelas SHALL ser uma tabela compacta.

#### Scenario: Fluxo financeiro

- **WHEN** o usuário abre o fluxo financeiro
- **THEN** vê um botão "Novo lançamento" na cor da marca, não dois botões
  (vermelho e verde)

### Requirement: Fluxo financeiro legível para todos

O fluxo SHALL mostrar os totais (receitas, despesas, saldo) como KPIs no
cabeçalho, visíveis por padrão, com opção rotulada de ocultar valores
persistida por usuário; filtros de período, status, conta e forma SHALL ser
rotulados e visíveis para quem pode visualizar; a base de data SHALL ser um
controle segmentado rotulado.

#### Scenario: Usuário que só visualiza

- **WHEN** um usuário com permissão de visualizar abre o fluxo
- **THEN** vê os filtros e os totais; só as ações de criar e editar não
  aparecem

### Requirement: Despesas fixas e folha

"Lançar" SHALL ter rótulo; excluir despesa lançada SHALL confirmar; a folha
SHALL ter o colaborador como título, o período como subtítulo, "Fechar
folha" como primária, "Imprimir" como secundária e "Reabrir" no menu
(visível, desabilitado com motivo quando não permitido); itens SHALL ser
tabela com ações nomeadas.

#### Scenario: Reabrir sem ser administrador

- **WHEN** um usuário que não é administrador abre uma folha fechada
- **THEN** vê "Reabrir folha" desabilitado com a dica "Apenas administradores
  reabrem folhas"

### Requirement: Controle de caixa com uma primária

A página de controle de caixa SHALL ter uma primária conforme o estado
(abrir ou fechar o caixa de hoje), ações por conta secundárias, histórico
paginado e o relatório do dia num painel com "Imprimir" que abre uma visão
de impressão própria.

#### Scenario: Várias contas aguardando

- **WHEN** três contas aguardam aprovação
- **THEN** os três "Aprovar" são secundários e só "Fechar caixa" é primário

#### Scenario: Imprimir o dia

- **WHEN** o usuário aciona "Imprimir" no relatório do dia
- **THEN** abre uma página de impressão só com o relatório, não a aplicação
  inteira

### Requirement: PDV

No PDV, "Receber" SHALL ser um botão primário grande com rótulo por venda;
"Fechar caixa" SHALL ser a primária da página; sangria e suprimento SHALL
ser secundárias; filas vazias SHALL usar o estado vazio; explicações longas
SHALL ficar em ajuda contextual; descartar uma venda SHALL confirmar no tom
destrutivo; direção entrada/saída SHALL ser um controle segmentado.

#### Scenario: Receber uma venda

- **WHEN** uma venda aguarda recebimento
- **THEN** o botão "Receber R$ X" é o elemento mais destacado da linha

### Requirement: Dinheiro e datas nos campos do kit

Conferência de caixa, lançamentos e parcelas SHALL usar o campo de dinheiro
único (vírgula decimal) e o seletor de data único; campos nativos de número
e data SHALL NOT aparecer.

#### Scenario: Conferência cega

- **WHEN** o usuário digita o valor contado
- **THEN** o campo mostra "R$ 1.234,50" com vírgula, sem placeholder
  conflitante
