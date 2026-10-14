## 1. Instrumento de verificação (antes)

- [x] 1.1 Criar `e2e/ui/capturas.spec.ts`: percorre as rotas estáticas de
      `src/app/(app-sidebar)` com a sessão do `global-setup`, grava
      `test-results/ui/<rota>.png` (1440×900) e `audit.json` com, por rota:
      tamanhos de fonte visíveis e contagem, cabeçalhos `h1`–`h6` com
      tamanho/peso/texto, botões repetidos (mesmo texto ≥ 3), botões sem nome
      acessível, `title=` nativo visível, altura das linhas de `tbody tr`,
      tamanhos de SVG. Rodar contra `next dev` (o build de produção mostra
      "Conta suspensa" para a conta de teste, porque `DEV_IGNORE_BLOCK` só
      vale em desenvolvimento)
- [x] 1.2 Rodar e guardar o `audit.json` de referência em
      `design/evidencia/tipografia-antes.json` (versão enxuta, sem PNG)
- [x] 1.3 Script `scripts/ui-audit-diff.mjs` que compara dois `audit.json` e
      lista, por rota, os tamanhos de fonte que apareceram/sumiram

## 2. Escala e utilitários

- [x] 2.1 Em `tailwind.config.ts`: remover as 72 chaves `fontFamily` mortas
      (`*-font-family`, 0 usos); manter `fontSize` do Untitled. `text-base`
      fica como está (é o mesmo 16/24 de `text-md`); sem regra de lint para
      ele, porque `no-restricted-syntax` não aceita duas severidades
- [x] 2.2 Plugin Tailwind `tailwind/typography-roles.ts` que registra
      `.type-<papel>` a partir de `src/lib/typography-roles.ts` (19 papéis,
      incluindo `kpi-hero` e `nav-group`): tamanho, linha, peso,
      `letter-spacing`, `text-transform` no eyebrow, `tabular-nums` nos KPIs,
      cor pela rampa (`gray-900/700/600`) até os tokens semânticos existirem
- [x] 2.3 Numerais tabulares: `tabular-nums` em toda `Table` e nos papéis de
      KPI (o utilitário do Tailwind, sem classe `.numeric` própria). Sem
      `font-feature-settings: "cv11"`: troca o desenho do "a" da Inter, o
      que é decisão de marca e não de hierarquia
- [x] 2.4 `src/components/ui/typography.tsx`: `Heading` (`as`, `variant`,
      `className`) e `Text` (`as`, `variant`, `className`), tipados com a união
      dos papéis. A prop é `variant`, não `role`, para não colidir com o
      atributo ARIA
- [x] 2.5 Vitrine `/sandbox/tipografia`: todos os papéis lado a lado com nome,
      tamanho e exemplo em contexto (título + subtítulo + card + tabela + KPI)

## 3. Kit nos papéis

- [x] 3.1 `common/Topbar.tsx`: `h1` → `type-page-title`; `supportText` →
      `<p class="type-page-subtitle">` abaixo do título (só quando existe);
      contêiner `min-h-12`; removido o `title=` com legenda de revisão do
      `h1` (a remoção completa da marcação fica em `navegacao-e-cabecalhos`);
      voltar ganhou `aria-label`
- [x] 3.2 `ui/card.tsx`: `CardTitle` → `h3` + `type-card-title` (sem
      `leading-none tracking-tight`); `CardDescription` → `type-secondary`
- [x] 3.3 `ui/dialog.tsx`, `ui/sheet.tsx`, `ui/alert-dialog.tsx`,
      `ui/drawer.tsx`: títulos → `type-dialog-title` (sem `leading-none`),
      descrições → `type-secondary`
- [x] 3.4 `ui/table.tsx`: `TableHead` → `type-table-header`; `TableCell` →
      `type-body`; prop `numeric` em `TableHead`/`TableCell` (alinha à
      direita; a tabela inteira usa `tabular-nums`); novos `TableGroupRow`
      (eyebrow) e `TableFullRow` com `colSpan` medido pelo `Table` (pelo
      cabeçalho ou, sem cabeçalho, pela linha de dado mais larga)
- [x] 3.5 `ui/form.tsx`, `ui/label.tsx`: `FormLabel` → `type-label` (sem
      `leading-none`, sem vermelho no erro); `FormDescription` →
      `type-helper`; `FormMessage` → `type-helper` + cor de erro
- [x] 3.6 `ui/empty-state.tsx`, `common/TableEmptyState.tsx`: título →
      `type-card-title`, descrição → `type-secondary`
- [x] 3.7 `ui/badge.tsx` já usa 12 px; `ui/status-tag.tsx`,
      `ui/avatar-label.tsx`, `ui/table-cells.tsx`: `text-[10px]` → `text-xs`
- [x] 3.8 `layout/SidebarComponent.tsx`, `layout/MobileSidebar.tsx`: os
      `<h3>` vinham do `Accordion.Header` do Radix; `AccordionTrigger` ganhou
      `asHeading={false}` (renderiza `div`) e as barras usam essa opção;
      subitens 14 px em vez de 12 px; badges de contagem 12 px
- [x] 3.9 `common/CustomButton.tsx`: título `type-body-strong`, legenda
      `type-caption` abaixo (ordem título › legenda)

## 4. Codemods

- [x] 4.1 Codemod de títulos de kit: `CardTitle`/`DialogTitle`/`SheetTitle`/
      `AlertDialogTitle`/`DrawerTitle` perdem as classes de tamanho, peso,
      cor e caixa; ficam só classes de layout (feito junto com 4.4)
- [x] 4.2 Codemod `uppercase` → `type-eyebrow` (96 trocas em 27 arquivos;
      `h2` de seção em caixa alta viraram `type-section-title` pelo 4.4).
      Revertidos à mão três campos que usam `uppercase` para forçar
      maiúsculas na digitação; rótulos de campo da nota fiscal voltaram para
      `type-label` em 5.7
- [x] 4.3 Codemod `min-12px`: `text-[10px]`/`text-[11px]` → `text-xs` e
      `text-[13px]` → `text-sm` (só tamanho, para preservar cor e peso
      definidos ao lado; inclui `InvoiceItems.tsx`, `InvoicePayment.tsx`,
      `NfseCamposAdicionaisSection.tsx`)
- [x] 4.4 Codemod de títulos: `h1` → `type-page-title`; `h2` →
      `type-section-title`; `h3`/`h4` → `type-card-title` ou
      `type-body-strong` conforme o tamanho original (194 trocas em 119
      arquivos; `feedback-modal.tsx` à mão)
- [x] 4.5 KPIs → `type-kpi-value`/`type-kpi-label` (34 valores e 34 rótulos
      no painel, base de custos, relatórios, composição, processos e fluxo
      financeiro; corrige `text-lG` em `TransactionsTotals.tsx`)
- [x] 4.6 Codemod `numeric`: 181 células em 36 arquivos que mostram valor,
      quantidade ou percentual; as 117 restantes com `text-right` são colunas
      de ação e ficam como estão
- [x] 4.7 Rodar `tsc`, lint e as capturas; comparar `audit.json` com o de
      referência. Resultado (`design/evidencia/tipografia-diff.txt`): nenhum
      texto abaixo de 12 px nem fora da escala {12, 14, 16, 18, 24, 30};
      todo `h1` com 24 px (66 rotas); nenhum `h3` na barra lateral. As 13
      rotas sem `h1` são avisos de plano/módulo não contratado da conta de
      teste (estoque, nota fiscal), redirecionamentos e um esqueleto de
      página que não termina (venda rápida) — cabeçalho nesses estados é
      escopo de `navegacao-e-cabecalhos` e `interacao-e-movimento`

## 5. Hierarquias invertidas (correções pontuais)

- [x] 5.1 `configuracoes/financeiro/plano-de-contas/components/TableData.tsx`:
      nível 1 em `TableGroupRow`, níveis 2–3 `body-strong` com recuo, folha
      `body`; sai a pintura de linha inteira em success-100/error-100
- [x] 5.2 `configuracoes/vendas/perfil-de-vendedor/components/Main.tsx`:
      perfil como linha de dado (`body-strong`, valores `numeric`),
      vendedores abaixo com recuo; sem células vazias
- [x] 5.3 `configuracoes/produtos/materiais/components/Materials.tsx`:
      setor em `TableGroupRow`, subcategoria `body-strong` sem caixa alta
- [x] 5.4 `configuracoes/financeiro/folhas-de-pagamento/components/Main.tsx`:
      nome do colaborador em `section-title` (abaixo do título da página);
      total da linha em `body-strong` (24 px dentro de célula ficaria maior
      que o título)
- [x] 5.5 `AssemblyEditor.tsx` e `ProcessEditor.tsx`: KPIs em
      `kpi-value`/`kpi-label` (iguais entre si; feito em 4.5)
- [x] 5.6 `(blank-layout-pages)/assinatura/page.tsx`: `h1` `page-title`,
      `h2` `section-title` (feito em 4.4)
- [x] 5.7 Nota fiscal: `h2` repetindo o `h1` removido em
      `EmissoresListClient.tsx` (em `CfopListClient.tsx` o `h2` "Tabela de
      CFOP" é seção legítima de uma página com duas tabelas e ficou); rótulos
      de campo em `InvoiceTotalsSection`, `InvoiceRecipientSection`,
      `InvoiceConfigSection`, `InvoiceDeliveryAddressSection`,
      `InvoicePayment`, `InvoiceEmissionConfigSection`, `EmissorListItem`,
      `NfseTomadorSection`, `NfseTotaisSection` → `type-label` por extenso
      ("Outras despesas", "Base do ICMS", "Valor da nota")
- [x] 5.8 `producao/agenda-de-entrega/.../DeliveryScheduleData.tsx`:
      data em `TableGroupRow` (corrige também o `colSpan={6}` numa tabela de
      4 colunas)
- [x] 5.9 Um único `common/DetailCard.tsx` para cliente e fornecedor
- [x] 5.10 Title Case → caixa de frase nos rótulos listados (20 arquivos)

## 6. Títulos de documento

- [x] 6.1 `lib/metadata.ts`: `pageTitle(...parts)` → "A · B"; `layout.tsx`
      raiz com `title.template = "%s · Atrupe"`
- [x] 6.2 Os layouts de módulo são componentes de cliente e não exportam
      `metadata`; o nome do módulo entra pela própria página com
      `pageTitle('Página', 'Módulo')`
- [x] 6.3 Base de custos e precificação com título por sub-página
      ("Mão de obra · Base de custos · Atrupe"); "Painel"; caixa de frase em
      fluxo financeiro, despesas fixas e notas avulsas

## 7. Lint e fechamento

- [x] 7.1 `.eslintrc.json`: `no-restricted-syntax` para tamanho em pixel,
      `uppercase` fora de `type-eyebrow` e `font-bold` em `className`
      (sandbox fora; cinco exceções comentadas). `leading-none` saiu dos
      títulos à mão; não virou regra porque também é usado em contêineres
      flex sem texto que quebra
- [x] 7.2 Capturas de depois em `design/evidencia/tipografia-depois.json` e o
      diff em `design/evidencia/tipografia-diff.txt`; nenhuma rota com mais
      de um `h1`. Testes da vitrine em `e2e/ui/tipografia.spec.ts` (7 casos)
- [x] 7.3 Atualizar `design.md` (raiz do front) §2.2 com a tabela de papéis e
      um ponteiro para `/sandbox/tipografia`
