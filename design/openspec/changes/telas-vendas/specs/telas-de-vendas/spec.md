# Telas de vendas

## Purpose

Listas e detalhes de orçamentos e ordens de serviço mostram o essencial
sem clique, com uma ação clara e dinheiro legível.

## ADDED Requirements

### Requirement: Lista de orçamentos e ordens

As listas SHALL ter linha clicável que abre o registro, no máximo uma ação
em linha e um menu "⋯", colunas de status (badge), data, vencimento ou
entrega e valor numérico neutro, busca e filtro de período, paginação com
intervalo, abas de status no cabeçalho com a primeira como padrão e, na
lista de ordens, a coluna de nota fiscal.

#### Scenario: Linha de orçamento

- **WHEN** o usuário vê uma linha de orçamento rejeitado
- **THEN** o valor está em cor neutra à direita, o status "Rejeitado" é um
  badge de erro, e clicar em qualquer ponto da linha abre o orçamento

#### Scenario: Ações de ordem

- **WHEN** o usuário abre o menu "⋯" de uma ordem
- **THEN** vê Ficha de produção, Emitir nota, Ver DANFE, Histórico e, por
  último em vermelho, Cancelar venda; "Imprimir via do cliente" é a ação em
  linha

### Requirement: Detalhe com cabeçalho de objeto

O detalhe de orçamento SHALL mostrar no cabeçalho número, cliente, status,
total, validade, vendedor e quantidade de itens; o de ordem SHALL mostrar
total, recebido, entrega e situação da nota; cada um SHALL ter uma ação
primária por estado e as demais em secundárias ou "Mais ações"; as seções
SHALL abrir expandidas.

#### Scenario: Orçamento aprovado

- **WHEN** o usuário abre um orçamento aprovado
- **THEN** vê o total e a validade no cabeçalho sem abrir nada, e a ação
  primária é "Concluir"; "Rejeitar" está em "Mais ações"

### Requirement: Resumo financeiro

O resumo financeiro SHALL ser um bloco alinhado à direita com itens,
desconto, frete e total em destaque, e o subtotal SHALL refletir o desconto
conforme a regra de cálculo.

#### Scenario: Orçamento com desconto

- **WHEN** um orçamento tem itens de R$ 1.000 e desconto de R$ 100
- **THEN** o bloco mostra Itens R$ 1.000,00, Desconto −R$ 100,00 e Total
  R$ 900,00, com o total maior que as outras linhas

### Requirement: Itens

A tabela de itens SHALL ter colunas numéricas alinhadas à direita, um único
padrão de expansão de linha (chevron), ações de item em menu, estado vazio
com "Adicionar item" e SHALL NOT exibir botões sem efeito ou permanentemente
desabilitados sem motivo.

#### Scenario: Orçamento sem itens

- **WHEN** um orçamento novo é aberto
- **THEN** a seção de itens mostra "Nenhum item ainda" com "Adicionar item"

### Requirement: Fluxos no contêiner certo

Condições de pagamento, entrega e detalhe de produto SHALL abrir em painel
lateral; compor um item SHALL ser uma página ou painel largo com
validação; escolher um item SHALL ser um único painel com busca; criar um
cliente a partir do orçamento SHALL NOT empilhar diálogos.

#### Scenario: Condições de pagamento

- **WHEN** o usuário edita as condições de pagamento
- **THEN** um painel lateral mostra o formulário em grade, as parcelas numa
  tabela compacta com um cabeçalho e a comissão como seção

### Requirement: Confirmações de vendas

Rejeitar, cancelar venda, remover item de composição e excluir orçamento
SHALL confirmar no tom destrutivo com verbo e objeto; aprovar, concluir e
reabrir SHALL confirmar no tom padrão.

#### Scenario: Cancelar venda

- **WHEN** o usuário aciona "Cancelar venda"
- **THEN** o diálogo oferece "Manter venda" e "Cancelar venda" (vermelho)

### Requirement: Venda rápida

A venda rápida SHALL ter uma única ação "Cobrar" visível, cabeçalho
legível e um link que abre um novo orçamento comum.

#### Scenario: Cobrar

- **WHEN** o usuário conclui uma venda rápida
- **THEN** vê um único botão "Cobrar R$ X" primário

### Requirement: Caminho entre detalhe, composição e resultado

Composição e resultado SHALL mostrar o caminho até o orçamento e voltar
para ele, com títulos "Composição" e "Resultado" e o número do orçamento
como subtítulo.

#### Scenario: Voltar da composição

- **WHEN** o usuário aciona voltar na composição do orçamento #1234
- **THEN** retorna ao orçamento #1234, não à lista
