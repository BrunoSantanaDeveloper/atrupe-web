## Purpose

Define como as coisas se movem no Atrupe: quanto tempo duram as transições,
com que curva, como modais, painéis, abas e a barra lateral entram e saem, e
como o sistema se comporta para quem pede menos movimento.

## ADDED Requirements

### Requirement: Durações e curvas nomeadas
As transições de interface MUST usar as durações nomeadas `fast` (150 ms),
`base` (200 ms) e `slow` (300 ms) e a curva `out` para entradas. Nenhuma
transição de interface comum (hover, abrir, fechar, trocar) pode passar de
300 ms.

#### Scenario: Abrir um painel lateral
- **WHEN** o usuário abre um painel lateral (sheet)
- **THEN** o painel termina de entrar em até 300 ms

### Requirement: Saída mais rápida que entrada
Modais, diálogos de confirmação e painéis MUST fechar em menos tempo do que
levam para abrir.

#### Scenario: Fechar um modal
- **WHEN** o usuário fecha um modal
- **THEN** o modal some em 150 ms, mais rápido que os 200 ms da entrada

### Requirement: Modal entra do centro
Modais e diálogos de confirmação MUST aparecer na sua posição final, com fade e
leve aumento de escala, sem deslocamento lateral ou diagonal.

#### Scenario: Abrir um diálogo de confirmação
- **WHEN** o usuário clica em excluir e o diálogo de confirmação abre
- **THEN** o diálogo surge no centro da tela com fade e escala de 95% para 100%, sem deslizar

### Requirement: Conteúdo de abas entra suave
Ao trocar de aba (componente `Tabs`), o conteúdo da aba nova MUST entrar com
fade de no máximo 200 ms.

#### Scenario: Trocar de aba
- **WHEN** o usuário troca de aba num formulário com abas
- **THEN** o conteúdo da nova aba aparece com fade, sem salto seco

### Requirement: Recolher a barra lateral
Recolher e expandir a barra lateral do desktop MUST terminar em até 300 ms,
animando a largura da barra e a opacidade dos rótulos.

#### Scenario: Recolher
- **WHEN** o usuário clica para recolher a barra lateral
- **THEN** a barra encolhe e os rótulos somem em até 300 ms

### Requirement: Redução de movimento
Com `prefers-reduced-motion: reduce`, animações e transições MUST ser
praticamente instantâneas, exceto os indicadores de progresso giratórios, que
continuam girando para indicar trabalho em andamento.

#### Scenario: Sistema com movimento reduzido
- **WHEN** o sistema operacional pede movimento reduzido e o usuário abre um modal
- **THEN** o modal aparece sem animação
