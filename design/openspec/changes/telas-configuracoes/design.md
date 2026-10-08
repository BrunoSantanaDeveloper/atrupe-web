# Design — telas de configurações

Arquitetura compartilhada: `../../design/sistema-visual.md`. Este arquivo
registra só as decisões de tela do módulo e os achados fora de escopo.

## Context

Resumo do relatório de módulo (evidência completa nas tarefas):

- Hubs: `configuracoes/components/CompanySettingsList.tsx` (card por linha,
  "Configurar →" primário, linha não clicável, `review:'todo'` pintando
  "Bancos e contas" de vermelho); Importações com seis "Importar →".
- Diálogo sobre diálogo: `CompanyInfo/index.tsx` (720 px, lista de empresas)
  → `NewCompanyInfo.tsx` (800 px, 5 abas em `grid-cols-5`, "Inativar"
  vermelho ao lado de "Salvar", botão gated com `className="hidden"`).
- `MeasureDefaultsDialog.tsx` 886 px para três selects; `CreditLimit.tsx`
  696 px com nome da condição em duas colunas, "tabela" de `p`, ação em
  massa escondida num accordion.
- Emissores: `EmissorFormModal.tsx` com 8 abas roláveis em `max-w-3xl`,
  "Salvar Certificado" dentro de aba + "Salvar" no rodapé; `ActivationWizardModal`
  com "Salvar CSC"/"Salvar numeração" por etapa; `EmissorListItem.tsx` com
  cabeçalho `div` clicável, três tiles "Configurar >", paletas emerald/amber,
  `title=` nativo; CFOP e naturezas como duas tabelas cruas empilhadas, cada
  uma com primária; `CfopFormModal` com SVGs à mão e "Salvar" verde.
- Permissões: matriz 5 ações × N módulos em diálogo de 900 px com cabeçalhos
  desalinhados (`Permissions/index.tsx:384-434`).
- Venda rápida: dois "Salvar" (`QuickSaleSettingsForm.tsx:244-246,368-370`),
  cards-rádio e chips crus.
- Composição: KPIs `text-2xl`, quatro mecanismos de salvar, status em
  `Select` que grava na hora, abas de variação como `<button>` crus
  (`AssemblyEditor.tsx`).
- Tabelas agrupadas invertidas: plano de contas (`TableData.tsx:86-186`),
  perfil de vendedor (`Main.tsx:121-193`), materiais (`Materials.tsx:194-227`).
- Listas: dois lápis idênticos em colaboradores, Cargos sem entrada, switches
  com `id="isActive"` repetido e sem nome, empty states sem CTA, tooltips
  "Desativar" vs diálogo "Inativar", `colSpan` errados, "Icone" sem acento,
  `IconTrash` para inativar conta, "Nova conta" sem ícone, "Histórico de
  Natureza" que não é histórico.
- Já bom: padrão "título + descrição + controle" em `AccountDialog.tsx:340-360`,
  `QuickSaleSettingsForm.tsx:160-168` e `AssetDetail`; autosave com carimbo
  e renomear em linha no `AssemblyEditor`; `alertDialog.open` com
  consequência em `AssetDetail` e `BankAccounts`.

## Goals / Non-Goals

**Goals:**
- Qualquer configuração se acha em dois cliques (hub → página), se lê de
  cima para baixo (seção + descrição + controle) e se salva de um jeito só.
- Nota fiscal fica indistinguível do resto do sistema.

**Non-Goals:**
- Mudar quais configurações existem, suas regras ou permissões.
- Reescrever o editor de composição além do cabeçalho, KPIs, salvar e
  controles crus.

## Decisions

### 1. `SettingsList` e `SettingsSection`

`SettingsList` (`common/`): `groups[{ title?, items[{ icon, title,
description, href, status?: 'ok'|'pending'|'inactive', badge? }] }]`; um
`Card` por grupo, linha `Link` de 64 px com chevron, hover, foco; sem botão.
`SettingsSection`: `title`, `description`, `children` (controle ou
formulário), `action?` — usado dentro das páginas de configuração; `SaveBar`
ou autosave por página.

### 2. Empresa como página

`/configuracoes/empresa-e-sistema/empresa` lista empresas (`SettingsList`
com status) → `/empresa/[id]` com `SectionNav` (Dados, Endereço, Marca,
Fiscal, Avançado) e `SaveBar`; "Inativar empresa" em "Zona de risco" no fim;
limite do plano mostrado como `Alert info` com "Fazer upgrade", nunca botão
escondido.

### 3. Emissor como página; CFOP/naturezas em abas

`/configuracoes/nota-fiscal/emissores/[id]` com `SectionNav` (Dados,
Certificado, NF-e, NFS-e, NFC-e, Numeração, Contingência) e `SaveBar`;
ativação como `Stepper` em página; `/configuracoes/nota-fiscal/cfop` com
abas "CFOP" e "Naturezas", uma primária por aba. `EmissorListItem` vira
`Card` com `ObjectHeader` compacto e `SettingsList` dos documentos (linha
com status e chevron).

### 4. Permissões como página

`/configuracoes/empresa-e-sistema/cargos/[id]` com `Table compact
sticky="header"`, colunas centradas com cabeçalhos centrados, "Cargo do
sistema" como badge e ações desabilitadas com motivo.

### 5. Plano de contas como árvore

`Table` com `TableGroupRow` para o nível 1 e linhas com `expandable`
(chevron em `tertiary icon sm`) para os níveis 2–3; sem pintura de linha
inteira; "Nível 1/2" viram "Grupo" e "Natureza".

### 6. Produtos

`/configuracoes/produtos` = hub (`SettingsList`: Padrões de medida, Grupos
de produtos, Biblioteca, Importar produtos, Pendências fiscais); catálogo,
materiais e processos em Cadastros (`navegacao-e-cabecalhos`). `NewProduct`
em `Sheet xl` com largura fixa e `SectionNav` interno.

### 7. Limite de crédito

Página com `Table` (condição × permitido, `Checkbox` por linha), `SaveBar`;
"Aplicar a todos os clientes" como ação secundária que abre `ConfirmDialog
tone="destructive"` dizendo quantos clientes serão sobrescritos.

## Risks / Trade-offs

- [Mais páginas = mais rotas e `metadata`] → geradas pela tabela de
  `navegacao-e-cabecalhos`; o custo é uma vez.
- [Usuários acostumados ao modal da empresa] → nota de versão; o caminho
  (hub → lista → empresa) é mais curto que hoje (hub → modal → modal).
- [Composição é um arquivo de 2 973 linhas] → tocar só cabeçalho, KPIs,
  salvar, status e controles crus; registrar refatoração maior como
  evolução futura.

## Migration Plan

Por hub, um PR cada: (1) Empresa e sistema, (2) Financeiro, (3) Vendas,
(4) Nota fiscal, (5) Produtos/Produção/Importações. Cada PR fecha com
capturas antes/depois das páginas do hub.

## Achados fora de escopo (para o OpenSpec de regras)

- Preço por usuário cravado em `SubscriptionSummaryCards.tsx:171`.
- Permissões divergentes entre hub e páginas de Emissores/CFOP; páginas sem
  gate (origens de contato, `SalesSettingsClient.tsx:53-58`).
- "Flow de aprovação" (`EditItem/index.tsx:237`): nome do conceito.
- Rótulos finais DONE/FINISHED (ver `cores-e-contraste`).

## Open Questions

Nenhuma que mude as specs; os números do hub (quantas empresas, quantos
emissores) são lidos da API existente.
