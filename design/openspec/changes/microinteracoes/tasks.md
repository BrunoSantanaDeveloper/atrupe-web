## 1. Base de movimento

- [x] 1.1 Durações `fast`/`base`/`slow`, curvas `out`/`in-out` e keyframes (`fade-in`, `skeleton-pulse`, `progress-indeterminate`) em `tailwind.config.ts`; variante `disabled-idle`
- [x] 1.2 Redução de movimento em `globals.css` (exceto `.animate-spin`)

## 2. Primitivos

- [x] 2.1 `ui/skeleton.tsx` sem blend, `bg-gray-200`, entrada atrasada e pulso suave
- [x] 2.2 `ui/button.tsx`: progresso com cor da variante, largura fixa, spinner centralizado e proporcional, `aria-busy`
- [x] 2.3 `ui/dialog.tsx` e `ui/alert-dialog.tsx`: fade + zoom do centro, saída mais rápida; `AlertDialogAction` em progresso e `GlobalAlertDialog` aberto até o `onConfirm` terminar
- [x] 2.4 `ui/sheet.tsx`: 300 ms entrada / 200 ms saída
- [x] 2.5 `ui/tabs.tsx`: `TabsContent` com fade
- [x] 2.6 Trocar `transition-all` por propriedades específicas nos primitivos de `ui/`

## 3. Navegação

- [x] 3.1 `NavigationProgress` no layout raiz + `startNavigationProgress()` + `hooks/useRouter.ts` nas navegações por código
- [x] 3.2 Item ativo otimista na barra lateral do desktop (`usePendingPath`)
- [x] 3.3 Aba otimista e `countsLoading` no Topbar
- [x] 3.4 `src/app/loading.tsx` com logo em fade/pulso atrasado
- [x] 3.5 Recolher a barra lateral em 300 ms, só largura e opacidade

## 4. Listagens

- [ ] 4.1 `FetchingRegion`, `TableSkeletonRows`, `ListSkeleton`; `TablePagination` com `isLoading`
- [ ] 4.2 Referência em Clientes e Orçamentos
- [ ] 4.3 Demais listagens: `keepPreviousData` + `FetchingRegion`, cabeçalho real com `TableSkeletonRows`, paginação reservada, `countsLoading`
- [ ] 4.4 `Skeleton h-[calc(100vh-150px)]`/`h-[480px]` de totais → `ListSkeleton` ou esqueleto com o formato da tela
- [ ] 4.5 Early returns que escondem o Topbar passam a mantê-lo
- [ ] 4.6 `TableSkeleton` removido quando não houver mais uso

## 5. Pontuais

- [ ] 5.1 Botões com "Salvando..." e botões de gravação sem retorno passam a usar `isLoading`
- [ ] 5.2 Mensagem de vazio antes dos dados: `AddToItem.tsx`, `QuotationItems.tsx`
- [ ] 5.3 Banners que retornam `null` enquanto carregam entram com fade
- [ ] 5.4 `FiscalModuleGate`: sem loader duplo

## 6. Conferência

- [ ] 6.1 `tsc` e `lint` limpos
- [ ] 6.2 Vitrine `/sandbox/microinteracoes` com antes/depois dos primitivos, nos dois temas
- [ ] 6.3 Conferência visual (claro, escuro, movimento reduzido)
