# Biblioteca e tamanhos de ícone

## Purpose

Uma única biblioteca de ícones, com tamanhos e traço definidos pelo contexto
e acessibilidade garantida pelo componente.

## ADDED Requirements

### Requirement: Uma biblioteca

Todos os ícones de interface SHALL vir de uma única biblioteca (Tabler,
estilo contorno); pictogramas próprios SHALL seguir o mesmo traço e grade, e
logos de terceiros SHALL ser imagens, não ícones.

#### Scenario: Primitivo do kit

- **WHEN** um select, um accordion ou um menu mostra seu chevron
- **THEN** o chevron tem o mesmo traço e a mesma grade dos ícones de ação da
  página ao redor

#### Scenario: Logo de banco

- **WHEN** um cartão de conta bancária mostra o logo do banco
- **THEN** o logo é uma imagem com texto alternativo com o nome do banco

### Requirement: Três tamanhos por contexto

Ícones SHALL ter um de três tamanhos: 16 px (texto em linha, botão pequeno,
chip), 20 px (botão médio e grande, ação de linha, campo, item de menu) ou
24 px (navegação lateral, cabeçalho de página, estado vazio); o traço SHALL
ser 2 até 20 px e 1,5 em 24 px; o tamanho SHALL ser decidido pelo componente
que contém o ícone, não pela página.

#### Scenario: Botão pequeno

- **WHEN** um botão de tamanho pequeno recebe um ícone
- **THEN** o ícone renderiza com 16 px e traço 2, sem que a página informe o
  tamanho

#### Scenario: Ação de linha

- **WHEN** uma ação de linha de tabela mostra um ícone
- **THEN** o ícone tem 20 px e o alvo de clique tem pelo menos 32 px

#### Scenario: Página capturada

- **WHEN** os tamanhos dos SVGs visíveis de uma página são coletados
- **THEN** todos pertencem a {16, 20, 24} px (pictogramas de estado vazio e
  logos excluídos)

### Requirement: Ícone acessível

Um ícone decorativo (ao lado de texto) SHALL ser `aria-hidden`; um ícone
informativo (sozinho) SHALL ter nome acessível e dica.

#### Scenario: Ícone ao lado do rótulo

- **WHEN** o botão "Novo cliente" tem um ícone de mais
- **THEN** o leitor de tela lê apenas "Novo cliente"

#### Scenario: Ícone sozinho

- **WHEN** uma ação de linha é só um ícone de lápis
- **THEN** ela tem `aria-label` "Editar <nome do registro>" e mostra uma dica
  com o mesmo texto ao focar ou pairar
