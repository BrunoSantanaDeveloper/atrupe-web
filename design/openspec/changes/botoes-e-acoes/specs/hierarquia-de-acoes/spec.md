# Hierarquia de ações

## Purpose

Garantir que cada região da tela tem no máximo uma ação principal visível,
que listas não repetem botões por linha e que ações destrutivas ficam no
lugar certo.

## ADDED Requirements

### Requirement: Uma primária por região

Uma região (cabeçalho de página, rodapé de diálogo, card, barra de seleção)
SHALL mostrar no máximo um botão primário; ações adicionais SHALL ser
secundárias com rótulo (até duas) ou itens de um menu "Mais ações".

#### Scenario: Cabeçalho da lista de orçamentos

- **WHEN** a lista de orçamentos é exibida
- **THEN** "Novo orçamento" é o único botão sólido; buscar, exportar e ajuda
  são secundários ou terciários

#### Scenario: Detalhe de orçamento em digitação

- **WHEN** o detalhe oferece Aprovar, Rejeitar, Concluir, Reabrir e Prévia
- **THEN** uma delas é primária, até duas são secundárias com rótulo e o
  resto fica em "Mais ações"; nenhuma é um azulejo

### Requirement: Nenhum botão repetido por linha

Listas e hubs SHALL NOT repetir o mesmo botão em cada linha; a linha SHALL ser
o link para o registro e ações por linha SHALL seguir o padrão de ações de
linha; um estado por linha SHALL ser mostrado por badge, com uma ação de
página para o conjunto.

#### Scenario: Hub de configurações

- **WHEN** o hub "Empresa e sistema" lista seis áreas
- **THEN** não há botão "Configurar" em nenhuma linha; cada linha inteira é
  clicável, mostra um chevron à direita e muda de fundo ao pairar

#### Scenario: Itens de nota sem configuração fiscal

- **WHEN** quatro itens da nota ainda não têm configuração fiscal
- **THEN** cada linha mostra um badge "Pendente" e o cabeçalho da seção
  mostra uma única ação "Configurar pendentes (4)"

#### Scenario: Contas de caixa

- **WHEN** várias contas de caixa aguardam aprovação
- **THEN** a ação por conta é secundária e existe no máximo uma primária na
  página

### Requirement: Ações de linha

Uma linha de lista SHALL abrir o registro ao clicar ou pressionar Enter
(com fundo ao pairar, cursor de ponteiro e foco visível); SHALL mostrar no
máximo uma ação em linha como botão só-ícone pequeno com dica; as demais
ações SHALL ficar num menu "⋯" com rótulos, separador antes do grupo
destrutivo e o item destrutivo em vermelho por último.

#### Scenario: Linha de ordem de serviço

- **WHEN** uma ordem tem imprimir via do cliente, abrir ficha, emitir nota,
  ver DANFE, cancelar e histórico
- **THEN** a linha mostra um botão só-ícone ("Imprimir") e um menu "⋯" com
  os demais, "Cancelar venda" em vermelho por último

#### Scenario: Clique em ação não abre a linha

- **WHEN** o usuário clica no menu "⋯" ou no checkbox de seleção de uma linha
- **THEN** o registro não é aberto

#### Scenario: Ação indisponível

- **WHEN** uma ação de linha não está disponível para o estado do registro
- **THEN** o item aparece desabilitado no menu com uma dica dizendo o motivo,
  ou não aparece; nunca aparece habilitado sem efeito

### Requirement: Seleção em massa neutra

A barra de seleção em massa SHALL ser neutra (superfície sutil) com o
contador e as ações; só o botão destrutivo SHALL ser vermelho.

#### Scenario: Selecionar três clientes

- **WHEN** o usuário marca três linhas
- **THEN** a barra "3 selecionados" aparece em cinza com "Excluir" em vermelho

### Requirement: Ação principal com rótulo

A ação principal de uma tela ou de uma linha SHALL ter rótulo de texto;
só-ícone SHALL ser reservado a ações secundárias.

#### Scenario: Frente de caixa

- **WHEN** uma venda aguarda recebimento
- **THEN** a ação "Receber" é um botão primário com rótulo e tamanho grande

### Requirement: Destrutivo no lugar certo

Ações destrutivas (excluir, cancelar objeto, inativar) SHALL NOT aparecer
como botão primário no cabeçalho de uma página de detalhe nem ao lado de
"Salvar"; SHALL ficar no menu "Mais ações" ou numa seção "Zona de risco" no
fim da página ou do formulário.

#### Scenario: Detalhe de cliente

- **WHEN** o cabeçalho do cliente mostra as ações
- **THEN** "Editar" é a primária e "Inativar cadastro" está em "Mais ações"
  em vermelho

#### Scenario: Formulário de empresa

- **WHEN** o formulário da empresa mostra o rodapé
- **THEN** o rodapé tem "Cancelar" e "Salvar"; "Inativar empresa" fica numa
  seção à parte, abaixo do formulário
