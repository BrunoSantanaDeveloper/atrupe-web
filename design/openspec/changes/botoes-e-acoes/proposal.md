# Botões e hierarquia de ação

## Why

O botão não diz o que é importante: há 31 variantes em três gerações (14
nunca usadas, duas primárias de verdes diferentes, uma secundária de borda
grossa e rótulo cinza que parece desabilitada, uma "outline" verde usada 65
vezes como secundária competindo com a primária); os hubs de configurações
empilham seis botões primários "Configurar →" idênticos; listas têm de 4 a 8
ícones sem rótulo por linha e a linha em si não abre nada; a ação principal
de telas inteiras é um ícone sem texto ("Receber" no PDV, "Emitir nota
fiscal", "Lançar"); páginas de detalhe oferecem Aprovar, Rejeitar e Imprimir
como o mesmo azulejo branco; confirmações destrutivas aparecem verdes com
ícone de check, vermelhas à mão, ou nem aparecem; e "Cancelar" fica ao lado
de "Cancelar movimentação". Evidência: `design/openspec/design/sistema-visual.md`
§2.3.

## What Changes

- **Sistema de 4 níveis:** `primary`, `secondary`, `tertiary`, `link`, cada
  um com tom `destructive`; tamanhos `sm` 32 / `md` 36 / `lg` 40 / `xl` 44 e
  versão `icon`; carregando sem mudar largura e com `aria-busy`; desabilitado
  por variante; foco único. **BREAKING**: as variantes legadas saem por
  codemod com tabela de equivalência (§4.3 do `sistema-visual.md`).
- **Uma primária por região:** cabeçalho de página com até uma `primary`,
  duas `secondary` com rótulo e menu "Mais ações"; destrutivo nunca no
  cabeçalho de detalhe.
- **`RowActions`:** linha clicável (abre o registro), no máximo uma ação em
  linha visível (`tertiary icon` 32 px, com dica e `aria-label`) e um menu
  "⋯" com rótulos, separadores e destrutivo em vermelho por último; barra de
  seleção em massa neutra.
- **Hubs sem "Configurar":** a linha é o link, com chevron (`SettingsList` em
  `componentes-adequados`); nenhum botão repetido por linha ("Configurar",
  "Importar", "Corrigir", "Aprovar", "Fechar caixa"); em vez disso, badge de
  estado por linha e uma ação de página ("Configurar pendentes (n)").
- **`ConfirmDialog`** com `tone="destructive|default"`: ícone e botão no tom,
  verbo + objeto no botão de confirmar, "Manter <objeto>"/"Voltar" no de
  desistir, descrição com a consequência; toda ação destrutiva passa por ele.
- **Vocabulário de rótulos** (`consts/acoes.ts`): "Novo <objeto>", "Adicionar
  <objeto>", "Salvar", "Cancelar", "Fechar" (só leitura), "Voltar" (só
  etapas), "Excluir <objeto>", "Remover", "Inativar"/"Reativar", "Importar
  <objeto>", "Exportar"; sem ícone de check em confirmar; seta só em
  "Avançar →".
- **Ícone sozinho só com nome:** todo botão-ícone tem `aria-label` e Tooltip
  (lint `jsx-a11y/control-has-associated-label`); nativo `title=` proibido em
  botão.
- `CustomButton` (azulejo de 70 px) deixa de ser botão de ação: vira
  `ChoiceCard` onde é escolha e `Button` onde é ação; `ActionButton` vira a
  base de `RowActions`.
- Botões de desenvolvimento ("Teste", "Trigger") e botões sem `onClick`
  removidos.

## Capabilities

### New Capabilities

- `sistema-de-botoes`: níveis, tons, tamanhos, estados e acessibilidade do
  botão.
- `hierarquia-de-acoes`: uma primária por região; ações de linha; proibição
  de botões repetidos; destrutivo no lugar certo.
- `confirmacoes-e-vocabulario`: diálogo de confirmação com tom e os rótulos
  padronizados.

### Modified Capabilities

Nenhuma.

## Impact

- `src/components/ui/button.tsx` (reescrito), `alert-dialog.tsx`,
  `common/ActionButton.tsx`, `common/CustomButton.tsx`, `common/GlobalAlertDialog.tsx`
  + `useAlertDialog`, `common/ConfirmDialog.tsx` (novo), `common/RowActions.tsx`
  (novo), `common/ChoiceCard.tsx` (novo), `src/consts/acoes.ts` (novo).
- 856 `<Button>` (codemod de variante), 127 `<button>` crus (migração),
  `configuracoes/components/CompanySettingsList.tsx`, todas as tabelas com
  ações por linha (≈ 40 arquivos listados em `tasks.md`), cabeçalhos de
  detalhe (`QuotationActions`, `OrderActions`, `ClientActions`,
  `InvoiceFormHeader`, `PayrollActions`, `AssetDetail`), 30 diálogos de
  confirmação.
- Depende de `cores-e-contraste` (tons, foco, desabilitado) e `icones`
  (tamanho do ícone por `size`).
- Achados fora de escopo (regras): quais ações cada perfil vê; aqui só a
  forma e a hierarquia. Botões sem handler ("Precificar a hora", "Ver origem
  do custo", "Editar item" de OS, "+" da assinatura, "Comprovante" do PDV, NF
  "recurso indisponível") são removidos ou desabilitados com dica até a regra
  existir.
