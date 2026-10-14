## 1. Movimento

- [ ] 1.1 `tailwind.config.ts`: `transitionDuration` `fast` 100 / `base` 150
      / `slow` 250; `transitionTimingFunction` `enter`/`exit`; utilitário
      `transition-ui` (plugin); keyframes de entrada/saída de diálogo,
      sheet, menu e tooltip com `duration-slow`/`base`
- [ ] 1.2 `globals.css`: bloco `@media (prefers-reduced-motion: reduce)`
      zerando `animation-duration`/`transition-duration` e desligando
      `animate-pulse`/`animate-spin` de página
- [ ] 1.3 Codemod: `transition-all` → `transition-ui` (79); `duration-500`
      → `duration-slow` (sidebar: `duration-base`); `duration-200/300` →
      `duration-base`; `ease-in-out` → `ease-enter`
- [ ] 1.4 `layout/SidebarComponent.tsx:211-351`, `MobileSidebar.tsx`,
      `ui/sheet.tsx:34`, `ui/dialog.tsx`, `ui/accordion.tsx`: durações por
      token; sidebar anima só `width` do contêiner via `grid-template-columns`
      (sem `transition-all` em cada item)
- [ ] 1.5 Remover esperas e pulsos artificiais: `FixedExpenses.tsx:165-180`
      (600 ms), `CashControl.tsx:610-614`/`CashDayDetail.tsx:283`
      (`setTimeout(400)` antes de imprimir — vira view de impressão em
      `telas-financeiro-e-caixa`), `NewCompanyInfo.tsx:195` (`animate-pulse`),
      `ContractModal.tsx:62` (texto pulsante → esqueleto)
- [ ] 1.6 Lint em erro: `transition-all`, `duration-\d+` fora dos tokens,
      `animate-pulse` fora de `Skeleton`

## 2. Foco e hover

- [ ] 2.1 Aplicar `focus-ring` em todos os primitivos: `ui/tabs.tsx:131,154`
      (ambas as variantes), `ui/dropdown-menu.tsx` (item, sub-trigger),
      `ui/select.tsx:22` (`focus:` → `focus-visible:`), `ui/checkbox.tsx`,
      `ui/radio-group.tsx`, `ui/switch.tsx`, `ui/accordion.tsx`,
      `ui/pagination.tsx`, `ui/toggle.tsx`, `ui/toggle-group.tsx`,
      `ui/command.tsx`, `ui/calendar.tsx`, `ui/slider.tsx`,
      `ui/file-uploader.tsx`, `common/radio-card.tsx`, `common/checkbox-card.tsx`
- [ ] 2.2 `TableRow` clicável (`botoes-e-acoes` 2.4) e cards-link
      (`common/LinkCard.tsx` novo: `border`, hover `border-strong shadow-sm`,
      chevron, `focus-ring`) — aplicar em `base-de-custos/resumo/components/CostSummaryView.tsx:132-133`,
      `precificacao/resumo/components/PricingSummaryView.tsx:254-256`,
      `configuracoes/components/CompanySettingsList.tsx:64-69`,
      `dashboard` cards com link
- [ ] 2.3 `<button>` crus de rádio/chip/aba ainda não migrados em
      `botoes-e-acoes` (viram `SegmentedControl`/`RadioCard` em
      `componentes-adequados`): até lá, `focus-ring` + `aria-pressed`/`role`
      em `ManagerBoard.tsx:148-161,236,271,293`, `EditPriceModal.tsx:246-280`,
      `QuickSaleSettingsForm.tsx:262-312`, `AccountDialog.tsx:212-239`,
      `CancelSubscriptionDialog.tsx:125-136`, `ProductionSettingsDialogs.tsx:160-180,487,507`,
      `AssemblyDialogs.tsx:173-183`, `NextStepDialog.tsx:86-90`,
      `ProposalPrint.tsx:147-170`, `ItemForm.tsx:112-124`,
      `QuotationProdDetailModal.tsx:541-556`, `DashboardPeriodFilter.tsx:26-38`,
      `CashDayDialogs.tsx:291-306`
- [ ] 2.4 Affordance só no hover → sempre visível (`tertiary icon sm`):
      `ProcessEditor.tsx:604-623`, `AssemblyEditor.tsx:968-980`;
      `group-hover:` sem `group` em `IssueInvoice.tsx:258,306`
- [ ] 2.5 Ocultos focáveis → condicional ou `inert`: `Financial.tsx:180,241,302`,
      `EditInstallments/index.tsx:307-310,344-346`, `DeliveryScheduleData.tsx:290-321`,
      `NewCompanyInfo.tsx:342-351` (`className="hidden"` → desabilitado com
      motivo), `PayrollItems.tsx:182-189` (remover), `TablePagination.tsx:75,110`
      (desabilitado sem `href="#"`)
- [ ] 2.6 Cabeçalhos clicáveis como `div`: `EmissorListItem.tsx:515-527`
      (botão com `aria-expanded`), `FiscalOnboardingBanner.tsx:44-47` (banner
      com botão de ação explícito); ícone de cadeado que gira com o chevron
      (`EmissorListItem.tsx:623-631`)
- [ ] 2.7 Lint em erro: `focus:` sem `focus-visible:`; `outline-none` sem
      `focus-ring`; `opacity-0` em `button`/`Button`/`a`;
      `jsx-a11y/click-events-have-key-events`,
      `no-noninteractive-element-interactions`, `no-static-element-interactions`

## 3. Avisos

- [ ] 3.1 `ui/sonner.tsx`: durações por tipo (4/5/6/8 s), `closeButton` em
      erro, ícones do dicionário, classes de tom; helper
      `toast.blocking(msg)` que recomenda `Alert` (documentado)
- [ ] 3.2 `ProductStRules.tsx:26,125,157-177`: migrar para sonner
- [ ] 3.3 Remover `ui/toast.tsx`, `ui/toaster.tsx`, `ui/use-toast.ts`,
      `common/ToastVariant.tsx`; lint `no-restricted-imports` para
      `@/components/ui/use-toast`
- [ ] 3.4 Erros bloqueantes mostrados como `Alert` na tela (não aviso):
      `NewClientForm.tsx:49-60` (erros de aba → marcador na aba + resumo),
      `Installments.tsx:85-87` (erro sob o campo), `SearchClientModal.tsx:71-75`
      (nada encontrado → estado no diálogo)
- [ ] 3.5 Toda gravação confirma: `ScheduleDate/index.tsx:188`,
      `Notes/index.tsx:113` (sem loading/erro), `DeliveryScheduleData.tsx:124-133`
      (finalizar serviço), `ManagerBoard.tsx:460-464` (resultado real de
      `stopWork`), `setores/components/Main.tsx:148-154` (switch),
      `AssetGroups.tsx:157-172` (renomear com Cancelar/Esc)

## 4. Carregamento

- [ ] 4.1 `common/QueryState.tsx` (loading → error → empty → data) e
      `EmptyState kind="error"` com "Tentar de novo" (o componente único de
      estado vazio vem de `componentes-adequados`; aqui a variante de erro
      no componente atual)
- [ ] 4.2 `ui/skeleton.tsx` com `aria-busy` e `role="status"` no contêiner;
      `TableSkeleton` com colunas da tabela real (sem `cols+1`, sem blocos
      de ação fixos, sem `w-32` uniforme); esqueletos de KPI, de cabeçalho e
      de formulário em `common/skeletons/`
- [ ] 4.3 `ui/spinner.tsx` como único spinner (tamanhos `sm`/`md`), usado
      pelo `Button` e em linha; remover os 43 `IconLoader*`/`LoaderCircle`
      + `animate-spin` ad hoc e os 21 "Carregando…"
- [ ] 4.4 Esqueleto eterno / erro como vazio → `QueryState`:
      `ProjectDetail.tsx:109`, `ProductionSheet.tsx:40`, `PricingSummaryView.tsx:53`,
      `ManagerBoard.tsx:89,262` (sem gerente → estado vazio com ação),
      `dashboard/**` (todos os cards com `isError`), `SummaryCards.tsx:72-74`
      e `SectorCardsGrid.tsx:140` (`return null`), `NfeAvulsaSection.tsx:98-100,186-188`
      (some em erro), `Transactions.tsx:33,49-51` (`emptyData = false`)
- [ ] 4.5 Esqueleto de página inteira → com forma: `colaboradores/.../Main.tsx:105`,
      `plano-de-contas/.../Main.tsx:73`, `QuickSaleSettingsForm.tsx:128`,
      `PDV.tsx:195`, `CashControl.tsx:352`, `Quotations.tsx:329`,
      `academy/[planName]/page.tsx:83`
- [ ] 4.6 Texto/spinner em vez de esqueleto → esqueleto: `TransactionDetails/index.tsx:193`,
      `EditInstallments/index.tsx:210`, `History.tsx:62`, `CompanyInfo/index.tsx:108`,
      `EmissoresListClient.tsx:355-357`, `CfopListClient.tsx:201-203`,
      `NaturezaListClient.tsx:210-212`, `QuotationHistoryDialog.tsx:61`,
      `clientes/[id]/orcamentos|ordens/page.tsx:35-38`, `NewClient/index.tsx:218`
      (`<></>` em edição → esqueleto do formulário), `QuotationItemsModal.tsx:196-256`
      (não mostrar "Nenhum produto" enquanto carrega)
- [ ] 4.7 Estado compartilhado por lista → por item: `FinancialFlowData.tsx:457`,
      `InvoiceEntry.tsx:70,204-208`, `ClientsData.tsx:103-113` (exclusão em
      massa com progresso e resultado parcial)

## 5. Alterações não salvas e modelo de salvar

- [ ] 5.1 `lib/useDirtyForm.ts` + contexto; `Dialog`/`Sheet` com
      `guardDirty` (intercepta `onOpenChange(false)`, Esc, clique fora) →
      `ConfirmDialog` "Descartar alterações?"
- [ ] 5.2 `common/UnsavedChangesGuard.tsx` no layout de app: `beforeunload`
      e interceptação de navegação interna quando há formulário sujo
- [ ] 5.3 `common/SaveBar.tsx`: barra fixa no rodapé da área de conteúdo
      com contagem/aviso, "Descartar" (secundário) e "Salvar" (primário);
      `common/AutosaveSwitch.tsx`
- [ ] 5.4 Aplicar a guarda: todos os diálogos de formulário de
      `configuracoes/**` (73), `NewClient`/`NewSupplier`, `EmissorFormModal`,
      `NewCompanyInfo`, `NewSerie`/`EditItem`, `AccountDialog`,
      `PaymentConditions`, `Delivery`, `TaskDetailDialog`, `EditPriceModal`
- [ ] 5.5 Guarda na navegação: `IssueNfseForm.tsx:784-789,890-899`,
      `StandaloneNfeForm.tsx:710-715`, `InvoiceFormHeader.tsx` "Cancelar
      digitação"; `NewClientForm.tsx:65-72` e `NewSuppilerForm.tsx:59-66`
      (troca PF/PJ pergunta antes de `reset()`)
- [ ] 5.6 Um modelo por tela: `QuickSaleSettingsForm.tsx:244-246,368-370`
      (uma `SaveBar`), `AssemblyEditor.tsx:1941-2497` (autosave com carimbo
      para tudo; "Salvar descritivo"/"Salvar como padrão" viram ações
      nomeadas sem "Salvar"), `ProcessEditor.tsx:429-447` (autosave),
      `CertificadoTab.tsx:189-198` + `EmissorFormModal.tsx:484-493` (um
      Salvar), `ActivationWizardModal.tsx:366-412` ("Avançar" salva a etapa),
      `Distribution.tsx:57-70` (não sobrescrever edição; `SaveBar`)

## 6. Fechamento

- [ ] 6.1 `e2e/ui/foco.spec.ts`: percorre com Tab as rotas principais e
      falha se algum elemento focado não tem o anel (checa `box-shadow`) ou
      está invisível (`opacity` 0 / largura 0)
- [ ] 6.2 Capturas com `prefers-reduced-motion` emulado: sem `animation`
      ativa
- [ ] 6.3 `design.md` da raiz §1 (densidade/interação) e §2.5 com os tokens
      de movimento e a política de carregamento
