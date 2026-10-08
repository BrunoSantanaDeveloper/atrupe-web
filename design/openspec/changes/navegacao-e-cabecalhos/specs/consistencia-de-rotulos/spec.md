# Consistência de rótulos e estados de página

## Purpose

O nome que o usuário clica é o nome que lê no título, na URL e na aba do
navegador; páginas sem permissão, não encontradas ou com erro têm sempre a
mesma forma.

## ADDED Requirements

### Requirement: Rótulo = título = URL

O rótulo do item de navegação (barra lateral ou hub), o título da página, o
último segmento da URL e o título do documento SHALL ser o mesmo nome (a URL
em kebab-case sem acentos); itens listados num módulo da navegação SHALL
viver na URL daquele módulo.

#### Scenario: Condições de pagamento

- **WHEN** o usuário clica em "Condições de pagamento" no hub Financeiro
- **THEN** a página se intitula "Condições de pagamento", a URL termina em
  `/condicoes-de-pagamento` e a aba do navegador diz "Condições de pagamento
  · Configurações · Atrupe"

#### Scenario: Materiais

- **WHEN** o usuário clica em "Materiais" sob "Cadastros"
- **THEN** a URL começa com `/cadastros/`

#### Scenario: URL antiga

- **WHEN** o usuário abre um favorito com a URL antiga de uma página
  renomeada
- **THEN** é redirecionado para a nova URL

### Requirement: Entradas de navegação próprias

Páginas alcançáveis apenas por botão dentro de outra página (Cargos) SHALL
ganhar entrada própria na navegação ou no hub.

#### Scenario: Cargos

- **WHEN** o usuário abre o hub "Empresa e sistema"
- **THEN** vê "Cargos" como linha própria, ao lado de "Colaboradores e
  usuários"

### Requirement: Mesmo gesto, mesmo destino

Uma linha de hub SHALL sempre abrir uma página (ou painel) do mesmo tipo;
hubs SHALL NOT misturar linhas que abrem página com linhas que abrem diálogo
sem distinção.

#### Scenario: Padrão de medida

- **WHEN** o usuário clica em "Padrão de medida"
- **THEN** abre uma página de configuração com os três padrões, não um
  diálogo

### Requirement: Sem permissão

Quando o usuário não tem permissão para uma página, a interface SHALL
mostrar o cabeçalho da página e um estado "sem permissão" com explicação e
contato; quem pode visualizar mas não editar SHALL ver filtros, busca e
dados, com as ações desabilitadas ou ocultas.

#### Scenario: Fluxo financeiro só leitura

- **WHEN** um usuário com permissão de visualizar abre o fluxo financeiro
- **THEN** vê os filtros e as movimentações; os botões de criar e editar
  não aparecem

#### Scenario: Página sem acesso

- **WHEN** um usuário sem acesso abre "Controle de caixa"
- **THEN** vê o título "Controle de caixa" e o estado "Você não tem acesso a
  esta página" com o contato do administrador; a página não fica em branco

### Requirement: Não encontrado e erro

Rotas inexistentes e falhas de carregamento de página SHALL mostrar páginas
de "não encontrado" e de "erro" com cabeçalho e ação (voltar, tentar de
novo); um registro inexistente SHALL usar a página de não encontrado, não um
texto solto.

#### Scenario: Orçamento inexistente

- **WHEN** o usuário abre a composição de um orçamento que não existe
- **THEN** vê a página de não encontrado com "Voltar para orçamentos"

### Requirement: Sem marcação interna

A interface de produção SHALL NOT mostrar marcações internas de revisão
(títulos coloridos, cards de pendências, legendas).

#### Scenario: Título de página

- **WHEN** qualquer página é renderizada fora do sandbox
- **THEN** o título usa a cor de texto primária, nunca azul ou vermelho de
  revisão
