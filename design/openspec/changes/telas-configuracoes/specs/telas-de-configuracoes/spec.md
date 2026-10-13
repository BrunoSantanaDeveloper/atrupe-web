# Telas de configurações

## Purpose

Toda configuração se encontra por um hub de linhas clicáveis, se edita numa
página com seções e se salva de um único jeito.

## ADDED Requirements

### Requirement: Hub é uma lista

Cada hub de configurações SHALL ser uma lista agrupada de linhas com ícone,
título, descrição, estado e chevron, em que a linha inteira abre a página
da configuração; SHALL NOT haver botões nas linhas nem linhas que abrem
diálogo.

#### Scenario: Empresa e sistema

- **WHEN** o usuário abre "Empresa e sistema"
- **THEN** vê um card com as linhas Configuração da empresa, Assinatura,
  Setores, Cargos, Colaboradores e usuários, Padrão de medida e
  Patrimônios, sem nenhum botão "Configurar", e cada linha abre uma página

#### Scenario: Importações

- **WHEN** o usuário abre "Importações"
- **THEN** vê uma página com o tipo de importação a escolher e o fluxo de
  envio, sem seis botões "Importar"

### Requirement: Página de configuração em seções

Uma página de configuração SHALL ser organizada em seções com título,
descrição e controle; SHALL ter exatamente um modelo de salvar (botão
único, barra de salvar fixa ou salvamento automático com carimbo) e SHALL
avisar antes de descartar alterações.

#### Scenario: Padrão de medida

- **WHEN** o usuário altera um padrão de medida
- **THEN** a alteração é salva automaticamente com o carimbo "Salvo" ou pela
  barra de salvar da página — sem diálogo

#### Scenario: Venda rápida

- **WHEN** a página de venda rápida tem várias seções
- **THEN** há uma única barra de salvar, e o interruptor principal segue o
  mesmo modelo

### Requirement: Formulários longos são páginas

Configurações com mais de uma aba ou mais de oito campos agrupados
(empresa, emissor, permissões de cargo, limite de crédito, produto) SHALL
ser páginas (ou painéis laterais) com navegação de seções; SHALL NOT ser
diálogos com abas, e nenhum diálogo SHALL abrir outro.

#### Scenario: Editar emissor

- **WHEN** o usuário abre um emissor
- **THEN** vê uma página com as seções (dados, certificado, documentos,
  numeração) numa navegação lateral, um único "Salvar" e o status do
  certificado no cabeçalho

#### Scenario: Ativar documento fiscal

- **WHEN** o usuário ativa a NFC-e de um emissor
- **THEN** segue etapas com indicador, "Voltar" e "Avançar", e cada etapa é
  salva ao avançar

### Requirement: Listas de configuração padronizadas

Listas de itens configuráveis (setores, cargos, colaboradores, condições,
contas, séries, status, motivos, origens, perfis, patrimônios, grupos,
gerentes de produção, CFOP, naturezas) SHALL usar a tabela do kit com
ações de linha, badge de status, estado vazio com "Novo <item>", busca
quando a lista pode passar de 20 itens, e interruptores com nome acessível
e confirmação de salvo.

#### Scenario: Setores

- **WHEN** o usuário liga o interruptor de um setor
- **THEN** o interruptor tem o nome "Ativar setor Produção", mostra andamento
  e confirma "Setor ativado"; setores administrativos mostram o motivo de
  não poderem ser desligados

#### Scenario: Sem itens

- **WHEN** não há cargos cadastrados
- **THEN** o estado vazio mostra "Nenhum cargo ainda" com "Novo cargo"

### Requirement: Hierarquia em tabelas agrupadas de configuração

O plano de contas SHALL ser uma árvore com expandir/recolher em que o nível
mais alto é a linha de grupo; o perfil de vendedor SHALL ser a entidade
principal (card ou linha de dado) com os vendedores abaixo; materiais SHALL
mostrar o setor como grupo e a subcategoria em texto normal.

#### Scenario: Plano de contas

- **WHEN** o usuário abre o plano de contas
- **THEN** "Receitas" e "Despesas" são grupos, os grupos internos expandem
  com um chevron e as contas não são maiores que os seus grupos

### Requirement: Nota fiscal no sistema de design

As telas de configuração fiscal SHALL usar os mesmos componentes das demais
(cabeçalho de página, tabela, alerta, badge, botões, ícones, tokens); SHALL
NOT ter cabeçalho duplicado, tabela crua, caixas de aviso feitas à mão,
cores fora dos tokens ou ícones desenhados no arquivo.

#### Scenario: CFOP e naturezas

- **WHEN** o usuário abre a tabela de CFOP
- **THEN** vê uma página com as abas "CFOP" e "Naturezas", uma tabela do
  kit por aba e um único botão "Novo CFOP" (ou "Nova natureza") no cabeçalho

### Requirement: Produtos tem hub

As configurações de produto (padrões, grupos, biblioteca, importação,
pendências fiscais) SHALL ter um hub próprio; o catálogo de produtos,
materiais e processos SHALL ficar em Cadastros.

#### Scenario: Abrir Produtos em Configurações

- **WHEN** o usuário abre "Configurações › Produtos"
- **THEN** vê um hub de linhas, não o catálogo
