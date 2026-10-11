# Confirmações e vocabulário

## Purpose

Toda ação destrutiva passa por uma confirmação com o mesmo formato, e os
rótulos dos botões usam as mesmas palavras em todo o sistema.

## ADDED Requirements

### Requirement: Confirmação destrutiva

Toda ação que apaga, cancela um objeto, inativa ou descarta dados SHALL abrir
um diálogo de confirmação no tom destrutivo: ícone de alerta vermelho,
título com verbo e objeto, descrição que diz a consequência, botão de
confirmar vermelho com verbo e objeto ("Excluir cliente", "Cancelar venda") e
botão de desistir neutro cujo rótulo não começa com "Cancelar" quando o de
confirmar começa.

#### Scenario: Cancelar uma venda

- **WHEN** o usuário aciona "Cancelar venda"
- **THEN** o diálogo mostra "Cancelar venda?", explica o que acontece com as
  parcelas e a produção, e oferece "Manter venda" (neutro) e "Cancelar venda"
  (vermelho)

#### Scenario: Rejeitar sem motivos cadastrados

- **WHEN** a empresa não tem motivos de rejeição cadastrados e o usuário
  aciona "Rejeitar orçamento"
- **THEN** o diálogo de confirmação aparece mesmo assim, antes de qualquer
  requisição

#### Scenario: Excluir sem confirmação

- **WHEN** o usuário aciona a lixeira de uma despesa fixa lançada ou de um
  rascunho de nota
- **THEN** a exclusão só acontece depois da confirmação

### Requirement: Confirmação não destrutiva

Ações irreversíveis mas positivas (aprovar, concluir, reabrir, fechar caixa,
emitir) SHALL usar o diálogo no tom padrão: sem ícone de alerta, botão de
confirmar na cor da marca, mesma estrutura de título e consequência.

#### Scenario: Aprovar orçamento

- **WHEN** o usuário aciona "Aprovar"
- **THEN** o diálogo não mostra triângulo de aviso e o botão "Aprovar
  orçamento" é da cor da marca

### Requirement: Confirmação assíncrona

Enquanto a ação confirmada está em curso, o diálogo SHALL permanecer aberto
com o botão de confirmar em estado de carregamento; SHALL fechar só após
sucesso e SHALL mostrar o erro sem fechar quando falhar.

#### Scenario: Falha ao excluir

- **WHEN** a exclusão confirmada falha no servidor
- **THEN** o diálogo continua aberto, mostra a mensagem de erro e permite
  tentar de novo ou desistir

### Requirement: Vocabulário dos rótulos

Os botões SHALL usar: "Novo <objeto>" para criar a partir de uma lista;
"Adicionar <objeto>" para acrescentar dentro de um formulário; "Salvar" para
gravar; "Cancelar" para sair de um formulário ou diálogo sem gravar; "Fechar"
só em diálogos de leitura; "Voltar" só entre etapas de um fluxo; "Excluir
<objeto>" para apagar; "Remover" para tirar de uma lista sem apagar;
"Inativar"/"Reativar"; "Importar <objeto>"; "Exportar". Rótulos SHALL estar
em caixa de frase, sem ícone de check em confirmações e sem seta, exceto
"Avançar →" em etapas.

#### Scenario: Mesmo gesto em módulos diferentes

- **WHEN** o usuário cria um cliente, um produto e uma condição de pagamento
- **THEN** os três botões de página dizem "Novo cliente", "Novo produto" e
  "Nova condição de pagamento", e os três diálogos terminam em "Cancelar" e
  "Salvar"

#### Scenario: Diálogo de leitura

- **WHEN** um diálogo só mostra informação (histórico, relatório do dia)
- **THEN** o único botão é "Fechar", em nível terciário

#### Scenario: Dica e diálogo concordam

- **WHEN** uma ação de linha tem a dica "Inativar conta"
- **THEN** o diálogo de confirmação e o aviso de sucesso usam o mesmo verbo
  ("Inativar", não "Desativar" ou "Remover")
