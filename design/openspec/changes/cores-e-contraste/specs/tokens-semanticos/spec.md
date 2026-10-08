# Tokens semânticos

## Purpose

Garantir que toda cor da interface vem de uma camada semântica com valor claro
e escuro, que opacidade funciona em qualquer cor e que nenhuma cor fora dos
tokens chega ao produto.

## ADDED Requirements

### Requirement: Camada semântica obrigatória

Componentes e páginas SHALL usar apenas os tokens semânticos (`text-*`, `bg-*`,
`border-*`, `ring-focus`, `scrim`, `tone-<tom>-<papel>`, `chart-*`) para cor;
as rampas (`gray-500`, `brand-600`…) SHALL ser referenciadas só pela definição
dos tokens semânticos e dos componentes de kit.

#### Scenario: Página nova

- **WHEN** uma página usa `className="text-gray-400"` ou `className="bg-brand-25"`
  fora de `src/components/ui`
- **THEN** o lint aponta o token semântico equivalente (`text-disabled`,
  `bg-surface-selected`)

#### Scenario: Mesmo token nos dois temas

- **WHEN** o usuário alterna entre tema claro e escuro
- **THEN** um elemento com `bg-surface` continua sendo superfície (branco no
  claro, cinza escuro no escuro) sem nenhuma classe `dark:` no elemento

### Requirement: Opacidade em qualquer cor

Toda cor do sistema SHALL aceitar modificador de opacidade (`/NN`) e gerar o
CSS correspondente.

#### Scenario: Véu de diálogo

- **WHEN** um diálogo, sheet ou drawer abre
- **THEN** o fundo da página fica visivelmente escurecido pelo véu (`scrim`,
  60 % de opacidade) em ambos os temas

#### Scenario: Superfície translúcida

- **WHEN** um componente usa `bg-surface/50`
- **THEN** o CSS compilado contém a classe e o elemento fica meio transparente

### Requirement: Sem cor fora dos tokens

O código SHALL NOT conter hexadecimais, classes das paletas padrão do Tailwind
(`red-*`, `amber-*`, `emerald-*`, `blue-*`, `indigo-*`, `neutral-*`…) nem
classes de cor que não compilam; o CI SHALL falhar quando encontrar uma.

#### Scenario: Classe que não existe

- **WHEN** um arquivo usa `text-muted-foreground`, `bg-blue-light` ou `text-lG`
- **THEN** o teste de classes desconhecidas falha no CI nomeando o arquivo e a
  classe

#### Scenario: Hexadecimal em className

- **WHEN** um arquivo usa `bg-[#FF4201]` ou `stroke="#E4E4E7"` em JSX
- **THEN** o lint falha; o único lugar com valores literais de cor é
  `src/app/globals.css`

### Requirement: Borda padrão sutil

A classe `border` sem cor SHALL produzir a borda padrão (`border-default`,
gray-200 no claro); a borda forte (`border-strong`, gray-300) SHALL ser usada
apenas em controles de formulário e botões secundários.

#### Scenario: Divisória de card

- **WHEN** um card usa `border-b` entre cabeçalho e conteúdo
- **THEN** a linha renderiza na cor `border-default`, não em cinza médio

### Requirement: Gráficos por token

Séries, grades, eixos e legendas de gráficos SHALL usar os tokens `chart-1…6`,
`chart-positive`, `chart-negative`, `chart-grid` e `chart-axis`, e a legenda
SHALL ler a cor da mesma configuração da série.

#### Scenario: Legenda e série

- **WHEN** o gráfico "Aprovados × rejeitados" mostra três séries
- **THEN** a amostra de cor de cada item da legenda é idêntica à cor da barra
  correspondente, em ambos os temas

#### Scenario: Contraste da série

- **WHEN** qualquer série é desenhada sobre a superfície
- **THEN** o contraste entre a cor da série e a superfície é de pelo menos 3:1
