# Estados interativos

## Purpose

Tudo que é clicável parece clicável, responde ao pairar e ao focar, e nunca
está invisível para o teclado.

## ADDED Requirements

### Requirement: Hover em todo interativo

Todo elemento clicável SHALL mudar visivelmente ao pairar: linhas de lista
mudam de fundo, cards com link ganham borda forte e sombra, links ganham
sublinhado, botões seguem o hover da sua variante; o cursor SHALL ser de
ponteiro em todo elemento clicável e SHALL NOT ser de ponteiro em elementos
não clicáveis.

#### Scenario: Card de resumo com link

- **WHEN** o usuário paira sobre um card de KPI que leva a outra página
- **THEN** a borda do card escurece, aparece uma sombra leve, o cursor é de
  ponteiro e um chevron indica a navegação

#### Scenario: Linha de hub

- **WHEN** o usuário paira sobre uma linha do hub de configurações
- **THEN** o fundo da linha muda e o cursor é de ponteiro

#### Scenario: Elemento não clicável

- **WHEN** o usuário paira sobre um badge de status ou um texto
- **THEN** o cursor continua de seta e nada muda

### Requirement: Foco visível e único

Todo elemento interativo SHALL mostrar o anel de foco do sistema ao receber
foco por teclado — inclusive abas, chips, cards de escolha, linhas
clicáveis, itens de menu e controles de formulário; nenhum elemento SHALL
remover o outline sem repor o anel; o anel SHALL NOT aparecer ao clicar com o
mouse.

#### Scenario: Abas por teclado

- **WHEN** o usuário move o foco para uma aba com Tab e entre abas com as
  setas
- **THEN** a aba focada mostra o anel de foco

#### Scenario: Card de escolha

- **WHEN** o usuário navega por Tab entre opções de tipo de nota fiscal
- **THEN** cada card focado mostra o anel e Espaço/Enter seleciona

### Requirement: Affordance sempre visível

Controles SHALL ser visíveis sem depender do hover; SHALL NOT existir
controle com opacidade zero, largura zero ou fora da tela que ainda receba
foco.

#### Scenario: Renomear uma etapa

- **WHEN** o usuário vê o nome de uma etapa renomeável
- **THEN** o botão de renomear (lápis) está visível ao lado do nome, em nível
  terciário, sem precisar pairar

#### Scenario: Ação oculta por estado

- **WHEN** uma ação não se aplica ao estado atual de uma linha
- **THEN** ela não está no DOM, ou está desabilitada com motivo; o Tab nunca
  para num botão invisível

### Requirement: Clicável tem semântica

Elementos clicáveis SHALL ser `button`, `a` ou ter `role` e manipulador de
teclado equivalente; cabeçalhos de card clicáveis SHALL ser botões com
`aria-expanded`.

#### Scenario: Cabeçalho de card de emissor

- **WHEN** o usuário pressiona Enter no cabeçalho de um card de emissor
- **THEN** o card expande ou recolhe e `aria-expanded` reflete o estado
