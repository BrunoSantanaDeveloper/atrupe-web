# Dicionário de glifos

## Purpose

Fazer cada ícone de ação significar sempre o mesmo gesto, em qualquer tela.

## ADDED Requirements

### Requirement: Um gesto, um ícone

O sistema SHALL manter um dicionário que associa cada gesto de ação a um
único ícone (ver, buscar, editar, excluir, inativar, reativar, duplicar,
histórico, imprimir, exportar, importar, emitir nota, ver nota, consultar
status, reprocessar, navegar para documento, receber, pagar, faturar, editar
parcelas, menu de linha, novo, avançar, voltar, observação, anexo, erro,
aviso, sucesso, informação); ações de aplicação SHALL usar o ícone do
dicionário.

#### Scenario: Mesma ação em módulos diferentes

- **WHEN** "Editar" aparece em clientes, produtos, condições de pagamento e
  séries de venda
- **THEN** o ícone é o mesmo lápis em todas

#### Scenario: Dois gestos na mesma linha

- **WHEN** uma linha de ordem de serviço oferece "Imprimir via do cliente" e
  "Abrir ficha de produção"
- **THEN** os dois usam ícones diferentes (impressora e documento com chevron),
  não duas impressoras

### Requirement: Lupa é busca

O ícone de lupa SHALL aparecer apenas em campos e botões de busca; "ver",
"abrir" e "detalhes" SHALL usar o ícone de olho ou a própria linha clicável.

#### Scenario: Lista de clientes

- **WHEN** a lista de clientes mostra o campo de busca, o botão "Consultar
  CNPJ" e a ação de abrir o cadastro
- **THEN** só o campo de busca usa a lupa

### Requirement: Ícones de estado e de aviso

Avisos e alertas SHALL usar os ícones de círculo com X (erro), triângulo
(aviso), círculo com check (sucesso) e círculo com i (informação); nenhum
ícone de marca ou de produto de terceiros SHALL representar estado.

#### Scenario: Aviso de erro

- **WHEN** uma operação falha e um aviso aparece
- **THEN** o aviso mostra o ícone de círculo com X no tom de erro

### Requirement: Nenhum emoji ou SVG avulso como ícone

Marcadores de estado e ações SHALL NOT usar emoji nem SVG escrito à mão.

#### Scenario: Venda rápida na lista

- **WHEN** um orçamento é de venda rápida
- **THEN** a linha mostra um badge "Venda rápida" com ícone do dicionário, não
  o caractere "⚡"
