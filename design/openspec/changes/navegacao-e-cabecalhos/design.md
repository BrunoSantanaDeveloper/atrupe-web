# Design — navegação e cabeçalhos de página

Arquitetura compartilhada: `../../design/sistema-visual.md` (§2.8, §4.8).

## Context

- `common/Topbar.tsx`: `title`, `tabs` (links renderizados como Radix `Tabs`
  com `role=tab`), `activeTab`, `paramName`, `primaryCta`, `secondaryCta`,
  `label` (faixa colorida que esconde o `HelpButton`), `previousPage`,
  `badge`, `supportText`, `classNames`, `review`. 86 usos.
- Navegação: `consts/nav.ts` (`mainNavigation` com `permission`,
  `requiredModule`, `children`); filtro em `SidebarComponent.tsx:96-195` e
  cópia divergente em `MobileSidebar.tsx:95-166`; ativo por
  `pathname.includes(path)`.
- Layouts de detalhe: `cadastros/clientes/[id]/layout.tsx:109-114` usa
  `params.tab` (inexistente) e aponta `/cadastro`; `base-de-custos/layout.tsx:26`
  já usa `useSelectedLayoutSegment` — é o modelo.
- `metadata.title` repetido por módulo (`tipografia-e-hierarquia` corrige o
  formato; aqui o conteúdo deve bater com o rótulo de navegação).
- Sem permissão: `PermissionGate fallback` com três formas; `fluxo-financeiro/page.tsx`
  sem fallback.

## Goals / Non-Goals

**Goals:**
- Toda página começa igual: caminho, título, contexto, ações, abas.
- O usuário sabe onde está (sidebar marcada, breadcrumb, aba ativa, título
  da aba do navegador) e como voltar.
- Detalhe mostra o essencial sem clique.

**Non-Goals:**
- Reorganizar a informação dentro das páginas de detalhe além do cabeçalho
  (mudanças de tela).
- Barra superior global com busca e notificações (fica anotado como
  evolução futura; sem spec).

## Decisions

### 1. `PageHeader` composto

```tsx
<PageHeader
  breadcrumb={[{ label: 'Vendas' }, { label: 'Orçamentos', href }, { label: '#1234' }]}
  title="Orçamento #1234" subtitle="Cliente Tal" status="OPEN"
  meta={[{ label: 'Validade', value: '12/10' }]}
  primary={<Button>Aprovar</Button>} secondary={[…]} more={[…]}
  tabs={[{ label: 'Todos', href, count }]} tone="default|admin"
/>
```

Breadcrumb substitui `previousPage` (o "voltar" é o penúltimo item; em
celular aparece só a seta). Abas são `Link`s com `aria-current`, não
`role=tab`. `label`/`classNames`/`review` saem; `HelpButton` sempre
presente. Codemod traduz `Topbar` → `PageHeader` (`previousPage` →
breadcrumb de dois níveis gerado do `consts/nav.ts`).

### 2. `ObjectHeader`

Extensão do `PageHeader` para detalhe: `title` em `object-title`, `status`,
`meta` com 3–5 pares (`kpi-label` + `kpi-value` compacto), ações pela regra
de `botoes-e-acoes`. Os números por tela (proposta inicial, a confirmar com
o OpenSpec de regras): orçamento = total, validade, vendedor, itens; OS =
total, recebido, entrega, NF; cliente = em aberto, último pedido, limite de
crédito, responsável; fornecedor = em aberto, última compra; projeto =
status, progresso (n/m), entrega; folha = colaborador, período, total;
patrimônio = valor, depreciação, setor; nota = número, série, ambiente,
total.

### 3. Uma lógica de navegação

`lib/navigation.ts`: `useNavigation()` devolve os itens já filtrados por
permissão, módulo contratado e limites de plano (a lógica de
`SidebarComponent.tsx:96-195`, incluindo `requireAllPermissions`), mais
`isActive(item)` por segmento (`pathname.startsWith(path + '/') || ===`) e
`activeParent`. Sidebar e menu móvel consomem o mesmo hook. `aria-current="page"`
no item ativo; o grupo pai recebe estado "contém ativo" distinto de
"aberto".

### 4. Sidebar recolhida com flyout

Recolhida (64 px) mostra só ícones com Tooltip; grupos abrem um flyout
(`Popover` lateral) com os subitens, em vez de expandir dentro do trilho.
Seções (`eyebrow`): "Operação" (Vendas, Financeiro, Produção), "Cadastros",
"Custos e preços", "Relatórios", "Configurações" — a ordem atual se mantém;
só ganham rótulo. Conta do usuário no rodapé com nome, empresa, plano e menu
(perfil, tema, sair) — `UserDropdown` vira esse menu.

### 5. Celular: `Sheet`

`MobileSidebar` vira `Sheet side="left" size="md"` com a mesma lista;
`MobileHeader` mostra o `PageHeader` compacto (voltar, título) e o botão de
menu. Perfil e sair ficam no rodapé do sheet como itens de menu.

### 6. Renomeações

| Navegação (sidebar/hub) | Título da página | URL |
|---|---|---|
| Condições de pagamento | Condições de pagamento | `configuracoes/financeiro/condicoes-de-pagamento` (redirect da antiga) |
| Contas bancárias | Contas bancárias | `configuracoes/financeiro/contas-bancarias` |
| Emissores de nota fiscal | Emissores de nota fiscal | `configuracoes/nota-fiscal/emissores` |
| Setores | Setores | `…/setores` |
| Séries de venda | Séries de venda | `…/series-de-venda` |
| Cargos (entrada própria sob Empresa e sistema) | Cargos | `…/cargos` |
| Materiais, Processos (sob Cadastros) | idem | `cadastros/materiais`, `cadastros/processos` (redirect de `configuracoes/produtos/*`) |
| Produtos (sob Cadastros) | Produtos | `cadastros/produtos` (redirect) |
| Produtos (configurações: padrões, grupos, biblioteca) | Produtos | `configuracoes/produtos` (hub) |
| Painel | Painel | `/dashboard` (URL fica) |
| Relatório de vendas / Relatório financeiro / DFC / Comissões / Projeção de caixa / Resultado por setor | mesmos nomes | existentes |

`metadata.title` = título da página (via `tipografia-e-hierarquia` 6.x).

### 7. Abas de sub-rota

Layouts com abas usam `useSelectedLayoutSegment`; as abas vêm de uma lista
por layout com `segment`, `label`, `count?`. Listas com abas de status usam
`?status=` e a aba padrão é a primeira (acaba o "padrão 'regularizados' mas
fallback 'todos'" e "'finalizadas' com 'Aguardando' primeiro").

### 8. Estados de página

`PermissionGate` sem fallback customizado renderiza `PageHeader` + `EmptyState
kind="forbidden"`; `not-found.tsx` e `error.tsx` em `(app-sidebar)` e por
módulo com `PageHeader` e ação. Quem só visualiza vê filtros e busca (gate só
nas ações).

## Risks / Trade-offs

- [Mudar URLs quebra favoritos] → redirecionamentos permanentes em
  `next.config.mjs`; nota de versão.
- [Breadcrumb gerado do `nav.ts` erra em páginas fora da navegação
  (detalhes, sandbox)] → `breadcrumb` explícito nessas; o gerado é só o
  padrão.
- [Flyout na sidebar recolhida é nova interação] → Tooltip continua para
  itens sem filhos; flyout fecha com Esc e clique fora; testado em e2e.
- [Remover `review` tira um instrumento que o time usa] → a marcação continua
  disponível em `/sandbox/revisao` lendo o mesmo `consts`, fora do produto.

## Migration Plan

1. `lib/navigation.ts` + sidebar/celular (sem mudar rotas).
2. `PageHeader` com codemod de `Topbar`; `ObjectHeader` nas páginas de
   detalhe (cabeçalho só; cards ficam).
3. Renomeações com redirects; abas de sub-rota; estados de página.
4. Remoção da marcação de revisão.

## Open Questions

- Números-chave por detalhe (decisão 2): confirmar com o OpenSpec de regras
  antes de `telas-*` implementarem; não bloqueia o componente.
