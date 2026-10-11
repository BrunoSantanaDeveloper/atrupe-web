# Tamanhos de contêiner

## Purpose

Diálogos, painéis laterais e cards têm tamanhos de um conjunto fechado e
raios por papel; cada tarefa usa o menor contêiner que cabe.

## ADDED Requirements

### Requirement: Tamanhos de diálogo

Diálogos SHALL ter um de cinco tamanhos: `sm` (400 px: confirmações), `md`
(560 px: formulário curto, padrão), `lg` (720 px: formulário em duas
colunas), `xl` (960 px: tabelas) ou `full`; larguras arbitrárias SHALL NOT
existir; o tamanho SHALL NOT mudar ao trocar de aba dentro do diálogo.

#### Scenario: Observações de um item

- **WHEN** o usuário abre o diálogo de observações de um item
- **THEN** o diálogo tem 560 px, não 950

#### Scenario: Diálogo com abas

- **WHEN** o usuário troca de aba dentro de um diálogo
- **THEN** a largura do diálogo não muda

#### Scenario: Lint de largura

- **WHEN** um componente passa `max-w-[855px]` ao conteúdo de um diálogo
- **THEN** o lint falha pedindo o tamanho nomeado

### Requirement: Painel lateral

O sistema SHALL oferecer um painel lateral (`Sheet`) com tamanhos `md`
(480 px), `lg` (640 px) e `xl` (800 px), com cabeçalho, corpo rolável e
rodapé, para ver ou editar um registro sem sair da lista.

#### Scenario: Abrir um registro a partir da lista

- **WHEN** o usuário abre os detalhes de uma movimentação a partir da lista
- **THEN** um painel lateral desliza sobre a lista, a lista continua visível
  atrás do véu e o painel não abre diálogos por cima de si

### Requirement: Anatomia do diálogo

O diálogo SHALL ter cabeçalho branco com título e descrição opcional (sem
faixa cinza nem ícone decorativo), corpo rolável com padding simétrico e
rodapé com os botões à direita separados por 12 px, com divisória só quando
o corpo rola.

#### Scenario: Diálogo curto

- **WHEN** um diálogo cabe na tela sem rolar
- **THEN** não há linha divisória entre o corpo e o rodapé

### Requirement: Raios por papel

Elementos SHALL usar um de três raios: `control` (8 px: botão, campo, chip,
célula de cor), `container` (12 px: card, diálogo, painel, menu, popover) ou
`pill` (badge, avatar); menu e submenu SHALL ter o mesmo raio.

#### Scenario: Menu e submenu

- **WHEN** um menu suspenso abre um submenu
- **THEN** ambos têm 12 px de raio

### Requirement: Menor contêiner que cabe

Confirmações e criação de objetos curtos SHALL usar diálogo; ver ou editar um
registro a partir de uma lista SHALL usar painel lateral; fluxos com mais de
uma etapa ou mais de oito campos agrupados SHALL usar página; um diálogo
SHALL NOT abrir outro diálogo.

#### Scenario: Cadastro completo de cliente

- **WHEN** o usuário cria um cliente com dados, endereços, contatos e limite
  de crédito
- **THEN** o fluxo acontece numa página ou num painel lateral com seções, não
  num diálogo com abas e altura presa à janela

#### Scenario: Lista de empresas

- **WHEN** o usuário abre a configuração da empresa e escolhe uma empresa
- **THEN** a empresa abre numa página ou painel, não num segundo diálogo
  sobre o primeiro
