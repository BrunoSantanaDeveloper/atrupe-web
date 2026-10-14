## 1. Lista de orçamentos

- [ ] 1.1 `QuotationsData.tsx`: linha clicável; `RowActions` (Imprimir em
      linha; Duplicar, Histórico, Excluir no menu); remover o lápis
      duplicado; `StatusBadge` + etiqueta do usuário (`Badge` neutro com cor
      calculada, sem `text-white` fixo; `QuotationTagDropdown` com itens
      desabilitados explicando o motivo e gatilho com nome); coluna de data;
      `Money` à direita; `Badge "Venda rápida"` no lugar do "⚡";
      `TableGroupRow`/`colSpan` por contexto; `lastPage` da API;
      `SelectionBar` neutra
- [ ] 1.2 `Quotations.tsx`: aba DONE "Concluídos"; abas no `PageHeader` com
      a primeira como padrão; `ListToolbar` com busca (sem botão primário)
      e `DateRangePicker`; filtros visíveis em aba vazia; `EmptyState` por
      tipo; esqueleto de tabela
- [ ] 1.3 `NewQuotation.tsx`: `DialogClose asChild`; "Novo orçamento" no
      cabeçalho e "Salvar" no rodapé; `NewClientTriggerButton` "Novo
      cliente" secundário abrindo `Sheet lg` (sem diálogo sobre diálogo)
- [ ] 1.4 `QuotationHistoryDialog.tsx` → `Sheet md` com `Timeline` e
      esqueleto; título "Histórico do orçamento"

## 2. Detalhe de orçamento

- [ ] 2.1 `Quotation.tsx` + `QuotationActions/index.tsx`: `ObjectHeader`
      (número, cliente, status, Total, Validade, Vendedor, Itens); primária
      por estado (decisão 1 do `design.md`), secundárias Prévia/Duplicar,
      menu Rejeitar/Reabrir/Histórico/Excluir; sem `CustomButton`; estado
      "aprovado para não admin" com cabeçalho e voltar
- [ ] 2.2 `Summary.tsx`: seção aberta; data com `DatePicker` e salvar em
      linha com nome; `title=` → Tooltip; remover "Data de rejeição: –"
      fixo; CPF/CNPJ do cliente com o mesmo mascaramento da empresa (regra
      a confirmar); accordion com `aria-label`
- [ ] 2.3 `PaymentConditions.tsx`: `TotalsBlock` (Itens, Desconto, Frete,
      Total); badge do kit; `Delivery.tsx` com dicionário de status de
      entrega e "Sem prazo" em vez de "0 dias"
- [ ] 2.4 `QuotationItems.tsx`: `Table numeric`; expansão por `TableRow
      expandable`; `RowActions` por item (Editar; Valores, Observações,
      Imagem, Retirar); `EmptyState` com "Adicionar item"; "Adicionar item"
      secundário no `CardHeader`; `colSpan` por contexto; desconto em
      `Money` neutro; notas como badge; `IconCurrencyReal`; ações
      desabilitadas com motivo em Tooltip
- [ ] 2.5 Diálogos de item: `Notes` `md` com título "Observações do item"
      e subtítulo com a descrição; `Image` `md`; `Values` `md`; `Delete`
      nomeando o item; `QuotationCategorySelectorModal` + `QuotationItemsModal`
      → um `Sheet md` com `Combobox`/busca, cabeçalho de tabela, preços à
      direita, esqueleto enquanto carrega, "Voltar" entre etapas
- [ ] 2.6 `PaymentConditions/index.tsx` → `Sheet lg`: `FormGrid`; parcelas
      em `Table compact` (`Installments.tsx` sem rótulos por linha, erro sob
      o campo); "Entrada" como `Checkbox`; comissão como seção (sem
      `CommissionDialog` empilhado); "Valor base" legível; caixa de frase
- [ ] 2.7 `Delivery/index.tsx` → `Sheet lg`: endereço em ordem padrão em
      `FormGrid`; `isLoading` no submit; tokens
- [ ] 2.8 `QuotationProdDetailModal.tsx` → `Sheet lg` responsivo (imagem
      fluida); `RadioCard` nas opções; título de carregamento como esqueleto
- [ ] 2.9 `QuotationComposeModal.tsx` → página `/orcamentos/[id]/itens/[itemId]/compor`
      (ou `Sheet xl`) com `FormGrid`, validação e `SaveBar`
- [ ] 2.10 `RejectQuotation.tsx`, `ApproveQuotation.tsx`, `OpenQuotation.tsx`,
      `FinishQuotation.tsx`: `ConfirmDialog` no tom certo; rejeitar sempre
      confirma; "Vazio" → `EmptyState` inline com link para cadastrar
      motivos; "Voltar"/"Cancelar" conforme vocabulário
- [ ] 2.11 Remover `common/DuplicateQuotationButton.tsx` ou
      `QuotationActions/Duplicate` (um só)

## 3. Lista e detalhe de ordens

- [ ] 3.1 `OrdersData.tsx`: linha clicável; `RowActions` (Imprimir via do
      cliente em linha; Ficha de produção, Emitir nota, Ver DANFE,
      Histórico, Cancelar venda no menu, ícones do dicionário); colunas de
      data e NF (`StatusBadge`); `Money`; `colSpan` por contexto; sem
      `text-nowrap` global; badges de ambiente fiscal no `ListToolbar`
- [ ] 3.2 `Orders.tsx` + `page.tsx`: aba padrão = primeira; `OrdersFilter`
      com `DateRangePicker`
- [ ] 3.3 `CancelOrderButton.tsx` × `CancelOrder.tsx` → um componente;
      `ConfirmDialog` "Cancelar venda?" / "Manter venda"; título igual ao
      gatilho
- [ ] 3.4 `Order.tsx` + `OrderActions/index.tsx`: `ObjectHeader` (Total,
      Recebido, Entrega, NF); primária/secundária/menu; "Ficha de
      produção" como nome único
- [ ] 3.5 `OrderItems.tsx`: "Editar item" com handler ou removido;
      desabilitados permanentes removidos; "–" para desconto zero;
      expansão igual à do orçamento; `IconCurrencyReal`
- [ ] 3.6 `Financial.tsx`: `Money` neutro (status pelo badge); "Visualizar"
      visível ou ausente; `Table numeric`
- [ ] 3.7 Remover `EmitNfeDialog.tsx`, `EmitNfseButton.tsx` (mortos)

## 4. Composição, resultado, proposta

- [ ] 4.1 `QuotationComposition.tsx`: `PageHeader` com breadcrumb até o
      orçamento, título "Composição", subtítulo "Orçamento #X"; sem
      `review`; "Remover" com confirmação e tom destrutivo; "Adicionar
      item"; "–" único para vazio
- [ ] 4.2 `QuotationResult.tsx`: idem cabeçalho; `Money` com sinal (sem
      `Math.abs`); percentuais por `Intl.NumberFormat`; `CardTitle` padrão;
      `EmptyState kind="error"`/`notFound()` em vez de texto solto
- [ ] 4.3 `ProposalPrint.tsx`, `ItemForm.tsx`: `RadioCard` do kit

## 5. Venda rápida

- [ ] 5.1 `QuickSaleQuotation.tsx` + `QuickSaleCheckout.tsx`: um único
      "Cobrar R$ X" (primária no card de status, que fica como referência);
      `PageHeader tone` legível em vez da faixa `bg-brand-200`; "Novo
      orçamento comum" abre o formulário; rodapé sem `<div/>` espaçador;
      Tooltip no botão desabilitado

## 6. Fechamento

- [ ] 6.1 Capturas das listas e detalhes antes/depois; `audit.json`:
      `iconOnlyNoLabel` 0, `buttons` repetidos 0, `rowHeights` 44
- [ ] 6.2 `e2e/quotation/*.spec.ts` e `e2e/orders/*.spec.ts` atualizados:
      linha abre o registro; menu "⋯"; cabeçalho mostra total; condições em
      painel; cancelar venda com "Manter venda"
