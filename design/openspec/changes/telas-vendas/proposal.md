# Telas de vendas

## Why

Orçamentos e ordens de serviço são as telas mais usadas e as que mais
acumulam os problemas de base: cinco a oito ícones sem rótulo por linha e a
linha não abre nada; o detalhe esconde total, validade e status em cinco
accordions fechados, oferece Aprovar, Rejeitar e Imprimir como azulejos
iguais e mostra um "Subtotal" que ignora o desconto; dinheiro é verde até em
orçamento rejeitado e desconto é laranja; doze larguras de diálogo com
formulários de 15 campos e editores de fluxo dentro de modal; rejeitar sem
confirmação; "Voltar" que descarta e "Cancelar" que confirma; duas
impressoras idênticas lado a lado; o mesmo ícone para ver e emitir nota;
itens sem estado vazio; abas de status com o padrão fora de ordem; nomes que
mudam de tela para tela ("Ficha" / "Via de produção", "Excluir" / "Retirar"
/ "Remover"). Evidência: `design/openspec/design/sistema-visual.md` §2 e
o relatório de módulo resumido em `design.md`.

## What Changes

- **Listas** (orçamentos, ordens): linha clicável, `RowActions` (uma em
  linha + menu), `StatusBadge`, coluna de data e de NF, valores em `Money`
  (neutros, à direita), badge "Venda rápida", seleção em massa neutra,
  `ListToolbar` com busca e filtro de período em ambas, paginação única com
  última página da API, aba padrão = primeira, rótulo "Concluídos".
- **Detalhe** (orçamento, OS): `ObjectHeader` com número, cliente, status,
  total, validade/entrega, vendedor/recebido/NF e uma ação primária por
  estado; seções abertas; resumo financeiro com subtotal, desconto e total
  em bloco à direita; itens com `Table numeric`, um padrão de expansão de
  linha, estado vazio com "Adicionar item", ações de item em `RowActions`;
  "Editar item" e botões permanentemente desabilitados removidos ou com
  motivo; breadcrumb entre detalhe, composição e resultado.
- **Fluxos em diálogo → tamanho certo ou painel:** condições de pagamento e
  entrega em `Sheet lg` com `FormGrid`; composição de item (`Compose`) em
  página ou `Sheet xl`; observações em `md`; seleção de item em uma etapa
  com "Voltar"; consulta de CNPJ dentro do formulário; novo cliente a partir
  do orçamento sem empilhar diálogos.
- **Confirmações** no tom certo: rejeitar sempre confirma; remover em
  composição confirma; "Cancelar venda" com "Manter venda"; aprovar/concluir
  sem triângulo.
- **Venda rápida:** uma única ação "Cobrar"; faixa do cabeçalho legível;
  "Novo orçamento comum" leva ao formulário.
- **Correções de interface pontuais** (`tasks.md`): `colSpan`, "Data de
  rejeição: –" fixo, CNPJ do cliente mascarado como o da empresa, "0 dias",
  `Math.abs` escondendo sinal, "–"/"—"/"--" unificados, `Delivery` reusando
  status de ordem, formatação de percentual por `Intl`.

## Capabilities

### New Capabilities

- `telas-de-vendas`: o que as listas e os detalhes de orçamento e ordem de
  serviço exibem e como se comportam.

### Modified Capabilities

Nenhuma.

## Impact

- `src/app/(app-sidebar)/vendas/**` (≈ 120 arquivos), `common/DuplicateQuotationButton.tsx`,
  `common/PrintQuotation/**` (só chamadas).
- Depende de `navegacao-e-cabecalhos` e `componentes-adequados`.
- Achados fora de escopo (regras): "Subtotal" = itens − desconto (`PaymentConditions.tsx:167`)
  é regra de cálculo a confirmar; "Não aprovados" do dashboard; o que "Fase
  atual" × "Status" (etiqueta do usuário) significam; rejeitar sem motivos
  cadastrados deve ser permitido?
