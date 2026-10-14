# Telas de cadastros, produção, estoque, base de custos e precificação

## Purpose

Cadastros, produção, estoque, custos e precificação seguem o mesmo padrão
de lista, detalhe e formulário, sem botões sem efeito nem estados
enganosos.

## ADDED Requirements

### Requirement: Listas de cadastro

Listas de clientes e fornecedores SHALL ter linha clicável, ação de linha
única com menu, colunas e pesos iguais entre si, tipo de pessoa como apoio
do nome, responsável em coluna própria, seleção neutra com progresso em
operações em massa e "Limpar filtros" no estado sem resultados; a lupa
SHALL aparecer só na busca.

#### Scenario: Busca sem resultado

- **WHEN** a busca por "xyz" não encontra clientes
- **THEN** o estado mostra "Nada encontrado para 'xyz'" com "Limpar
  filtros", não "Novo cliente"

### Requirement: Detalhe de cliente e fornecedor

O detalhe SHALL ter cabeçalho de objeto com números-chave, "Editar" como
primária e inativar no menu; abas por segmento de rota que marcam a ativa
e apontam para rotas existentes; contatos e endereços em listas compactas;
os campos de resumo corretos (cargo mostra cargo, celular mostra celular).

#### Scenario: Aba Dados

- **WHEN** o usuário abre um fornecedor
- **THEN** a aba "Dados" está marcada, a rota termina em `/dados` e o
  cabeçalho mostra o valor em aberto e a última compra

### Requirement: Formulário de pessoa

O formulário de cliente e fornecedor SHALL ser um só (parametrizado), em
painel ou página com seções, grade de campos, endereço em ordem padrão,
repetidores com ação de remover nomeada, erro indicado na seção, consulta de
CNPJ dentro do formulário, placeholders de exemplo e guarda de alterações
(inclusive ao trocar entre pessoa física e jurídica); salvar SHALL NOT mudar
de seção sem erro.

#### Scenario: Salvar válido

- **WHEN** o usuário salva um cliente válido a partir da seção de endereços
- **THEN** o formulário salva e fecha sem pular para o limite de crédito

#### Scenario: Consultar CNPJ

- **WHEN** o usuário digita o CNPJ e aciona "Buscar dados"
- **THEN** os campos são preenchidos no próprio formulário, sem abrir outro
  diálogo

### Requirement: Produção

O gerenciador SHALL usar controles do kit, mostrar o tipo da tarefa em
texto, ter estado vazio quando não há gerente e confirmar "Parar"; o
detalhe de tarefa SHALL ser um painel com uma ação primária por estado e
campos que salvam em linha com carimbo; projetos SHALL ter busca, paginação,
linha clicável e cabeçalho com status, progresso e entrega; produtividade
SHALL mostrar eficiência em cor neutra com seta e filtro de período; "hoje"
SHALL seguir o fuso do usuário.

#### Scenario: Tarefa aguardando base

- **WHEN** uma tarefa não pode ser concluída porque a base não terminou
- **THEN** "Concluir" aparece desabilitado com a dica "Aguardando etapa
  anterior"

#### Scenario: Eficiência abaixo de 100 %

- **WHEN** um setor tem eficiência de 85 %
- **THEN** o valor aparece em cor neutra com seta para baixo, não em
  vermelho

### Requirement: Agenda de entrega

A agenda SHALL mostrar a data como linha de grupo, uma ação em linha
("Agendar") e as demais no menu com ícones distintos, etapa com texto e
ícone do setor, estados "Concluído" e "Entregue" distintos, e SHALL NOT ter
botões invisíveis nem botões sem função.

#### Scenario: Faturar e editar parcelas

- **WHEN** o usuário abre o menu de um serviço
- **THEN** "Faturar" e "Editar parcelas" têm ícones diferentes e rótulos

### Requirement: Estoque

O estoque SHALL ter abas no cabeçalho, busca, paginação e ordenação,
quantidades em formato pt-BR, saídas com sinal e tom de erro, movimentos
com período e estado vazio, e a linha do material SHALL abrir seu
histórico; a entrada de nota SHALL ser uma fila filtrável com cada nota em
painel, andamento por nota e vínculo de material por campo pesquisável.

#### Scenario: Quantidade decimal

- **WHEN** um material tem 12,5 kg
- **THEN** a tabela mostra "12,5 kg"

### Requirement: Base de custos

As abas SHALL seguir a ordem de dependência (Resumo, Despesas,
Distribuição, Por setor, Mão de obra, Patrimônios, Comparativo); KPIs SHALL
usar o card único neutro com link visível; despesas administrativas SHALL
ter primeira coluna fixa e paginação; distribuição SHALL NOT perder edições
em recarga e SHALL ter barra de salvar; comparativo SHALL ter status nas
abas, período em seletor de intervalo e "acima do previsto" em tom de
aviso; carga horária SHALL ser definida por um botão com rótulo e um único
campo.

#### Scenario: Editar distribuição durante recarga

- **WHEN** o usuário altera percentuais e os dados são recarregados
- **THEN** os valores digitados permanecem e a barra de salvar indica
  alterações pendentes

### Requirement: Precificação

Contagens de resumo SHALL corresponder ao destino do link; avisos SHALL usar
o alerta do kit; listas SHALL ter busca, paginação e abas com contador;
o editor de preço SHALL ser um painel com cards de rádio do kit, dados
somente leitura como texto, campos de dinheiro e percentual do kit e
valores em cor neutra.

#### Scenario: Produtos abaixo do custo

- **WHEN** o resumo diz "5 itens abaixo do custo" e o usuário clica
- **THEN** a lista aberta mostra exatamente 5 itens

### Requirement: Sem botão sem efeito

Nenhuma linha SHALL exibir um botão que não faz nada; ações sem regra
implementada SHALL ser removidas ou desabilitadas com dica.

#### Scenario: Linha de mão de obra

- **WHEN** o usuário vê uma linha de setor
- **THEN** vê "Definir carga horária" com rótulo e não vê "Precificar a
  hora" até que a ação exista
