# Telas de nota fiscal (emissão e lista)

## Why

A emissão de nota é o fluxo mais sensível do sistema e o que menos segue o
sistema de design: o cabeçalho é feito à mão, o cliente aparece em cinza
claro, "Emitir NF-e" é um azulejo cinza igual a "Cancelar digitação", dez
cards colapsáveis sem indicador de etapas nem total fixo (o total é o último
e pode ser recolhido), rótulos em caixa alta e abreviados ("Outras desps."),
checkboxes sem função, "Configurar" primário por item, selects "1 - Saida"/
"0 - Nao", caixas amarelas à mão, três listas de "tipo de nota" com tokens
diferentes, cabeçalho copiado e divergente entre NF-e e NFS-e, três máscaras
de dinheiro, sair sem aviso com o formulário preenchido. A lista mostra a
mesma nota em duas tabelas que compartilham a paginação, com três filtros
sobrepostos, verde como cor de acento do módulo, "ID: xxxx" de depuração,
excluir rascunho sem confirmação, ambiente escondido abaixo de `xl`.
Evidência: `design/openspec/design/sistema-visual.md` §2 e o relatório de
módulo resumido em `design.md`.

## What Changes

- **Lista única** (`/nota-fiscal/emitir`): uma tabela com todas as notas e
  ordens elegíveis, `StatusBadge` do dicionário (tipo e status separados),
  valores neutros, ambiente sempre visível no cabeçalho, filtros em
  `ListToolbar` (tipo, status, período, busca), seleção com `SelectionBar`
  ("Emitir selecionadas"), `RowActions` único (menu "⋯" como o da NFC-e),
  confirmação ao excluir rascunho, sem "ID" de depuração, cor da marca como
  acento; a seção de avulsas some como lista separada (vira filtro).
- **Emissão como página com seções:** `PageHeader` com número/série,
  ambiente, status; `SectionNav` lateral (Emitente, Destinatário, Itens,
  Transporte, Pagamento, Informações adicionais, Totais); resumo de totais
  fixo (`TotalsBlock`) na lateral/rodapé; `SaveBar` com "Salvar rascunho"
  (secundária) e "Emitir" (primária) — um só cabeçalho para NF-e, NFS-e,
  NFC-e e avulsas; guarda de não salvo em "Cancelar digitação".
- **Escolha do tipo** em uma única página de etapas (`Stepper`: Tipo →
  Dados) com `RadioCard` do kit; o modal de dois passos e as três listas
  divergentes saem.
- **Campos:** `FormGrid`, rótulos em caixa de frase e completos, `required`,
  `SegmentedControl` para entrada/saída e sim/não, `MoneyInput` único,
  `DatePicker`, `Combobox` para produto/cliente, itens em `Table numeric`
  (mantendo `InvoiceItems.tsx:223-248` como referência) com badge "Pendente"
  + "Configurar pendentes (n)", remover/editar via `RowActions`, parcelas
  em tabela compacta, `Alert` do kit para homologação e avisos.
- **Diálogos fiscais** (cancelar, inutilizar, contingência, rejeição) com
  `ConfirmDialog`/`Alert`.
- Pagamento dividido com o `PaymentSplit` único (de financeiro).

## Capabilities

### New Capabilities

- `telas-de-nota-fiscal`: a lista de notas e a página de emissão.

### Modified Capabilities

Nenhuma.

## Impact

- `src/app/(app-sidebar)/nota-fiscal/**` (≈ 60 arquivos), `components/fiscal/**`
  (chamadas), `common/TotalsBlock.tsx` (de `telas-vendas`).
- Depende de `navegacao-e-cabecalhos` e `componentes-adequados`
  (`Stepper`, `SectionNav`, `SaveBar`, `Combobox`, `StatusBadge`, `Alert`).
- Achados fora de escopo (regras): se avulsas devem mesmo aparecer junto
  das notas de pedido; o que acontece com rascunho ao "cancelar digitação";
  "Consultar SEFAZ" × "Reprocessar" como ações distintas; rótulos "OS"/
  "Pedido de venda".
