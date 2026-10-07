# Hierarquia de página

## Purpose

Definir a ordem visual obrigatória dos textos em páginas, cards, diálogos e
tabelas agrupadas, para que o usuário saiba de relance o que é título, seção,
dado e apoio.

## ADDED Requirements

### Requirement: Um título por página

Toda página SHALL ter exatamente um `h1` com o papel `page-title`, renderizado
pelo cabeçalho de página; nenhum outro texto da área de conteúdo SHALL ser
maior que ele, exceto o valor do KPI herói do painel.

#### Scenario: Página com cards e KPIs

- **WHEN** a página "Base de custos › Resumo" é renderizada
- **THEN** "Base de custos" tem 24 px, os títulos dos cards têm 16 px, os
  valores de KPI têm 24 px e os rótulos de KPI têm 14 px

#### Scenario: Página sem cabeçalho

- **WHEN** uma página (ex.: o painel) não passa título ao cabeçalho de página
- **THEN** a página ainda assim exibe um `h1` com o nome da página

### Requirement: Subtítulo menor que o corpo-título

O subtítulo de página SHALL usar `page-subtitle` (14 px, cor terciária) e SHALL
ser um parágrafo, não um cabeçalho HTML.

#### Scenario: Detalhe de orçamento

- **WHEN** o cabeçalho mostra "Orçamento #1234" e o nome do cliente como apoio
- **THEN** o número tem 24 px em cor primária e o nome do cliente 14 px em cor
  terciária, na mesma linha ou logo abaixo

### Requirement: Níveis de cabeçalho em ordem

Seções de página SHALL usar `h2` com `section-title`; cards SHALL usar `h3` com
`card-title`; a navegação lateral SHALL NOT usar `h1`–`h6`, para que a lista de
títulos da página comece pelo `h1`. (Escolher o nível do título do card pelo
contexto, evitando `h1` → `h3` sem seção, fica para quando o cabeçalho de
página padronizado existir — `navegacao-e-cabecalhos`.)

#### Scenario: Leitor de tela lista os cabeçalhos

- **WHEN** um leitor de tela lista os cabeçalhos da página "Clientes"
- **THEN** o primeiro é "Clientes" (h1) e os módulos da barra lateral não
  aparecem na lista

### Requirement: Hierarquia em tabela agrupada

Em tabelas com linhas de grupo (setor, mês, categoria, nível de plano de
contas), a linha de grupo SHALL usar `eyebrow` e as linhas de dado `body`;
em árvores, o peso SHALL diminuir com a profundidade, nunca aumentar.

#### Scenario: Plano de contas

- **WHEN** o plano de contas mostra "Receitas" › "Vendas" › "Produtos" › conta
- **THEN** "Receitas" é a linha de grupo em `eyebrow`, os níveis intermediários
  usam `body-strong` e a conta usa `body`

#### Scenario: Perfil de vendedor

- **WHEN** a lista de perfis mostra o perfil e, abaixo, os vendedores
- **THEN** o nome do perfil usa `body-strong` (14 px) e seus valores `body`, e
  os vendedores ficam em linhas de dado normais, sem células vazias

### Requirement: KPI maior que o rótulo

Um indicador SHALL mostrar o valor em `kpi-value` (24 px, tabular) e o rótulo
em `kpi-label` (14 px), e o painel SHALL destacar no máximo dois KPIs com a
variante herói (30 px).

#### Scenario: Cards de resumo

- **WHEN** a tela mostra quatro cards de resumo lado a lado
- **THEN** os quatro valores têm 24 px e os quatro rótulos 14 px, e nenhum
  rótulo está em caixa alta

### Requirement: Título do documento

O título da aba do navegador SHALL seguir "Página · Módulo · Atrupe" e SHALL
ser diferente em cada sub-página de um módulo.

#### Scenario: Sub-páginas de um módulo

- **WHEN** o usuário abre "Base de custos › Mão de obra" e "Base de custos ›
  Patrimônios" em duas abas
- **THEN** as abas mostram "Mão de obra · Base de custos · Atrupe" e
  "Patrimônios · Base de custos · Atrupe"
