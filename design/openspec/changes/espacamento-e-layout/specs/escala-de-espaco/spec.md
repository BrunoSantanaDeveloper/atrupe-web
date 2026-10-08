# Escala de espaço

## Purpose

Todo espaçamento da interface vem de uma grade de 4 px e de medidas fixas por
lugar, para que telas diferentes tenham o mesmo ritmo.

## ADDED Requirements

### Requirement: Grade de 4 px

Margens, paddings e gaps SHALL ser múltiplos de 4 px tomados dos tokens de
espaço; valores arbitrários (`p-[13px]`, `mt-[6px]`) SHALL NOT existir.

#### Scenario: Lint de valor arbitrário

- **WHEN** um arquivo usa `gap-[10px]` ou `mt-[6px]`
- **THEN** o lint falha apontando o token mais próximo

### Requirement: Medidas por lugar

A área de conteúdo SHALL ter gutter de 24 px em todos os lados; seções de
página SHALL distar 24 px; o padding de card SHALL ser 20 px (cabeçalho
compacto 16); campos de formulário SHALL distar 16 px e grupos de campos 32;
elementos em linha (botões, chips) SHALL distar 8 px; linhas de hub SHALL ter
64 px de altura.

#### Scenario: Página com cabeçalho e dois cards

- **WHEN** uma página mostra o cabeçalho, um card de filtros e um card de
  tabela
- **THEN** há 24 px da borda da área de conteúdo ao primeiro elemento em
  todos os lados, 20 px entre o cabeçalho e o primeiro card e 24 px entre os
  cards

#### Scenario: Padding assimétrico

- **WHEN** a área de conteúdo ou o corpo de um diálogo mostra uma barra de
  rolagem
- **THEN** o padding esquerdo e o direito permanecem iguais

### Requirement: Densidade de tabela

Linhas de tabela SHALL ter 44 px de altura mínima por padrão (36 px na
densidade compacta) e o cabeçalho 40 px; a densidade SHALL ser definida na
tabela, não em cada célula.

#### Scenario: Lista capturada

- **WHEN** as alturas das linhas de uma lista são medidas
- **THEN** linhas de uma só linha de texto medem 44 px e linhas com duas
  linhas de texto medem no máximo 56 px

#### Scenario: Tabela compacta

- **WHEN** uma tabela de conferência (matriz de permissões, itens de nota)
  usa densidade compacta
- **THEN** suas linhas medem 36 px e o texto continua com 14 px

### Requirement: Formulário em grade

Formulários SHALL usar uma grade de 12 colunas com campos ocupando colunas
inteiras, grupos separados por 32 px com título de seção, e repetidores
(endereços, contatos) com cabeçalho de item e ação de remover; SHALL NOT
usar elementos vazios, larguras flexíveis mistas ou alturas de linha
artificiais para alinhar.

#### Scenario: Endereço

- **WHEN** um formulário pede endereço
- **THEN** os campos aparecem na ordem CEP, Rua, Número, Complemento, Bairro,
  Cidade/UF, em uma grade alinhada em duas ou três colunas, colapsando para
  uma coluna em telas estreitas

#### Scenario: Parcelas

- **WHEN** um formulário lista parcelas editáveis
- **THEN** há uma única linha de cabeçalho com os rótulos e cada parcela é uma
  linha alinhada abaixo dela

### Requirement: Barra lateral

A barra lateral SHALL ter 264 px expandida e 64 px recolhida, logo de 56 px,
itens de 36 px, subitens de 32 px, seções separadas por 16 px sem régua por
item, e a conta do usuário no rodapé.

#### Scenario: Primeiro item visível

- **WHEN** a barra lateral é exibida a 900 px de altura
- **THEN** o primeiro item de navegação começa a menos de 80 px do topo da
  barra

### Requirement: Estado vazio pelo conteúdo

Estados vazios SHALL ter altura definida pelo conteúdo (padding vertical de
48 px), nunca pela altura da janela.

#### Scenario: Card com abas vazio

- **WHEN** uma aba sem registros é exibida dentro de um card abaixo de KPIs
- **THEN** o estado vazio ocupa só o necessário e a página não ganha rolagem
  por causa dele
