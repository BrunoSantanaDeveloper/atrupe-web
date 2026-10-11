# Cabeçalho de página

## Purpose

Toda página começa com o mesmo cabeçalho: caminho, título, contexto e ações;
páginas de detalhe mostram o essencial sem clique.

## ADDED Requirements

### Requirement: Cabeçalho em toda página

Toda página da área autenticada SHALL começar com o cabeçalho de página do
kit, contendo: caminho (breadcrumb) quando há mais de um nível, ou nada;
título (único `h1`); subtítulo opcional; ações (no máximo uma primária, até
duas secundárias com rótulo, menu "Mais ações"); abas de sub-rota ou de
status opcionais; o botão de ajuda sempre disponível.

#### Scenario: Painel

- **WHEN** o usuário abre o painel
- **THEN** vê o título "Painel" e o seletor de período no cabeçalho, no mesmo
  lugar em que outras páginas mostram título e ações

#### Scenario: Página administrativa

- **WHEN** o usuário abre uma página de administração
- **THEN** o cabeçalho usa o tom administrativo (faixa laranja com texto
  legível), e o botão de ajuda continua visível

#### Scenario: Página sem o cabeçalho do kit

- **WHEN** um desenvolvedor cria uma página com `<h1>` próprio em vez do
  cabeçalho do kit
- **THEN** o lint falha

### Requirement: Caminho e voltar

Páginas abaixo de uma lista (detalhe, composição, resultado, ficha) SHALL
mostrar o caminho "Módulo › Lista › Registro › Página" com cada nível
anterior clicável; o voltar SHALL levar ao nível anterior, não à raiz do
módulo; em celular, o caminho SHALL colapsar para a seta de voltar com o
nome do nível anterior.

#### Scenario: Composição do orçamento

- **WHEN** o usuário está em "Composição" do orçamento #1234
- **THEN** vê "Vendas › Orçamentos › #1234 › Composição" e voltar leva ao
  orçamento #1234, não à lista

### Requirement: Cabeçalho de objeto

Páginas de detalhe SHALL usar o cabeçalho de objeto: nome do registro como
título, badge de status, de três a cinco números-chave sempre visíveis e as
ações; as seções abaixo SHALL abrir expandidas por padrão.

#### Scenario: Orçamento

- **WHEN** o usuário abre um orçamento
- **THEN** sem nenhum clique vê o número, o cliente, o status, o total, a
  validade e o vendedor, e a ação primária do estado atual

#### Scenario: Cliente

- **WHEN** o usuário abre um cliente
- **THEN** vê nome, tipo, status, valor em aberto, último pedido e limite de
  crédito no cabeçalho, com "Editar" como ação primária

#### Scenario: Folha de pagamento

- **WHEN** o usuário abre a folha de um colaborador
- **THEN** o nome do colaborador é o título e o período é o subtítulo

### Requirement: Abas no cabeçalho

Abas de status ou de sub-rota SHALL ficar no cabeçalho, como links com a
atual marcada (`aria-current`), contador só quando maior que zero, e a aba
padrão SHALL ser a primeira da lista.

#### Scenario: Lista de ordens

- **WHEN** o usuário abre a lista de ordens de serviço sem parâmetro
- **THEN** a primeira aba está ativa e o conteúdo corresponde a ela

#### Scenario: Aba de detalhe

- **WHEN** o usuário navega de "Dados" para "Financeiro" no cliente
- **THEN** a aba "Financeiro" fica marcada e a rota muda para `/financeiro`
