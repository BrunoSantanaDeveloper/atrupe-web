# Navegação lateral

## Purpose

A barra lateral mostra onde o usuário está, cabe em telas comuns e funciona
igual no computador e no celular.

## ADDED Requirements

### Requirement: Estrutura

A barra lateral SHALL ter 264 px expandida e 64 px recolhida, logo de 56 px
no topo, seções com rótulo, itens de 36 px com ícone de 20 px, subitens
indentados, e a conta do usuário (nome, empresa, plano, menu) no rodapé;
SHALL NOT ter divisória entre itens nem legenda de revisão.

#### Scenario: Altura comum

- **WHEN** a barra é exibida numa janela de 900 px de altura
- **THEN** todos os módulos de primeiro nível cabem sem rolagem com um grupo
  aberto

### Requirement: Estado ativo por rota

O item cujo caminho corresponde ao segmento atual da rota SHALL ser marcado
como ativo (`aria-current="page"`), o grupo que o contém SHALL ser marcado
mesmo quando fechado, e um caminho que apenas contém o texto de outro SHALL
NOT ativar o outro.

#### Scenario: Grupo fechado com filho ativo

- **WHEN** o usuário está em "Cadastros › Clientes" e fecha o grupo Cadastros
- **THEN** o grupo continua marcado como contendo a página ativa

#### Scenario: Rotas com prefixo comum

- **WHEN** o usuário está em "/configuracoes/produtos"
- **THEN** o item "Produtos" de Cadastros não é marcado como ativo

### Requirement: Recolhida com flyout

Com a barra recolhida, itens SHALL mostrar dica com o nome ao pairar ou
focar, e grupos SHALL abrir um menu lateral (flyout) com os subitens; o
flyout SHALL fechar com Esc e clique fora.

#### Scenario: Abrir Financeiro recolhido

- **WHEN** a barra está recolhida e o usuário clica em Financeiro
- **THEN** um menu lateral mostra os subitens de Financeiro sem expandir a
  barra

### Requirement: Uma lógica de permissão

Barra lateral e menu do celular SHALL mostrar exatamente os mesmos itens
para o mesmo usuário, derivados de uma única lógica de permissão, módulo
contratado e limite de plano.

#### Scenario: Usuário sem módulo de PDV

- **WHEN** um usuário sem o módulo de PDV abre o menu no computador e no
  celular
- **THEN** "Frente de caixa" não aparece em nenhum dos dois

### Requirement: Menu do celular acessível

No celular, o menu SHALL abrir como painel lateral com `role="dialog"`,
foco preso, fechamento por Esc e por toque fora, rolagem da página
bloqueada; o cabeçalho móvel SHALL mostrar o título da página e o voltar.

#### Scenario: Abrir e fechar no celular

- **WHEN** o usuário abre o menu e pressiona Esc (ou toca fora)
- **THEN** o menu fecha e o foco volta ao botão de menu

### Requirement: Botões do cromo com nome

O botão de recolher, o de ajuda, o de menu do usuário e o de menu móvel
SHALL ter nome acessível e indicar seu estado (`aria-expanded`).

#### Scenario: Recolher por teclado

- **WHEN** o usuário foca o botão de recolher
- **THEN** o leitor de tela anuncia "Recolher menu, expandido"
