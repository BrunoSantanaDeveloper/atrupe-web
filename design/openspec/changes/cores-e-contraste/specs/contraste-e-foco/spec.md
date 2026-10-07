# Contraste e foco

## Purpose

Garantir legibilidade mínima de texto e controles em ambos os temas e um
único indicador de foco em todo o sistema.

## ADDED Requirements

### Requirement: Contraste mínimo

Texto SHALL ter contraste ≥ 4,5:1 sobre o fundo em que aparece; ícones
informativos, bordas de controle e indicadores de estado SHALL ter ≥ 3:1;
texto decorativo em caixas de cor (faixas do cabeçalho) SHALL seguir a mesma
regra.

#### Scenario: Auditoria automática por rota

- **WHEN** o `axe-core` roda sobre cada rota capturada com a regra
  `color-contrast`
- **THEN** nenhuma violação é reportada em texto visível nos dois temas

#### Scenario: Link no login

- **WHEN** a tela de login mostra "Esqueci minha senha" e "Criar conta"
- **THEN** os links usam a cor de marca de texto com contraste ≥ 4,5:1 sobre o
  branco

#### Scenario: Switch desligado

- **WHEN** um switch está desligado
- **THEN** o trilho tem contraste ≥ 3:1 com a superfície (não gray-100 sobre
  branco)

#### Scenario: Faixa de administração

- **WHEN** uma página administrativa mostra a faixa "Super Admin"
- **THEN** o texto branco sobre a faixa tem contraste ≥ 4,5:1 e a faixa usa
  um token (`tone-admin`), não um hexadecimal

### Requirement: Desabilitado legível

Um controle desabilitado SHALL permanecer legível (texto ≥ 3:1) e SHALL manter
a forma da sua variante (um botão sem borda não ganha caixa cinza ao
desabilitar).

#### Scenario: Botão primário desabilitado

- **WHEN** "Salvar" está desabilitado por formulário inválido
- **THEN** o botão aparece com fundo sutil, borda padrão e texto em cor
  desabilitada, e o rótulo continua legível

#### Scenario: Link desabilitado

- **WHEN** um botão de estilo link é desabilitado
- **THEN** só a cor do texto muda; não aparece fundo nem borda

### Requirement: Anel de foco único

Todo elemento interativo (botão, link, input, select, checkbox, radio, switch,
aba, item de menu, linha clicável, card clicável, chip) SHALL mostrar o mesmo
anel de foco (4 px na cor `ring-focus` mais borda `border-focus`) quando
focado por teclado, e SHALL NOT mostrá-lo ao clicar com o mouse.

#### Scenario: Navegação por Tab numa lista

- **WHEN** o usuário percorre com Tab o botão "Novo cliente", a busca, as abas
  e as ações de uma linha
- **THEN** cada elemento focado mostra o mesmo anel, inclusive as abas e as
  ações de linha

#### Scenario: Clique com o mouse

- **WHEN** o usuário clica num select com o mouse
- **THEN** o anel de foco não aparece; a borda muda para a cor de foco apenas
  enquanto o campo está aberto

#### Scenario: Elemento oculto

- **WHEN** uma ação está visualmente oculta (opacidade zero ou largura zero)
- **THEN** ela não recebe foco por teclado (está fora do DOM ou é `inert`)
