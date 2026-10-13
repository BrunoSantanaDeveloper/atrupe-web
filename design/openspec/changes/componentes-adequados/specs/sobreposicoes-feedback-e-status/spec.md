# Sobreposições, feedback e status

## Purpose

Ver e editar a partir de listas sem empilhar diálogos; mostrar status,
avisos, estados vazios, caminho e etapas sempre com o mesmo componente.

## ADDED Requirements

### Requirement: Painel lateral para registros

Ver ou editar um registro a partir de uma lista SHALL abrir um painel
lateral com cabeçalho (título, status, ações) e corpo em seções; o painel
SHALL ser endereçável pela URL e fechar com o botão voltar do navegador.

#### Scenario: Detalhe de movimentação

- **WHEN** o usuário abre uma movimentação na lista "A receber"
- **THEN** um painel lateral mostra os dados, o histórico e as ações; a lista
  continua visível atrás

#### Scenario: Diálogo não abre diálogo

- **WHEN** uma ação dentro de um painel ou diálogo precisa de outra tela
- **THEN** o conteúdo do painel é substituído (com "Voltar") ou o diálogo
  fecha antes de abrir o próximo; nunca há dois diálogos empilhados

### Requirement: Etapas visíveis

Fluxos com mais de uma etapa SHALL mostrar um indicador de etapas com a
atual marcada e permitir voltar; cada etapa SHALL ter "Voltar" e "Avançar"
(ou "Concluir").

#### Scenario: Emitir nota em dois passos

- **WHEN** o usuário escolhe o tipo de nota e depois preenche os dados
- **THEN** vê "1 Tipo › 2 Dados" com a etapa atual marcada e um "Voltar" na
  segunda

### Requirement: Badge de status único

Status SHALL ser mostrados pelo badge de status, que lê rótulo, tom e ícone
do dicionário de estados; polegares, pontos coloridos sem texto e enums crus
SHALL NOT representar status.

#### Scenario: Lista de notas e seção de avulsas

- **WHEN** uma nota autorizada aparece na lista e na seção de avulsas
- **THEN** o badge é idêntico nos dois lugares

### Requirement: Alertas e banners

Avisos persistentes na tela SHALL usar o componente de alerta (informação,
sucesso, atenção, erro) e avisos de sistema no topo (ambiente de
homologação, teste expirado, bloqueio) SHALL usar o banner do kit; caixas
coloridas feitas à mão SHALL NOT existir.

#### Scenario: Ambiente de homologação

- **WHEN** a empresa está em ambiente de homologação fiscal
- **THEN** a tela de emissão mostra o alerta de atenção do kit, igual ao
  banner de ambiente de desenvolvimento no topo

### Requirement: Estado vazio único

Estados vazios SHALL usar um único componente com os tipos "vazio" (com
ação de criar), "sem resultados" (com limpar filtros), "erro" (com tentar de
novo) e "sem permissão" (com quem pedir); a mensagem SHALL dizer o que falta
e a ação SHALL ser coerente com o tipo.

#### Scenario: Nenhum patrimônio

- **WHEN** a empresa não tem patrimônios cadastrados
- **THEN** o estado vazio mostra "Nenhum patrimônio ainda" com o botão
  "Novo patrimônio"

#### Scenario: Sem permissão

- **WHEN** o usuário abre uma página que não pode ver
- **THEN** a página mostra o estado "sem permissão" com o título da página,
  a explicação e o contato do administrador — nunca uma página em branco

#### Scenario: Filtro sem itens

- **WHEN** o filtro "Abaixo do mínimo" não tem materiais
- **THEN** o estado diz "Nenhum material abaixo do mínimo", não "Nenhum
  material em estoque"

### Requirement: Breadcrumb

Páginas com mais de um nível SHALL mostrar o caminho (módulo › página ›
registro) acima do título; o último item SHALL ser a página atual, sem link.

#### Scenario: Composição de um orçamento

- **WHEN** o usuário está em "Itens do orçamento 1234"
- **THEN** vê "Vendas › Orçamentos › #1234 › Composição" e pode voltar a
  qualquer nível

### Requirement: Abas no cabeçalho

Abas de sub-rota ou de status SHALL ficar no cabeçalho da página, abaixo do
título, com contador só quando maior que zero; abas SHALL NOT ficar dentro
do cabeçalho de um card nem ser usadas como filtros lado a lado.

#### Scenario: Comparativo com status e período

- **WHEN** o comparativo precisa de status e período
- **THEN** o status fica nas abas do cabeçalho e o período num seletor de
  intervalo
