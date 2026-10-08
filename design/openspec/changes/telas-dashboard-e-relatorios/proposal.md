# Telas de painel e relatórios

## Why

O painel não tem título, mostra dez KPIs do mesmo tamanho com o mesmo ícone
sem destacar nenhum nem comparar com o período anterior, chama a mesma API
duas vezes para repetir contagens em dois cards, define "Não aprovados" de
dois jeitos na mesma tela, deixa um card órfão numa grade de dois, trata
erro como "nenhuma venda" e carrega componentes mortos de 700 linhas com
estilos fora do sistema. Os relatórios não têm um padrão de título nem de
ação (impressora sem nome que abre PDF/Excel), usam paletas hexadecimais por
arquivo com legendas que não batem com as séries e uma cor que o próprio
código diz reprovar em contraste, misturam filtro global e filtro de tabela
que discordam, perdem filtros ao recarregar, não têm estado vazio em tabelas
e gráficos, pintam resultados negativos de verde e formatam percentual com
ponto. Evidência: `design/openspec/design/sistema-visual.md` §2 e o
relatório de módulo resumido em `design.md`.

## What Changes

- **Painel:** `PageHeader` "Painel" com período (`DateRangePicker` com
  presets); dois KPIs herói (faturamento e resultado, por exemplo — a
  confirmar) com variação em relação ao período anterior e os demais em
  `KpiCard` padrão; cada conceito uma vez (os cards "Orçamentos" e "Resumo
  de vendas" fundidos, uma chamada); definição única de "Não aprovados";
  grades 4/2/1 e 3/1 sem órfão; `QueryState` com erro; banner fiscal como
  `Banner` do kit; período como `SegmentedControl`; código morto removido.
- **Relatórios:** padrão de página — `PageHeader` com título "Relatório de
  …", `DateRangePicker` com presets como filtro único (sem select de
  período + range), "Exportar" (PDF/Excel) como secundária com rótulo e
  "Relatório avançado" só onde existe; filtros persistidos na URL; um
  filtro por tela (a tabela obedece ao filtro da página); `KpiCard` com
  hierarquia (um herói por relatório); gráficos pelos tokens `chart-*` com
  legenda da mesma config, estados vazio/erro e nota quando o gráfico
  ignora o período; tabelas com `numeric`, estado vazio, paginação em
  `CardFooter` e cabeçalhos estáveis; `Money` neutro (negativo com sinal);
  percentual por `Intl`; DFC com expansão acessível e negativos por valor,
  não por nome; comissões com filtros na URL; projeção com negativos
  sinalizados; resultado por setor com `KpiCard` e sem `return null`.
- Títulos e espaçamentos uniformes; `Tabs` de link no cabeçalho (financeiro
  Receitas/Despesas).

## Capabilities

### New Capabilities

- `telas-de-painel-e-relatorios`: o que o painel e cada relatório exibem e
  como filtram, exportam e tratam estados.

### Modified Capabilities

Nenhuma.

## Impact

- `src/app/(app-sidebar)/dashboard/**`, `relatorios/**` (≈ 70 arquivos),
  `common/charts/**`, `ui/chart.tsx` (uso), `common/ExportDataButton.tsx`,
  `common/KpiCard.tsx` (de `telas-cadastros-producao-custos` ou criado aqui,
  o que vier primeiro).
- Depende de `navegacao-e-cabecalhos`, `componentes-adequados` e
  `cores-e-contraste` (tokens de gráfico).
- Achados fora de escopo (regras): definição de "Não aprovados"; quais
  KPIs são herói; se "Aprovados × rejeitados" deve obedecer ao período;
  "Ticket médio" único; DFC classificar negativos por tipo de conta, não
  pelo nome "Despesas".
