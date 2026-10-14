# Movimento

## Purpose

Transições curtas, consistentes e respeitosas da preferência de movimento
reduzido.

## ADDED Requirements

### Requirement: Durações por token

Transições SHALL usar uma de três durações: rápida (100 ms, mudanças de
cor), base (150 ms, botões, campos, chevrons, barra lateral) ou lenta (250
ms, entrada e saída de diálogo, painel lateral, accordion); entradas SHALL
desacelerar (`ease-out`) e saídas acelerar (`ease-in`).

#### Scenario: Recolher a barra lateral

- **WHEN** o usuário recolhe a barra lateral
- **THEN** a transição termina em 150 ms

#### Scenario: Abrir um painel lateral

- **WHEN** um painel lateral abre
- **THEN** ele desliza em 250 ms desacelerando e fecha em 250 ms acelerando

### Requirement: Propriedades animáveis

Transições SHALL animar apenas cor, cor de fundo, cor de borda, sombra,
opacidade e transformação; largura, altura, margem e padding SHALL NOT ser
animados (exceto a altura de accordion gerida pelo componente de kit).

#### Scenario: Lint de transition-all

- **WHEN** um arquivo usa `transition-all`
- **THEN** o lint falha pedindo o utilitário de transição do sistema

### Requirement: Movimento reduzido

Quando o sistema operacional pede movimento reduzido, a interface SHALL
desativar transições e animações decorativas, inclusive o pulso de
esqueletos e a rotação de spinners de página; spinners dentro de botões
SHALL ser substituídos por texto de estado.

#### Scenario: Preferência ativa

- **WHEN** `prefers-reduced-motion: reduce` está ativo e um diálogo abre
- **THEN** o diálogo aparece sem animação de entrada

### Requirement: Sem movimento de alarme ou espera artificial

Erros de validação SHALL NOT piscar ou pulsar; nenhuma ação SHALL incluir
espera artificial antes de atualizar a interface.

#### Scenario: Aba com erro

- **WHEN** uma aba de formulário contém campos inválidos
- **THEN** a aba mostra um indicador estático (ponto ou contagem no tom de
  erro), sem animação
