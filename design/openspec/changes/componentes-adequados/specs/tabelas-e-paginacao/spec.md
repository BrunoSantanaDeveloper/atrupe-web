# Tabelas e paginação

## Purpose

Toda lista usa a mesma tabela, com números alinhados, ordenação, seleção,
estados e uma única paginação.

## ADDED Requirements

### Requirement: Uma tabela

Listas tabulares SHALL usar o componente de tabela do kit; tabelas HTML cruas
e "tabelas" feitas de divs SHALL NOT existir.

#### Scenario: Tabela de CFOP

- **WHEN** a tela de CFOP lista os códigos
- **THEN** a lista usa a tabela do kit com cabeçalho no papel de cabeçalho
  de tabela, não um `<table>` com cabeçalho em caixa alta

### Requirement: Colunas numéricas

Colunas de valor, quantidade e percentual SHALL ser declaradas numéricas:
alinhadas à direita, com numerais tabulares e cabeçalho alinhado à direita;
valores ausentes SHALL ser "–" na cor terciária, nunca "R$ 0,00" quando não
há valor.

#### Scenario: Coluna de valores

- **WHEN** uma tabela mostra "Valor" e "Desconto"
- **THEN** cabeçalho e células das duas colunas estão à direita e os dígitos
  alinham entre linhas

### Requirement: Ordenação acessível

Colunas ordenáveis SHALL ter cabeçalho clicável com indicador de direção e
`aria-sort`; a ordenação ativa SHALL ser visível sem cor.

#### Scenario: Ordenar por vencimento

- **WHEN** o usuário clica em "Vencimento"
- **THEN** a seta indica crescente, o cabeçalho informa `aria-sort="ascending"`
  e um segundo clique inverte

### Requirement: Cabeçalho e coluna fixos

Tabelas com rolagem vertical longa SHALL poder fixar o cabeçalho; tabelas
com rolagem horizontal SHALL fixar a primeira coluna (identificador).

#### Scenario: Despesas administrativas

- **WHEN** a tabela de despesas tem oito colunas e rola horizontalmente
- **THEN** a coluna com o nome da conta permanece visível

### Requirement: Estados embutidos

A tabela SHALL renderizar sozinha os estados carregando (esqueleto com o
número real de colunas), erro (com tentar de novo), vazio (com ação de criar)
e sem resultados (com limpar filtros), ocupando a largura total; a paginação
SHALL NOT aparecer em tabela vazia.

#### Scenario: Sem resultados para o filtro

- **WHEN** a busca não encontra registros
- **THEN** a tabela mostra "Nada encontrado para os filtros" com "Limpar
  filtros", e a paginação não aparece

#### Scenario: Filtros permanecem

- **WHEN** a aba ou o filtro atual não tem registros
- **THEN** os filtros e a busca continuam visíveis para o usuário mudá-los

### Requirement: Linha de grupo e colSpan

Linhas de grupo e de estado SHALL ocupar todas as colunas da tabela sem que
a tela informe o número de colunas.

#### Scenario: Coluna condicional

- **WHEN** a coluna "Valor" é ocultada por permissão
- **THEN** a linha de grupo continua ocupando todas as colunas visíveis

### Requirement: Paginação única

Listas paginadas SHALL usar um único componente de paginação que mostra o
intervalo ("1–20 de 340"), permite escolher o tamanho da página (10/20/50),
tem botões "Anterior"/"Próxima" acessíveis (desabilitados sem foco quando não
há página) e páginas numeradas com a atual marcada; a última página SHALL
vir do servidor, não de divisão no navegador.

#### Scenario: Última página

- **WHEN** o usuário está na última página
- **THEN** "Próxima" está desabilitado e não recebe foco por Tab

#### Scenario: Duas listas na mesma página

- **WHEN** uma página tem duas listas paginadas
- **THEN** cada uma tem o seu parâmetro de página; paginar uma não pagina a
  outra

### Requirement: Listas longas sempre com busca e paginação

Listas que podem passar de 50 registros (produtos, materiais, projetos,
movimentos de estoque, despesas administrativas, histórico do caixa) SHALL
ter busca e paginação (ou rolagem virtual) e SHALL NOT carregar tudo no
navegador.

#### Scenario: Precificação de produtos

- **WHEN** a empresa tem 2 000 produtos
- **THEN** a lista de precificação mostra uma página por vez, com busca por
  nome e código
