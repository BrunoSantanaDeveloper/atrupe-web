# papeis-tipograficos Specification

## Purpose
Garantir que todo texto da interface pertence a um papel com tamanho, altura
de linha, peso e cor definidos uma vez, para que a hierarquia seja a mesma em
qualquer tela.

## Requirements

### Requirement: Escala fechada de papéis

A interface SHALL usar exclusivamente os papéis `page-title` (24/32, 600),
`page-subtitle` (14/20, 400), `section-title` (18/28, 600), `card-title`
(16/24, 600), `dialog-title` (18/28, 600), `object-title` (24/32, 600),
`kpi-value` (24/32, 600, numerais tabulares; variante herói 30/38),
`kpi-label` (14/20, 500), `body` (14/20, 400), `body-strong` (14/20, 600),
`secondary` (14/20, 400), `caption` (12/18, 400), `label` (14/20, 500),
`helper` (14/20, 400), `eyebrow` (12/18, 600, caixa alta, espaçamento 0,04em),
`table-header` (12/18, 500), `nav-item` (14/20, 500) e `nav-group` (= eyebrow).

#### Scenario: Página capturada

- **WHEN** uma página do sistema é renderizada a 1440×900 e os tamanhos de
  fonte dos textos visíveis são coletados
- **THEN** todo tamanho encontrado está no conjunto {12, 14, 16, 18, 24, 30}
  px e nenhum texto tem menos de 12 px

#### Scenario: Texto sem papel

- **WHEN** um desenvolvedor escreve `className="text-[11px]"` ou
  `className="uppercase tracking-wider"` fora do papel `eyebrow`
- **THEN** o lint do projeto falha apontando o papel equivalente

### Requirement: Primitivos de texto

O sistema SHALL oferecer os componentes `Heading` (escolhe a tag `h1`–`h4` e o
papel) e `Text` (escolhe `p`/`span` e o papel), e os componentes de kit
`CardTitle`, `CardDescription`, `DialogTitle`, `DialogDescription`,
`SheetTitle`, `AlertDialogTitle`, `TableHead`, `FormLabel`, `FormDescription`
e `FormMessage` SHALL aplicar o papel correspondente por padrão.

#### Scenario: Card sem sobrescrita

- **WHEN** uma página usa `<CardTitle>Resumo</CardTitle>` sem `className`
- **THEN** o título renderiza com 16 px, altura 24, peso 600 e a cor de texto
  primária, igual a qualquer outro card do sistema

#### Scenario: Diálogo e página

- **WHEN** um diálogo está aberto sobre uma página
- **THEN** o título do diálogo (18 px) é menor que o título da página (24 px) e
  maior que o corpo (14 px)

### Requirement: Caixa alta só no eyebrow

Texto em caixa alta SHALL existir apenas no papel `eyebrow`, usado em
cabeçalhos de grupo de tabela, rótulos de seção de formulário e rótulos de
seção da navegação lateral.

#### Scenario: Cabeçalho de grupo em tabela

- **WHEN** uma tabela agrupa linhas por setor, mês ou categoria
- **THEN** a linha de grupo usa `eyebrow` (12 px, caixa alta) sobre fundo sutil
  e as linhas de dado usam `body` (14 px)

#### Scenario: Rótulo de campo

- **WHEN** um formulário exibe o rótulo de um campo
- **THEN** o rótulo está em caixa normal, 14 px, peso 500

### Requirement: Numerais tabulares

Células numéricas de tabela, valores de KPI e totais SHALL usar numerais
tabulares (`font-variant-numeric: tabular-nums`).

#### Scenario: Coluna de valores

- **WHEN** uma coluna de tabela mostra valores em reais
- **THEN** os dígitos de linhas diferentes ficam alinhados verticalmente e o
  valor é alinhado à direita

### Requirement: Cores de texto por papel

Cada papel SHALL carregar a sua cor (primária para títulos e identificadores,
secundária para corpo e rótulos, terciária para apoio, legendas e cabeçalhos de
tabela); a página SHALL NOT precisar repetir a cor ao lado do papel. O limite
de contraste do texto é da capability `contraste-e-foco` (mudança
`cores-e-contraste`).

#### Scenario: Texto de apoio numa linha de tabela

- **WHEN** uma célula mostra um identificador e, abaixo, uma linha de apoio
  (e-mail, descrição)
- **THEN** o identificador usa `body-strong` (cor primária) e o apoio usa
  `secondary` (cor terciária), sem classe de cor na célula
