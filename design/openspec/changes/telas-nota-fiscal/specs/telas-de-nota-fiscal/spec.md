# Telas de nota fiscal

## Purpose

Emitir e acompanhar notas com o total, o ambiente e as pendências sempre
visíveis, numa única lista e numa única página de emissão.

## ADDED Requirements

### Requirement: Lista única de notas

A lista de notas SHALL mostrar todas as notas e ordens elegíveis numa única
tabela com documento (tipo em badge neutro + número), origem, cliente,
data, status (badge do dicionário), valor neutro e ações; filtros de tipo,
origem, status, período e busca SHALL ficar na barra da lista; avulsas
SHALL ser um filtro, não uma segunda tabela; o ambiente fiscal SHALL
aparecer no cabeçalho em qualquer largura.

#### Scenario: Nota avulsa autorizada

- **WHEN** uma NF-e avulsa foi autorizada
- **THEN** aparece na lista com origem "Avulsa" e o badge "Autorizada",
  igual a uma nota de pedido autorizada

#### Scenario: Ambiente de homologação em tela estreita

- **WHEN** a janela tem 1024 px e a empresa está em homologação
- **THEN** o badge "Homologação" continua visível no cabeçalho

### Requirement: Ações de nota

Cada linha SHALL ter "Emitir nota" com rótulo como ação em linha quando
elegível e as demais ações num único menu "⋯" (ver DANFE, consultar status,
reprocessar, cancelar, inutilizar, excluir rascunho), com ícones distintos
por ação; excluir rascunho SHALL confirmar; linhas não selecionáveis SHALL
explicar o motivo na dica do checkbox.

#### Scenario: Excluir rascunho

- **WHEN** o usuário escolhe "Excluir rascunho"
- **THEN** vê a confirmação destrutiva e o aviso de sucesso diz "Rascunho
  excluído"

### Requirement: Escolha do tipo em etapas

Iniciar uma nota SHALL ser uma página com indicador de etapas (Tipo →
Dados), cards de rádio do kit para o tipo e "Voltar" na segunda etapa; SHALL
NOT ser um modal de dois passos.

#### Scenario: Escolher NFC-e

- **WHEN** o usuário escolhe NFC-e e avança
- **THEN** chega à página de emissão de NFC-e com a etapa 2 marcada e pode
  voltar para trocar o tipo

### Requirement: Página de emissão

A emissão de NF-e, NFS-e, NFC-e e avulsas SHALL usar a mesma página:
cabeçalho com documento, cliente, status e ambiente; navegação de seções;
seções abertas; bloco de totais sempre visível; barra fixa com "Cancelar
digitação" (com guarda), "Salvar rascunho" e "Emitir" como primária; a
confirmação de emissão SHALL resumir número, destinatário e total.

#### Scenario: Rolar a página

- **WHEN** o usuário rola até o transporte
- **THEN** o bloco de totais e a barra de ações continuam visíveis e a
  seção "Transporte" fica marcada na navegação

#### Scenario: Emitir

- **WHEN** o usuário aciona "Emitir NF-e"
- **THEN** vê a confirmação com destinatário e total antes do envio, e o
  botão mostra andamento até a resposta

### Requirement: Itens pendentes

Itens sem configuração fiscal SHALL mostrar o badge "Pendente" e a seção
SHALL oferecer uma única ação "Configurar pendentes (n)" que percorre os
itens; remover um item SHALL confirmar; checkboxes sem ação em massa SHALL
NOT existir.

#### Scenario: Três itens pendentes

- **WHEN** três itens não têm configuração
- **THEN** cada um mostra "Pendente" e o cabeçalho da seção mostra
  "Configurar pendentes (3)"; não há botão "Configurar" por linha

### Requirement: Campos fiscais humanos

Campos de escolha fiscal (entrada/saída, sim/não, finalidade) SHALL usar
controle segmentado ou select com rótulos em português (código em texto de
ajuda); rótulos SHALL ser completos e em caixa de frase; dinheiro, datas,
produto e cliente SHALL usar os campos do kit; avisos de ambiente e de
transporte SHALL usar o alerta do kit.

#### Scenario: Tipo de operação

- **WHEN** o usuário informa o tipo de operação
- **THEN** escolhe entre "Entrada" e "Saída" num controle segmentado, sem
  ver "1 - Saida"

### Requirement: Diálogos fiscais

Cancelar nota, inutilizar numeração e entrar em contingência SHALL usar a
confirmação do kit no tom destrutivo (ou de atenção) com a consequência
explicada e campos do kit; rejeições SHALL manter o caminho de reemissão.

#### Scenario: Cancelar nota autorizada

- **WHEN** o usuário aciona "Cancelar nota"
- **THEN** vê a confirmação destrutiva com o prazo e o motivo obrigatório, e
  o botão "Cancelar nota" em vermelho ao lado de "Manter nota"
