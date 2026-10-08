## 1. Componentes do módulo

- [ ] 1.1 `common/SettingsList.tsx` (grupos → card; linha `Link` 64 px com
      ícone 40, título `body-strong`, descrição `secondary` a 4 px,
      `StatusBadge` opcional, chevron; hover/foco; sem botão)
- [ ] 1.2 `common/SettingsSection.tsx` (título `section-title`, descrição,
      controle/formulário, `action?`) e `common/SectionNav.tsx` (navegação
      lateral de seções com âncoras e `aria-current`)
- [ ] 1.3 Vitrine `/sandbox/configuracoes` com hub, página de configuração
      com `SaveBar`, página com `SectionNav`, lista de configuração

## 2. Hubs

- [ ] 2.1 `configuracoes/components/CompanySettingsList.tsx` → `SettingsList`;
      remover `cta`, `review`, `!bg-gray-200`/`opacity-50`; estado por badge
- [ ] 2.2 `empresa-e-sistema/components/CompanySettingsClient.tsx`: linhas
      Empresa, Assinatura, Setores, **Cargos**, Colaboradores e usuários,
      Padrão de medida, Patrimônios — todas para página
- [ ] 2.3 `financeiro/components/FinanceSettingsClient.tsx`: Contas
      bancárias, Condições de pagamento, Limite de crédito (página), Plano
      de contas, Despesas fixas, Folhas de pagamento — rótulos = títulos
- [ ] 2.4 `vendas/components/SalesSettingsClient.tsx`: Status de orçamento,
      Motivos de rejeição e cancelamento, Origens de contato (com gate),
      Perfis de vendedor, Séries de venda, Venda rápida
- [ ] 2.5 `nota-fiscal/components/FiscalSettingsClient.tsx`: Emissores de
      nota fiscal, CFOP e naturezas, Gestão de notas (ou remover o redirect
      morto), Invoicy (idem) — caixa de frase
- [ ] 2.6 `produtos/page.tsx` → hub (Padrões de medida do produto, Grupos de
      produtos, Biblioteca, Importar produtos, Pendências fiscais); catálogo
      sai para Cadastros (`navegacao-e-cabecalhos` 4.2)
- [ ] 2.7 `importacoes/components/ImportSettingsClient.tsx`: página única com
      `SegmentedControl`/`RadioCard` do tipo (Clientes, Fornecedores,
      Produtos, Ordens, Financeiro…) e o fluxo (`common/import/ImportModal`
      parametrizado de `componentes-adequados` 5.3) em `Stepper`: arquivo →
      validação → resultado (erros paginados, "Baixar erros"); rótulos
      "Importar <objeto>"; alerta de erros visível

## 3. Empresa e sistema

- [ ] 3.1 Empresa: `/empresa` (lista `SettingsList` com status) e
      `/empresa/[id]` (`SectionNav` Dados/Endereço/Marca/Fiscal/Avançado,
      `FormGrid`, `SaveBar`, zona de risco "Inativar empresa", limite de
      plano como `Alert info` + "Fazer upgrade"); apagar `CompanyInfo/index.tsx`
      e `NewCompanyInfo.tsx` (modal); `Steps/*` viram seções; três estilos
      de heading → papéis; `Step5` com `EmptyState`/`Alert`; `Step2`
      endereço em `FormGrid`; aba NF com indicador de erro; sem
      `animate-pulse`
- [ ] 3.2 Padrão de medida: `SettingsSection` em linha na página do hub
      (ou `/padrao-de-medida`) com três selects e autosave + "Salvo"; apagar
      `MeasureDefaultsDialog.tsx`
- [ ] 3.3 Setores (`setores/components/Main.tsx`): título "Setores";
      `EmptyState` com "Novo setor" (criar a ação se a regra permitir, senão
      explicar); `AutosaveSwitch` com `aria-label` por setor e motivo nos
      administrativos; sem `pr-20`; checkbox do diálogo no corpo; "Ícone"
- [ ] 3.4 Colaboradores e usuários (`TableData.tsx`): `RowActions` (Editar
      colaborador em linha; Editar usuário, Inativar no menu); "Sem usuário"
      em `text-tertiary`; `TableGroupRow` por setor; `TableSkeleton` único;
      `NewEmployee`/`EditEmployee` com o mesmo `Sheet lg` e `FormGrid`
- [ ] 3.5 Cargos: `/cargos` lista (`EmptyState` com ícone certo e "Novo
      cargo"; ações desabilitadas com motivo e badge "Cargo do sistema") e
      `/cargos/[id]` permissões como página (`Table compact sticky`,
      cabeçalhos e células centrados, "–" em `text-tertiary`, `SaveBar`)
- [ ] 3.6 Assinatura: `SubscriptionSummaryCards.tsx` com grade 3/1 real,
      "Remover módulo" no menu com rótulo, "+" removido ou com ação real,
      preço vindo da API (fora de escopo: registrar), "Período de teste";
      `SubscriptionManagementClient.tsx` com "Cancelar assinatura" em zona de
      risco no fim e `EmptyState` quando não há assinatura;
      `CancelSubscriptionDialog.tsx` com `RadioCard` e confirmação
      destrutiva sem check; `ContractModal.tsx` com esqueleto e `secondary`
- [ ] 3.7 Patrimônios: `AssetDetail.tsx` com `ObjectHeader` (Editar primária;
      Vender/Inativar no menu); `Assets.tsx` `EmptyState` com "Novo
      patrimônio"; `AssetGroups.tsx` renomear em linha com Cancelar/Esc;
      `NewAsset` em `FormGrid`; sem `review`

## 4. Financeiro

- [ ] 4.1 Limite de crédito: `/limite-de-credito` página com `Table compact`
      (condição × "Permitido" `Checkbox`), `SaveBar`, "Aplicar a todos os
      clientes" como ação secundária com `ConfirmDialog` destrutivo contando
      os clientes; apagar `CreditLimit.tsx` modal (nome da condição uma vez)
- [ ] 4.2 Contas bancárias (`BankAccounts.tsx`, `AccountDialog.tsx`): chips →
      `StatusBadge`/Tooltip; "Inativar conta" com `IconBan` e confirmação
      que diz "inativar" (não "remover"); `EmptyState` para zero contas
      ativas; "Nova conta" com ícone; tipo de conta em `RadioCard`; diálogo
      `lg` com `FormGrid` (ou `Sheet`); cabeçalhos "Recebe"/"Paga" sem cor
- [ ] 4.3 Condições de pagamento: "Inativo" neutro; dica = diálogo =
      "Inativar"; `EmptyState` com ícone e CTA gated; `colSpan` por contexto;
      `NewPaymentCondition` com `SegmentedControl` %/R$, seções em
      `eyebrow`, `Cancelar` terciário, sem "Teste"
- [ ] 4.4 Plano de contas (`TableData.tsx`, `NewCategoryDialog`,
      `EditSubcategoryDialog`): árvore (decisão §5), sem pintura de linha,
      "Grupo"/"Natureza" em vez de "Nível 1/2", mesma grade nos dois
      diálogos, "Cancelar" em ambos, "Ativar" como `secondary`, esqueleto
      com forma
- [ ] 4.5 Despesas fixas (config): breadcrumb/voltar; `EmptyState` com ícone
      de despesa; "Valor padrão"; `EditFixedExpense` em `md`, sem "Teste"
- [ ] 4.6 Folhas de pagamento (`Main.tsx`): nome em `body-strong` na lista;
      total em `kpi-value`; acréscimo/desconto com rótulo e sinal (não só
      cor); filtros em `ListToolbar` acima da tabela, identidade do
      colaborador no `ObjectHeader`

## 5. Vendas

- [ ] 5.1 Status de orçamento: `ColorPicker` com texto por contraste; dicas
      corretas ("Editar status", "Excluir status"); confirmação destrutiva
      com descrição real; `primaryCta` gated; `TableSkeleton` com 3 colunas
- [ ] 5.2 Origens de contato: padrões do sistema sem Editar/Excluir (badge
      "Padrão"); `PermissionGate`; `text-tertiary`
- [ ] 5.3 Motivos: "Novo motivo" único no cabeçalho com seletor de grupo;
      grupos em `TableGroupRow`
- [ ] 5.4 Perfis de vendedor: card por perfil (`Card` com `CardHeader` +
      ações no menu + tabela de vendedores); "Cancelar" no diálogo de
      configurar
- [ ] 5.5 Séries de venda: `Table` com `RowActions` (Editar em linha;
      Inativar com confirmação via `DisableSerie`; "Excluir orçamentos da
      série" destrutivo no menu); `EmptyState`; `NewSerie`/`EditItem` com o
      mesmo `Sheet lg`, título "Editar série de venda", "Salvar"/"Cancelar";
      "Fluxo de aprovação"
- [ ] 5.6 Venda rápida: uma `SaveBar`; interruptor principal no mesmo modelo;
      `RadioCard`/`SegmentedControl` no lugar dos crus; esqueleto com forma

## 6. Nota fiscal

- [ ] 6.1 Emissores: `/emissores` lista (`Card` por emissor com `ObjectHeader`
      compacto: razão social, CNPJ, certificado como `StatusBadge`, ações
      no menu) e `SettingsList` dos documentos (NF-e, NFS-e, NFC-e com
      status e chevron); `/emissores/[id]` página com `SectionNav`
      (Dados, Certificado, NF-e, NFS-e, NFC-e, Numeração, Contingência) e
      `SaveBar` única; ativação como `Stepper` em `/emissores/[id]/ativar/[doc]`;
      apagar `EmissorFormModal.tsx`, "Salvar Certificado"/"Salvar CSC"/
      "Salvar numeração" avulsos; paletas → tons; `title=` → Tooltip;
      cadeado sem girar; cabeçalho `h2` duplicado removido; esqueleto e
      `EmptyState` do kit; `bg-red-600` → `ConfirmDialog` destrutivo;
      "Remover configuração" em caixa de frase
- [ ] 6.2 CFOP e naturezas: `/cfop` com abas "CFOP" | "Naturezas" (uma
      primária por aba, "Novo CFOP"/"Nova natureza"), `Table` do kit,
      `RowActions` (menu com `aria-label`), dica = diálogo ("Excluir");
      `CfopRow` sem seta colorida (badge Entrada/Saída neutro);
      `CfopFormModal` com Tabler, `secondary`/`primary` corretos, sem
      "Entrada/Saída" redundante (derivado do código) ou como
      `SegmentedControl`; `NaturezaFormModal` em `lg` sem `h-[90vh]`;
      "Naturezas" (não "Histórico de Natureza")
- [ ] 6.3 Diálogos fiscais (`CancelNfeDialog`, `InutilizarNfceDialog`,
      `ContingenciaNfceDialog`, `DocumentosTabs`): `Alert warning` do kit,
      `ConfirmDialog` no tom certo, "Gerenciar documentos"
- [ ] 6.4 `gestao/` e `invoicy/`: remover `GestaoNotasClient` morto e o
      redirect sem destino, ou integrar `InvoicyConfigForm` como seção do
      emissor

## 7. Produtos, produção e composição

- [ ] 7.1 `NewProduct.tsx`: `Sheet xl` com largura fixa, `SectionNav`
      (Dados, Medidas, Fiscal, Composição, Variações), uma heading por
      seção nos papéis, ícone à esquerda em "Novo produto", sem "Trigger";
      `ProductFiscalTab` responsivo com rótulos completos ("CFOP
      interestadual"); `ProductStRules` no sonner e tokens
- [ ] 7.2 Catálogo (`ProductsData.tsx`): linha abre o produto; `RowActions`
      (Editar em linha; Composição, Precificar, Duplicar no menu); preço em
      `Money`; código em `caption`; busca e paginação; "Grupos de produtos"
      e "Biblioteca" (`Products.tsx:250-267`, hoje só ícones) com rótulo no
      cabeçalho ou como linhas do hub
- [ ] 7.3 Grupos de produtos (`grupo-de-produtos/components/ProductsGroupData.tsx:83-85`,
      linha de setor hoje em texto puro): `TableGroupRow` por setor;
      `NewProductGroup` em `md` com `FormGrid`; lápis com nome
- [ ] 7.4 Etapas de produção do produto: `ProductionStage/ProductionStageItem.tsx:54`
      ganha alternativa de teclado ao arrastar (botões "Mover para cima/baixo"
      no menu da etapa ou setas com `aria-live` anunciando a nova posição) e
      handle visível (`IconGripVertical`); `ProductionStageIcon.tsx:18-27`
      deixa de ser `Button` com `pointer-events-none` e vira ícone decorativo
      (`Icon` com `aria-hidden`) com fundo de tom (`bg-tone-success-bg`, não
      `bg-green-200`)
- [ ] 7.5 Pendências fiscais (`FiscalPendenciasAlert.tsx`): `Alert warning`
      com contagem + lista de linhas clicáveis (sem "Corrigir >")
- [ ] 7.6 Materiais (`Materials.tsx`): setor em `TableGroupRow`,
      subcategoria normal; sem `ReviewTodo`; `NewMaterial` como referência de
      formulário progressivo (manter)
- [ ] 7.7 Processos (`Processes.tsx`, `ProcessEditor.tsx`): nome abre o
      processo; lápis de renomear visível; KPIs em `kpi-*`; autosave com
      carimbo (sem "Salvar processo")
- [ ] 7.8 Composição (`AssemblyEditor.tsx`, `AssemblyDialogs.tsx`,
      `NextStepDialog.tsx`): KPIs em `kpi-*`; autosave único com carimbo
      ("Salvar descritivo"/"Salvar como padrão" viram ações nomeadas:
      "Atualizar descritivo", "Definir como padrão"); status via
      `SegmentedControl` + `ConfirmDialog` em transições; abas de variação
      com `Tabs`; "Nova variação" em todo lugar; `secondary` em Cancelar;
      rótulos de seção em `eyebrow`; cards de escolha em `RadioCard` com
      foco; diálogos em `md`/`lg`
- [ ] 7.9 Produção (`ProductionSettings.tsx`, `ProductionSettingsDialogs.tsx`):
      `RowActions` por gerente; badges do kit; `RadioCard`; select com
      rótulo; ícone de navegação próprio

## 8. Fechamento

- [ ] 8.1 Guarda de não salvo em todos os diálogos/sheets restantes do
      módulo (`grep -rl "DialogContent" configuracoes`)
- [ ] 8.2 Capturas antes/depois dos cinco hubs e das páginas de cada um;
      `audit.json` sem botão repetido ≥ 3 e sem ícone sem nome
- [ ] 8.3 `e2e/configuracoes/*.spec.ts`: hub → página em cada linha dos
      cinco hubs; empresa como página; emissor como página; CFOP em abas
