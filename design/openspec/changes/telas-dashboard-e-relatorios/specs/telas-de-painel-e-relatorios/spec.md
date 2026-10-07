# Telas de painel e relatórios

## Purpose

O painel destaca o que importa e cada relatório tem o mesmo esqueleto,
filtra de um jeito, exporta com rótulo e desenha gráficos legíveis.

## ADDED Requirements

### Requirement: Painel com hierarquia

O painel SHALL ter título, seletor de período no cabeçalho, no máximo dois
indicadores em destaque (maiores, com variação em relação ao período
anterior) e os demais em cards padrão; cada conceito SHALL aparecer uma
única vez com uma única definição; grades SHALL NOT deixar card órfão; erro
de carregamento SHALL aparecer como erro.

#### Scenario: Abrir o painel

- **WHEN** o usuário abre o painel
- **THEN** vê "Painel" como título, dois números em destaque com setas de
  variação e os outros indicadores menores; "Não aprovados" aparece uma vez
  com a sua definição acessível

#### Scenario: Falha em um card

- **WHEN** a requisição de vendas falha
- **THEN** o card mostra o estado de erro com "Tentar de novo", não
  "Nenhuma venda"

### Requirement: Esqueleto de relatório

Todo relatório SHALL ter o mesmo esqueleto: cabeçalho com título "Relatório
de …" (ou nome próprio), seletor de intervalo com presets como único filtro
de período, "Exportar" com rótulo (PDF/Excel) e, quando existir, "Relatório
avançado"; indicadores com um destaque; gráficos; tabela; filtros SHALL
persistir na URL e SHALL ser únicos por tela (a tabela obedece ao período da
página); espaçamento entre seções SHALL ser o mesmo em todos.

#### Scenario: Recarregar com filtro de cliente

- **WHEN** o usuário filtra o relatório de vendas por um cliente e
  recarrega a página
- **THEN** o filtro continua aplicado e o campo mostra o cliente

#### Scenario: Período e tabela

- **WHEN** o usuário muda o período do relatório
- **THEN** indicadores, gráficos e tabela mostram o mesmo período

### Requirement: Gráficos por token

Gráficos SHALL usar as cores de gráfico do sistema, a legenda SHALL ser
gerada da mesma configuração das séries, e SHALL haver estados vazio e de
erro; um gráfico que não obedece ao filtro de período SHALL dizer no título
qual período mostra.

#### Scenario: Sem dados no período

- **WHEN** não há orçamentos no período
- **THEN** o gráfico de origem mostra "Sem dados no período" em vez de uma
  rosca vazia

### Requirement: Tabelas de relatório

Tabelas de relatório SHALL ter colunas numéricas alinhadas à direita com
valores neutros (negativos com sinal), cabeçalhos estáveis durante o
carregamento, percentuais com vírgula, estado vazio e paginação no rodapé
do card.

#### Scenario: Resultado negativo

- **WHEN** um setor fecha com resultado negativo
- **THEN** o valor aparece "−R$ 1.200,00" em tom de erro, nunca em verde

### Requirement: DFC acessível

A tabela do DFC SHALL expandir linhas por um botão com nome e estado
(`aria-expanded`) de pelo menos 32 px, e SHALL identificar entradas e
saídas pelo valor, não pelo nome da linha.

#### Scenario: Expandir uma categoria

- **WHEN** o usuário aciona o botão de expandir de "Despesas operacionais"
- **THEN** as subcategorias aparecem e o botão informa `aria-expanded="true"`

### Requirement: Exportar com rótulo

A exportação SHALL ser um botão "Exportar" com rótulo e menu (PDF, Excel);
SHALL NOT ser um ícone de impressora sem nome.

#### Scenario: Exportar comissões

- **WHEN** o usuário aciona "Exportar" no relatório de comissões
- **THEN** vê o menu com "PDF" e "Excel"
