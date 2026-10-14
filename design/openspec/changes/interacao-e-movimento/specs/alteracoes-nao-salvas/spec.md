# Alterações não salvas

## Purpose

O usuário nunca perde o que digitou sem ser avisado, e cada tela de edição
tem um único modelo de salvar.

## ADDED Requirements

### Requirement: Guarda ao fechar

Um diálogo ou painel com formulário alterado SHALL pedir confirmação antes
de fechar por Esc, pelo botão de fechar, por clique fora ou por "Cancelar";
a confirmação SHALL oferecer "Continuar editando" e "Descartar".

#### Scenario: Esc com formulário alterado

- **WHEN** o usuário altera um campo do formulário de emissor e pressiona Esc
- **THEN** aparece "Descartar alterações?" e o diálogo só fecha se o usuário
  escolher "Descartar"

#### Scenario: Formulário intocado

- **WHEN** o usuário abre um diálogo e fecha sem alterar nada
- **THEN** o diálogo fecha sem perguntar

### Requirement: Guarda ao navegar

Uma página com formulário alterado SHALL pedir confirmação antes de navegar
para outra rota, ao acionar "Cancelar digitação" e ao fechar a aba do
navegador.

#### Scenario: Cancelar digitação de nota

- **WHEN** o usuário preencheu parte da nota fiscal e aciona "Cancelar
  digitação"
- **THEN** aparece a confirmação de descarte antes de sair

#### Scenario: Troca de tipo que limpa o formulário

- **WHEN** o usuário troca de pessoa física para jurídica com campos
  preenchidos
- **THEN** a interface pergunta antes de limpar os campos

### Requirement: Um modelo de salvar por tela

Uma tela de edição SHALL usar exatamente um destes modelos: botão "Salvar"
único (formulário curto), barra de salvar fixa com "Descartar" e "Salvar"
(página longa) ou salvamento automático com carimbo de hora; SHALL NOT
combinar vários botões "Salvar" para partes do mesmo formulário.

#### Scenario: Configuração de venda rápida

- **WHEN** a página de venda rápida tem várias seções editáveis
- **THEN** há uma única barra de salvar fixa (ou salvamento automático), não
  dois botões "Salvar"

#### Scenario: Formulário com abas

- **WHEN** um formulário em diálogo tem abas (dados, certificado, documentos)
- **THEN** há um único "Salvar" no rodapé do diálogo; nenhuma aba tem o seu
  próprio

### Requirement: Dados não sobrescritos

Uma nova busca de dados SHALL NOT sobrescrever campos que o usuário alterou
e ainda não salvou.

#### Scenario: Distribuição de custos em edição

- **WHEN** o usuário altera percentuais e a tela refaz a busca em segundo
  plano
- **THEN** os percentuais digitados permanecem até salvar ou descartar
