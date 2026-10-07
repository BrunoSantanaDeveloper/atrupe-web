# Carregamento e avisos

## Purpose

Um único jeito de dizer "está carregando", "deu erro" e "deu certo".

## ADDED Requirements

### Requirement: Esqueleto com forma

Enquanto página, tabela ou cards carregam, a interface SHALL mostrar um
esqueleto com a forma do conteúdo esperado (linhas da tabela, cards de KPI,
cabeçalho) marcado como ocupado; SHALL NOT mostrar um bloco cinza genérico
nem o texto "Carregando…" sozinho.

#### Scenario: Lista carregando

- **WHEN** a lista de clientes está buscando dados
- **THEN** aparecem o cabeçalho da tabela e linhas de esqueleto com o número
  de colunas da tabela real

#### Scenario: Painel carregando

- **WHEN** o painel está buscando os indicadores
- **THEN** aparecem esqueletos no formato dos cards de KPI e dos gráficos,
  não um retângulo da altura da tela

### Requirement: Spinner só em contexto pequeno

Spinners SHALL aparecer apenas dentro de botões em andamento ou ao lado de
um texto curto de estado em linha; SHALL NOT substituir o esqueleto de uma
área.

#### Scenario: Salvar em andamento

- **WHEN** o usuário confirma um formulário
- **THEN** o botão mostra o spinner; a área ao redor não muda

### Requirement: Erro de carregamento é um estado

Quando a busca de dados falha, a interface SHALL mostrar um estado de erro
com a mensagem e uma ação "Tentar de novo"; SHALL NOT manter o esqueleto
indefinidamente nem mostrar o estado vazio ("nenhum dado").

#### Scenario: Falha ao abrir um projeto

- **WHEN** a requisição do projeto falha
- **THEN** a página mostra "Não foi possível carregar o projeto" com "Tentar
  de novo" e o botão de voltar; o esqueleto some

#### Scenario: Falha no painel

- **WHEN** a requisição de vendas do painel falha
- **THEN** o card mostra o estado de erro, não "Nenhuma venda aprovada no
  período"

### Requirement: Carregamento por item

Ações em itens de uma lista SHALL indicar o andamento apenas no item
acionado.

#### Scenario: Confirmar uma entrada de nota

- **WHEN** o usuário confirma a entrada de uma nota entre várias
- **THEN** só o botão daquela nota mostra o spinner; as outras continuam
  acionáveis

### Requirement: Um sistema de avisos

Avisos SHALL usar um único sistema; avisos de sucesso SHALL durar 4 s; de
erro SHALL durar 8 s com botão de fechar; um erro que impede a tarefa SHALL
ser mostrado como alerta fixo na tela em vez de aviso passageiro; os ícones
SHALL ser os do dicionário.

#### Scenario: Erro ao salvar

- **WHEN** salvar falha
- **THEN** o aviso de erro permanece 8 s ou até ser fechado, com ícone de
  círculo com X

#### Scenario: Aviso que nunca aparecia

- **WHEN** a tela de regras de ST de produto salva com sucesso
- **THEN** o aviso "Regra salva" aparece como em qualquer outra tela

### Requirement: Toda gravação confirma

Toda gravação bem-sucedida SHALL ser confirmada por aviso ou por carimbo de
"Salvo" visível, inclusive em controles de efeito imediato (switches); em
caso de falha, o controle SHALL voltar ao estado anterior e informar o erro.

#### Scenario: Ativar um setor pelo switch

- **WHEN** o usuário liga o switch de um setor
- **THEN** o switch mostra andamento, depois o aviso "Setor ativado"; se
  falhar, o switch volta a desligado e o erro é informado
