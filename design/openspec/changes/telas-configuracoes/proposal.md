# Telas de configurações

## Why

Configurações é onde a queixa do usuário é mais visível: cada hub é uma pilha
de seis cards com um botão primário "Configurar →" idêntico (e Importações
com seis "Importar →"), alguns abrindo página e outros um diálogo — que por
sua vez abre outro diálogo (empresa). A tipografia colapsa em 16–18 px.
Formulários de 5 a 8 abas vivem em modais de 800–900 px com "Salvar" dentro
das abas e outro no rodapé; a página de venda rápida tem dois "Salvar" e o
editor de composição quatro mecanismos de salvar; nenhum diálogo avisa ao
descartar. Tabelas agrupadas invertem a hierarquia (perfil de vendedor,
plano de contas, materiais). Nota fiscal foi construída fora do kit (tabelas
cruas, caixas amarelas, paletas padrão, SVGs à mão, cabeçalho duplicado).
Rótulos de hub, títulos e URLs discordam; Cargos não tem entrada; Produtos
não tem hub. Evidência: `design/openspec/design/sistema-visual.md` §2 e o
relatório de módulo resumido em `design.md` desta mudança.

## What Changes

- **Hubs como `SettingsList`:** um card por grupo, linhas (ícone, título,
  descrição, badge de estado, chevron) todas abrindo página; "Configurar" e
  "Importar" desaparecem; Importações vira uma página com seletor de tipo.
- **Páginas em vez de diálogos** para: Configuração da empresa (lista de
  empresas → página da empresa com seções e `SaveBar`; "Inativar" em zona de
  risco), Padrão de medida (seção em linha com autosave), Limite de crédito
  (página com tabela e a ação em massa como etapa confirmada), Emissores
  (página por emissor com `SectionNav` em vez de 8 abas em modal; wizard de
  ativação com `Stepper`), Permissões de cargo (página com tabela compacta
  e cabeçalho fixo), Venda rápida (uma `SaveBar`).
- **Padrão `SettingsSection`** (título + descrição + controle) em todas as
  páginas de configuração; modelo de salvar único por página (botão, barra
  ou autosave); guarda de alterações não salvas em todo diálogo restante.
- **Listas de configuração** (setores, cargos, colaboradores, condições,
  contas bancárias, séries, status, motivos, origens, perfis, patrimônios,
  grupos, produção, CFOP/naturezas) com `Table`, `RowActions`, `StatusBadge`,
  `EmptyState` com ação, busca onde cabe, `AutosaveSwitch` com feedback,
  "Novo <objeto>" único, destrutivo confirmado no tom certo.
- **Hierarquia nas tabelas agrupadas** (plano de contas como árvore com
  expandir/recolher; perfil de vendedor como card por perfil; materiais com
  setor em grupo e subcategoria normal).
- **Nota fiscal no kit:** `PageHeader` único, `Table`, `Alert`, tokens,
  ícones Tabler, CFOP e naturezas em abas ou sub-páginas, formulário de
  emissor como página, diálogos de cancelar/inutilizar/contingência com
  `ConfirmDialog` e `Alert`.
- **Produtos:** hub de configurações de produto (padrões, grupos,
  biblioteca, importação); catálogo, materiais e processos vão para
  Cadastros (`navegacao-e-cabecalhos`); `NewProduct` com largura fixa, uma
  heading por seção, sem botão de desenvolvimento; composição e processos
  com autosave único e KPIs nos papéis.
- Correções pontuais de interface listadas em `tasks.md` (switches sem
  nome, tooltips discordantes, `colSpan`, gêneros, acentos, "Flow de
  aprovação", preços cravados na interface, botões sem efeito).

## Capabilities

### New Capabilities

- `telas-de-configuracoes`: a forma das páginas de configuração (hub,
  página de configuração, lista de configuração, formulário longo) e o que
  cada tela do módulo deve exibir.

### Modified Capabilities

Nenhuma.

## Impact

- `src/app/(app-sidebar)/configuracoes/**` (≈ 230 arquivos), `consts/nav.ts`,
  `common/SettingsList.tsx` (novo), `common/SettingsSection.tsx` (novo),
  `common/SectionNav.tsx` (novo).
- Depende de `navegacao-e-cabecalhos` (`PageHeader`, rotas, hubs) e
  `componentes-adequados` (`Table`, `Sheet`, `Stepper`, `StatusBadge`,
  `EmptyState`, `SegmentedControl`, `ColorPicker`, `AutosaveSwitch`,
  `SaveBar`).
- Achados fora de escopo (regras): `SubscriptionSummaryCards.tsx:171` preço
  por usuário cravado na interface (deve vir da API); permissão de
  Emissores/CFOP (`invoice:nfse:view`) diferente do hub (`nota_fiscal:config:view`);
  `SalesSettingsClient.tsx:53-58` e origens de contato sem gate; edição de
  tarefa liberada para quem só visualiza (`TaskDetailDialog.tsx:66`). Ficam
  listados no `design.md` para o OpenSpec de regras.
