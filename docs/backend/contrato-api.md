# Contrato da API — endpoints que faltam para as telas prontas

Preparado em 07/10/2026 a partir do branch `integracao-2026-10-07` do `atrupe-front`, que junta processos, orçamento e gerenciador. É para o desenvolvedor do backend: diz o que construir, e em que ordem, para que as telas que hoje leem **dados de exemplo em memória** passem a ler a API. Esses dados estão nos arquivos `src/actions/*.ts` marcados como "PROVISÓRIO".

**Como ler cada endpoint.** Cada rota tem um bloco, sempre na mesma ordem:

- método e rota;
- corpo e resposta, com JSON de exemplo;
- permissão;
- o que o servidor valida, com o ID da regra;
- o que o servidor calcula;
- o que a tela faz com a resposta;
- qual action do front ele substitui.

Os IDs de regra (SEG-1, BC-8, ORC-7…) são referências à documentação interna de regras da Atrupe; o que o backend precisa saber de cada uma está escrito no próprio bloco, em `seguranca.md` e em `pendencias.md`, neste guia.

**O que este documento não repete.** O que a API já tem não aparece aqui como endpoint novo:

- orçamento: `/sale/quotation`, com `add-product`, `update-product`, `remove-product`, `finish`, `approve`, `reject`, `duplicate`, `bill` e `pdf-data`;
- produtos: `/product`, com `toggle-status`, `quantity` e `export`;
- grupos: `/category`, com `by-sector`;
- setores: `/sector`, com `with-products`;
- unidades: `/unit-of-measure`;
- contas bancárias: `/bank/account`;
- controle de caixa: `/financial/cash-control`;
- Agenda de entrega: `/sale/delivery-schedule`;
- colaboradores: `/employee`;
- plano de contas: `/financial/nature`;
- folha: `/financial/payroll-setup` e `/financial/payroll-templates`;
- cadastros: `/client` e `/supplier`.

Quando um desses precisa de campo novo, o bloco leva a marca **"(muda)"** e lista só o que muda.

## Convenções

- **Empresa e permissão no servidor.** A empresa vem da sessão, nunca do corpo, e toda consulta filtra por ela. Os mocks guardam um estado só para todas as empresas e **não conferem permissão**: hoje só as telas conferem. Por isso cada bloco diz a chave que o servidor precisa exigir (formato `secao:item:acao`) e a feature de plano (`company.plan.features`).
- **Custo e preço só com permissão.** Sem `values:values:view`, o servidor **omite** os campos de custo e de preço; não basta a tela esconder. No orçamento, o custo de recurso nunca vai para a tela (ORC-7, SEG-6).
- **Excluir e remover.** Excluir um cadastro próprio exige `:delete`. Remover uma linha de dentro do registro que se está editando (item, etapa, linha, recurso) exige `:edit`.
- **Erro.** No formato do filtro que já existe: `{ "statusCode": 400, "timestamp": "…", "path": "…", "userMessage": { "message": "Texto para a tela" } }`. O front mostra `userMessage.message` num aviso. As mensagens entre aspas nos blocos são as que as telas já mostram hoje, vindas dos mocks. Campo não declarado no DTO responde 400, então todos os campos do corpo precisam estar declarados.
- **Rotas.** No padrão das que já existem: minúsculas, no singular, em kebab-case e agrupadas por módulo. Uma ação vira subrota com verbo (`POST …/approve`, `PATCH …/toggle-status`). Contagem para abas usa `GET …/quantity`.
- **Listagens.** Recebem `page`, `limit` e `search` e devolvem `{ "data": [...], "page": 1, "lastPage": 3, "total": 42 }`. O `limit` máximo é 100, aplicado no servidor (SEG-2).
- **Criar e editar.** `POST` cria e devolve o registro com `id`; `PATCH` edita uma parte; `PUT` só substitui uma configuração inteira; `DELETE` remove.
- **Unidades.** Dinheiro em **centavos** (inteiro). Medidas do item do orçamento em **milímetros**, como o `add-product` já usa: onde o mock trabalha em metros, o front converte. Datas no formato ISO. Cada campo de percentual diz a sua escala.
- **Cálculo no servidor (SEG-1).** Onde o mock calcula custo, preço, consumo, rateio ou tempo, o endpoint devolve o número pronto e o bloco resume a fórmula em "O servidor calcula". A simulação interativa pode receber coeficientes já resolvidos para aquele item, e o servidor revalida ao salvar.
- **Auditoria (SEG-3, SEG-4).** Exportar exige permissão própria e o arquivo sai identificado com empresa, usuário e data. O acesso às telas de método (composição, base de custos, precificação, resultado previsto) fica registrado.

## Ordem de construção

Segue o roteiro do produto (pauta de 07/10/2026): **processos e produtos → orçamento → gerenciador de produção → base de custos e precificação → locação**. O módulo 5 (venda rápida, caixa e estoque) fica fora dessa sequência. São recursos do LITE e do FULL que já têm tela em mock, e podem andar em paralelo quando houver folga, sem bloquear os outros.

Dentro de cada módulo, o parágrafo "Ordem dentro do módulo" diz o que destrava mais telas. Há dependências entre os módulos:

- o orçamento lê a composição do produto (módulo 1);
- o gerenciador nasce da aprovação do orçamento (módulo 2) e lê a composição do item vendido;
- a precificação e a composição leem o custo da base de custos (módulo 4).

Até o módulo 4 existir, o custo-hora e o custo da máquina podem vir de valores informados no cadastro, desde que pela mesma rota que depois passa a calcular.

## Índice

1. [Processos e produtos](#1-processos-e-produtos) — 60 endpoints
   - [Parte A — Produtos, processos e composição](#parte-a--produtos-processos-e-composição): `GET /product/assembly-resource`, `PATCH /sector/:id (muda)`, `GET /process`, `GET /process/quantity`, `GET /process/:id`, `POST /process`, `PATCH /process/:id`, `PATCH /process/:id/toggle-status`, `GET /process/:id/usage`, `GET /process/:id/usual-next`, `PUT /process/usual-next`, `POST /process/:id/line · PATCH /process/:id/line/:lineId · DELETE /process/:id/line/:lineId`, `POST /process/:id/line/:lineId/option · DELETE /process/:id/line/:lineId/option/:optionId`, `POST /process/:id/field · PATCH /process/:id/field/:fieldId · DELETE /process/:id/field/:fieldId`, `POST /process/:id/formula · PATCH /process/:id/formula/:formulaId · DELETE /process/:id/formula/:formulaId`, `GET /product/:id/assembly`, `PATCH /product/:id/assembly`, `POST /product/:id/assembly/adopt-suggested-price`, `POST /product/:id/assembly/block`, `PATCH /product/:id/assembly/block/:blockId`, `DELETE /product/:id/assembly/block/:blockId`, `POST /product/:id/assembly/block/:blockId/restore-process-lines`, `GET /product/:id/assembly/next-step`, `GET /product/:id/assembly/part-candidate`, `POST /product/:id/assembly/block/:blockId/line`, `PATCH /product/:id/assembly/block/:blockId/line/:lineId`, `POST /product/:id/assembly/block/:blockId/line/:lineId/reset`, `DELETE /product/:id/assembly/block/:blockId/line/:lineId`, `POST /product/:id/assembly/block/:blockId/line/:lineId/option`, `DELETE /product/:id/assembly/block/:blockId/line/:lineId/option/:optionId`, `POST /product/:id/assembly/field`, `PATCH /product/:id/assembly/field/:fieldId`, `DELETE /product/:id/assembly/field/:fieldId`, `POST /product/:id/assembly/formula`, `PATCH /product/:id/assembly/formula/:formulaId`, `DELETE /product/:id/assembly/formula/:formulaId`, `GET /product/:id/variation`, `PUT /product/:id/variation`, `POST /product/:id/variation`, `PATCH /product/:id/variation/:variationId`, `DELETE /product/:id/variation/:variationId`, `GET /product/:id/price-tier`, `PUT /product/:id/price-tier`, `GET /product (muda)`, `GET /product/:id/usage`, `POST /product/:id/duplicate`, `GET /product/assembly-library`, `POST /product/:id/assembly/import-library`, `GET /product/:id/sale-form`, `POST /product/:id/sale-composition`
   - [Parte B — Materiais](#parte-b--materiais): `GET /material`, `POST /material`, `PATCH /material/:id`, `POST /material/:id/variation`, `PATCH /material/:id/variation/:variationId`, `PATCH /material/:id/price`, `GET /material/:id/usage`, `PATCH /material/:id/toggle-status`, `POST /material/import/preview`, `POST /material/import`
2. [Orçamento](#2-orçamento) — 21 endpoints: `POST /sale/quotation/:id/add-product (muda)`, `PATCH /sale/quotation/update-product/:itemId (muda)`, `GET /sale/quotation/:id (muda)`, `DELETE /sale/quotation/remove-product/:itemId (muda)`, `POST /sale/quotation/:id/item/:itemId/line/preview`, `POST /sale/quotation/:id/item/:itemId/line`, `DELETE /sale/quotation/:id/item/:itemId/line/:lineId`, `POST /sale/quotation/:id/composed-draft`, `GET /sale/quotation/:id/composed-draft/:draftId`, `POST /sale/quotation/:id/add-composed`, `PATCH /sale/quotation/update-composed/:itemId`, `POST /sale/quotation/:id/composed-draft/:draftId/save-as-product`, `POST /sale/quotation/:id/add-material`, `PATCH /sale/quotation/update-material/:itemId`, `GET /sales-settings`, `PUT /sales-settings`, `GET /sale/quotation/:id/result`, `GET /sale/quotation/:id/result/export`, `POST /sale/quotation/:id/finish (muda)`, `POST /sale/quotation/:id/approve (muda)`, `GET /sale/quotation/:id/pdf-data (muda)`
3. [Gerenciador de produção (ELITE)](#3-gerenciador-de-produção-elite) — 35 endpoints: `GET /sector (muda)`, `PATCH /sector/:id (muda)`, `GET /production/config`, `GET /production/manager`, `POST /production/manager`, `POST /production/manager/:id/inactivate`, `POST /production/manager/:id/reactivate`, `PUT /production/manager/:id/user/:collaboratorId`, `PATCH /production/collaborator/:id`, `POST /production/task-type`, `PATCH /production/task-type/:id/toggle-status`, `POST /production/task-type/:id/step`, `PUT /production/task-type/:id/step-order`, `POST /production/vehicle`, `PATCH /production/vehicle/:id/toggle-status`, `POST /sale/quotation/:id/approve (muda)`, `GET /production/project`, `GET /production/project/:id`, `POST /production/project/:id/release`, `PATCH /production/project/:id/delivery`, `GET /production/manager/:id/board`, `GET /production/agenda`, `PUT /production/task/:id/schedule`, `PATCH /production/task/:id`, `POST /production/task/:id/action`, `POST /production/task/:id/pendency`, `POST /production/task/:id/release-next`, `POST /production/task/:id/work/start`, `POST /production/task/:id/work/stop`, `PUT /production/task/:id/time-entry/:entryId`, `POST /production/task/:id/time-entry`, `POST /production/task/:id/attachment`, `POST /production/task/:id/attachment/:attachmentId/version`, `PUT /production/task/:id/attachment/:attachmentId/current`, `GET /production/productivity`
4. [Base de custos, patrimônios e precificação (PRO)](#4-base-de-custos-patrimônios-e-precificação-pro) — 37 endpoints: `PATCH /sector/:id (muda)`, `GET /cost-base/admin-expense`, `GET /cost-base/admin-expense/totals`, `PATCH /cost-base/admin-expense/:id`, `GET /cost-base/sector`, `GET /cost-base/summary`, `GET /cost-base/distribution`, `PUT /cost-base/distribution`, `GET /cost-base/sector/allocation`, `PUT /cost-base/sector/:id/allocation`, `GET /cost-base/labor`, `PUT /cost-base/labor/:sectorId/hours`, `GET /cost-base/depreciation`, `GET /cost-base/comparison`, `GET /asset`, `GET /asset/quantity`, `GET /asset/:id`, `POST /asset`, `PATCH /asset/:id`, `PATCH /asset/:id/toggle-status`, `POST /asset/:id/sell`, `POST /asset/:id/cost`, `POST /asset/:id/setup`, `GET /asset/group`, `POST /asset/group`, `PATCH /asset/group/:id`, `DELETE /asset/group/:id`, `GET /pricing/summary`, `PUT /pricing/parameters`, `GET /pricing/item`, `PATCH /pricing/item/:id`, `PATCH /product/:id (muda)`, `POST /pricing/item/apply-suggested`, `GET /financial/payroll-setup (muda)`, `PATCH /financial/payroll-setup/:id (muda)`, `PATCH /financial/payroll-templates/:id (muda)`, `PATCH /employee/:id (muda)`
5. [Venda rápida, contas, caixa (LITE) e estoque (FULL) — fora da sequência principal](#5-venda-rápida-contas-caixa-lite-e-estoque-full--fora-da-sequência-principal) — 32 endpoints: `GET /sale/quick-sale/settings`, `PUT /sale/quick-sale/settings`, `POST /sale/quotation/quick-sale`, `POST /sale/quotation/:id/approve (muda)`, `POST /sale/quotation/:id/quick-sale/charge`, `GET /sale/quotation/:id/cash-status`, `GET /bank/account (muda)`, `POST /bank/account · PATCH /bank/account/:id (muda)`, `DELETE /bank/account/:id (muda)`, `PATCH /bank/account/:id/toggle-status (muda)`, `GET /financial/cash-control (muda)`, `POST /financial/cash-control`, `POST /financial/cash-control/:id/adjustment`, `POST /financial/cash-control/:id/close`, `POST /financial/cash-control/:id/reopen`, `POST /financial/cash-control/:id/movement/:movementId/approve`, `POST /financial/cash-control/transfer`, `GET /financial/pdv`, `POST /financial/pdv/session`, `POST /financial/pdv/session/:id/movement`, `POST /financial/pdv/session/:id/close`, `POST /financial/pdv/sale/:id/claim`, `POST /financial/pdv/sale/:id/receive`, `POST /financial/pdv/sale/:id/ready`, `POST /financial/pdv/sale/:id/discard`, `POST /financial/pdv/sale/:id/reverse`, `POST /financial/pdv/sale/:id/bill`, `GET /stock`, `GET /stock/movement`, `GET /stock/invoice-entry`, `PATCH /stock/invoice-entry/:id/item/:itemId`, `POST /stock/invoice-entry/:id/confirm`
6. [Locação](#6-locação) — 6 endpoints: `PATCH /asset/:id (muda)`, `PUT /product/:id/rental-prices`, `GET /rental/availability`, `POST /sale/quotation/:id/add-product (muda)`, `POST /sale/quotation/:id/approve (muda)`, `GET /rental/asset/:id/result`
7. [Decisões de modelagem a revisar](#7-decisões-de-modelagem-a-revisar)
8. [Tabela mock → endpoint](#8-tabela-mock--endpoint)

São 191 blocos de endpoint ao todo: rotas novas e mudanças em rotas que já existem.

## 1. Processos e produtos

### Parte A — Produtos, processos e composição

**Ordem dentro do módulo.** (1) **Recursos disponíveis** e **processos com linhas e opções**: o processo é guardado no mesmo formato da etapa (MS-11), então a linha, a opção, o campo e a fórmula construídos aqui servem às duas telas, e o motor de cálculo (SEG-1) nasce junto, na simulação do processo. (2) **Composição do produto**: leitura com cálculo, cabeçalho, etapas, e as mesmas linhas, campos e fórmulas sob o produto. Isso destrava a página de composição, a aba Composição do diálogo do produto e o R$ da lista. (3) **Formulário de venda e relatório da composição**, que destravam o item composto no orçamento, a proposta e a criação do projeto na produção. (4) **Variações e faixas de preço**: são do START/LITE e não dependem do motor; podem ser feitas em paralelo, logo no início. (5) O resto: "onde é usado", duplicar, biblioteca e o filtro `hasComposition`.

**Convenções deste módulo.** Dinheiro em centavos. Percentuais (`lossPercent`, `margin`) em percentual, com até uma casa decimal (20 = 20 %). As medidas que entram (`quantity`, `width`, `height`) vão em **milímetros**, como no `add-product`: o mock usa metros e o front converte. A área sai em m², e a quantidade de cada linha sai na unidade do recurso (m², m, un, min). Tempo em minutos. **Permissões:** a composição e os processos usam hoje `product_settings:products:view` (ler) e `product_settings:products:edit` (alterar). Como a composição é tela de método (SEG-6), a regra pede uma chave própria. Proposta: `product_settings:composition:view|edit`, e as telas trocam de chave quando ela existir. Nos blocos, **[ver]** e **[editar]** indicam essas duas chaves. Os campos de custo e de preço (`cost`, `unitCost`, `sale`, `suggestedPrice`, `margin`, os resumos) exigem também `values:values:view`: sem ela, o servidor omite os campos. **Plano:** composição = `cost_base` + `product_composition`; processos = `cost_base`; variações = START (sem feature); faixas = `product_composition`. O servidor registra o acesso às leituras de método (SEG-4): `GET /product/:id/assembly` e `GET /process/:id`.

**Modelo mínimo.** `ProductAssembly` (1 por produto, mais 1 por variação que tiver composição própria): `status` (`DRAFT` "Em edição" · `RELEASED` "Liberado para venda" · `PART` "Parte", IP-14, CP-17), `dimension` (`SALE` · `FIXED`, IP-16) e `allowRenameStages`. Nome, código, unidade comercial, valor de venda, padrão de medidas, descritivo técnico, `allowEditValues` e `allowEditDescription` **continuam no `/product`** e não se duplicam (CP-16, CP-17). `AssemblyBlock` (etapa): `processId` **ou** `partProductId` **ou** nenhum dos dois (etapa do produto, IP-29), mais `dependsOn[]`, `baseBlockId`, `sectorId`, `setupMinutes`, `localName`, `localTaskType`, `localRules`, `removedSourceLineIds[]` e `fixedMeasure`. `AssemblyLine`: `kind`, `mode` (`SINGLE` · `CHOOSE` · `LIST`), `formula` (FormulaKey), `perUnit`, `lossPercent`, `minimum`, `optional`, `optionalDefault`, `fieldName`, `formulaId`, `people` e `options[]`. A opção guarda **só a referência** `resourceId`, mais `configName` e, se houver, `perUnit`, `lossPercent` e `minimum` próprios (IP-26, IP-27). O custo e o preço de venda do recurso vêm sempre do cadastro dele (CP-21). **Vínculo com o processo (CP-21):** a etapa com `processId` não copia as linhas. Ela guarda só o que foi ajustado neste produto: linha com `overridden`, linha `addedHere`, linhas removidas, `localRules`, `localName` e `localTaskType`. O resto é lido do processo a cada cálculo. Mudar o processo muda os produtos; orçamentos já feitos não mudam (AB-4, ORC-10).

#### Recursos disponíveis

São os recursos que uma linha pode usar (CP-3, IP-31). O servidor monta a lista a partir dos cadastros:

- máquina: a configuração produtiva do patrimônio detalhado ou o grupo de bens (P-16, P-28);
- material: o material, ou cada variação dele (MT-3, MT-10.1);
- mão de obra: o setor, pelo custo-hora da Base de custos e pela hora vendida;
- terceirizado avulso (T-4).

O `resourceId` é uma chave estável que o servidor monta e devolve, por exemplo `material:<id>:<variationId>`, `asset-setup:<id>`, `asset-group:<id>` ou `labor:<sectorId>`. A linha guarda só essa chave.

##### GET /product/assembly-resource

Lista os recursos que podem entrar numa linha de composição (produto ou processo), com unidade e, para quem vê valores, custo e preço de venda por unidade.

- **Resposta:**
```json
{ "data": [
  { "resourceId": "labor:3f2a…", "kind": "LABOR", "name": "Mão de obra · Produção", "unit": "min", "unitCost": 27, "unitSale": 100 },
  { "resourceId": "material:metalon-50x30", "kind": "MATERIAL", "name": "Metalon 50 × 30", "unit": "m", "unitCost": 1850, "unitSale": 3108,
    "profile": { "x": 50, "y": 30, "barLength": 6000 }, "weight": 1.9 },
  { "resourceId": "material:couche-300:v1", "kind": "MATERIAL", "name": "Couchê 300 g · A3", "unit": "un",
    "sheet": { "width": 297, "height": 420, "wholeSheets": true } }
], "page": 1, "lastPage": 2, "total": 143 }
```
- **Query:** `kind` (`MACHINE` · `MATERIAL` · `LABOR` · `OUTSOURCED`), `search`, `unit` (o diálogo da escolha passa a unidade da linha, IP-39), `page`, `limit` (máximo 100, SEG-2).
- **Permissão:** [ver]; `values:values:view` para `unitCost` e `unitSale`; plano `cost_base`.
- **O servidor valida:** só recursos ativos (material ativo e de produção, patrimônio não inativo). A mão de obra de setor que vende por equipamento não aparece (AB-19, 29/09/2026). O servidor lê isso do campo `saleUnit` do setor (ver o bloco "muda" abaixo).
- **O servidor calcula:** `unitSale` = o preço de venda do cadastro do recurso. Sem ele, vale custo × markup de referência da Precificação (IP-25, PR-1). Na mão de obra, o custo e a venda vão por minuto (custo-hora ÷ 60 e hora vendida ÷ 60). A medida da folha e a do perfil vão em mm.
- **A tela:** os diálogos "Nova linha" e "Opções da linha" buscam por tipo e por texto. Hoje a tela carrega tudo uma vez (`staleTime: Infinity`); com o limite, passa a buscar ao digitar. A lista de setores **não** sai mais daqui: vem de `/sector` (o fallback do `useCompanySectors` sai).
- **Substitui:** `product-assembly.ts › getAssemblyResources`.

##### PATCH /sector/:id (muda)

O setor ganha "como este setor vende" (AB-19, MO-2).

- **Corpo:** `{ "saleUnit": "HOUR" }`. Os valores são `HOUR` ou a unidade do equipamento (`M2` · `M` · `UN` · `KM`). Também é aceito no `POST /sector`, e o `GET` devolve o campo.
- **Permissão:** `company_settings:sectors:edit`.
- **O servidor valida:** o padrão é `HOUR`.
- **A tela:** a composição desabilita o botão Mão de obra na etapa de setor com `saleUnit ≠ HOUR`. Hoje esse dado é o `SECTOR_SALES` do mock.
- **Substitui:** a constante `SECTOR_SALES` de `product-assembly.ts` (lida por `getAssemblyResources`).

#### Processos

O processo é uma etapa reutilizável de um setor (MS-11), guardada no formato da etapa: setor, preparo (CP-15), regras de venda (MS-3 a MS-6), tipo de tarefa (MS-8) e linhas. Ele tem ainda `afterBase` (`INHERIT` "Acompanha a base" · `OWN` "Medida própria", decisão de 03/10), `sellerInstructions` (CP-13), `isActive`, e os próprios campos e fórmulas (IP-4, IP-2). A marcação "costuma vir depois de" (FL-7) é um par `from → to`, guardado uma vez.

##### GET /process

Lista os processos da empresa para a tela de Processos e para o painel "Acrescentar a este item" do orçamento.

- **Resposta:**
```json
{ "data": [
  { "id": "…", "name": "Ilhós", "sectorId": "…", "sector": "Produção", "category": "Depois de Impressão solvente, Bainha", "afterBase": "INHERIT",
    "taskType": "Produção", "setupMinutes": 5, "rules": { "quantityMode": "HIDDEN_ONE", "followsBase": true, "dimension": "SAME_AS_PARENT", "descriptionEditable": false },
    "lines": 2, "kinds": ["LABOR", "MATERIAL"], "incomplete": false, "isActive": true, "usedIn": 4 }
], "page": 1, "lastPage": 1, "total": 9 }
```
- **Query:** `status` (`ativos` · `inativos`, padrão `ativos`), `search`, `sectorId`, `page`, `limit` (máx. 100).
- **Permissão:** [ver] + `cost_base`. No orçamento, `sale:quotation:edit`, só com os ativos.
- **O servidor calcula:** `category` (MS-7) é "Depois de X, Y" a partir dos pares FL-7 que chegam ao processo; sem par, é "Serviço de máquina" se o processo tem linha `MACHINE`, senão "Primário". `incomplete` (IP-37, MS-8) é verdadeiro quando o processo não tem linha ou tem linha sem opção. `usedIn` conta os produtos (e as composições de variação) com etapa ligada a ele.
- **A tela:** a lista de Processos, com as abas Ativos e Inativos e o aviso de "linha sem recurso". O `AddToItem` usa só os ativos.
- **Substitui:** `product-assembly.ts › getProcessList`.

##### GET /process/quantity

Contagem para as abas.

- **Resposta:** `{ "active": 9, "inactive": 1 }`
- **Permissão:** [ver] + `cost_base`.
- **A tela:** as abas Ativos e Inativos (hoje a tela conta a lista inteira).
- **Substitui:** a contagem feita em `Processes.tsx` sobre `getProcessList`.

##### GET /process/:id

Detalhe do processo com a simulação numa medida (CP-2, PAD-6). Não grava nada.

- **Query:** `quantity`, `width`, `height` (mm; sem eles, vale a medida padrão do processo). Para "Simular depois de outra etapa" (§9.1, 06/10), também `baseQuantity`, `baseWidth` e `baseHeight`.
- **Resposta:**
```json
{ "id": "…", "name": "Ilhós", "sectorId": "…", "sector": "Produção", "afterBase": "INHERIT", "setupMinutes": 5, "taskType": "Produção",
  "sellerInstructions": "Confirme com o cliente a distância entre ilhoses.", "isActive": true, "category": "Depois de Impressão solvente",
  "rules": { "quantityMode": "HIDDEN_ONE", "followsBase": true, "dimension": "SAME_AS_PARENT", "descriptionEditable": false },
  "measure": { "quantity": 1, "width": 1000, "height": 1000 },
  "block": { "setupCost": 241, "setupSale": 500, "cost": 812, "sale": 2140, "lines": [
    { "id": "…", "name": "Ilhós", "kind": "MATERIAL", "mode": "SINGLE", "formula": "PER_PERIMETER_DIV_EXTRA", "fieldName": "Distância entre ilhoses (m)",
      "perUnit": 1, "lossPercent": 0, "minimum": null, "quantity": 8, "minimumApplied": false,
      "selected": { "id": "…", "resourceId": "material:ilhos", "name": "Ilhós latão", "unit": "un", "unitCost": 12 }, "cost": 96, "sale": 240,
      "options": [ … ] } ] },
  "fields": [ { "id": "…", "name": "Distância entre ilhoses (m)", "defaultValue": 0.5, "allowsFraction": true, "usedBy": ["Ilhós"] } ],
  "formulas": [ { "id": "…", "name": "Travessas", "expression": "…", "usedBy": [], "error": null } ],
  "resourceSummary": [ { "resourceId": "material:ilhos", "name": "Ilhós latão", "kind": "MATERIAL", "unit": "un", "quantity": 8, "cost": 96, "sale": 240, "people": null } ],
  "cost": 812, "sale": 2140,
  "usedIn": [ { "productId": "…", "name": "Banner 440 com bastão" } ] }
```
- **Permissão:** [ver] + `cost_base`; custo e venda com `values:values:view`. Registrar o acesso (SEG-4).
- **O servidor valida:** "Processo não encontrado".
- **O servidor calcula:** o motor da composição sobre a etapa sozinha. Com a base simulada, a etapa é calculada depois de uma base sem custo, com a medida dada e as regras por posição (`rulesByPosition`). `cost` = custo do preparo + Σ custo das linhas. `sale` = venda do preparo + Σ venda das linhas (o motor está resumido em `GET /product/:id/assembly`).
- **A tela:** a página `/processos/[id]` e o diálogo Editar processo mostram a Simulação, a tabela de linhas e o "Usado em". O orçamento **não** usa esta rota para o preço do processo avulso: usa a rota de preço do processo do módulo 2 (Orçamento), que não devolve custo (ORC-7).
- **Substitui:** `product-assembly.ts › getProcessDetail` (as telas de configuração; a chamada do `AddToItem` e o `recalculateItemLines` vão para o módulo 2 (Orçamento)).

##### POST /process

Cria um processo vazio (MS-1).

- **Corpo:** `{ "name": "Dupla face", "sectorId": "…", "afterBase": "INHERIT" }`
- **Resposta:** o processo criado, no formato de `GET /process/:id` (com `id`).
- **Permissão:** [editar] + `cost_base` (a tela usa `product_settings:products:edit`).
- **O servidor valida:** "Informe o nome do processo"; o setor precisa existir e estar ativo.
- **O servidor calcula:** nasce com as regras de base (MS-5: quantidade livre, medida livre, descrição editável), `setupMinutes: 0`, tipo de tarefa = setor, ativo.
- **A tela:** o diálogo Novo processo fecha e reabre na aba Composição.
- **Substitui:** `product-assembly.ts › createProcessDef`.

##### PATCH /process/:id

Altera a configuração do processo e as regras de venda dele.

- **Corpo:** `{ "name": "Ilhós", "sectorId": "…", "afterBase": "OWN", "setupMinutes": 10, "sellerInstructions": "…", "taskType": "Acabamento", "rules": { "quantityMode": "FREE", "followsBase": false, "dimension": "FREE_SIZE", "descriptionEditable": true } }` (todos opcionais).
- **Resposta:** `{ "id": "…", "affectedProducts": 4 }`
- **Permissão:** [editar] + `cost_base`.
- **O servidor valida:** "Processo não encontrado"; "Informe o nome da etapa" (nome vazio); `setupMinutes ≥ 0`.
- **A tela:** o Salvar do rodapé (PAD-5) e os seletores do cabeçalho da etapa do processo. O processo avisa quantos produtos a mudança alcança (CP-21).
- **Substitui:** `product-assembly.ts › updateProcessMeta` (sem o `active`); `product-assembly.ts › setBlockLocalRules` quando chamado pelo ProcessEditor no host `processo:<id>`.

##### PATCH /process/:id/toggle-status

Inativa ou reativa o processo (PAD-7). O processo nunca é excluído.

- **Corpo:** `{ "isActive": false }`
- **Resposta:** `{ "id": "…", "isActive": false }`
- **Permissão:** [editar] + `cost_base`.
- **O servidor valida:** "Processo não encontrado".
- **O servidor calcula:** inativo, o processo continua nas etapas dos produtos (que passam a vir com `processInactive: true`), mas deixa de aparecer em `next-step`, em `GET /process?status=ativos` e no orçamento.
- **A tela:** o `InactivateProcessDialog`, depois de mostrar o "onde é usado".
- **Substitui:** `product-assembly.ts › updateProcessMeta` (`values.active`).

##### GET /process/:id/usage

Onde o processo é usado, para o diálogo de inativar (PAD-7).

- **Resposta:** `{ "data": [ { "productId": "…", "name": "Banner 440 com bastão", "variation": null, "stage": "Impressão solvente" } ] }`
- **Permissão:** [ver] + `cost_base`.
- **O servidor calcula:** as etapas ligadas ao processo em todos os produtos e composições de variação. Não entram os itens montados no orçamento.
- **A tela:** lista no diálogo de inativar.
- **Substitui:** `product-assembly.ts › getProcessUsage`.

##### GET /process/:id/usual-next

As duas listas do card "No fluxo dos produtos": "costuma vir depois de" e "etapas seguintes usuais" (FL-7).

- **Resposta:** `{ "before": [ { "id": "…", "name": "Impressão solvente", "sector": "Impressão", "afterBase": "OWN", "usual": true } ], "after": [ { "id": "…", "name": "Bainha", "sector": "Produção", "afterBase": "INHERIT", "usual": false } ] }`
- **Permissão:** [ver] + `cost_base`.
- **O servidor valida:** "Processo não encontrado".
- **O servidor calcula:** todos os outros processos (inclusive os inativos), marcados com `usual` pelos pares, nas duas direções. Os marcados vêm primeiro, depois a ordem é por setor e por nome.
- **A tela:** as duas listas de marcar.
- **Substitui:** `product-assembly.ts › getUsualNext`.

##### PUT /process/usual-next

Liga ou desliga o par "vem depois de" (FL-7). O par é editável dos dois lados.

- **Corpo:** `{ "fromProcessId": "…", "toProcessId": "…", "usual": true }`
- **Resposta:** `{ "fromProcessId": "…", "toProcessId": "…", "usual": true }`
- **Permissão:** [editar] + `cost_base`.
- **O servidor valida:** "Processo não encontrado"; "Um processo não vem depois dele mesmo".
- **A tela:** marcar ou desmarcar no card; recarrega as duas listas.
- **Substitui:** `product-assembly.ts › setUsualNext`.

##### POST /process/:id/line · PATCH /process/:id/line/:lineId · DELETE /process/:id/line/:lineId

As linhas do processo. O contrato é o mesmo das linhas da etapa do produto (ver Composição › Linhas): o mesmo corpo, as mesmas validações e as mesmas mensagens. Não existe `reset` nem "restaurar linhas", que só fazem sentido no produto.

- **Corpo:** igual a `POST /product/:id/assembly/block/:blockId/line` e a `PATCH …/line/:lineId`.
- **Resposta:** `{ "id": "…", "affectedProducts": 4 }`
- **Permissão:** [editar] + `cost_base`. Remover linha é `:edit` (regra firmada).
- **O servidor valida:** as mesmas mensagens da linha do produto.
- **O servidor calcula:** a mudança vale na hora para os produtos ligados (CP-21), exceto nas linhas que eles ajustaram (`overridden`). Uma linha nova no processo aparece nos produtos na mesma posição, salvo nos que a removeram.
- **A tela:** o ProcessEditor recarrega o `GET /process/:id` e avisa quantos produtos a mudança alcança.
- **Substitui:** `product-assembly.ts › addAssemblyLine`, `updateAssemblyLine`, `removeAssemblyLine` (quando chamados com `processo:<id>`).

##### POST /process/:id/line/:lineId/option · DELETE /process/:id/line/:lineId/option/:optionId

As opções de uma linha de escolha ou de lista do processo (IP-27, IP-31). O contrato é o mesmo das opções da linha do produto.

- **Corpo:** igual a `POST /product/:id/assembly/block/:blockId/line/:lineId/option`.
- **Resposta:** `{ "id": "…", "affectedProducts": 4 }`
- **Permissão:** [editar] + `cost_base`.
- **O servidor valida:** as mesmas mensagens da opção do produto.
- **A tela:** o ProcessEditor recarrega.
- **Substitui:** `product-assembly.ts › addLineOption`, `removeLineOption` (no host `processo:<id>`).

##### POST /process/:id/field · PATCH /process/:id/field/:fieldId · DELETE /process/:id/field/:fieldId

Os campos do orçamento declarados no processo (IP-4, IP-19). O produto que inclui o processo ganha esses campos pelo nome. O contrato é o mesmo dos campos do produto.

- **Corpo:** igual a `POST /product/:id/assembly/field`.
- **Resposta:** o campo criado ou alterado; `DELETE` responde 204.
- **Permissão:** [editar] + `cost_base`.
- **O servidor valida:** as mesmas mensagens dos campos do produto.
- **A tela:** o card Processo (ProductFields, com `productId = hostId` hoje).
- **Substitui:** `product-assembly.ts › addProductField`, `updateProductField`, `removeProductField` (no host `processo:<id>`).

##### POST /process/:id/formula · PATCH /process/:id/formula/:formulaId · DELETE /process/:id/formula/:formulaId

As fórmulas do processo (IP-2). O produto que inclui o processo recebe a fórmula marcada "veio do processo", e ela acompanha a do processo (CP-21). O contrato é o mesmo das fórmulas do produto.

- **Corpo:** igual a `POST /product/:id/assembly/formula`.
- **Resposta:** a fórmula criada ou alterada; `DELETE` responde 204.
- **Permissão:** [editar] + `cost_base`.
- **O servidor valida:** as mesmas mensagens das fórmulas do produto.
- **A tela:** a lista "Fórmulas do processo" e "Nova fórmula…" na linha.
- **Substitui:** `product-assembly.ts › addProductFormula`, `updateProductFormula`, `removeProductFormula` (no host `processo:<id>`).

Sem endpoint (sem chamador): `getProcessCatalog` (a lista de ativos é `GET /process?status=ativos`).

#### Composição do produto: leitura, cabeçalho e preço

A composição é uma camada do produto (CP-17): produto sem composição abre vazio, com o cabeçalho do cadastro (CP-16), e nunca aparece com margem zero (DC-15). Toda rota sob `/product/:id/assembly` aceita `variationId` (na query nas leituras, no corpo nas escritas) para agir na composição própria de uma variação. Sem `variationId`, vale a composição padrão. Os ids de etapa, linha, campo e fórmula são únicos, e o servidor confere que pertencem a esse produto e a essa variação.

##### GET /product/:id/assembly

Lê a composição já calculada numa medida: a página de composição, a aba Composição do diálogo do produto e a simulação (IP-15, PAD-6). Não grava nada.

- **Query:** `variationId`, `quantity`, `width`, `height` (mm; sem eles, vale o padrão de medidas do cadastro do produto).
- **Resposta:**
```json
{ "productId": "…", "name": "Banner 440 com bastão", "code": "PRD-01", "unitKind": "AREA", "unitPrice": 4500, "status": "RELEASED", "dimension": "SALE",
  "allowRenameStages": false, "isActive": true, "measure": { "quantity": 1, "width": 900, "height": 1200 }, "area": 1.08,
  "blocks": [ { "id": "…", "type": "PROCESS", "processId": "…", "partProductId": null, "name": "Impressão solvente", "localName": null, "sectorId": "…", "sector": "Impressão",
      "dependsOn": [], "baseBlockId": null, "role": "BASE", "setupMinutes": 10, "taskType": "Impressão",
      "rules": { "quantityMode": "FREE", "followsBase": true, "dimension": "FREE_SIZE", "descriptionEditable": true }, "rulesOverridden": false, "removedProcessLines": 0,
      "processInactive": false, "partInactive": false, "measure": { "quantity": 1, "width": 900, "height": 1200 }, "setupCost": 482, "setupSale": 1333, "cost": 2950, "sale": 6100,
      "part": null, "partFlow": null, "partLines": [], "partSetupMinutes": 0,
      "lines": [ { "id": "…", "name": "Material", "kind": "MATERIAL", "mode": "CHOOSE", "selectedId": "…", "formula": "PER_AREA", "perUnit": 1, "lossPercent": 20, "minimum": 0.5,
          "optional": false, "optionalDefault": true, "fieldName": null, "formulaId": null, "formulaName": null, "people": null, "overridden": false, "addedHere": false,
          "options": [ { "id": "…", "resourceId": "material:lona-440", "configName": null, "name": "Lona 440 g", "unit": "m²", "unitCost": 1250, "unitSale": 2500, "perUnit": null, "lossPercent": null, "minimum": null } ],
          "effective": { "perUnit": 1, "lossPercent": 20, "minimum": 0.5, "own": false }, "quantity": 1.296, "minimumApplied": false, "sheetYield": null, "cost": 1620, "sale": 3240 } ] } ],
  "resourceSummary": [ { "resourceId": "material:lona-440", "name": "Lona 440 g", "kind": "MATERIAL", "unit": "m²", "quantity": 1.296, "cost": 1620, "sale": 3240, "people": null } ],
  "fields": [ { "id": "…", "name": "Distância entre ilhoses (m)", "defaultValue": 0.5, "allowsFraction": true, "usedBy": ["Ilhós"], "fromProcess": true } ],
  "formulas": [ { "id": "…", "name": "Travessas", "expression": "(largura - montante · X * 2) * 2", "processId": null, "usedBy": ["Estrutura soldada"], "error": null } ],
  "cost": 5120, "suggestedPrice": 9870, "saleAmount": 1.08, "priceForMeasure": 4860, "suggestedUnitPrice": 9139, "margin": -5.3,
  "activeTier": { "from": 101, "unitPrice": 28 }, "effectiveTiers": [ { "from": 1, "unitPrice": 35 } ], "tiersFromVariation": false,
  "tierSummary": [ { "from": 1, "unitPrice": 35, "unitCost": 12.5, "margin": 64.3 } ],
  "variationSummary": [ { "id": null, "name": "Padrão", "cost": 5120, "priceForMeasure": 4860, "margin": -5.3 } ],
  "warnings": [ { "blockId": "…", "code": "DISCONNECTED_PATH" }, { "blockId": "…", "lineId": "…", "code": "LINE_WITHOUT_RESOURCE" } ] }
```
- **Permissão:** [ver] + `cost_base` + `product_composition`. Sem `values:values:view`, saem `unitCost`, `unitSale`, `cost`, `sale`, `setupCost`, `setupSale`, `suggestedPrice`, `suggestedUnitPrice`, `margin`, `priceForMeasure`, `tierSummary`, `variationSummary` e os valores do `resourceSummary`. Registrar o acesso (SEG-4).
- **O servidor valida:** "Produto não encontrado" (de outra empresa também dá 404).
- **O servidor calcula** (SEG-1; a tela recebe o resultado, nunca a conta):
  - a ordem topológica das etapas por `dependsOn` (FL-1);
  - a medida de cada etapa pelas regras de venda (`localRules ?? as do processo`, MS-3 a MS-5): `SAME_AS_PARENT` usa a medida da base; a quantidade vale `FREE`, `HIDDEN_ONE` = quantidade da base, ou `AREA_RATIO` = ⌊área da base ÷ área da etapa⌋ × quantidade da base;
  - a quantidade de cada linha pela fórmula (as 22 FormulaKey: por área, perímetro, campo, tempo, aproveitamento de folha AP-1/AP-3/AP-4, fórmula do produto IP-2 com as referências "linha · X/Y/largura/altura/peso", MT-10.1);
  - qtd = bruto × pessoas (IP-13) × (1 + perda/100), e depois max(qtd, mínimo) (IP-35). Valem o consumo, a perda e o mínimo da opção escolhida, ou os da linha (IP-26). A linha `LIST` e a opcional desmarcada ficam fora (IP-8, IP-28);
  - custo da linha = qtd × custo unitário do cadastro; venda = qtd × preço de venda do recurso (IP-25);
  - preparo uma vez por pedido: minutos × custo-hora do setor ÷ 60, e na venda × hora vendida ÷ 60 (CP-15);
  - parte calculada na medida da etapa, até 3 níveis (IP-9);
  - `cost` = Σ etapas; `suggestedPrice` = Σ venda das etapas; `saleAmount` = área × quantidade (`AREA`), quantidade (`UNITY`) ou unidades × quantidade;
  - `priceForMeasure` = preço vigente × `saleAmount`, onde o preço vigente é o da faixa (FQ-1, FQ-2), o da variação (PV-4) ou o do produto;
  - `suggestedUnitPrice` = sugerido ÷ `saleAmount`; `margin` = (preço − custo) ÷ preço × 100, ou `null` sem custo (DC-15);
  - o `tierSummary` recalcula cada faixa na quantidade dela (FQ-3); o `variationSummary` calcula a padrão e cada variação (PV-4);
  - os `warnings`: caminho solto (FL-12) e linha sem recurso (IP-37).
- **A tela:** o AssemblyEditor desenha as etapas, o fluxo, a Simulação (custo, venda, sugerido e margem), o Resumo por recurso e os cards de campos e fórmulas. O `ProductsData` (R$ da lista) lê `cost / saleAmount` para o modal de precificação. O `seed` some: o servidor lê o cadastro.
- **Substitui:** `product-assembly.ts › getAssembly`; `compositions.ts › getComposition` (que só servia para o cabeçalho, agora em `GET /product/:id`).

##### PATCH /product/:id/assembly

Altera o cabeçalho da composição: situação, dimensão e "Permitir renomear etapas".

- **Corpo:** `{ "variationId": null, "status": "RELEASED", "dimension": "FIXED", "allowRenameStages": true }` (todos opcionais).
- **Resposta:** `{ "productId": "…", "status": "RELEASED", "dimension": "FIXED", "allowRenameStages": true }`
- **Permissão:** [editar] + `cost_base` + `product_composition`.
- **O servidor valida** (ao passar para `RELEASED`, IP-14): "Monte a composição antes de liberar o produto para venda" (sem etapas); "Há linhas de escolha sem opção padrão. Escolha antes de liberar". O produto em `DRAFT` ou em `PART` não sai na lista do orçamento (ver `GET /product`, muda).
- **A tela:** o seletor Situação e as chaves do cabeçalho. Nome, valor de venda, padrão de medidas ("Salvar como padrão"), descritivo técnico, `allowEditValues` e `allowEditDescription` vão no `PATCH /product/:id` que já existe (medidas em mm): a composição não tem cópia deles, e o espelho do `ProductsData` (`updateAssembly({unitPrice})` depois do PUT) sai.
- **Substitui:** `product-assembly.ts › updateAssembly` (os campos `status`, `dimension`, `allowRenameStages`; os outros vão para o `/product`); `compositions.ts › setReleasedForSale` (sem chamador).

##### POST /product/:id/assembly/adopt-suggested-price

Adota o preço sugerido como valor de venda do produto, ou da variação (CP-16, CP-7, DC-14). É uma decisão deliberada, produto a produto.

- **Corpo:** `{ "variationId": null }`
- **Resposta:** `{ "productId": "…", "variationId": null, "unitPrice": 9139 }` (centavos por unidade comercial).
- **Permissão:** [editar] + `product_settings:products:edit` + `values:values:view`; plano `cost_base`.
- **O servidor valida:** "Produto sem custo calculado" (composição sem custo).
- **O servidor calcula:** o `suggestedUnitPrice` na medida padrão, pelo próprio servidor. O corpo **não** traz o valor. Grava no valor de venda do cadastro (`items[0]`, que a API guarda por mm²/mm/ml) ou no `unitPrice` da variação. A adoção em lote (CP-7, 05/10) é da Precificação, não daqui.
- **A tela:** o botão "Adotar preço sugerido" da Simulação recarrega a composição e o produto. Hoje a tela só grava no mock, e o cadastro não muda.
- **Substitui:** `product-assembly.ts › updateAssembly` (`values.unitPrice` vindo do AssemblyEditor) e `setVariationPrice` (no adotar); `compositions.ts › applySuggestedPrice` (sem chamador).

#### Composição do produto: etapas e fluxo

A etapa é do produto (IP-29). Ela pode ser montada ali mesmo (`OWN`), preenchida por um processo cadastrado (`PROCESS`, FL-6, CP-21) ou ser outro produto (`PART`, IP-9). O fluxo é a dependência (FL-1 a FL-5); a lista de etapas é a porta de entrada (decisão de 05/10).

##### POST /product/:id/assembly/block

Acrescenta uma etapa: a primeira, a "nova etapa depois de…", a inserida no meio de uma ligação ou um novo caminho.

- **Corpo:**
```json
{ "variationId": null, "type": "PROCESS", "processId": "…", "dependsOn": ["<blockId>"], "insertBefore": "<blockId>" }
```
  Com `type: "OWN"`, mandar `name` e `sectorId`. Com `type: "PART"`, mandar `partProductId`.
- **Resposta:** `{ "id": "<blockId>" }`
- **Permissão:** [editar] + `cost_base` + `product_composition`.
- **O servidor valida:**
  - "Processo não encontrado" (inexistente ou inativo, PAD-7);
  - "Informe o nome da etapa" (`OWN`); o setor precisa estar ativo;
  - "Parte sem composição" (`PART`);
  - "Um produto não pode ser parte dele mesmo", também por dentro de outra parte (IP-9);
  - a parte inativa não entra (PAD-7);
  - `dependsOn` e `insertBefore` precisam ser etapas desta composição.
- **O servidor calcula:** a etapa com dependência nasce com as regras de acabamento, e a base é a primeira dependência (FL-2, MS-5). Começando caminho, nasce com medida e quantidade próprias. O `afterBase: OWN` do processo mantém medida própria mesmo depois de outra etapa (03/10). Com `insertBefore`, a etapa seguinte passa a depender da nova (FL-5). Na etapa `PROCESS`, as linhas são lidas do processo (vínculo, CP-21), e os campos e fórmulas que elas leem são criados no produto pelo nome (IP-4, IP-2).
- **A tela:** a etapa nova abre selecionada; o editor recarrega a composição.
- **Substitui:** `product-assembly.ts › addAssemblyBlock`, `addOwnBlock`, `addPartBlock` (do AssemblyEditor; o QuotationComposeModal vai para o módulo 2 (Orçamento)); `compositions.ts › addCompositionStep` (sem chamador).

##### PATCH /product/:id/assembly/block/:blockId

Ajusta a etapa neste produto: nome, tipo de tarefa, regras de venda, ligações (FL-5) ou o processo que a preenche (FL-6).

- **Corpo:** `{ "name": "Acabamento", "taskType": "Acabamento", "rules": { "quantityMode": "HIDDEN_ONE", "followsBase": true, "dimension": "SAME_AS_PARENT", "descriptionEditable": false }, "dependsOn": ["<b1>", "<b2>"], "processId": "…" }` (todos opcionais). `rules: null` volta às regras do processo.
- **Resposta:** `{ "id": "<blockId>" }`
- **Permissão:** [editar] + `cost_base` + `product_composition`.
- **O servidor valida:**
  - "Etapa não encontrada";
  - "Informe o nome da etapa";
  - "A etapa não pode depender dela mesma";
  - laço: "<etapa> já vem depois de <etapa>: ligar as duas fecharia um laço";
  - "Processo não encontrado" (o processo novo precisa estar ativo).
- **O servidor calcula:**
  - Na etapa de processo, o nome, o tipo de tarefa e as regras ficam como ajuste local (`localName`, `localTaskType`, `localRules`) só quando diferem do processo, e a etapa passa a vir com `rulesOverridden` (IP-18, IP-23, IP-30). Na etapa própria, gravam direto.
  - `dependsOn` substitui a lista. A base fica a mesma se continuar na lista; senão, vira o primeiro item.
  - Trocar `processId` mantém o id, as ligações e a base; as linhas passam a ser as do processo novo.
- **A tela:** o título editável, o seletor de tarefa, os seletores de quantidade, base e medida, e o menu da caixa do fluxo ("ligar a…", "desligar de", "trocar o processo").
- **Substitui:** `product-assembly.ts › setBlockLocalRules`, `linkBlock`, `unlinkBlock`, `replaceBlockProcess` (do AssemblyEditor); `compositions.ts › updateCompositionStep` (sem chamador).

##### DELETE /product/:id/assembly/block/:blockId

Remove a etapa sem deixar o fluxo solto (FL-12).

- **Resposta:** 204.
- **Permissão:** [editar] (remover etapa de dentro do produto é `:edit`).
- **O servidor valida:** "Etapa não encontrada".
- **O servidor calcula:** quem dependia da etapa herda as dependências dela, e a base passa para a base da removida.
- **A tela:** o menu "remover" da etapa; recarrega.
- **Substitui:** `product-assembly.ts › removeAssemblyBlock`; `compositions.ts › removeCompositionStep` (sem chamador).

##### POST /product/:id/assembly/block/:blockId/restore-process-lines

Traz de volta as linhas do processo que foram removidas neste produto (CP-21).

- **Corpo:** `{}`
- **Resposta:** `{ "id": "<blockId>", "restored": 2 }`
- **Permissão:** [editar].
- **O servidor valida:** "Etapa não encontrada" (também quando a etapa não tem processo).
- **A tela:** o link "restaurar as linhas do processo" da etapa; recarrega.
- **Substitui:** `product-assembly.ts › restoreProcessLines`.

##### GET /product/:id/assembly/next-step

Os processos para "Nova etapa depois de…" e "trocar o processo": os usuais primeiro (FL-7), depois todos.

- **Query:** `blockId` (vazio na primeira etapa ou em novo caminho), `variationId`.
- **Resposta:** `{ "usual": [ { "id": "…", "name": "Acabamento de banner", "sectorId": "…", "sector": "Produção", "afterBase": "INHERIT", "sellerInstructions": null } ], "all": [ … ] }`
- **Permissão:** [ver] + `cost_base`.
- **O servidor calcula:** `all` = os processos ativos, por setor e nome. `usual` = os pares FL-7 que saem do processo da etapa; fica vazio sem etapa ou em etapa sem processo. Sem nenhuma marcação, a tela mostra `all`.
- **A tela:** os diálogos "Nova etapa" e "Trocar processo", com o "ver todos".
- **Substitui:** `product-assembly.ts › getNextStepCandidates` (do AssemblyEditor).

##### GET /product/:id/assembly/part-candidate

Os produtos que podem entrar como parte (IP-9).

- **Query:** `search`, `page`, `limit` (máx. 100).
- **Resposta:** `{ "data": [ { "productId": "…", "name": "Quadro de metalon", "code": "PRT-01", "status": "PART", "stages": 3 } ], "page": 1, "lastPage": 1, "total": 4 }`
- **Permissão:** [ver] + `cost_base`.
- **O servidor calcula:** os produtos ativos, com etapas, que não são o próprio produto e não o contêm. Os de `status: PART` vêm primeiro.
- **A tela:** o diálogo "Parte".
- **Substitui:** `product-assembly.ts › getPartCandidates` (do AssemblyEditor); `compositions.ts › getAvailableParts` (sem chamador).

Sem endpoint (sem chamador): `moveAssemblyBlock` (a ordem é a dependência, FL-5), `getFlow` (o fluxo já vem em `blocks[].dependsOn` e `partFlow`), `compositions.ts › moveCompositionStep`.

#### Composição do produto: linhas e opções

A linha é um recurso único, uma escolha de um ou uma lista para o vendedor (IP-21, IP-8). Ela pode ser opcional (IP-28). Na mão de obra, tem pessoas (IP-13). A opção guarda só a referência ao recurso (CP-21).

##### POST /product/:id/assembly/block/:blockId/line

Acrescenta uma linha à etapa (IP-31).

- **Corpo:**
```json
{ "variationId": null, "name": "Papel", "kind": "MATERIAL", "mode": "CHOOSE", "resourceIds": ["material:couche-150", "material:couche-300"],
  "perUnit": 1, "formula": "SHEET_YIELD", "lossPercent": 5, "minimum": null, "optional": false, "optionalDefault": true,
  "fieldName": null, "fieldDefault": null, "formulaId": null, "people": null }
```
- **Resposta:** `{ "id": "<lineId>" }`
- **Permissão:** [editar] + `cost_base` + `product_composition`.
- **O servidor valida:**
  - "Etapa não encontrada";
  - "Informe o nome da linha";
  - "Escolha a fórmula do produto" (`CUSTOM` sem `formulaId` válido);
  - "Escolha ao menos um recurso" (IP-37);
  - "Recurso único leva um recurso só";
  - "As opções de uma escolha precisam ter a mesma unidade" (IP-39);
  - "Recurso não encontrado";
  - na etapa de setor que vende por equipamento, não aceita `LABOR` (AB-19);
  - `people` só em `LABOR`, inteiro ≥ 1.
- **O servidor calcula:** em `LIST`, a linha nasce sem escolhida, com fórmula `SELLER`, sem perda e sem mínimo (IP-8). Nos outros modos, a primeira opção é a escolhida. Na etapa de processo, a linha fica `addedHere`. Com `fieldName`, cria o campo do produto (se ainda não existe) com `fieldDefault` (IP-4).
- **A tela:** os diálogos "Acrescentar material", máquina, mão de obra e terceirizado; recarrega.
- **Substitui:** `product-assembly.ts › addAssemblyLine` (do AssemblyEditor).

##### PATCH /product/:id/assembly/block/:blockId/line/:lineId

Ajusta a linha neste produto (IP-22): a opção escolhida, o consumo, a fórmula, a perda e o mínimo, por linha e por opção (IP-26), o opcional, a folha (AP-3, AP-4) e as pessoas.

- **Corpo:**
```json
{ "variationId": null, "selectedId": "<optionId>", "perUnit": 1.2, "formula": "PER_AREA", "lossPercent": 30, "minimum": 0.5, "optional": true, "optionalDefault": false,
  "sheetMargin": 5, "sheetGap": 3, "chargeWholeSheets": true, "fieldName": "Nº de letras", "fieldDefault": 10, "formulaId": null, "people": 2,
  "optionValues": [ { "id": "<optionId>", "perUnit": 1.0, "lossPercent": null, "minimum": 0.5 } ] }
```
  Todos os campos são opcionais. `sheetMargin` e `sheetGap` vão em mm. Em `optionValues`, `null` volta ao valor da linha.
- **Resposta:** `{ "id": "<lineId>", "overridden": true }`
- **Permissão:** [editar] + `cost_base` + `product_composition`.
- **O servidor valida:** "Linha não encontrada"; "Escolha a fórmula do produto"; `selectedId` precisa ser opção da linha; `people` só em `LABOR`.
- **O servidor calcula:** fórmula diferente de `CUSTOM` zera o `formulaId`. Na etapa de processo, a linha passa a "alterado neste produto" (`overridden`), **exceto** quando só o `selectedId` mudou, porque trocar a opção é uso normal.
- **A tela:** o diálogo "Ajustar" da linha e a tabela "Por opção"; recarrega e mostra a marca "alterado neste produto".
- **Substitui:** `product-assembly.ts › updateAssemblyLine` (do AssemblyEditor).

##### POST /product/:id/assembly/block/:blockId/line/:lineId/reset

"Voltar a acompanhar o processo": desfaz o ajuste local da linha (CP-21).

- **Corpo:** `{ "variationId": null }`
- **Resposta:** `{ "id": "<lineId>", "overridden": false }`
- **Permissão:** [editar].
- **O servidor valida:** "Linha não encontrada" (também quando a linha não veio do processo).
- **A tela:** o link na linha marcada; recarrega.
- **Substitui:** `product-assembly.ts › resetAssemblyLine`.

##### DELETE /product/:id/assembly/block/:blockId/line/:lineId

Remove a linha da etapa.

- **Query:** `variationId`.
- **Resposta:** 204.
- **Permissão:** [editar] (é linha de dentro do produto: `:edit`).
- **O servidor valida:** "Etapa não encontrada"; "Linha não encontrada".
- **O servidor calcula:** a linha que veio do processo entra em `removedSourceLineIds` para não voltar quando o processo mudar (CP-21).
- **A tela:** o ícone de remover da linha; recarrega.
- **Substitui:** `product-assembly.ts › removeAssemblyLine` (do AssemblyEditor).

##### POST /product/:id/assembly/block/:blockId/line/:lineId/option

Acrescenta uma opção a uma linha de escolha ou de lista. O mesmo recurso pode entrar de novo com outra configuração (IP-27).

- **Corpo:** `{ "variationId": null, "resourceId": "material:pvc-3mm", "configName": "Refile PVC", "perUnit": 1.2 }`
- **Resposta:** `{ "id": "<optionId>" }`
- **Permissão:** [editar] + `cost_base` + `product_composition`.
- **O servidor valida:**
  - "Linha não encontrada";
  - "Recurso único não tem opções";
  - "Recurso não encontrado";
  - "As opções desta linha são em <unidade>" (IP-39);
  - "Este recurso já está na linha: dê um nome à configuração";
  - "Já existe uma configuração com esse nome".
- **O servidor calcula:** a linha de escolha sem escolhida passa a escolher esta opção. Na etapa de processo, a linha fica `overridden`.
- **A tela:** o diálogo "Opções da linha"; recarrega.
- **Substitui:** `product-assembly.ts › addLineOption` (do AssemblyEditor).

##### DELETE /product/:id/assembly/block/:blockId/line/:lineId/option/:optionId

Remove uma opção da linha.

- **Query:** `variationId`.
- **Resposta:** 204.
- **Permissão:** [editar].
- **O servidor valida:** "Linha não encontrada"; "A linha precisa de ao menos um recurso; remova a linha" (IP-37).
- **O servidor calcula:** se a opção removida era a escolhida, a primeira restante passa a ser. Na etapa de processo, a linha fica `overridden`.
- **A tela:** o diálogo "Opções da linha"; recarrega.
- **Substitui:** `product-assembly.ts › removeLineOption` (do AssemblyEditor).

#### Composição do produto: campos do orçamento e fórmulas

Os campos são declarados uma vez no produto, e cada linha lê o campo pelo nome (IP-4, IP-6). O campo diz se aceita fração (IP-19). As fórmulas também são do produto (IP-2, 03/10): leem as medidas, a quantidade, o tempo, os campos e as referências do material de outra linha. As do processo vêm junto e acompanham o processo.

##### POST /product/:id/assembly/field

Cria um campo do orçamento no produto.

- **Corpo:** `{ "variationId": null, "name": "Nº de letras", "defaultValue": 10, "allowsFraction": false }`
- **Resposta:** `{ "id": "…", "name": "Nº de letras", "defaultValue": 10, "allowsFraction": false, "usedBy": [] }`
- **Permissão:** [editar] + `cost_base` + `product_composition`.
- **O servidor valida:** "Informe o nome do campo"; "Já existe um campo com esse nome neste produto" (sem acento e sem maiúscula); "<nome> é um número inteiro. Ligue "Aceita fração" se o campo puder ter decimais" (IP-19).
- **A tela:** o card "Campos do orçamento" (ProductFields); recarrega a composição.
- **Substitui:** `product-assembly.ts › addProductField` (no produto); `compositions.ts › addProductField` (sem chamador).

##### PATCH /product/:id/assembly/field/:fieldId

Altera o nome, o valor padrão ou a fração do campo.

- **Corpo:** `{ "variationId": null, "name": "Nº de letras", "defaultValue": 12, "allowsFraction": false }` (todos opcionais).
- **Resposta:** o campo alterado.
- **Permissão:** [editar].
- **O servidor valida:** "Campo não encontrado"; "Informe o nome do campo"; "Já existe um campo com esse nome neste produto"; a regra do inteiro (IP-19).
- **O servidor calcula:** desligar a fração arredonda o padrão. Renomear renomeia nas linhas que leem o campo.
- **A tela:** o card de campos; recarrega.
- **Substitui:** `product-assembly.ts › updateProductField` (no produto); `compositions.ts › updateProductField` (sem chamador).

##### DELETE /product/:id/assembly/field/:fieldId

Remove um campo que nenhuma linha lê.

- **Query:** `variationId`.
- **Resposta:** 204.
- **Permissão:** [editar].
- **O servidor valida:** "Campo não encontrado"; em uso: "Este campo é lido em <etapas>. Troque o campo nessas linhas antes de removê-lo". O uso conta tanto a linha com `fieldName` quanto a fórmula que cita o campo.
- **A tela:** o card de campos; recarrega.
- **Substitui:** `product-assembly.ts › removeProductField` (no produto); `compositions.ts › removeProductField` (sem chamador).

##### POST /product/:id/assembly/formula

Cria uma fórmula do produto (IP-2).

- **Corpo:** `{ "variationId": null, "name": "Travessas", "expression": "(largura - montante · X * 2) * 2" }`
- **Resposta:** `{ "id": "…", "name": "Travessas", "expression": "…", "processId": null, "usedBy": [], "error": null }`
- **Permissão:** [editar] + `cost_base` + `product_composition`.
- **O servidor valida:** "Dê um nome à fórmula"; o erro do parser ("Escreva a fórmula.", "Sobrou "x" no fim da fórmula.", "A conta não deu um número."); "Já existe uma fórmula com esse nome neste produto". O teste é feito na medida padrão, com os campos e as referências de material.
- **A tela:** "Nova fórmula…" no tipo de cálculo da linha e o card "Fórmulas do produto". O teste ao vivo do diálogo pode continuar no front, com o mesmo parser (é a conta que a própria pessoa está escrevendo), e o servidor revalida ao salvar.
- **Substitui:** `product-assembly.ts › addProductFormula` (no produto).

##### PATCH /product/:id/assembly/formula/:formulaId

Altera o nome ou a expressão da fórmula.

- **Corpo:** `{ "variationId": null, "name": "Travessas", "expression": "…" }` (opcionais).
- **Resposta:** a fórmula alterada.
- **Permissão:** [editar].
- **O servidor valida:** "Fórmula não encontrada"; "Dê um nome à fórmula"; o erro do parser. A fórmula que veio do processo (`processId` preenchido) só se altera no processo.
- **A tela:** o card de fórmulas; recarrega.
- **Substitui:** `product-assembly.ts › updateProductFormula` (no produto).

##### DELETE /product/:id/assembly/formula/:formulaId

Remove uma fórmula que nenhuma linha usa.

- **Query:** `variationId`.
- **Resposta:** 204.
- **Permissão:** [editar].
- **O servidor valida:** em uso: "Esta fórmula é usada em <etapas>. Troque o tipo de cálculo nessas linhas antes de removê-la".
- **A tela:** o card de fórmulas; recarrega.
- **Substitui:** `product-assembly.ts › removeProductFormula` (no produto).

#### Variações do produto

**Proposta de modelo único (a revisar).** Hoje convivem dois modelos:

- (A) `variations` com exceções por linha (PV-2): é o que serve à variação simples do START (PV-6) e ao card oculto da composição;
- (B) `variants` como cópias independentes (03/10): são as abas visíveis da composição.

A proposta é ter **uma só entidade** `ProductVariation { id, name, unitPrice | null, priceTiers | null, hasOwnAssembly }`, do produto:

- **No START** ela tem só nome e preço (PV-6); sem preço, vale o do produto.
- **No PRO** a mesma variação pode ganhar **composição própria**, que nasce como cópia da padrão (ou de outra variação) e depois é independente (03/10). Sem composição própria, a variação usa a composição padrão e muda só o preço (é a "tabelação de valores" de 30/09).
- O item do orçamento guarda o `variationId` (PV-3, PV-5).
- As exceções por linha e as etapas só da variação (PV-2, PV-7: `overrides`, `extraBlocks`) **não vão para a API**: foram substituídas em 03/10, e as actions delas só têm chamador no trecho oculto da tela (`SHOW_SECOND_PART = false`).
- A aba da variação no editor deixa de usar o id técnico `<produto>::v:<id>` e passa `variationId` às rotas da composição.

##### GET /product/:id/variation

Lista as variações do produto.

- **Resposta:** `{ "data": [ { "id": "…", "name": "Econômico · lona 380", "unitPrice": 3900, "hasOwnAssembly": true, "hasOwnTiers": false } ] }`
- **Permissão:** `product_settings:products:view`; no orçamento, `sale:quotation:edit`. O `unitPrice` sai para quem vê o preço de venda do produto (o mesmo critério do `/product`).
- **A tela:** o bloco Variações do diálogo do produto (ProductVariations), as abas da composição e a escolha da variação no modal do item do orçamento.
- **Substitui:** `product-assembly.ts › getProductVariations`, `getProductVariants`.

##### PUT /product/:id/variation

Substitui a lista de variações simples (PV-6, START): nome e preço.

- **Corpo:** `{ "variations": [ { "id": "…", "name": "M", "unitPrice": 5200 }, { "name": "GG", "unitPrice": null } ] }`
- **Resposta:** a lista gravada, no formato do `GET`.
- **Permissão:** `product_settings:products:edit`.
- **O servidor valida:** "Dê um nome para cada variação"; "Duas variações com o mesmo nome" (sem maiúscula). Só para produto de uma unidade de venda: kit não tem variação (05/10).
- **O servidor calcula:** as variações que vêm com `id` mantêm a composição própria e as faixas. As que ficam fora da lista são removidas, junto com a composição delas.
- **A tela:** o Salvar do bloco Variações.
- **Substitui:** `product-assembly.ts › saveProductVariations`.

##### POST /product/:id/variation

Cria uma variação com composição própria, como cópia do que está na tela (PRO, decisão de 03/10).

- **Corpo:** `{ "name": "G", "copyFrom": null }` (`copyFrom` = o `variationId` de origem; `null` copia a padrão).
- **Resposta:** `{ "id": "…", "name": "G", "unitPrice": null, "hasOwnAssembly": true }`
- **Permissão:** [editar] + `cost_base` + `product_composition`.
- **O servidor valida:** "Dê um nome à variação (P, M, G…)"; "Já existe uma variação com esse nome".
- **O servidor calcula:** copia tudo da origem (etapas, linhas, campos, fórmulas, faixas, situação) com ids novos. Depois de criadas, as duas são independentes.
- **A tela:** o diálogo "Variação" ao lado da Situação abre a aba nova.
- **Substitui:** `product-assembly.ts › createProductVariant`; `compositions.ts › addProductVariation` (sem chamador).

##### PATCH /product/:id/variation/:variationId

Renomeia a variação ou muda o preço dela (PV-4).

- **Corpo:** `{ "name": "GG", "unitPrice": 5600 }` (opcionais; `unitPrice: null` volta ao preço do produto).
- **Resposta:** a variação alterada.
- **Permissão:** `product_settings:products:edit` (preço também com `values:values:view`).
- **O servidor valida:** "Variação não encontrada"; "Dê um nome à variação"; "Já existe uma variação com esse nome".
- **A tela:** renomear pela aba ativa.
- **Substitui:** `product-assembly.ts › renameProductVariant`; `compositions.ts › setVariationPrice` (sem chamador).

##### DELETE /product/:id/variation/:variationId

Remove a variação e a composição própria dela.

- **Resposta:** 204.
- **Permissão:** `product_settings:products:edit`.
- **O servidor valida:** "Variação não encontrada". O item de orçamento que já vendeu a variação guarda o retrato (ORC-10) e não muda.
- **A tela:** o remover da aba, com confirmação.
- **Substitui:** `product-assembly.ts › removeProductVariant`; `compositions.ts › removeProductVariation` (sem chamador).

A variação escolhida no item do orçamento vai em `add-product` e `update-product` (campo `variationId`; o preço do item passa a ser o da variação) e está no módulo 2 (Orçamento).

Sem endpoint (modelo de exceções substituído em 03/10, chamador só no trecho oculto `SHOW_SECOND_PART`): `addVariation`, `removeVariation`, `setVariationPrice` (fora do adotar), `setVariationLine`, `clearVariationLine`, `addVariationBlock`, `removeVariationBlock`; `compositions.ts › setVariationOverride`, `clearVariationOverride`.

#### Faixas de preço por quantidade

É tabela de preço, não desconto (FQ-1). A faixa vale para o total da venda (FQ-2). O produto tem uma tabela, e a variação pode ter a sua (FQ-4). Os valores vão em centavos por unidade comercial, sem arredondar para reais (cartão: 35 = R$ 0,35).

##### GET /product/:id/price-tier

Lê a tabela do produto ou de uma variação.

- **Query:** `variationId`.
- **Resposta:** `{ "inherited": false, "tiers": [ { "from": 1, "unitPrice": 35 }, { "from": 101, "unitPrice": 28 } ] }`
- **Permissão:** `product_settings:products:view` ou `sale:quotation:edit`; `cost:pricing:view` na Precificação. Plano `product_composition`.
- **A tela:** a seção "Preço por quantidade" do modal de precificação e a faixa aplicada no modal do item do orçamento.
- **Substitui:** `product-assembly.ts › getPriceTiers`.

##### PUT /product/:id/price-tier

Grava a tabela inteira do produto ou de uma variação.

- **Corpo:** `{ "variationId": null, "inherit": false, "tiers": [ { "from": 1, "unitPrice": 35 }, { "from": 101, "unitPrice": 28 } ] }`
- **Resposta:** a tabela gravada, como no `GET`.
- **Permissão:** `product_settings:products:edit` + `values:values:view` (na Precificação, também `cost:pricing:edit`). Plano `product_composition`.
- **O servidor valida:** "Variação não encontrada"; "Duas faixas começam na mesma quantidade"; `from ≥ 1` e `unitPrice ≥ 0`.
- **O servidor calcula:** ordena por `from`. Com `inherit: true`, apaga a tabela da variação, que volta à do produto.
- **A tela:** cada ação na seção de faixas grava e recarrega.
- **Substitui:** `product-assembly.ts › setPriceTiers`.

#### Produto: lista, uso, duplicar e biblioteca

##### GET /product (muda)

Filtro e marca de composição (CP-17), e a lista "para venda" do orçamento (IP-14).

- **Query nova:** `hasComposition` (`true` · `false`); `forSale=true` deixa de fora o inativo, o `DRAFT` e o `PART`.
- **Resposta (campos novos no item da lista):** `{ "hasComposition": true, "compositionStatus": "RELEASED", "hasVariations": true }`
- **Permissão:** a de hoje; o filtro `hasComposition` só com `cost_base`.
- **A tela:** o filtro "Composição" (Todos · Com · Sem) e a marca "Com composição" na lista de produtos, valendo para todas as páginas e não só a exibida. O modal "Qual item deseja adicionar?" passa `forSale=true`.
- **Substitui:** `product-assembly.ts › getComposedProductIds`.

##### GET /product/:id/usage

Onde o produto é usado, para o diálogo de inativar (PAD-7).

- **Resposta:** `{ "asPart": [ { "productId": "…", "name": "Placa em lona com quadro de ferro", "stage": "Quadro de metalon" } ], "openQuotations": [ { "quotationId": "…", "reference": "ORC-2026-0184", "client": "Supermercado Bom Preço", "itemId": "9c1e…", "itemName": "Lona com bainha e ilhós" } ] }`
- **Permissão:** `product_settings:products:edit`.
- **O servidor calcula:** as etapas-parte que apontam para o produto em qualquer composição (padrão e variações). `openQuotations` lista os orçamentos em digitação, aguardando ou vencidos (`OPEN`, `DONE`, `OVERDUE`) que têm o produto como item ou como parte de linha `PART`: é a mesma regra do bloqueio de aprovação do módulo 2 (Orçamento).
- **A tela:** o `InactivateProductDialog` lista as partes e os orçamentos afetados e depois chama o `PATCH /product/:id/toggle-status` que já existe. Inativo, o produto vem como `partInactive` nas etapas e não aparece em `part-candidate`. O espelho `setProductActive` sai.
- **Substitui:** `product-assembly.ts › getProductUsage`, `setProductActive` (o servidor lê o `isActive` do cadastro).

##### POST /product/:id/duplicate

Duplica o produto com o cadastro e a composição (etapas, campos, fórmulas, variações e faixas) num passo só (03/10).

- **Corpo:** `{ "name": "Banner 440 com bastão (cópia)" }`
- **Resposta:** o produto criado, no formato de `GET /product/:id`.
- **Permissão:** `product_settings:products:create`. A composição só é copiada com `cost_base`; sem a feature, sai só o cadastro.
- **O servidor valida:** "Produto não encontrado".
- **O servidor calcula:** ids novos, com `dependsOn`, base e `formulaId` remapeados. A etapa de processo continua ligada ao mesmo processo (CP-21). A cópia nasce `DRAFT` (IP-14).
- **A tela:** o botão Duplicar da lista abre o produto novo. Hoje são três chamadas (`GET /product/:id`, `POST /product`, `copyCompositionFrom`), e o erro "não tem composição" é ignorado.
- **Substitui:** `product-assembly.ts › copyCompositionFrom`.

##### GET /product/assembly-library

As composições de referência da biblioteca (IP-7).

- **Query:** `search`, `segment`, `page`, `limit` (máx. 100).
- **Resposta:** `{ "data": [ { "id": "…", "name": "Banner com bastão e cordão", "segment": "Comunicação visual", "description": "…", "stages": [ { "name": "Impressão solvente", "sector": "Impressão", "role": "BASE" } ], "resources": 6 } ], "page": 1, "lastPage": 1, "total": 6 }`
- **Permissão:** `product_settings:products:create` + `cost_base`.
- **A tela:** o botão Biblioteca da lista de produtos abre o "Novo produto" com nome e descritivo preenchidos.
- **Substitui:** `product-assembly.ts › getLibrary`.

##### POST /product/:id/assembly/import-library

Copia uma composição da biblioteca para o produto recém-criado. A biblioteca não muda.

- **Corpo:** `{ "libraryId": "…" }`
- **Resposta:** `{ "productId": "…", "blocks": 2, "unmatchedResources": [ { "name": "Madeira de banner", "unit": "m" } ] }`
- **Permissão:** `product_settings:products:create` + `cost_base` + `product_composition`.
- **O servidor valida:** "Composição não encontrada na biblioteca".
- **O servidor calcula:** cria as etapas em sequência, cada uma dependendo da anterior (FL-1), depois das que já existirem. A composição nasce `DRAFT`. Os materiais da biblioteca são conciliados com o cadastro da empresa (área 4); o que não casa volta em `unmatchedResources`, para a tela pedir a escolha.
- **A tela:** no `onSuccess` do `POST /product`, abre o produto na aba Composição e avisa o que ficou sem material.
- **Substitui:** `product-assembly.ts › importFromLibrary`.

#### Materiais nas composições

O diálogo de inativar o material lê onde ele é usado em `GET /material/:id/usage`, e a inativação tira o material das composições na mesma transação: os dois estão no módulo 1, parte B (Materiais).

#### O produto na venda: formulário do vendedor e relatório da composição

Na venda, o vendedor vê só o que pode mudar (IP-36, IP-6, FL-8). A composição completa fica num relatório de consulta, **sem custo nem preço de recurso** (ORC-7, SEG-6). Estas duas rotas nunca devolvem custo, nem preço por linha ou por recurso, qualquer que seja a permissão. A única exceção é o `sale` por etapa do relatório, usado para ratear o valor do item na proposta.

##### GET /product/:id/sale-form

O formulário "Escolhas do produto" do item do orçamento.

- **Query:** `variationId`.
- **Resposta:** `null` quando o produto não tem composição. Exemplo:
```json
{ "stages": [ { "blockId": "…", "name": "Impressão solvente", "sector": "Impressão" } ],
  "extras": [ { "fieldId": "…", "name": "Distância entre ilhoses (m)", "kind": "DECIMAL", "defaultValue": 0.5 } ],
  "times": [ { "blockId": "…", "name": "Tempo · Criação da arte", "defaultMinutes": 60 } ],
  "choices": [ { "blockId": "…", "lineId": "…", "name": "Material", "stage": "Impressão solvente", "defaultId": "…", "options": [ { "id": "…", "name": "Lona 440 g" } ] } ],
  "optionals": [ { "blockId": "…", "lineId": "…", "name": "Cordão", "stage": "Acabamento de banner", "defaultIncluded": true } ],
  "lists": [ { "blockId": "…", "lineId": "…", "name": "Material de fixação", "stage": "Instalação", "options": [ { "id": "…", "name": "Parafuso com bucha", "unit": "un" } ] } ],
  "instructions": [ { "blockId": "…", "stage": "Criação da arte", "text": "Pergunte se o cliente leva a arte pronta." } ],
  "requiresMeasure": false }
```
- **Permissão:** `sale:quotation:view` ou `sale:quotation:edit`, mais `product_composition`. **Não** exige a permissão da composição: é a vista do vendedor.
- **O servidor valida:** "Produto não encontrado"; produto inativo, `DRAFT` ou `PART` não é vendável (IP-14, PAD-7).
- **O servidor calcula:**
  - `extras` são os campos lidos por alguma linha (`INTEGER`, ou `DECIMAL` com fração, IP-19);
  - `times` são as linhas de tempo informado (IP-32, IP-33);
  - `choices`, `optionals` e `lists` vêm das linhas `CHOOSE`, das opcionais e das `LIST` (IP-21, IP-28, IP-8). A linha sem opção não sai (IP-37);
  - `instructions` vêm dos processos (CP-13);
  - `requiresMeasure` vale quando o produto não tem medida padrão (IP-15/IP-16, 30/09).
- **A tela:** o `SaleCompositionFields` (no `QuotationProdDetailModal` e no `ItemForm`) e as instruções no `AddToItem`.
- **Substitui:** `product-assembly.ts › getSaleForm`.

##### POST /product/:id/sale-composition

O relatório da composição daquela venda, com as escolhas do vendedor. É uma leitura, com corpo, e não grava nada.

- **Corpo:**
```json
{ "variationId": null, "measure": { "quantity": 2, "width": 900, "height": 1200 },
  "extras": [ { "fieldId": "…", "value": 0.5 } ], "times": [ { "blockId": "…", "minutes": 90 } ],
  "choices": [ { "blockId": "…", "lineId": "…", "optionId": "…" } ], "optionals": [ { "blockId": "…", "lineId": "…", "included": false } ],
  "lists": [ { "blockId": "…", "lineId": "…", "optionId": "…", "quantity": 8 } ], "notes": [ { "blockId": "…", "text": "Cordão branco" } ] }
```
- **Resposta:**
```json
{ "name": "Banner 440 com bastão", "technicalDescription": "…", "measure": { "quantity": 2, "width": 900, "height": 1200 }, "variation": "Econômico · lona 380",
  "blocks": [ { "id": "…", "name": "Acabamento de banner", "sector": "Produção", "taskType": "Produção", "role": "FINISHING", "baseName": "Impressão solvente",
    "measure": { "quantity": 2, "width": 900, "height": 1200 }, "extra": "tempo 1h00 · Distância entre ilhoses (m): 0,5", "note": "Cordão branco", "setupMinutes": 10, "sale": 2350,
    "lines": [ { "id": "…", "name": "Madeira", "kind": "MATERIAL", "resource": "Madeira de banner", "quantity": 3.96, "unit": "m", "entries": null },
               { "id": "…", "name": "Material de fixação", "kind": "MATERIAL", "resource": null, "quantity": null, "unit": "un", "entries": [ { "name": "Parafuso com bucha", "unit": "un", "quantity": 8 } ] } ] } ] }
```
- **Permissão:** `sale:quotation:view` + `product_composition`.
- **O servidor valida:**
  - "Este produto não tem composição";
  - os ids de etapa, linha e opção são deste produto ou variação;
  - campo inteiro recusa decimal: "Só número inteiro" (IP-19);
  - sem medida padrão, a medida é obrigatória.
- **O servidor calcula:**
  - aplica as escolhas numa cópia, só para esta venda, e roda o motor;
  - tira as linhas vazias e as opcionais desmarcadas;
  - junta as linhas da parte e soma o preparo dela (GP-16);
  - `sale` por etapa é a venda sugerida da etapa, que a proposta "detalhado com valores" usa como peso para repartir o valor do item entre as etapas (IP-12). É o único valor do relatório: não vai custo nem preço por linha.
- **A tela:** o `CompositionReport` (a lupa "Composição de…") e o `ProposalPrint`. No servidor, a criação do projeto na produção (`tasksFromComposition`, PCP-4) usa o mesmo cálculo, e o retrato que o item grava com custo (ORC-10) é do módulo 2 (Orçamento).
- **Substitui:** `product-assembly.ts › getSaleComposition` (as telas passam `variationId` no lugar de `variationName`).

Itens montados no orçamento (`createDraftAssembly`, `updateDraftAssembly`, `getComposedItemView`, `resolveComposedItem`, `saveDraftAsProduct`, ORC-11): endpoints do módulo 2 (Orçamento).

### Parte B — Materiais

**Ordem dentro do módulo.** Primeiro `GET /material` com `POST` e `PATCH /material/:id`: destravam o cadastro, a conciliação da entrada de nota (`MatchItemModal`), a busca de venda direta do orçamento (ORG-1, base do `add-material`) e os recursos de material da composição. Depois as variações (`POST`/`PATCH /material/:id/variation`) e o preço (`PATCH /material/:id/price`), que fecham MT-3/MT-4 e a aba Materiais da Precificação. Em seguida `GET /material/:id/usage` e `PATCH /material/:id/toggle-status`, que dependem das tabelas da composição já existirem. Por último a importação de lista (`/material/import/preview` e `/material/import`), com a tabela de de-para.

#### Material

Cadastro do insumo do PRO (DIV-5, MT-9: aba Materiais de "Produtos e materiais"). Entidade `material`: `id`, `code` (gerado pelo servidor, `MAT-nn` sequencial por empresa), `name`, `sectorId` (→ `/sector`; é o destino do resultado da venda do material, MT-7), `subcategory` (texto livre; a lista agrupa por setor › subcategoria, decisão de 05/10/2026), `unit` (enum `HR|M2|M|KM|UN|KG|LT`, MT-6; não usa `/unit-of-measure`), `directSale`, `productionMaterial`, `priceRule` (`FIXED|VARIABLE`), `cost` e `price` em centavos (nulos quando há variação, MT-3), `active` e `advanced` (configuração avançada, MT-10.1). `advanced`: `shape` (`PROFILE|SHEET|OTHER`), `x`, `y`, `barLength` (perfil, **mm**), `width`, `height` (chapa, **mm**), `wholeSheets` (cobrar a folha inteira, padrão `true`, AP-4), `weight` (kg **por unidade de venda** do material). A composição lê essas medidas; a conversão mm → m e a montagem do recurso `mat:<materialId>[:<variationId>]` ficam no endpoint de recursos da composição (módulo 1, parte A (composição)), não aqui. Não há `DELETE`: material com histórico é inativado, nunca excluído.

##### GET /material

Lista os materiais da empresa para a tela de materiais, para a conciliação da entrada de nota e para a busca de venda direta do orçamento.

- **Resposta:**
  ```json
  { "data": [
      { "id": "metalon-50x30", "code": "MAT-06", "name": "Metalon 50 × 30", "sectorId": "s-3", "sector": "Serralheria",
        "subcategory": "Perfis", "unit": "M", "directSale": false, "productionMaterial": true, "priceRule": "FIXED",
        "cost": 1850, "price": null, "margin": null, "priceStatus": "PENDING", "variations": [], "active": true,
        "advanced": { "shape": "PROFILE", "x": 50, "y": 30, "barLength": 6000, "width": null, "height": null, "wholeSheets": true, "weight": 1.9 } },
      { "id": "lona-440", "code": "MAT-01", "name": "Lona 440", "unit": "M2", "cost": null, "price": null,
        "variations": [ { "id": "v1", "brand": "Marca X", "color": "Branca", "cost": 1250, "price": 2800, "margin": 55.4, "priceStatus": "PRICED" }, … ], … }
    ], "page": 1, "lastPage": 1, "total": 7 }
  ```
  Query: `page`, `limit` (máx. 100, SEG-2), `search` (nome ou código, sem acento e sem caixa), `active` (`true` padrão | `false`; as abas Ativos/Inativos mandam `active=true|false`), `sectorId`, `directSale`, `productionMaterial`. Ordem: setor, subcategoria, nome (a tela agrupa nessa ordem). `margin` é percentual com uma casa (55.4 = 55,4 %); `priceStatus`: `PRICED|PENDING|BELOW_COST|NO_COST`.
- **Permissão:** `product_settings:products:view` (tela de materiais) **ou** `stock:invoice_entry:view` (entrada de nota) **ou**, só com `directSale=true&active=true`, `sale:quotation:create` / `sale:quotation:edit` (busca do orçamento). Feature `cost_base`; na busca de venda direta, empresa sem `cost_base` recebe `data: []` (não 403), para a busca do orçamento seguir funcionando no START/LITE. `cost`, `margin` e `priceStatus` (no material e nas variações) só com `values:values:view`; **com `directSale=true` o servidor nunca devolve custo** (SEG-6, ORC-7) — só `id`, `code`, `name`, `sector`, `unit`, `price` e `variations[].{id, brand, color, price}`.
- **O servidor valida:** filtra pela empresa da sessão; `limit` acima de 100 vira 100 (SEG-2); inativo não aparece com `active=true` (some das listas de escolha).
- **O servidor calcula:** `margin = (price − cost) ÷ price × 100`, uma casa; `priceStatus`: sem custo → `NO_COST`, sem preço → `PENDING`, preço < custo → `BELOW_COST`, senão `PRICED` (SEG-1; hoje a tela calcula em `Materials.tsx › pricingItemOf`).
- **A tela:** Materiais agrupa por setor e subcategoria e mostra custo/P.V. com `-` quando nulo; a entrada de nota lista os ativos no seletor de vínculo; o orçamento mostra os de venda direta na busca com a etiqueta **Material** e o setor, e o diálogo pede a variação (marca · cor, o front monta o rótulo) e a quantidade — o item nasce pelo `POST /sale/quotation/:id/add-material` do módulo 2 (Orçamento).
- **Substitui:** `materials.ts › getMaterials`, `quotation-composition.ts › getDirectSaleMaterials`.

##### POST /material

Cadastra um material.

- **Corpo:**
  ```json
  { "name": "Metalon 50 × 30", "sectorId": "s-3", "subcategory": "Perfis", "unit": "M", "cost": 1850,
    "directSale": false, "productionMaterial": true,
    "advanced": { "shape": "PROFILE", "x": 50, "y": 30, "barLength": 6000, "width": null, "height": null, "weight": 1.9 } }
  ```
- **Resposta:** o material criado, no formato da listagem, com `id`, `code` (`"MAT-08"`), `priceRule: "FIXED"`, `price: null`, `variations: []`, `active: true`.
- **Permissão:** `product_settings:products:edit`; feature `cost_base`. `cost` só é aceito com `values:values:view` (sem ela, entra nulo).
- **O servidor valida:** nome obrigatório — "Informe o nome do material"; `sectorId` de um setor da empresa; `unit` no enum (MT-6); `advanced.shape` no enum; medidas e peso ≥ 0; `wholeSheets` só tem efeito com `shape: "SHEET"` e vale `true` quando omitido (AP-4); `code` gerado no servidor, único por empresa (o mock gera pelo tamanho da lista e colide).
- **A tela:** toast "Material cadastrado", fecha o modal e recarrega a lista.
- **Substitui:** `materials.ts › createMaterial`.

##### PATCH /material/:id

Edita o cadastro e a configuração avançada (parcial).

- **Corpo:** os campos do `POST`, todos opcionais. Ex.: `{ "name": "Metalon 50 × 30 chapa 18", "directSale": true, "advanced": { "shape": "SHEET", "width": 1220, "height": 2440, "wholeSheets": false, "weight": 4.2 } }`. `advanced` substitui o bloco inteiro.
- **Resposta:** o material atualizado, no formato da listagem.
- **Permissão:** `product_settings:products:edit`; feature `cost_base`; `cost` só com `values:values:view`.
- **O servidor valida:** material da empresa — "Material não encontrado"; nome não vazio — "Informe o nome do material"; **material com variação não recebe `cost`/`price` próprios** — ignorar o campo (o modal de edição manda `cost` sempre) (MT-3); `active`, `code`, `priceRule`, `price` e `variations` não entram por aqui (têm rota própria); mudar `unit` de material já usado em composição é recusado — "Este material já está em composições; a unidade não pode mudar" (as quantidades das linhas estão naquela unidade).
- **A tela:** toast "Material atualizado", fecha o modal, recarrega a lista; a composição relê as medidas do perfil/chapa na próxima abertura.
- **Substitui:** `materials.ts › updateMaterial`.

#### Variações (marca × cor)

Marca e cor são variações; espessura e tamanho são materiais diferentes (MT-2). Entidade `material_variation`: `id`, `materialId`, `brand`, `color`, `cost`, `price` (centavos, nulos = sem definição). Com variação, custo e preço vivem no cruzamento marca × cor e a venda exige escolher a variação (MT-3, MT-4). A composição aponta para a variação (MT-5).

##### POST /material/:id/variation

Cria em lote as combinações marca × cor, todas com o mesmo custo (preenchimento em série, MT-3).

- **Corpo:** `{ "brands": ["Marca X", "Marca Y"], "colors": ["Branca", "Preta"], "cost": 1250, "price": null }`
- **Resposta:** `{ "created": 3, "variations": [ { "id": "v6", "brand": "Marca Y", "color": "Preta", "cost": 1250, "price": null }, … ] }` (só as novas).
- **Permissão:** `product_settings:products:edit`; feature `cost_base`; `cost`/`price` só com `values:values:view`.
- **O servidor valida:** material da empresa — "Material não encontrado"; ao menos uma marca e uma cor, sem texto vazio; combinação já existente é ignorada, sem erro (comparar sem caixa e sem acento); na primeira variação, **zera `cost` e `price` do material** (MT-3) na mesma transação.
- **A tela:** toast "N variações criadas", limpa os campos e recarrega a lista; as combinações aparecem como etiquetas na seção Variações.
- **Substitui:** `materials.ts › createMaterialVariations`.

##### PATCH /material/:id/variation/:variationId

Altera custo e preço de uma combinação (MT-4).

- **Corpo:** `{ "cost": 1420, "price": 3100 }` (cada um opcional; `null` = sem definição).
- **Resposta:** `{ "id": "v3", "brand": "Marca Y", "color": "Branca", "cost": 1420, "price": 3100, "margin": 54.2, "priceStatus": "PRICED" }`
- **Permissão:** `product_settings:products:edit` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** variação do material e da empresa — "Variação não encontrada"; valores inteiros ≥ 0; com `priceRule: "VARIABLE"`, custo novo recalcula o preço pelo lucro guardado (ver `PATCH /material/:id/price`).
- **O servidor calcula:** `margin` e `priceStatus` como na listagem.
- **A tela:** "Custo e preço" (VariationsModal) mostra "Variação atualizada" e recarrega a lista.
- **Substitui:** `materials.ts › updateMaterialVariation`.

#### Preço do material (DC-6, PR-2)

O preço do material se edita no cadastro (botão R$) e na aba Materiais da Precificação, sobre o mesmo dado (DC-6, PR-1). O modal é o mesmo (`EditPriceModal`, PR-2: variável informa o lucro e calcula o preço; fixo informa o preço e calcula o lucro). A lista da aba Materiais da Precificação é do módulo 4 (precificação); a gravação é esta rota.

##### PATCH /material/:id/price

Grava a regra e o preço do material, ou da variação quando houver.

- **Corpo:** `{ "variationId": "v1", "rule": "VARIABLE", "price": 2800, "desiredMargin": 300 }` — `variationId` obrigatório quando o material tem variação e proibido quando não tem; `desiredMargin` (lucro informado no modal, **décimos de ponto**: 300 = 30,0 %, como os parâmetros da Precificação) só com `rule: "VARIABLE"`.
- **Resposta:** o item no formato `PricingItem` da Precificação: `{ "id": "mat:lona-440:v1", "name": "Lona 440 · Marca X Branca", "code": "MAT-01", "sector": "Impressão", "unit": "m²", "cost": 1250, "costUpdatedAt": null, "rule": "VARIABLE", "price": 2800, "margin": 55.4, "status": "PRICED" }`
- **Permissão:** `product_settings:products:edit` (pelo cadastro) **ou** `cost:pricing:edit` (pela Precificação); mais `values:values:view`; feature `cost_base` (pela Precificação, também `pricing_center`).
- **O servidor valida:** material/variação da empresa — "Item não encontrado"; sem custo não há preço — "Este item ainda não tem custo."; `price` inteiro > 0; com `VARIABLE`, o servidor refaz o preço a partir de custo, parâmetros da empresa e `desiredMargin` e recusa diferença acima de 1 centavo do `price` enviado (SEG-1: o modal simula, o servidor revalida); `priceRule` é do material (vale para todas as variações), como no mock.
- **O servidor calcula:** preço variável = custo ÷ (1 − tributação − custo financeiro − comissão − lucro), com os parâmetros da Precificação (PR-4), arredondado ao centavo; `margin` e `status` como na listagem. Com `VARIABLE`, guarda `desiredMargin` e recalcula o preço quando o custo mudar (cadastro, variação, importação, entrada de nota — ORG-19); com `FIXED`, só a margem muda e o item pode cair em `BELOW_COST` (DC-14).
- **A tela:** toast "Preço salvo"; recarrega a lista de materiais e as listas da Precificação (`pricing-items`, `pricing-summary`).
- **Substitui:** `pricing.ts › updateItemPrice` (só `group: "materials"`); hoje chamado pelo `EditPriceModal` em `Materials.tsx` e `VariationsModal.tsx`.

#### Inativar e reativar ("onde é usado")

Inativar tira o material das composições (decisão de 05/10/2026, revista no mesmo dia): ele sai das opções das linhas; se era o escolhido, a linha passa para a próxima opção; se era a única opção, a linha sai da etapa. Orçamentos já feitos não mudam. Reativar não devolve o material às composições.

##### GET /material/:id/usage

Lista os produtos e processos cuja composição usa o material (qualquer variação), com a etapa.

- **Resposta:** `{ "data": [ { "kind": "PRODUCT", "id": "prod-12", "name": "Porta de metalon", "stage": "Serralheria" }, { "kind": "PROCESS", "id": "proc-3", "name": "Estrutura metálica", "stage": "Serralheria" } ] }`
- **Permissão:** `product_settings:products:edit`; feature `cost_base`.
- **O servidor valida:** material da empresa — "Material não encontrado"; conta as composições dos produtos (sem as variantes técnicas do produto) e dos processos.
- **A tela:** o diálogo de inativar mostra "Ele está em N composições e vai sair de todas…" e a lista com a etiqueta Produto/Processo; sem uso, "Ele não está em nenhuma composição".
- **Substitui:** `product-assembly.ts › getMaterialUsage`.

##### PATCH /material/:id/toggle-status

Inativa ou reativa o material; ao inativar, retira-o das composições na mesma transação.

- **Corpo:** `{ "active": false }`
- **Resposta:** o material atualizado, com `active` e `removedFrom: 2` (linhas de composição alteradas; 0 ao reativar).
- **Permissão:** `product_settings:products:edit` (inativar não é excluir); feature `cost_base`.
- **O servidor valida:** material da empresa — "Material não encontrado"; `active` diferente do atual; ao inativar, remove o material (todas as variações) das opções das linhas de produtos e processos, troca o escolhido pela próxima opção e apaga a linha que ficar sem opção — **tudo numa transação** (hoje são duas chamadas soltas, `removeMaterialFromCompositions` e depois `setMaterialActive`); itens de orçamento já gravados não são tocados; ao reativar, não recoloca nada.
- **A tela:** toast "Material inativado" / "Material reativado", recarrega a lista e invalida a composição (`assembly`) e os processos (`process-detail`); a Precificação passa a mostrar o produto com composição inconsistente (alerta 3 da área 6).
- **Substitui:** `materials.ts › setMaterialActive`, `product-assembly.ts › removeMaterialFromCompositions`.

#### Importação de lista (IMP-1, área 4)

A planilha (colada ou `.csv`/`.txt`) é lida no front e enviada como linhas `{ name, unit, sector, cost }`. Entidade nova `material_import_link` (de-para aprendido): `companyId`, `externalName` (normalizado: minúsculas, sem acento, espaços colapsados), `materialId`, único por empresa + `externalName`. O de-para por fornecedor + código do item da nota (ORG-17) e o fator de conversão (ORG-18) são da entrada de nota, não desta rota. Unidades aceitas (após normalizar): `m2|m²|mq|metro quadrado → M2`; `m|ml|metro|metro linear → M`; `un|und|unid|unidade|pc|pç|folha|chapa → UN`; `kg|quilo → KG`; `l|lt|litro → LT`; `h|hr|hora → HR`; `km → KM`.

##### POST /material/import/preview

Concilia as linhas com o cadastro sem gravar nada.

- **Corpo:** `{ "rows": [ { "name": "Metalon 50x30", "unit": "ml", "sector": "Serralheria", "cost": 1900 }, … ] }`
- **Resposta:** `{ "data": [ { "line": 3, "name": "Metalon 50x30", "unit": "ml", "sector": "Serralheria", "cost": 1900, "status": "LINKED", "materialId": "metalon-50x30", "materialName": "Metalon 50 × 30", "unitKey": "M" }, { "line": 4, "name": "", "status": "INVALID", "problem": "Linha sem nome", … } ] }` — `status`: `NEW|MATCH|LINKED|INVALID`.
- **Permissão:** `product_settings:products:edit` + `values:values:view` (a planilha traz custo); feature `cost_base`.
- **O servidor valida:** no máximo 500 linhas por envio — "A lista tem mais de 500 linhas; divida em partes"; por linha: nome vazio → `INVALID` "Linha sem nome"; unidade fora da tabela → `INVALID` `Unidade "<x>" não reconhecida (use m², m, un, kg, l)`; setor informado e não cadastrado → `INVALID` `Setor "<x>" não cadastrado`; `cost` inteiro ≥ 0 ou nulo.
- **O servidor calcula:** a conciliação em cascata: de-para aprendido (`LINKED`) → nome normalizado igual a um material da empresa (`MATCH`) → `NEW`. Só concilia com material **ativo**.
- **A tela:** mostra a prévia com "Já cadastrado", "De-para guardado", "Novo" e "Ignorada" (com o motivo); em cada linha a pessoa troca a decisão ("Cadastrar como material novo" ou outro material ativo); contadores de criar/atualizar/ignorar.
- **Substitui:** `materials.ts › previewMaterialImport`.

##### POST /material/import

Aplica a importação já conciliada: atualiza os vinculados, cadastra os novos e guarda o de-para.

- **Corpo:** `{ "rows": [ { "name": "Metalon 50x30", "unit": "ml", "sector": "Serralheria", "cost": 1900, "materialId": "metalon-50x30" }, { "name": "Fita dupla face", "unit": "un", "sector": "Produção", "cost": 450, "materialId": null } ] }`
- **Resposta:** `{ "created": 1, "updated": 1, "ignored": 0 }`
- **Permissão:** `product_settings:products:edit` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** as mesmas regras por linha do preview (linha inválida é contada em `ignored`, não silenciosamente descartada); `materialId` de material ativo da empresa; tudo numa transação; limite de 500 linhas.
- **O servidor calcula:** com `materialId`: se o nome normalizado difere do nome do material, grava/atualiza o de-para (`externalName → materialId`, "da próxima vez o sistema já sabe"); atualiza `cost` **só se o material não tem variação** e `cost` não é nulo (MT-3), e com `priceRule: "VARIABLE"` refaz o preço; conta `updated`. Sem `materialId`: cria o material com `code` gerado, `sectorId` pelo nome da planilha (vazio → o setor padrão da empresa para materiais), `subcategory: "Importados"`, `directSale: false`, `productionMaterial: true`, `priceRule: "VARIABLE"`, `price: null`; conta `created`.
- **A tela:** toast "N materiais cadastrados · M atualizados", fecha o diálogo e recarrega a lista.
- **Substitui:** `materials.ts › importMaterials`.

Sem endpoint: `materials-data.ts › materialUnitSymbol` (formatação da sigla da unidade, fica no front); `materials-data.ts › materialResources` (vira a parte de materiais do endpoint de recursos da composição, módulo 1, parte A (composição): um recurso por variação, `unitCost`/`unitSale` da variação, `profile` em mm, `sheet` convertido para metros com `wholeSheets`, `weight`).

## 2. Orçamento

**Ordem dentro do módulo.** Comece pelo **item do orçamento**: `composition` e `variationId` em `add-product`/`update-product` e o detalhe do orçamento devolvendo o item completo (composição, variação, `product.isActive`, linhas, acréscimo). Isso destrava o modal do produto, a lista de itens e a trava do PAD-7 sem nenhuma rota nova. Em seguida, as **linhas dentro do item** (`…/item/:itemId/line`, com a prévia de preço): elas fazem o valor acrescentado entrar no total e nas condições de pagamento, que é o aviso que a tela mostra hoje. Depois vêm as duas mudanças pequenas em `finish` e `approve`, o **material de venda direta** e o **markup do terceirizado** (`/sales-settings`). O **item montado na hora** (ORC-11) depende do motor de cálculo da composição do módulo 1 (parte A) e entra depois dele. O **resultado previsto** (ORC-8) só faz sentido quando as linhas já gravam custo, então fica por último, junto com o `pdf-data`.

Convenções deste módulo: dinheiro em centavos. Medidas do item e das linhas em **milímetros** (`width`, `height`); os mocks usam metros e o front converte (÷ 1000) ao migrar. `quantity` é um número de unidades. **ORC-7 vale em todo o módulo:** nenhuma rota do orçamento devolve custo (da linha, do recurso ou do item) a quem não tem a permissão de método. Neste contrato essa permissão é `cost:pricing:view` + `values:values:view`, e o resultado previsto tem chave própria (ver ORC-8). Preço de venda só sai com `values:values:view`. Todas as rotas de escrita exigem o orçamento **em digitação** (`OPEN`), como `actionDisabled('edit'|'addItem')` faz na tela.

### Item do orçamento: composição, variação, acréscimo e totais

O item que já existe passa a guardar o que o vendedor escolheu. Isso inclui a composição (IP-36: extras, tempos, escolhas, opcionais, listas, observações por etapa), a variação (PV-3, PV-6), o acréscimo (ALT-25) e a origem (`PRODUCT`, `COMPOSED` ou `MATERIAL`). Também guarda as linhas acrescentadas dentro dele (ORC-5), descritas no recurso seguinte.

#### POST /sale/quotation/:id/add-product (muda)

Passa a aceitar a composição escolhida e a variação.

- **Corpo (campos novos):**
  ```json
  { "productId": "3f2a…", "quantity": 1, "description": "Banner 440 com bastão · M",
    "items": [ { "id": "…", "quantity": 1, "width": 900, "height": 1200, "salePrice": 4500 } ],
    "variationId": "v-m",
    "composition": {
      "extras": [ { "fieldId": "ilhoses-por-metro", "value": 2 }, { "fieldId": "block:b3", "value": 12 } ],
      "times": [ { "blockId": "b2", "minutes": 90 } ],
      "choices": [ { "blockId": "b1", "lineId": "l1", "optionId": "lona-440" } ],
      "optionals": [ { "blockId": "b2", "lineId": "l4", "included": true } ],
      "lists": [ { "blockId": "b2", "lineId": "l5", "optionId": "ilhos-latao", "quantity": 16 } ],
      "notes": [ { "blockId": "b2", "text": "Ilhós a cada 50 cm" } ] } }
  ```
- **Resposta:** o item criado, com `id`, `variation: { "id": "v-m", "name": "M" }` e `composition` (com `summary: ["Lona 440", "Ilhós: 16", "Bastão"]` montado pelo servidor).
- **Permissão:** `sale:quotation:edit`. `composition` exige a feature `product_composition`; sem ela, o campo dá 400.
- **O servidor valida:**
  - Produto com variações exige `variationId`: "Escolha a variação do produto" (PV-6).
  - A variação pertence ao produto.
  - `composition` só para produto com composição liberado para venda (IP-14). Cada `blockId`, `lineId` e `optionId` existe na composição do produto. Linha sem opção não é aceita (IP-37).
  - `quantity` das listas maior que zero (IP-8). Valor dos extras inteiro, salvo campo que aceita fração (IP-19).
  - Produto inativo não entra (PAD-7).
- **O servidor calcula:**
  - Preço base da variação: `variation.unitPrice ?? product.unitPrice`. Com variação, as faixas de quantidade do produto deixam de valer para o item (PV-4, PV-6).
  - Para produto com composição, o retrato da venda (ORC-10): custo e preço por etapa, recursos resolvidos na medida do item com as escolhas aplicadas, guardados no item.
  - O `salePrice` enviado só vale se o produto permitir editar valores.
- **A tela:** toast "Item adicionado", recarrega o orçamento. O modal deixa de chamar `saveItemComposition` depois do POST.
- **Substitui:** `quotation-composition.ts › saveItemComposition` (criação).

#### PATCH /sale/quotation/update-product/:itemId (muda)

Aceita `composition`, `variationId` e `addition`. Ao mudar a medida, recalcula as linhas que acompanham a base.

- **Corpo (campos novos):**
  ```json
  { "quantity": 2, "items": [ { "id": "…", "width": 3000, "height": 1000 } ],
    "variationId": "v-g", "composition": { "choices": [ … ], "notes": [ … ] },
    "discount": 0, "addition": 2500 }
  ```
- **Resposta:** o item atualizado, com `linesRecalculated: 2` (quantas linhas acrescentadas foram refeitas com a medida nova).
- **Permissão:** `sale:quotation:edit`. `composition` exige `product_composition`. `discount`/`addition` exigem `values:values:view` (janela Valores).
- **O servidor valida:**
  - O mesmo que `add-product` para `variationId` e `composition`.
  - `addition` ≥ 0, em centavos. Fica **fora do limite de desconto** do perfil (ALT-25). O desconto continua limitado pelo perfil sobre o preço base (ALT-8, EC-17).
  - Hoje o front manda o valor agregado como `discount` negativo; com o campo novo, desconto negativo dá 400.
  - Só em `OPEN`: "Orçamento já aprovado, não é possível editar os valores" (mensagem que a tela já usa).
- **O servidor calcula:**
  - Valor do item: `max(0, preçoBase × quantidade + Σ linhas.price − discount + addition)`.
  - Se `quantity`, `width` ou `height` mudou, refaz as linhas com `followsBase = true` e mantém as de medida própria (decisão de 05/10/2026, diferente do legado). Linha `PROCESS`: o cálculo do processo na medida nova. Linha `PART`: proporção da medida, `price × medida(nova) ÷ medida(antiga)`, com `medida = quantidade × (largura ou 1) × (altura ou 1)`, e o mesmo para o custo.
  - `resolvedAt` passa para agora nas linhas refeitas.
  - O retrato da composição do item também é refeito, porque a venda ainda não aconteceu (AB-4 vale depois).
- **A tela:** com `linesRecalculated > 0`, `toast.info("Uma linha acrescentada foi recalculada com a medida nova" | "N linhas …")`. A janela Valores mostra "Valor agregado: + R$ X (Y %)" e a lista mostra o acréscimo em verde.
- **Substitui:** `quotation-composition.ts › saveItemComposition` (edição), `recalculateItemLines`.

#### GET /sale/quotation/:id (muda)

O detalhe passa a devolver o item completo e totais que somam as linhas.

- **Resposta (campos novos no item e nos totais):**
  ```json
  { "id": "…", "status": "OPEN",
    "items": [
      { "id": "9c1e…", "origin": "PRODUCT", "product": { "id": "3f2a…", "isActive": true, "hasComposition": true },
        "variation": { "id": "v-m", "name": "M" },
        "composition": { "choices": [ … ], "summary": ["Lona 440", "Ilhós: 16"] },
        "discount": 0, "addition": 2500, "linesTotal": 36364, "total": 81364,
        "lines": [ { "id": "ln-1", "kind": "LOOSE", "name": "Letra caixa", "sector": "Terceirizado · Letras & Cia",
                     "tags": ["terceirizado"], "price": 36364, "followsBase": null, "measure": null,
                     "processId": null, "productId": null } ] },
      { "id": "a7b2…", "origin": "COMPOSED", "name": "Totem em ACM", "description": "Totem dupla face",
        "quantity": 1, "width": 800, "height": 2000, "draftId": "dr-91…", "stages": 3,
        "sectors": ["CNC", "Serralheria", "Instalação"], "attention": false, "total": 245000 },
      { "id": "c3d4…", "origin": "MATERIAL", "name": "MDF 10 mm · Marca Y · Branco", "description": "Material · Marcenaria",
        "material": { "materialId": "mdf-10", "variationId": "v4", "unit": "un", "unitPrice": 9500 },
        "quantity": 2, "total": 19000 } ],
    "totals": { "items": 345364, "discount": 0, "addition": 2500, "total": 345364 } }
  ```
- **Permissão:** `sale:quotation:view` (`sale:other_quotation:view` para orçamento de outro vendedor). Sem `values:values:view`, o servidor omite `price`, `total`, `linesTotal`, `discount`, `addition` e os totais. `cost` nunca sai daqui (ORC-7).
- **O servidor calcula:**
  - Total do item: produto, `max(0, base × qtd + Σ linhas − desconto + acréscimo)`; montado na hora, `Σ preço das etapas`; material, `round(preço unitário × qtd)`.
  - Total do orçamento: `Σ itens`, contando os montados na hora e os de material.
  - As condições de pagamento passam a fechar contra esse total.
  - `attention = 0 etapas` (MS-12).
- **A tela:**
  - Uma consulta só alimenta a lista de itens: badges da composição, "Ver a composição completa", linhas acrescentadas com "+ R$ X acrescentado", etiquetas "Material", "Composição", "Exige atenção" e "Produto inativo".
  - O aviso "o que foi acrescentado ainda não soma no total" sai.
  - Deixa de buscar `GET /product/:id` por item para conferir `isActive` (`useInactiveQuotationItems`).
- **Substitui:** `quotation-composition.ts › getItemCompositions`, `getItemLines`, `getComposedItems`.

#### DELETE /sale/quotation/remove-product/:itemId (muda)

Passa a remover item de qualquer origem: produto, montado na hora ou material. Leva junto as linhas, o retrato e o rascunho do fluxo.

- **Resposta:** `{ "id": "a7b2…" }`
- **Permissão:** `sale:quotation:edit`. Pela regra firmada, remover uma linha de dentro do registro é `:edit`. A tela usa hoje `sale:quotation:delete` no item e precisa alinhar.
- **O servidor valida:** item do orçamento da empresa da sessão, orçamento `OPEN`.
- **A tela:** `alertDialog` "Excluir <nome>?" → toast "Item excluído", recarrega o orçamento.
- **Substitui:** `quotation-composition.ts › removeComposedItem`.

### Linhas acrescentadas dentro do item (ORC-5)

O item é um recipiente aberto, como no legado. Depois de lançado, recebe processos (`PROCESS`), itens prontos do catálogo (`PART`) e terceirizados avulsos (`LOOSE`), cada um numa linha própria (MS-15). A linha guarda tipo, nome, setor, etiquetas, a medida usada (`measure`, em mm), `followsBase`, a origem (`processId` ou `productId`), o preço, o custo e o retrato do cálculo (`resolved`, `resolvedAt`; ORC-10). O custo nunca volta ao orçamento (ORC-7). Rotas conforme o backend-pendente (05/10 e 06/10/2026).

#### POST /sale/quotation/:id/item/:itemId/line/preview

Calcula o preço da linha antes de gravar, para o painel "Acrescentar a este item" mostrar o valor enquanto o vendedor mexe na medida ou no custo.

- **Corpo:** o mesmo da criação da linha (abaixo). Exemplo de processo:
  ```json
  { "kind": "PROCESS", "processId": "instalacao", "followsBase": false,
    "measure": { "quantity": 1, "width": 2000, "height": 1000 },
    "fields": [ { "fieldId": "km", "value": 20 }, { "fieldId": "tempo", "value": 120 } ] }
  ```
- **Resposta:**
  ```json
  { "price": 9000, "tags": ["1 un", "2 × 1 m"], "followsBaseDefault": true,
    "instructions": [ { "stage": "Instalação", "text": "Confirme altura e acesso ao local" } ],
    "suggestedPrice": null, "markup": null }
  ```
  No `LOOSE`: `{ "suggestedPrice": 36364, "markup": 45, "price": 36364 }`.
- **Permissão:** `sale:quotation:edit`; feature `product_composition`. `price` e `suggestedPrice` só com `values:values:view`; sem ela, a resposta traz só `tags`, `instructions` e `followsBaseDefault`.
- **O servidor valida:** o mesmo da criação, sem gravar.
- **O servidor calcula:**
  - `PROCESS`: o cálculo do processo na medida (a do item quando `followsBase`), com os campos que o processo declara (km, tempo, pessoas; IP-4, IP-13). `followsBaseDefault` vem da preferência do processo: herda a medida da base → `true` (03/10/2026).
  - `PART`: `round(preço unitário × fator × quantidade)`, com `fator` = largura × altura (AREA), largura (LENGTH) ou 1 (UNITY).
  - `LOOSE`: `round(custo ÷ (1 − markup/100))`, com o markup da empresa (MS-16, T-4).
  - `instructions` são as instruções ao vendedor dos processos (do processo ou do produto escolhido; CP-13).
- **A tela:**
  - Mostra o preço ao lado da medida.
  - No terceirizado, mostra o preço sugerido com o percentual escrito ao lado e a conta; ele acompanha o custo até o vendedor editar.
  - Mostra as instruções ao vendedor como texto de apoio.
  - Deixa de chamar o cálculo do processo (que devolve custo) e de calcular `partPrice` e `outsourcedPriceFromCost` no cliente.
- **Substitui:** os cálculos de `AddToItem.tsx` (`partPrice`, `outsourcedPriceFromCost` de `src/lib/quotation.ts`) e as chamadas de `AddToItem.tsx` a `product-assembly.ts › getProcessDetail` e `getSaleForm` (só as instruções). Essas duas funções ficam no módulo 1 (parte A) para as telas de configuração.

#### POST /sale/quotation/:id/item/:itemId/line

Acrescenta uma linha ao item e refaz o valor dele.

- **Corpo:** um dos três tipos.
  ```json
  { "kind": "PROCESS", "processId": "impressao-lona", "followsBase": true,
    "measure": { "quantity": 1, "width": 3000, "height": 1000 }, "fields": [] }
  ```
  ```json
  { "kind": "PART", "productId": "3f2a…", "followsBase": true,
    "measure": { "quantity": 1, "width": 1200, "height": 800 } }
  ```
  ```json
  { "kind": "LOOSE", "supplierId": null, "supplier": "Letras & Cia", "description": "Letra caixa",
    "cost": 20000, "price": 36364 }
  ```
- **Resposta:**
  ```json
  { "line": { "id": "ln-7…", "kind": "PROCESS", "name": "Impressão em lona", "sector": "Impressão",
      "tags": ["1 un", "3 × 1 m"], "price": 7757, "followsBase": true,
      "measure": { "quantity": 1, "width": 3000, "height": 1000 }, "processId": "impressao-lona", "productId": null },
    "item": { "id": "9c1e…", "linesTotal": 44121, "total": 89121 } }
  ```
- **Permissão:** `sale:quotation:edit`; feature `product_composition`. O `price` enviado no `LOOSE` só é aceito de quem tem `values:values:view`; de quem não tem, o servidor grava o sugerido.
- **O servidor valida:**
  - Orçamento `OPEN` e item dele, na empresa da sessão.
  - `PROCESS`: processo ativo (PAD-7) e sem linha sem recurso (IP-37). Campos obrigatórios do processo informados, como km e tempo da instalação.
  - `PART`: produto ativo, liberado para venda e com preço.
  - `LOOSE`: "Informe o que acrescentar" (descrição vazia) e `cost` > 0.
  - `followsBase` ligado copia a medida do item e ignora a enviada. Desligado, exige `measure` com largura e altura > 0.
  - `measure` e `followsBase` só valem para `PROCESS` e para `PART` medido. No `PART` por unidade, `followsBase` fica nulo.
- **O servidor calcula:**
  - Preço como na prévia.
  - Custo da linha: `PROCESS` pela composição do processo. `PART` pela composição do produto, o que corrige o custo zero de hoje. `LOOSE` é o custo digitado, que vira despesa no financeiro quando a venda acontece (T-3).
  - `resolved` guarda os recursos com quantidade, `unitCost` e custo, com `actualQuantity`/`actualCost` nulos até o apontamento (ORC-9, ORC-10). `resolvedAt` é a data da criação.
  - Valor do item e total do orçamento refeitos.
  - O setor do `LOOSE` é "Terceirizado · <fornecedor>" (ou "Terceirizado").
- **A tela:** toast "<nome> acrescentado a <item>" ou "Terceirizado acrescentado a <item>", fecha o painel, recarrega o orçamento. O custo digitado some da tela (ORC-7).
- **Substitui:** `quotation-composition.ts › addItemLine`.

#### DELETE /sale/quotation/:id/item/:itemId/line/:lineId

Retira uma linha do item e refaz o valor dele.

- **Resposta:** `{ "item": { "id": "9c1e…", "linesTotal": 7757, "total": 52757 } }`
- **Permissão:** `sale:quotation:edit` (linha de dentro do registro).
- **O servidor valida:** linha do item, item do orçamento, orçamento `OPEN`.
- **A tela:** `alertDialog` "Retirar <nome>?" → toast "Retirado do item" (erro: "Erro ao retirar"), recarrega o orçamento.
- **Substitui:** `quotation-composition.ts › removeItemLine`.

### Item montado na hora: o botão "Composição" (ORC-11, MS-12)

Serve para quando não existe produto pronto. O vendedor dá nome, descritivo, medida e quantidade e monta o fluxo com **o mesmo editor da composição do produto** (FL-1 a FL-7), só naquele item. O resultado não vira cadastro. Modelo: um **rascunho de fluxo** (`draft`) da empresa, ligado ao orçamento. O item `COMPOSED` guarda o `draftId` (para reabrir) e o retrato das etapas como linhas com custo (ORC-10). A tela recebe só o resumo (ORC-7). O compor não tem permissão própria (ORC-11): vale `sale:quotation:edit`.

**Etapas do rascunho:** são as **rotas de etapa da composição do módulo 1 (parte A)**. Isso vale para incluir processo, etapa própria, parte, ligar, desligar, trocar processo e remover etapa, e também para candidatos a etapa seguinte, candidatos a parte e recursos (`addAssemblyBlock`, `addOwnBlock`, `addPartBlock`, `linkBlock`, `unlinkBlock`, `replaceBlockProcess`, `removeAssemblyBlock`, `getNextStepCandidates`, `getPartCandidates`, `getAssemblyResources`). As rotas ficam em `/sale/quotation/:id/composed-draft/:draftId/assembly/...` (`block`, `block/:blockId`, `next-step`, `part-candidate`), com o mesmo corpo e a mesma resposta de `/product/:id/assembly/...`: é o mesmo serviço, com um dono do tipo `QUOTATION_DRAFT` no lugar do produto. Os recursos vêm de `GET /product/assembly-resource`. Nesse caso, o servidor confere `sale:quotation:edit` no orçamento dono do rascunho, e não `product_settings:products:edit`, e não devolve custo.

#### POST /sale/quotation/:id/composed-draft

Abre um rascunho vazio quando o vendedor clica em "Composição".

- **Corpo:** `{ "name": "Item composto", "measure": { "quantity": 1, "width": 1000, "height": 1000 } }` (os dois opcionais)
- **Resposta:** `{ "id": "dr-91…", "name": "Item composto" }`
- **Permissão:** `sale:quotation:edit`; feature `product_composition`.
- **O servidor valida:** orçamento `OPEN`.
- **A tela:** guarda o `draftId` e mostra o editor de fluxo vazio. O servidor apaga sozinho o rascunho que não virou item (ao fechar sem confirmar), depois de um prazo.
- **Substitui:** `product-assembly.ts › createDraftAssembly`.

#### GET /sale/quotation/:id/composed-draft/:draftId

Mostra o que o vendedor vê ao montar: etapas, recursos e o **preço de venda** de cada um, nunca o custo.

- **Query:** `quantity`, `width`, `height` (mm), a medida digitada no modal.
- **Resposta:**
  ```json
  { "id": "dr-91…", "name": "Item composto", "measure": { "quantity": 1, "width": 2000, "height": 1000 },
    "stages": [ { "id": "b1", "name": "Impressão solvente", "sector": "Impressão", "dependsOn": [], "processId": "impressao-solvente",
      "partProductId": null, "partFlow": null, "sale": 7400, "setupMinutes": 10,
      "lines": [ { "id": "l1", "name": "Material", "kind": "MATERIAL", "resource": "Lona 440 g", "quantity": 2.4, "unit": "m²", "sale": 6000 } ] } ],
    "total": 9100 }
  ```
- **Permissão:** `sale:quotation:edit`; `sale` e `total` só com `values:values:view`.
- **O servidor calcula:** o motor da composição (módulo 1 (parte A)) na medida pedida, sem gravar. `total` = soma do preço de venda das etapas.
- **A tela:** desenha o fluxo ("Setor · R$ X" em cada etapa) e marca "Exige atenção" quando não há etapa.
- **Substitui:** `product-assembly.ts › getComposedItemView`.

#### POST /sale/quotation/:id/add-composed

Cria o item `COMPOSED` a partir do rascunho.

- **Corpo:** `{ "draftId": "dr-91…", "name": "Totem em ACM", "description": "Totem dupla face com iluminação", "quantity": 1, "width": 800, "height": 2000 }`
- **Resposta:** o item no formato do detalhe (`origin: "COMPOSED"`, `stages`, `sectors`, `total`, `attention`), sem custo e sem linhas.
- **Permissão:** `sale:quotation:edit`; feature `product_composition`.
- **O servidor valida:** "Informe o nome do item". O rascunho é do orçamento e da empresa. `quantity` ≥ 1 (arredonda para cima de 1). Rascunho sem etapa **não é erro**: o item nasce com `attention: true` (MS-12, 05/10/2026).
- **O servidor calcula:**
  - Grava nome e medida no rascunho.
  - Resolve cada etapa como uma linha `PROCESS` (ou `PART`, se a etapa é parte) com custo, preço, recursos e `resolvedAt` (ORC-10).
  - `price = Σ preço das etapas`, `stages = nº de etapas`, `sectors = setores distintos`.
- **A tela:** toast "Item acrescentado", fecha o modal, recarrega o orçamento.
- **Substitui:** `quotation-composition.ts › addComposedItem`, `product-assembly.ts › updateDraftAssembly` (nome e medida vão no corpo) e `resolveComposedItem` (o retrato é interno ao servidor).

#### PATCH /sale/quotation/update-composed/:itemId

Edita o item montado na hora: nome, descritivo, medida, quantidade e o fluxo já mexido no rascunho.

- **Corpo:** `{ "name": "Totem em ACM", "description": "…", "quantity": 2, "width": 800, "height": 2000 }`
- **Resposta:** o item no formato do detalhe.
- **Permissão:** `sale:quotation:edit`.
- **O servidor valida:** "Item não encontrado" (item `COMPOSED` do orçamento, que não pode ser `MATERIAL` nem `PRODUCT`). "Informe o nome do item". Orçamento `OPEN`.
- **O servidor calcula:** refaz o retrato com o rascunho atual (a venda ainda não aconteceu; AB-4 vale depois).
- **A tela:** toast "Item atualizado".
- **Substitui:** `quotation-composition.ts › updateComposedItem`.

#### POST /sale/quotation/:id/composed-draft/:draftId/save-as-product

"Salvar como produto", um botão discreto. Cria um produto **"Em edição"** com a composição do rascunho. O item do orçamento continua o que foi montado.

- **Corpo:** `{ "name": "Totem em ACM" }`
- **Resposta:** `{ "id": "7e1f…", "name": "Totem em ACM", "status": "DRAFT", "code": null }`
- **Permissão:** `sale:quotation:edit` e `product_settings:products:create`, porque cria um cadastro. A tela não confere hoje e precisa esconder o botão de quem não tem.
- **O servidor valida:** "Item não encontrado"; "Monte ao menos uma etapa antes".
- **O servidor calcula:** cria o produto em `/product` com `status` em edição (IP-14), sem código, e copia as etapas do rascunho para a composição dele.
- **A tela:** toast "Produto criado em edição. Revise a composição em Configurações › Produtos antes de liberar para venda."
- **Substitui:** `product-assembly.ts › saveDraftAsProduct`.

### Material de venda direta como item (ORG-1)

O item passa a aceitar um material além de produto (`origin: "MATERIAL"`). A unidade e o preço vêm do material ou da variação (marca · cor). A busca usa `GET /material?directSale=true&active=true` (módulo 1 (parte B, Materiais), só referência), que precisa devolver setor, unidade, preço e variações com preço.

#### POST /sale/quotation/:id/add-material

- **Corpo:** `{ "materialId": "mdf-10", "variationId": "v4", "quantity": 2 }`
- **Resposta:** o item no formato do detalhe: `{ "id": "c3d4…", "origin": "MATERIAL", "name": "MDF 10 mm · Marca Y · Branco", "description": "Material · Marcenaria", "material": { "materialId": "mdf-10", "variationId": "v4", "unit": "un", "unitPrice": 9500 }, "quantity": 2, "total": 19000 }`
- **Permissão:** `sale:quotation:edit`.
- **O servidor valida:** "Material não encontrado" (inexistente, inativo ou sem venda direta). "Escolha a variação do material" (o material tem variações e `variationId` não veio). "Este material está sem preço de venda". `quantity` inteira ≥ 1. Orçamento `OPEN`.
- **O servidor calcula:** `unitPrice = variação.price ?? material.price`; `total = round(unitPrice × quantity)`; nome `"<material> · <variação>"`; descrição `"Material · <setor>"`.
- **A tela:** toast "Item adicionado", fecha o diálogo, recarrega o orçamento. A prévia do diálogo pode continuar no cliente, porque o preço já vem na busca.
- **Substitui:** `quotation-composition.ts › addMaterialItem`.

#### PATCH /sale/quotation/update-material/:itemId

- **Corpo:** `{ "variationId": "v5", "quantity": 3 }`
- **Resposta:** o item no formato do detalhe.
- **Permissão:** `sale:quotation:edit`.
- **O servidor valida:** "Item não encontrado" (item `MATERIAL` do orçamento), "Material não encontrado", "Escolha a variação do material", "Este material está sem preço de venda". Orçamento `OPEN`.
- **O servidor calcula:** como na criação.
- **A tela:** toast "Item editado".
- **Substitui:** `quotation-composition.ts › updateMaterialItem`.

### Configurações de venda: markup do terceirizado avulso (MS-16, T-4)

Por empresa: `{ outsourcedMarkup }`, percentual com até duas casas (45 = 45 %), padrão 45, o mesmo do legado. O preço sugerido do terceirizado avulso é `custo ÷ (1 − markup/100)`.

#### GET /sales-settings

- **Resposta:** `{ "outsourcedMarkup": 45 }`
- **Permissão:** `sales_settings:series:view`, a chave que a tela usa hoje. O painel do orçamento não precisa desta rota, porque a prévia da linha já devolve o `markup`.
- **A tela:** Configurações › Vendas › Terceirizado avulso preenche o campo e mostra o exemplo (R$ 200 → R$ 363,64 com 45 %).
- **Substitui:** `sales-settings.ts › getSalesSettings`.

#### PUT /sales-settings

- **Corpo:** `{ "outsourcedMarkup": 40 }`
- **Resposta:** `{ "outsourcedMarkup": 40 }`
- **Permissão:** `sales_settings:series:edit`. O terceirizado avulso existe do LITE em diante; se houver feature, é a `product_composition`.
- **O servidor valida:** "O markup precisa ser um percentual entre 0 % e 99 %" (não numérico, < 0 ou ≥ 100).
- **A tela:** toast "Markup do terceirizado atualizado". Vale para as próximas linhas; as já gravadas não mudam.
- **Substitui:** `sales-settings.ts › updateSalesSettings`.

### Resultado previsto: estimativa de custos (ORC-8, ORC-9)

É uma tela, não PDF. Permissão própria, **desligada por padrão no perfil de vendedor**, e acesso registrado (SEG-4). Lê o retrato gravado nas linhas (ORC-10). Não refaz a conta com o custo de hoje.

#### GET /sale/quotation/:id/result

- **Resposta:**
  ```json
  { "revenue": 345364, "productionCost": 162300,
    "commission": { "percent": 5, "value": 17268 }, "taxes": { "percent": 10, "value": 34536 },
    "result": 131260, "margin": 38.0,
    "items": [ { "itemId": "9c1e…", "name": "Lona com bainha e ilhós", "total": 81364, "cost": 41200, "margin": 49.4,
      "lines": [ { "id": "ln-1", "kind": "PROCESS", "name": "Impressão em lona", "sector": "Impressão", "price": 7757, "cost": 4617,
        "resolvedAt": "2026-09-20T09:14:00Z",
        "resolved": [ { "kind": "MATERIAL", "name": "Lona 440 · Branca", "unit": "m²", "quantity": 3, "unitCost": 1250, "cost": 3750,
                        "actualQuantity": null, "actualCost": null } ] } ] } ] }
  ```
  `margin` em percentual com uma casa (38,0 = 38,0 %).
- **Permissão:** chave nova **`sale:quotation_result:view`**. A tela usa hoje, provisoriamente, `cost:pricing:view` + `values:values:view`. Feature `cost_base`.
- **O servidor valida:** orçamento da empresa. De outro vendedor, só com `sale:other_quotation:view`.
- **O servidor calcula:**
  - `revenue = total do orçamento`; `productionCost = Σ custo das linhas` (produto, acrescentadas, montado na hora).
  - Comissão pelo percentual do perfil do vendedor; tributos pelo percentual da Precificação (PR-1). O mock usa 5 % e 10 % fixos.
  - `result = revenue − productionCost − commission − taxes`; `margin = result ÷ revenue`. Por item, `(total − custo) ÷ total`.
  - `actual*` vêm do apontamento (ELITE/FULL, ORC-9). Ficam nulos no PRO.
- **A tela:** o quadro do resultado e, por item, as linhas com recursos estimado × realizado.
- **SEG-4:** registra cada acesso (usuário, orçamento, data) e alerta quando um usuário abre a estimativa de muitos orçamentos em sequência.
- **Substitui:** os cálculos de `QuotationResult.tsx` sobre `quotation-composition.ts › getQuotation` (protótipo).

#### GET /sale/quotation/:id/result/export

- **Resposta:** arquivo (PDF ou planilha) identificado com empresa, usuário e data em todas as páginas (SEG-3).
- **Permissão:** **`sale:quotation_result:export`** (nova); feature `cost_base`.
- **SEG-4:** registra a exportação.
- **A tela:** botão de exportar na tela do resultado (a construir).
- **Substitui:** nenhuma action (não há mock).

### Concluir, aprovar, produto inativo e proposta

#### POST /sale/quotation/:id/finish (muda)

- **O servidor:**
  - **Aceita** orçamento sem condição de pagamento (decisão de 05/10/2026: "concluir sem condição pode").
  - Também não bloqueia por item "Exige atenção" (MS-12) nem por produto inativo; esses só travam a aprovação.
  - Parcelas que não fecham com o total continuam recusadas, como hoje.
- **A tela:** antes de chamar, mostra "Concluir mesmo assim?" com o que falta (condição de pagamento, item sem etapas, produto inativado), calculado a partir do detalhe.

#### POST /sale/quotation/:id/approve (muda)

- **O servidor valida:**
  - Sem condição de pagamento, recusa com "Informe a condição de pagamento para aprovar". A exceção é a venda rápida, do módulo 5.
  - Com algum item cujo produto (ou a parte de uma linha `PART`) está inativo, recusa com "Este orçamento não pode ser aprovado: troque ou retire os itens com produto inativo" e devolve `userMessage.items: [{ "itemId": "9c1e…", "name": "Banner 440" }]` (PAD-7).
  - Item `attention` não bloqueia (MS-12).
- **O servidor faz:** congela o retrato das linhas (ORC-10). A partir daqui, refazer a conta não muda o que foi vendido. O custo das linhas `LOOSE` vira despesa a pagar ao fornecedor (T-3).
- **A tela:** sem condição, abre o diálogo de condições e segue para a aprovação. Com produto inativo, abre "Este orçamento não pode ser aprovado" com a lista dos itens a trocar ou retirar.

#### GET /sale/quotation/:id/pdf-data (muda)

- **Query nova:** `detailLevel` = `resumo` · `lista` · `valores` (IP-12). O padrão é `valores` para quem tem `values:values:view` e `resumo` sem o recurso de plano `pdf_show_item_details`.
- **Resposta (campos novos):** cada item traz `origin`, `material.unit`, `variation.name` e as `lines` acrescentadas (`name`, `sector`, `tags`, `price`), além das `compositions` de hoje.
- **O servidor valida:** `valores` só para quem tem `values:values:view`. Sem a permissão, cai para `lista` e omite os preços de linha e de parte.
- **O servidor calcula:**
  - O valor do item já inclui as linhas e o **acréscimo embutido**, sem linha própria de acréscimo na proposta (ALT-25).
  - No `valores`, o valor do item é repartido entre as etapas pelo peso de cada uma no preço sugerido. As etapas somam o preço do item, e a etapa vazia não aparece.
  - O detalhamento usa sempre o **nome de venda** (`localName || name`), nunca nomes internos.
- **A tela:** o diálogo de impressão escolhe o nível. A proposta do protótipo (`/composicao/proposta`) passa a ler daqui.
- **Substitui:** a composição da proposta em `ProposalPrint.tsx` sobre `quotation-composition.ts › getQuotation` (protótipo).

**Sem endpoint (protótipo `/vendas/orcamentos/[id]/composicao`, vitrine em memória):** `getQuotation`, `getItemOptions`, `addQuotationItem`, `addQuotationLine`, `updateQuotationItem`, `removeQuotationLine` e `removeQuotationItem` servem só ao orçamento de exemplo. No orçamento real, o mesmo fica coberto por `add-product`/`update-product`/`remove-product` e pelas rotas de linha acima. `getQuotationProducts` é a lista de produtos de exemplo: no real, vale `GET /product` com variações, campos e `hasComposition` (módulo 1 (parte A)). `getDirectSaleMaterials` vira `GET /material?directSale=true&active=true` (módulo 1 (parte B, Materiais)).

## 3. Gerenciador de produção (ELITE)

**Ordem dentro do módulo.** (1) O campo `color` no `/sector`: é pequeno e destrava a cor em onze telas, inclusive fora do ELITE (Agenda de entrega, composição, processos). (2) A configuração (`/production/config`, gerenciadores, tipos de tarefa e etapas, colaboradores, veículos): sem ela, não há onde a tarefa cair. (3) A criação do projeto na aprovação do orçamento, junto com a leitura de projeto e de quadro (`/production/project`, `/production/manager/:id/board`): é aqui que entram o cálculo das tarefas e o cálculo dos alertas, que todas as leituras devolvem. (4) A máquina de estados e o apontamento (`/production/task/:id/action`, `work/start`, `work/stop`): sem isso o quadro só serve para olhar. (5) Agenda, veículos, anexos, correção de tempo e produtividade, nessa ordem.

Convenções do módulo. Tempo sempre em **minutos**, número com uma casa (`42`, `25.3`). Datas ISO, horário `HH:mm`. Toda rota confere a feature `production_manager` (ELITE) e filtra pela empresa da sessão. **Quem age é sempre o usuário da sessão**: o servidor grava o nome dele em `history`, `completedBy`, `releasedNext.by` e nas correções. O campo `by` que as actions do mock recebem do cliente não existe na API. Quem é gerente também é decidido pelo servidor, nunca pelo corpo: gerente é quem tem `production:production:edit` ou tem perfil `MANAGER` na produção (GP-11). As mensagens de erro do mock viram 400/404 com o mesmo texto em `userMessage.message`. A tarefa nunca leva custo nem preço: `consumption` traz só recurso, quantidade e unidade (ORC-7).

### Setor com cor

O setor ganha `color` (hexadecimal `#RRGGBB`, maiúsculo). Setor novo sem cor recebe o padrão do ícone, a mesma tabela de `src/consts/sectors.ts` (`device-desktop-analytics` `#6B7280`, impressão `#2563EB`…). Quando o ícone é desconhecido, recebe `#6B7280`. O tipo de tarefa não tem cor: usa a do setor do gerenciador de cada etapa (área 9 §4.14).

#### GET /sector (muda)

Listagem e detalhe passam a devolver `color` em cada setor. `with-products` também.

- **Resposta:** `{ "data": [ { "id": "12", "name": "Impressão", "icon": "printer", "color": "#2563EB", "isActive": true, "isProductionStage": true, "kind": "…" } ], "page": 1, "lastPage": 1, "total": 9 }`
- **Permissão:** a de hoje (`company_settings:sectors:view`). A cor não depende de plano.
- **A tela:** `useSectorColor` lê a cor do próprio setor e deixa de casar pelo nome. Gerenciador, ficha, Agenda de entrega, composição e processos passam a receber o setor com `id`, e o servidor deve mandar `sector` como objeto (`{ id, name, icon, color }`) nas respostas da produção (abaixo).
- **Substitui:** `sector-colors.ts › getSectorColors`

#### PATCH /sector/:id (muda)

Editar o setor aceita `color`. `POST /sector` também aceita (opcional).

- **Corpo:** `{ "name": "Impressão", "icon": "printer", "isProductionStage": true, "color": "#1D4ED8" }`. `color: null` volta ao padrão do ícone.
- **Resposta:** o setor salvo, com `color`.
- **Permissão:** `company_settings:sectors:edit` (`:create` no POST).
- **O servidor valida:** formato `#RRGGBB`, "Cor inválida" (área 9 §4.14). Grava em maiúsculas.
- **A tela:** o diálogo de editar setor manda a cor no mesmo `PATCH`, toast "Setor atualizado". A segunda chamada sai.
- **Substitui:** `sector-colors.ts › setSectorColor`

### Configuração da produção

Entidades por empresa: **fluxo** (`id`, `name`; hoje fixo, "Comunicação Visual", sem cadastro na tela). **Gerenciador** (`name`, `sectorId`, `flowId`, `timeMode` `PLAY_STOP` · `DRAG_DROP`, `intervalMinutes`, `active`, `users[] { collaboratorId, onlyAssigned }`). **Tipo de tarefa** (`name`, `release` `AFTER_BASE` · `WITH_BASE` · `DONE`, `timeControl`, `active`, `steps[]` ordenadas `{ id, name, managerId }`). **Colaborador** da produção (`id` = id do usuário do sistema, `name`, `email`, `role` `OPERATOR` · `MANAGER`, `working`). **Veículo** (`name`, `plate`, `active`).

#### GET /production/config

Tudo o que a tela de Configurações › Produção mostra, inclusive os inativos, numa leitura só. Vale como o `GET` de gerenciadores, tipos e veículos para quem só configura.

- **Resposta:** `{ "flows": [ { "id": "flow-cv", "name": "Comunicação Visual" } ], "managers": [ { "id": "mgr-impressao", "name": "Impressão", "sector": { "id": "12", "name": "Impressão", "icon": "printer", "color": "#2563EB" }, "flowId": "flow-cv", "timeMode": "PLAY_STOP", "intervalMinutes": 10, "users": [ { "collaboratorId": "u-31", "onlyAssigned": true } ], "active": true } ], "taskTypes": [ { "id": "tt-impressao", "name": "Impressão", "release": "WITH_BASE", "timeControl": true, "steps": [ { "id": "st-1", "name": "Impressão", "managerId": "mgr-impressao" }, … ], "active": true } ], "collaborators": [ { "id": "u-31", "name": "Marcos", "email": "marcos@…", "role": "OPERATOR", "working": null } ], "vehicles": [ { "id": "veh-1", "name": "Fiorino", "plate": "ABC1D23", "active": true } ] }`
- **Permissão:** `production:production:view` · feature `production_manager`.
- **O servidor valida:** só a empresa da sessão. `collaborators` são os usuários ativos da empresa. Quem ainda não tem perfil na produção aparece como `OPERATOR` (GP-11).
- **A tela:** as quatro abas de Configurações › Produção. O detalhe do projeto usa só `collaborators` e `vehicles`, para o diálogo da tarefa.
- **Substitui:** `production-manager.ts › getManagerConfig`

#### GET /production/manager

Os gerenciadores ativos com a contagem do quadro, para as abas do topo do gerenciador.

- **Resposta:** `[ { "id": "mgr-impressao", "name": "Impressão", "sector": { "id": "12", "name": "Impressão", "icon": "printer", "color": "#2563EB" }, "timeMode": "PLAY_STOP", "intervalMinutes": 10, "active": true, "open": 4, "alerts": 1 } ]`
- **Permissão:** `production:production:view` · `production_manager`.
- **O servidor valida:** o operador recebe só os gerenciadores a que tem acesso. O gerente recebe todos (GP-11).
- **O servidor calcula:** `open` = tarefas abertas de projetos `PRODUCTION` cuja etapa atual está neste gerenciador e que o usuário pode ver. `alerts` = quantas dessas têm `alert`.
- **A tela:** abas segmentadas com a contagem. A primeira vira a selecionada quando falta `?gerenciador=`.
- **Substitui:** `production-manager.ts › getManagerSummary`

#### POST /production/manager

Cria um gerenciador. `PUT /production/manager/:id`, com o mesmo corpo, substitui os campos editáveis.

- **Corpo:** `{ "name": "Impressão", "sectorId": "12", "flowId": "flow-cv", "timeMode": "PLAY_STOP", "intervalMinutes": 10 }`
- **Resposta:** o gerenciador criado (`users: []`, `active: true`), formato do `config`.
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** nome obrigatório, "Informe o nome do gerenciador". Setor obrigatório, ativo e da empresa, "Escolha o setor do gerenciador". Fluxo da empresa, "Fluxo de produção não encontrado" (legado §9.1). `timeMode` no enum (GP-43). `intervalMinutes` inteiro ≥ 0 (GP-20).
- **A tela:** diálogo de gerenciador, toast "Gerenciador salvo", recarrega `config`. Hoje a tela manda o **nome** do setor (`sector`) e passa a mandar `sectorId`.
- **Substitui:** `production-manager.ts › saveManager`

#### POST /production/manager/:id/inactivate

Inativa o gerenciador e passa as etapas dele para outro (GP-15).

- **Corpo:** `{ "destinationId": "mgr-producao" }`
- **Resposta:** `{ "id": "mgr-impressao", "active": false, "movedSteps": 3 }`
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** "Gerenciador não encontrado". Destino existe, está ativo e é outro, "Escolha um gerenciador ativo de destino" (GP-15).
- **O servidor calcula:** toda etapa de tipo de tarefa com `managerId = id` passa a `destinationId`. As tarefas abertas nessas etapas vão junto.
- **A tela:** diálogo de inativar com a escolha do destino. Recarrega `config`.
- **Substitui:** `production-manager.ts › inactivateManager`

#### POST /production/manager/:id/reactivate

Reativa o gerenciador. As etapas não voltam sozinhas.

- **Resposta:** `{ "id": "mgr-impressao", "active": true }`
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** "Gerenciador não encontrado".
- **A tela:** botão "Reativar" na aba de gerenciadores.
- **Substitui:** `production-manager.ts › reactivateManager`

#### PUT /production/manager/:id/user/:collaboratorId

Define o acesso de um colaborador ao gerenciador (GP-11).

- **Corpo:** `{ "access": "ASSIGNED" }`, com `NONE` · `ALL` · `ASSIGNED`
- **Resposta:** `{ "users": [ { "collaboratorId": "u-31", "onlyAssigned": true }, … ] }`
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** "Gerenciador não encontrado". Colaborador é usuário ativo da empresa, "Colaborador não encontrado". `NONE` tira o acesso. `ASSIGNED` grava `onlyAssigned: true` (GP-11).
- **A tela:** diálogo de usuários do gerenciador e aba Colaboradores.
- **Substitui:** `production-manager.ts › setManagerUser`

#### PATCH /production/collaborator/:id

Muda o perfil de produção do colaborador (GP-11).

- **Corpo:** `{ "role": "MANAGER" }`
- **Resposta:** `{ "id": "u-31", "role": "MANAGER" }`
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** "Colaborador não encontrado". `role` é `OPERATOR` ou `MANAGER`.
- **A tela:** select da aba Colaboradores, toast "Perfil alterado".
- **Substitui:** `production-manager.ts › setCollaboratorRole`

#### POST /production/task-type

Cria o tipo de tarefa já com a primeira etapa. `PUT /production/task-type/:id` edita `name`, `release` e `timeControl`, sem `managerId`.

- **Corpo:** `{ "name": "Impressão", "release": "WITH_BASE", "timeControl": true, "managerId": "mgr-impressao" }`
- **Resposta:** o tipo criado, com `steps: [ { "id": "st-…", "name": "Primeira etapa", "managerId": "mgr-impressao" } ]`.
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** "Informe o nome do tipo de tarefa". Nome único na empresa, porque é a chave que casa com o "tipo de tarefa" da etapa da composição (IP-23). Ao criar: gerenciador ativo, "Escolha o gerenciador da primeira etapa". `release` no enum (GP-13). Não aceita `color` (§4.14).
- **A tela:** diálogo de tipo de tarefa, recarrega `config`.
- **Substitui:** `production-manager.ts › saveTaskType`

#### PATCH /production/task-type/:id/toggle-status

Ativa ou inativa o tipo. O tipo inativo deixa de casar na geração de tarefas.

- **Corpo:** `{ "active": false }`
- **Resposta:** `{ "id": "tt-impressao", "active": false }`
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** "Tipo de tarefa não encontrado".
- **A tela:** botão de ativar/inativar na aba de tipos.
- **Substitui:** `production-manager.ts › setTaskTypeActive`

#### POST /production/task-type/:id/step

Acrescenta uma etapa no fim do tipo. `PATCH /production/task-type/:id/step/:stepId` edita, com o mesmo corpo. `DELETE /production/task-type/:id/step/:stepId` remove.

- **Corpo:** `{ "name": "Refile", "managerId": "mgr-producao" }`
- **Resposta:** o tipo com `steps` atualizado.
- **Permissão:** `production:production:edit` · `production_manager`. Remover etapa também é `:edit`, porque é linha do registro.
- **O servidor valida:** "Tipo de tarefa não encontrado", "Informe o nome da etapa". O gerenciador existe e está ativo (GP-14: as etapas podem estar em gerenciadores diferentes). No `DELETE`: "O tipo precisa de ao menos uma etapa". Também recusa quando há tarefa aberta parada nessa etapa: "Há tarefas abertas nesta etapa" (o mock não trata).
- **A tela:** diálogo de etapa e o ícone de remover. Recarrega `config`.
- **Substitui:** `production-manager.ts › saveTaskStep`, `production-manager.ts › removeTaskStep`

#### PUT /production/task-type/:id/step-order

Grava a sequência inteira das etapas (legado §9.2, "sequência").

- **Corpo:** `{ "stepIds": [ "st-b4c5", "st-x1y2" ] }`
- **Resposta:** o tipo com `steps` na nova ordem.
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** "Tipo de tarefa não encontrado". A lista tem exatamente as etapas do tipo.
- **A tela:** as setas sobe/desce montam a nova ordem e mandam a lista inteira. Também serve para arrastar.
- **Substitui:** `production-manager.ts › moveTaskStep`

#### POST /production/vehicle

Cadastra um veículo (VS-7). `PUT /production/vehicle/:id`, com o mesmo corpo, edita.

- **Corpo:** `{ "name": "Fiorino", "plate": "abc-1d23" }`
- **Resposta:** `{ "id": "veh-1", "name": "Fiorino", "plate": "ABC-1D23", "active": true }`
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** "Informe o nome do veículo". A placa vai sem espaços nas pontas e em maiúsculas.
- **A tela:** aba Veículos, toast "Veículo salvo".
- **Substitui:** `production-manager.ts › saveVehicle`

#### PATCH /production/vehicle/:id/toggle-status

Ativa ou inativa o veículo.

- **Corpo:** `{ "active": false }`
- **Resposta:** `{ "id": "veh-1", "active": false }`
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** "Veículo não encontrado".
- **A tela:** aba Veículos.
- **Substitui:** `production-manager.ts › setVehicleActive`

### Projeto nasce da venda aprovada

**Projeto** (`number`, `quotationId`, `client`, `seller`, `approvedAt`, `deliveryType`, `firstDue`, `due`, `status` `STANDBY` · `PRODUCTION` · `DONE` · `CANCELED`). **Tarefa** (`code` de 5 caracteres, `projectId`, `quotationItemId`, `itemName`, `itemImage`, `stageName`, `sector`, `taskTypeId`, `stepIndex`, `status`, `estimatedMinutes`, `setupMinutes`, `machine`, `baseTaskId`, `dependsOn[]`, `quantity`, `measureText`, `fields[]`, `consumption[]`, `note`, `schedule`, `assigneeId`, `pendency`, `releasedNext`, `timeEntries[]`, `corrections[]`, `attachments[]`, `history[]`, `completedBy`, `completedAt`, `vehicleId`, `km`). Leituras devolvem a **tarefa com os campos derivados** (`TaskView`), descrita em `GET /production/manager/:id/board`.

#### POST /sale/quotation/:id/approve (muda)

A aprovação passa a criar o projeto de produção quando a empresa tem a feature `production_manager`.

- **Corpo:** o de hoje, sem mudança.
- **Resposta:** a de hoje, mais `"productionProject": { "id": "pj-k9m2", "tasks": 7, "status": "STANDBY" }`. Vem `null` quando a empresa não tem a feature ou nenhum item tem composição.
- **Permissão:** a de hoje (`sale:quotation:edit` / aprovar). Criar o projeto não pede permissão de produção ao vendedor, porque é efeito da aprovação.
- **O servidor valida:** as recusas de hoje continuam. Não cria segundo projeto se a venda já tem um (reaprovação não duplica). Item sem composição não gera tarefa (GP-41). Se nenhum item tem composição, aprova normalmente e não cria projeto: o erro do mock "Nenhum item da venda tem composição: não há etapa a produzir" não trava a venda. Alterar ou cancelar venda em produção fica para o FULL (§12.3 / AB-6).
- **O servidor calcula:** cria o projeto em `STANDBY`. `number` vem do código da venda, `client`, `seller` e `deliveryType` da venda, e `firstDue = due` da data de entrega da venda (ou aprovação + 7 dias). Para cada item, pelo **retrato da composição guardado no item** (ORC-10, com as escolhas, extras e opcionais da venda, e a medida em mm), gera **uma tarefa por etapa** (PCP-4, FL-10, GP-16). Cada caixa de dentro de uma parte vira uma tarefa do seu setor (FL-10). A etapa sem linhas e sem preparo (opcional desmarcado) não vira tarefa. Os campos da tarefa:
  - `taskTypeId`: o tipo ativo cujo nome casa com o tipo de tarefa da etapa, sem diferenciar maiúsculas (IP-23). Sem tipo, cai no tipo padrão "Produção".
  - Tempos: `estimatedMinutes = arredonda(preparo + Σ quantidade das linhas em minutos)` (mão de obra + preparo, CP-15). `setupMinutes` é o preparo.
  - `machine`: o recurso da 1ª linha de máquina.
  - Consumo e conteúdo: `consumption` traz as linhas resolvidas, só recurso, quantidade e unidade, sem custo. `fields` são os campos da venda com nome ("Nº de letras: 6"). `note` é a observação de produção (MS-13), `itemImage` a imagem do item.
  - `measureText`: `"3 un · 0,9 × 1,2 m"`.
  - `dependsOn`: as etapas de que esta depende no fluxo da composição (FL-1, "depende de"), dentro do mesmo item, porque os itens correm em paralelo (§4.7). A regra do tipo ajusta a ligação com a base: `AFTER_BASE` espera a base, `WITH_BASE` corre junto com ela (GP-13).
  - `code`: 5 caracteres, único no projeto.
  - Status inicial `NOT_STARTED`.
- **A tela:** a tela do orçamento não muda (pode mostrar "Projeto de produção criado em stand-by" quando vier `productionProject`). Em Produção › Projetos, o projeto aparece na aba Stand-by. O botão "Projeto da venda aprovada (exemplo)" sai.
- **Substitui:** `production-manager.ts › createProjectFromSale`

#### GET /production/project

Os projetos de produção, por situação.

- **Resposta:** `{ "data": [ { "id": "pj-k9m2", "number": "1024-V1", "quotationId": "…", "client": "Supermercado Bom Preço", "seller": "Natihely", "approvedAt": "2026-10-05", "deliveryType": "Entrega na instalação", "firstDue": "2026-10-09", "due": "2026-10-09", "status": "PRODUCTION", "total": 5, "done": 1, "alerts": 2, "risk": true, "late": false } ], "page": 1, "lastPage": 1, "total": 12 }`. Na query: `status`, `search` (número ou cliente), `page`, `limit`.
- **Permissão:** `production:production:view` · `production_manager`.
- **O servidor valida:** `limit` ≤ 100 (SEG-2).
- **O servidor calcula:** `total` e `done` (tarefas `DONE`). `alerts` conta as tarefas com alerta. `risk` = alguma tarefa com `DELIVERY_RISK`. `late` = situação aberta e `due` antes de hoje (GP-18).
- **A tela:** a tabela de Produção › Projetos, com progresso, alertas, risco e atraso. A contagem das abas vem de `GET /production/project/quantity` → `{ "STANDBY": 2, "PRODUCTION": 7, "DONE": 30, "CANCELED": 1 }`.
- **Substitui:** `production-manager.ts › getProjects`

#### GET /production/project/:id

O projeto com todas as tarefas, para o detalhe e para a ficha de produção.

- **Resposta:** `{ "project": { …projeto }, "late": false, "risk": true, "tasks": [ { …TaskView } ] }`
- **Permissão:** `production:production:view` · `production_manager`.
- **O servidor valida:** "Projeto não encontrado". O operador com `onlyAssigned` recebe só as tarefas que pode ver, mais `hidden` com quantas ficaram de fora (GP-11).
- **A tela:** o detalhe agrupa as tarefas por item, mostra a faixa de alertas e abre o diálogo da tarefa. A ficha imprime itens, etapas ("SETOR – ETAPA"), consumo, campos e observação, sem valores (GP-19).
- **Substitui:** `production-manager.ts › getProject`

#### POST /production/project/:id/release

Libera a produção: o projeto sai de stand-by (GP-8). `POST /production/project/:id/finish` conclui, e `POST /production/project/:id/cancel` cancela.

- **Resposta:** `{ "id": "pj-k9m2", "status": "PRODUCTION", "autoDone": 1 }`
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** "Projeto não encontrado". `release` só sai de `STANDBY`. `finish` só com todas as tarefas `DONE` ou `CANCELED`: "Ainda há tarefas abertas neste projeto". `cancel` não vale para projeto `DONE` nem `CANCELED`.
- **O servidor calcula:** em `release`, as tarefas `NOT_STARTED` de tipo `release = DONE` nascem concluídas (`completedBy` "sistema", histórico "Nasceu concluída pela regra do tipo de tarefa", GP-13). Em `cancel`, fecha os apontamentos abertos e cancela as tarefas abertas (histórico "Cancelada com o projeto").
- **A tela:** botões "Liberar produção", "Concluir projeto" e "Cancelar projeto", com confirmação. Em erro, toast "Não foi possível atualizar".
- **Substitui:** `production-manager.ts › setProjectStatus`

#### PATCH /production/project/:id/delivery

Altera a data de entrega do projeto (GP-8).

- **Corpo:** `{ "due": "2026-10-12" }`
- **Resposta:** `{ "id": "pj-k9m2", "firstDue": "2026-10-09", "due": "2026-10-12", "risk": false }`
- **Permissão:** `production:production:edit` · `production_manager`.
- **O servidor valida:** "Projeto não encontrado", "Informe a nova data". Mantém `firstDue` e registra no histórico do projeto quem mudou, de quando para quando.
- **O servidor calcula:** os alertas da cadeia são recalculados com o novo `due` (§12.2).
- **A tela:** "Alterar entrega" no detalhe do projeto. Recarrega projeto e quadro.
- **Substitui:** `production-manager.ts › changeDelivery`

### Quadro, agenda e cadeia de alertas

**TaskView** = tarefa + `project` (o projeto), `taskType`, `step` (a etapa atual), `managerId`, `sector` (`{ id, name, icon, color }` do setor do gerenciador da etapa), `blocked`, `blockedBy`, `assignee`, `workers` (quem está com o relógio aberto nela), `actualMinutes`, `late` e `alert` (`{ kind, text }` ou `null`). **Regras que o servidor aplica em toda leitura** (SEG-1, §12.2, GP-42):

- **Bloqueio.** A dependência está satisfeita com a anterior `DONE`, `CANCELED` ou com `releasedNext`. `blocked` = (`NOT_STARTED` e dependência não satisfeita) ou projeto em `STANDBY`. `blockedBy` = nome da etapa que trava, ou "produção não liberada" (PR-2, FL-13).
- **Tempo e atraso.** `actualMinutes` = soma dos trechos fechados + o que corre nos abertos. `late` = tarefa aberta com `project.due` antes de hoje.
- **`alert`**, só para tarefa aberta de projeto `PRODUCTION`, nesta ordem:
  1. `OVERDUE`: o fim agendado (`date + start + minutes`) já passou.
  2. `LATE_PREDECESSOR`: uma dependência aberta está vencida ou tem alerta (recursivo).
  3. `DELIVERY_RISK`: o que falta no caminho mais longo daqui para a frente não cabe nos minutos de expediente até `due`. O que falta é `max(previsto − apontado, 0)` desta tarefa + o maior caminho das dependentes abertas. O expediente vem do calendário da empresa, com feriados (§4.8). Até existir calendário, 08:00–18:00 todos os dias, como o mock.
  4. `DELIVERY_RISK`: a tarefa está agendada para depois de `due`.

  **Nunca reagenda sozinho.** O alerta some quando a cadeia volta a caber.

#### GET /production/manager/:id/board

O quadro de um gerenciador: as tarefas cuja etapa atual está nele, já filtradas pelo que o usuário da sessão pode ver.

- **Resposta:** `{ "manager": { …gerenciador }, "viewer": { "collaboratorId": "u-31", "name": "Marcos", "manager": false }, "tasks": [ { "id": "tk-a1b2", "code": "C7E12", "stageName": "Impressão", "status": "IN_PROGRESS", "estimatedMinutes": 42, "setupMinutes": 10, "machine": "Plotter Roland", "actualMinutes": 25.3, "blocked": false, "blockedBy": null, "late": false, "alert": { "kind": "DELIVERY_RISK", "text": "O que falta daqui para a frente (180 min) não cabe até a entrega em 09/10/2026." }, "sector": { "id": "12", "name": "Impressão", "color": "#2563EB", "icon": "printer" }, "project": { "number": "1024-V1", "client": "…", "due": "2026-10-09" }, "assignee": { "id": "u-31", "name": "Marcos" }, "workers": [ … ], "timeEntries": [ … ], "attachments": [ … ], "history": [ … ], … } ], "hidden": 2, "collaborators": [ { "id": "u-31", "name": "Marcos", "role": "OPERATOR", "working": { "taskId": "tk-a1b2", "since": "2026-10-07T11:05:00Z" }, "onlyAssigned": true } ], "taskTypes": [ … ], "vehicles": [ … ] }`
- **Permissão:** `production:production:view` · `production_manager`.
- **O servidor valida:** "Gerenciador não encontrado". **Quem vê o quê (GP-11), sempre pela sessão:**
  - O gerente vê tudo.
  - O operador sem acesso ao gerenciador recebe 403 "Você não tem acesso a este gerenciador".
  - Com `onlyAssigned`, o operador vê só as tarefas em que é `assigneeId` ou está em `workers`. `hidden` diz quantas ficaram de fora.
- **O servidor calcula:** a TaskView de cada tarefa, de projetos `PRODUCTION`, em qualquer status. `viewer.manager` = `production:production:edit` ou perfil `MANAGER`. O colaborador é o usuário da sessão, não o casamento pelo e-mail.
- **A tela:** seis colunas pelos estados (GP-28), com filtros de pessoa, período e busca no cliente. No `DRAG_DROP`, a coluna Colaboradores com arrastar (GP-17). O cabeçalho mostra o intervalo (GP-20). `viewer` vira o padrão de "Quem faz" no diálogo.
- **Substitui:** `production-manager.ts › getManagerBoard`, `production-manager.ts › getViewer`

#### GET /production/agenda

A agenda viva de todos os gerenciadores e a ocupação dos veículos, num período.

- **Resposta:** `{ "scheduled": [ { …TaskView, "schedule": { "date": "2026-10-07", "start": "08:30", "minutes": 60 }, "occupies": 60 } ], "unscheduled": [ { …TaskView } ], "vehicles": [ { "id": "veh-1", "name": "Fiorino", "plate": "ABC-1D23" } ], "vehicleUsage": [ { "vehicleId": "veh-1", "date": "2026-10-08", "km": 84, "tasks": [ "tk-…", "tk-…" ], "conflict": true } ], "managers": [ … ] }`. Na query: `from` e `to` (`YYYY-MM-DD`).
- **Permissão:** `production:production:view` · `production_manager`.
- **O servidor valida:** `from` ≤ `to`, período de no máximo 92 dias. Mesma visibilidade do quadro (GP-11): o operador recebe só as tarefas dos gerenciadores a que tem acesso.
- **O servidor calcula:**
  - `scheduled`: as tarefas de projetos `PRODUCTION` agendadas no período, por data e início.
  - `unscheduled`: as abertas sem agenda.
  - `occupies` = preparo + `max(previsto − preparo, 0)`: **o preparo ocupa a máquina** (§4.14).
  - `vehicleUsage`: por veículo e dia, os km somados e `conflict` quando duas saídas se sobrepõem no horário (VS-7).
- **A tela:** as visões Agenda viva e Veículos do gerenciador. Os períodos hoje, semana e todas viram `from`/`to`.
- **Substitui:** `production-manager.ts › getAgenda`

#### PUT /production/task/:id/schedule

Agenda a tarefa ou tira da agenda (GP-35). Reagendar é sempre manual.

- **Corpo:** `{ "schedule": { "date": "2026-10-08", "start": "08:30", "minutes": 60 } }`. `{ "schedule": null }` tira da agenda.
- **Resposta:** `{ "message": "Agendou para 08/10/2026 às 08:30", "task": { …TaskView } }`
- **Permissão:** `production:production:view` · `production_manager`. A tarefa precisa estar visível ao usuário (GP-11).
- **O servidor valida:** "Tarefa não encontrada". `start` em `HH:mm`, `minutes` > 0. Não recusa conflito: devolve o `alert` recalculado. O intervalo do gerenciador (GP-20) entra no cálculo de sobreposição da mesma máquina.
- **A tela:** bloco Agenda do diálogo da tarefa. Recarrega quadro, agenda e projeto.
- **Substitui:** `production-manager.ts › scheduleTask`

#### PATCH /production/task/:id

Atribui a tarefa a alguém e reserva veículo e km. Os campos são parciais.

- **Corpo:** `{ "assigneeId": "u-31" }` ou `{ "vehicleId": "veh-1", "km": 84 }`. `null` tira a atribuição ou o veículo.
- **Resposta:** `{ "message": "Reservou Fiorino · 84 km", "task": { …TaskView } }`
- **Permissão:** `production:production:view` · `production_manager`. A tarefa precisa estar visível.
- **O servidor valida:** "Tarefa não encontrada". O colaborador é usuário ativo da empresa. O veículo é ativo e da empresa. `km` ≥ 0 (VS-7). Grava no histórico "Atribuiu a {nome}" / "Tirou a atribuição" / "Reservou {veículo} · {km} km" / "Tirou o veículo".
- **A tela:** "Quem faz" e "Saída com veículo" no diálogo da tarefa.
- **Substitui:** `production-manager.ts › assignTask`, `production-manager.ts › setTaskVehicle`

### Estado da tarefa (GP-28)

Seis estados: `NOT_STARTED` · `IN_PROGRESS` · `PAUSED` · `PENDING` · `DONE` · `CANCELED`. Cada ação grava `history` (quem e quando, o mais recente primeiro).

#### POST /production/task/:id/action

Aplica uma ação de estado à tarefa.

- **Corpo:** `{ "action": "START", "collaboratorId": "u-31" }`. `action` é `START` · `PAUSE` · `RESUME` · `FINISH` · `CANCEL` · `RESTART`. `collaboratorId` é opcional, só em `START`/`RESUME`, para ligar o relógio de quem faz.
- **Resposta:** `{ "message": "Foi para Refile", "task": { …TaskView } }`. As mensagens: "Iniciou a etapa", "Pausou a etapa", "Continuou a etapa", "Cancelou a etapa", "Reiniciou a etapa", "Foi para {etapa}", "Tarefa concluída".
- **Permissão:** `production:production:view` · `production_manager`. A tarefa precisa estar visível ao usuário (GP-11).
- **O servidor valida:** "Tarefa não encontrada". As transições (GP-28):
  - `START`: de `NOT_STARTED`.
  - `PAUSE`: de `IN_PROGRESS`.
  - `RESUME`: de `PAUSED` ou `PENDING`. Resolve a pendência, com histórico "Resolveu a pendência: …".
  - `FINISH` e `CANCEL`: de qualquer estado aberto.
  - `RESTART`: de `DONE` ou `CANCELED`.

  Fora disso: "Não dá para {ação} neste estado". `START` e `RESUME` com a tarefa bloqueada: "Esta etapa espera {blockedBy}" (PR-2).
- **O servidor calcula:**
  - `PAUSE`, `FINISH` e `CANCEL` fecham os trechos abertos.
  - `START` e `RESUME` com `collaboratorId` e `taskType.timeControl` abrem um trecho `CLOCK`, como `work/start`.
  - `FINISH` numa etapa do meio: `stepIndex + 1`, volta a `NOT_STARTED` e sem agenda. A tarefa muda de gerenciador (GP-14).
  - `FINISH` na última etapa: `DONE` e grava **`completedBy` e `completedAt` sempre** (GP-36). Libera as dependentes (PR-2, GP-13).
  - `RESTART`: volta a `NOT_STARTED`, limpa `completedBy`/`completedAt` e **mantém** os apontamentos. A correção do tempo é pelo gerente (GP-44).
- **A tela:** os botões do estado no diálogo (`actionsByStatus`). O toast mostra `message`. Recarrega quadro, contagens, agenda e projeto.
- **Substitui:** `production-manager.ts › actOnTask`

#### POST /production/task/:id/pendency

Registra uma pendência com descrição. A tarefa vai para `PENDING` e os relógios param (GP-28).

- **Corpo:** `{ "text": "Cliente não mandou a arte aprovada" }`
- **Resposta:** `{ "message": "Pendência registrada", "task": { …TaskView, "status": "PENDING", "pendency": { "text": "…", "at": "…", "by": "Marcos" } } }`
- **Permissão:** `production:production:view` · `production_manager`. A tarefa precisa estar visível.
- **O servidor valida:** "Tarefa não encontrada", "Descreva a pendência", "A tarefa já foi encerrada" (não aceita `DONE` nem `CANCELED`).
- **A tela:** modal "Descrição da pendência". `RESUME` resolve a pendência.
- **Substitui:** `production-manager.ts › addPendency`

#### POST /production/task/:id/release-next

Libera as etapas que dependem desta antes de concluí-la, com quem, quando e a quantidade opcional (FL-13, GP-37).

- **Corpo:** `{ "quantity": 10 }`. O campo é opcional: sem ele, ou com `null`, a liberação é simples.
- **Resposta:** `{ "message": "Acabamento liberada(s)", "task": { …TaskView, "releasedNext": { "at": "…", "by": "Marcos", "quantity": 10, "of": 50 } } }`
- **Permissão:** `production:production:view` · `production_manager`. A tarefa precisa estar visível.
- **O servidor valida:** "Tarefa não encontrada", "A tarefa já foi encerrada", "Nenhuma etapa espera por esta". Com quantidade: inteiro entre 1 e a quantidade da tarefa. Não libera duas vezes.
- **O servidor calcula:** `of` = quantidade da tarefa quando vem `quantity`. As dependentes deixam de ficar bloqueadas.
- **A tela:** "Liberar próxima etapa" no diálogo, com o campo de quantidade opcional ("10 de 50").
- **Substitui:** `production-manager.ts › releaseNext`

### Apontamento de tempo (GP-43, GP-44)

O apontamento é feito de **trechos por pessoa**: `timeEntries[] { id, collaboratorId, start, end, minutes, source CLOCK · DRAG · CORRECTION, note }`. O apontado da tarefa é a soma dos trechos. Uma pessoa tem no máximo um trecho aberto (`working`). A correção guarda `corrections[] { at, by, entryId, before, after, note }`.

#### POST /production/task/:id/work/start

Liga o relógio de um colaborador na tarefa: o Play & Stop, ou arrastar o colaborador para a tarefa no coletivo.

- **Corpo:** `{ "collaboratorId": "u-31", "source": "DRAG" }`. `source` é `CLOCK` (padrão) ou `DRAG`.
- **Resposta:** `{ "message": "Colaborador na tarefa: o relógio começou", "task": { …TaskView } }`
- **Permissão:** `production:production:view` · `production_manager`. O operador só liga o **próprio** relógio. O gerente liga o de qualquer um (no coletivo, quem arrasta costuma ser o líder). O colaborador precisa ter acesso ao gerenciador (GP-11).
- **O servidor valida:** "Tarefa ou colaborador não encontrado", "Esta etapa espera {blockedBy}", "A tarefa já foi encerrada". O tipo da tarefa precisa ter `timeControl` (o mock não confere).
- **O servidor calcula:** se a pessoa estava em outra tarefa, fecha aquele trecho antes (uma tarefa por pessoa). Abre o trecho e grava `working`. `assigneeId` fica com a pessoa quando estava vazio. `NOT_STARTED` ou `PAUSED` passam a `IN_PROGRESS`.
- **A tela:** soltar o colaborador no cartão (`DRAG_DROP`) e o botão de ligar o relógio no diálogo. Recarrega o quadro.
- **Substitui:** `production-manager.ts › startWork`

#### POST /production/task/:id/work/stop

Para o relógio de um colaborador. Não muda o estado da tarefa.

- **Corpo:** `{ "collaboratorId": "u-31" }`
- **Resposta:** `{ "message": "Relógio parado", "task": { …TaskView } }`
- **Permissão:** `production:production:view` · `production_manager`. O operador para o próprio relógio, o gerente para o de qualquer um.
- **O servidor valida:** não dá erro quando a pessoa não tem trecho aberto nesta tarefa.
- **O servidor calcula:** fecha o trecho (`minutes` com uma casa), limpa `working` e grava no histórico "Saiu da tarefa (relógio parado)".
- **A tela:** "Parar" no painel de colaboradores do quadro (o painel sabe a tarefa por `working.taskId`) e no diálogo.
- **Substitui:** `production-manager.ts › stopWork`

#### PUT /production/task/:id/time-entry/:entryId

Corrige um trecho de tempo: os minutos e a pessoa (GP-44).

- **Corpo:** `{ "minutes": 25, "collaboratorId": "u-31", "note": "esqueceu o relógio no almoço" }`
- **Resposta:** `{ "message": "Apontamento corrigido", "task": { …TaskView } }`
- **Permissão:** **só o gerente**. A tela usa `production:production:edit`. A regra pede permissão própria (GP-44): proposta `production:time_entry:edit`. Feature `production_manager`.
- **O servidor valida:** "Tarefa não encontrada", "Apontamento não encontrado", "Pare o relógio antes de corrigir" (trecho aberto), "Diga o motivo da correção", "O tempo não pode ser negativo".
- **O servidor calcula:** grava `source: CORRECTION` e `note`. Empilha em `corrections` o antes, o depois, quem e quando, e grava no histórico "Corrigiu o apontamento: X min → Y min (Nome). motivo". **A correção é visível a quem foi afetado**: o colaborador de antes e o de depois veem esse registro na tarefa, mesmo com `onlyAssigned` (GP-44).
- **A tela:** botão de corrigir em cada trecho de Apontamentos.
- **Substitui:** `production-manager.ts › correctTimeEntry`

#### POST /production/task/:id/time-entry

Lança tempo à mão para alguém (GP-44).

- **Corpo:** `{ "collaboratorId": "u-31", "minutes": 30, "note": "trabalhou sem ligar o relógio" }`
- **Resposta:** `{ "message": "Tempo lançado", "task": { …TaskView } }`
- **Permissão:** a mesma da correção (`production:production:edit` hoje, `production:time_entry:edit` proposta) · `production_manager`.
- **O servidor valida:** "Tarefa não encontrada", "Informe o tempo" (minutos ≤ 0), "Diga o motivo do lançamento". O colaborador é usuário ativo da empresa.
- **O servidor calcula:** o trecho termina agora e começa `minutes` antes, com `source: CORRECTION` e `note`. Também entra em `corrections`, com `before: null`, quem e quando, para que o histórico do gerente fique completo (o mock só grava no histórico).
- **A tela:** o mesmo formulário da correção ("novo lançamento").
- **Substitui:** `production-manager.ts › addTimeEntry`

### Anexos por etapa (GP-25, GP-26)

O anexo é da tarefa e da etapa: `attachments[] { id, name, kind ART · CUT · PHOTO · OTHER, versions[] { version, fileName, size, mime, uploadedBy, uploadedAt, current, url } }`. O arquivo vai para armazenamento de objetos, fora do banco. `url` é um **link assinado com prazo** (sugestão: 15 min), gerado a cada leitura, e nunca um endereço público (seguranca.md, GP-27). A cota de espaço (GP-27) fica fora deste contrato, com a BSP/AWS.

#### POST /production/task/:id/attachment

Cria um anexo com a primeira versão.

- **Corpo:** `multipart/form-data`: `name` ("Arte final"), `kind` (`ART`), `file`.
- **Resposta:** `{ "id": "at-l0k9", "name": "Arte final", "kind": "ART", "versions": [ { "version": 1, "fileName": "arte-v1.pdf", "size": 2400000, "mime": "application/pdf", "uploadedBy": "Natihely", "uploadedAt": "…", "current": true, "url": "https://…?X-Amz-Expires=900…" } ] }`
- **Permissão:** `production:production:view` · `production_manager`. A tarefa precisa estar visível.
- **O servidor valida:** "Tarefa não encontrada", "Escolha o arquivo", "Dê um nome ao anexo". Tamanho máximo por arquivo (a definir com a infraestrutura). Tipos aceitos: imagem, PDF, AI, CDR, TIFF, DXF, ZIP.
- **A tela:** formulário de anexo no diálogo, toast "Anexo guardado". A prévia usa `url` e deixa de usar `dataUrl`.
- **Substitui:** `production-manager.ts › addAttachment` (sem `attachmentId`)

#### POST /production/task/:id/attachment/:attachmentId/version

Sobe uma nova versão: ela fica como a válida, e as anteriores ficam preservadas (GP-26).

- **Corpo:** `multipart/form-data`: `file`.
- **Resposta:** o anexo com `versions`, em que a nova tem `version: n + 1` e `current: true`.
- **Permissão:** `production:production:view` · `production_manager`.
- **O servidor valida:** "Anexo não encontrado", "Escolha o arquivo".
- **A tela:** "Nova versão" no anexo.
- **Substitui:** `production-manager.ts › addAttachment` (com `attachmentId`)

#### PUT /production/task/:id/attachment/:attachmentId/current

Escolhe qual versão é a válida (GP-26).

- **Corpo:** `{ "version": 2 }`
- **Resposta:** o anexo com `versions`, em que só a escolhida tem `current: true`.
- **Permissão:** `production:production:view` · `production_manager`.
- **O servidor valida:** "Anexo não encontrado". A versão existe: "Versão não encontrada" (o mock não confere e pode deixar nenhuma válida). Grava no histórico quem trocou e quando.
- **A tela:** "Usar esta versão" na lista de versões.
- **Substitui:** `production-manager.ts › setCurrentVersion`

### Produtividade (GP-30, GP-32, GP-34)

#### GET /production/productivity

A produtividade pelo tempo vendido, por setor e por pessoa, só das tarefas finalizadas.

- **Resposta:** `{ "bySector": [ { "sector": { "id": "12", "name": "Impressão", "color": "#2563EB" }, "tasks": 4, "sold": 180, "worked": 165.5, "productivity": 108.8 } ], "people": [ { "collaboratorId": "u-31", "name": "Marcos", "tasks": 3, "sold": 120, "worked": 110, "productivity": 109.1 } ], "unsold": { "minutes": 95, "bySector": [ { "sectorId": "12", "minutes": 40 } ] } }`. Na query, opcionais: `from` e `to`, pela data de conclusão. Sem eles, o mês corrente.
- **Permissão:** `production:production:view` · feature `productivity_tracking`. `people` só com `production:productivity:view` (a tela usa `production:production:edit` como provisória). **Sem a permissão, o servidor omite `people`**, sem depender de flag do cliente (PCP-3, GP-11).
- **O servidor valida:** período de no máximo 366 dias.
- **O servidor calcula:**
  - Por setor: `sold` = Σ `estimatedMinutes` das tarefas `DONE` (GP-30, o tempo vendido, não o gasto). `worked` = Σ apontado. `productivity = arredonda1(sold ÷ worked × 100)` (%), ou `null` quando `worked` = 0.
  - Por pessoa: cada uma recebe `sold × (minutos dela ÷ minutos de todos na tarefa)`, a **divisão proporcional pelos trechos** (GP-32).
  - `unsold` = tempo sem venda, fora da produtividade (GP-34). Hoje é o apontado em tarefas canceladas. O lançamento próprio de manutenção, limpeza e refação (GP-38) ainda não tem tela.
- **A tela:** Produção › Produtividade, tabela por setor e, para quem tem a permissão, por pessoa. O front deixa de mandar `perPerson`.
- **Substitui:** `production-manager.ts › getProductivity`

Sem endpoint (sem chamador): `production-manager.ts › getTask` (o diálogo usa a TaskView do quadro ou do projeto, e toda ação devolve a TaskView atualizada).

## 4. Base de custos, patrimônios e precificação (PRO)

**Ordem dentro do módulo.** (1) As features de plano `cost_base` e `pricing_center` (ALT-14) e o campo `nature` no setor (BC-7): sem eles nenhuma tela do módulo abre nem calcula. (2) **Patrimônios e grupos**: destravam três telas e alimentam depreciação e custos de bem em todo o resto (Por setor, Resumo, rateio entre equipamentos, Máquinas na Precificação, máquina na composição). (3) **Folha "muda"** (`/financial/payroll-setup` com acréscimo, desconto e encargos): é dela que sai o custo de mão de obra do setor (ALT-19). (4) **Base de custos**: despesas administrativas → Por setor e Resumo → Distribuição e rateio entre equipamentos → Mão de obra → Patrimônios (totais) → Comparativo por último, porque depende do realizado do financeiro e do volume vendido. (5) **Precificação**, que só lê custos prontos dos passos 2 a 4.

**Regras que valem para todo o módulo.**
- **SEG-1:** nenhum endpoint aceita custo vindo do front. Depreciação, custo mensal de custo do bem, custo do setor, rateios, custo-hora, markup, preço sugerido, margem e encargos da folha saem calculados pelo servidor. Onde a tela simula (modal de preço, barras de rateio, carga horária), ela recebe só os coeficientes já resolvidos daquele item, e o servidor **recalcula e revalida ao salvar**. O mock tem dados soltos que hoje não batem entre si (despesa administrativa fixa em 875.099 no Por setor, `directCost` à parte, preço da hora em dois lugares): no servidor, cada número tem uma fonte só.
- **SEG-4 (auditoria):** o servidor registra **usuário, data, rota e volume** em todo `GET` de `/cost-base/*`, `/pricing/*`, `/asset/:id` e `/asset` (as telas de método), e alerta o administrador da empresa quando uma conta percorre essas telas em sequência ou em volume fora do normal. Toda escrita que muda custo ou preço (critério da conta, distribuição, rateio, carga horária, parâmetros, preço, custo e configuração do bem, encargos da folha) fica no histórico com **antes, depois, quem e quando**. Nos blocos abaixo, "auditado" quer dizer isso.
- **SEG-6:** `cost:base:*` e `cost:pricing:*` são permissões de método: não vêm liberadas por padrão em perfis operacionais. A configuração produtiva do patrimônio é método e fica sob `cost:base`. Nenhum endpoint de orçamento, produção ou ficha devolve custo deste módulo a quem não tem essas permissões (ORC-7).
- **Valores:** Base de custos, Precificação e Patrimônios exigem também `values:values:view` (as páginas usam `requireAll`). Em `/cost-base/*` e `/pricing/*` tudo é valor: sem a permissão, **403**. Em `/asset` o servidor **omite** os campos de valor (aquisição, residual, depreciação, custos, custo e preço das configurações) e devolve o resto.
- **Mês de referência:** todas as respostas de custo trazem `referenceMonth` (`AAAA-MM`), o último mês **completo** (DC-17). Quando um mês fecha, as médias e tudo o que depende delas são recalculados pelo servidor, sem ação do usuário.
- **Unidades:** dinheiro em centavos. Percentuais da Base de custos e de Patrimônios em percentual com até duas casas (`12.5` = 12,5 %); o rateio manual entre equipamentos aceita mais casas (BC-9). Percentuais da Precificação em **décimos de ponto** (`60` = 6,0 %). Margens (`margin`, `differencePercent`) em % com uma casa (`72.5`).

### Features de plano e setor

ALT-14: a sessão (`company.plan.features`, montada em `src/lib/auth.ts`) passa a trazer `cost_base` (PRO) e `pricing_center` (PRO), associadas ao plano. O servidor confere a feature em cada rota deste módulo: `cost_base` em `/cost-base/*`, `/asset/*` e nas mudanças da folha que calculam encargos; `pricing_center` em `/pricing/*`. Sem a feature, 403 com "Recurso disponível no plano PRO". Quando as chaves chegarem, o front apaga o bloco de `NEXT_PUBLIC_DEV_FEATURES` em `src/hooks/usePlanFeatures.ts`.

#### PATCH /sector/:id (muda)

Acrescenta ao setor a natureza (BC-7) e o critério do rateio entre os equipamentos (BC-3, BC-3.1, BC-4), com os nomes já combinados no backend-pendente.

- **Corpo:** `{ "nature": "PRODUCTIVE" }` (também aceito no `POST /sector`)
- **Resposta:** o setor com `{ "nature": "PRODUCTIVE", "allocationCriterion": "ACQUISITION_VALUE", "allocationPercentages": null, "allocationPreviousCriterion": null, … }`
- **Permissão:** `company_settings:sectors:edit` (criar: `:create`).
- **O servidor valida:** `nature` é `ADMINISTRATIVE` ou `PRODUCTIVE`; padrão `PRODUCTIVE` (BC-7). `allocationCriterion` nasce `ACQUISITION_VALUE` (regra base, BC-3) e **não** é editável por aqui: muda só por `PUT /cost-base/sector/:id/allocation`. Ao passar um setor para `ADMINISTRATIVE`, zera o percentual que ele recebia na Distribuição e o critério de rateio (todo o custo dele vai para o total administrativo, BC-7).
- **A tela:** o cadastro de setores ganha o campo; a Base de custos lê `nature` em todas as abas.

### Base de custos — Despesas administrativas

Cada conta é uma conta do plano de contas (`/financial/nature`) marcada como despesa administrativa, com `criterion` e `manualValue` guardados por empresa. Conta ligada a custo de patrimônio não entra aqui (P-17). A lista é plana, sem grupo (decisão de 22/09/2026).

#### GET /cost-base/admin-expense

Lista as contas administrativas com o último mês, as médias e o custo mensal de referência pelo critério escolhido.

- **Resposta:** `{ "referenceMonth": "2026-08", "data": [ { "id": "1", "name": "Aluguel", "chartAccount": "Despesas administrativas", "lastMonth": 880000, "avg3": 873333, "avg6": 866667, "avg12": 870000, "criterion": "AVG_6", "manualValue": null, "referenceValue": 866667 }, … ], "page": 1, "lastPage": 1, "total": 12 }`
- **Permissão:** `cost:base:view` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** filtros `criterion` e `search` (nome ou conta do plano) na query; `limit` máximo 100 (SEG-2) — a base tem poucas dezenas de contas e cabe numa página. Auditado (SEG-4).
- **O servidor calcula:** `lastMonth` e `avgN` = média do **realizado** da conta no financeiro nos últimos N meses completos (`null` quando não há N meses de histórico); `referenceValue` = o valor do critério (`MANUAL` → `manualValue`) (DC-17, BC-T5, BC-T6).
- **A tela:** tabela de Despesas administrativas com a média escolhida em destaque e "-" onde é `null`; mês de referência no cabeçalho. Não envia mais `groupId` nem lê `groups` (a tela já não usa).
- **Substitui:** `cost-base.ts › getAdminExpenses`

#### GET /cost-base/admin-expense/totals

Totais dos cartões da aba.

- **Resposta:** `{ "total": 12, "byAverage": 11, "manual": 1, "referenceValue": 1413767 }`
- **Permissão:** `cost:base:view` + `values:values:view`; feature `cost_base`.
- **O servidor calcula:** `byAverage` = contas com critério ≠ `MANUAL`; `referenceValue` = Σ dos `referenceValue` (nulo conta zero). É o **mesmo** número que entra como despesa administrativa no Por setor e no Resumo (descontado o que for rateado por item, quando a BC-8 existir).
- **A tela:** cartões; `total > 0` decide entre lista e estado vazio.
- **Substitui:** `cost-base.ts › getAdminExpensesTotals`

#### PATCH /cost-base/admin-expense/:id

Troca o critério da conta (e o valor, no manual). Grava na hora, sem "Salvar alterações" (DC-17).

- **Corpo:** `{ "criterion": "MANUAL", "manualValue": 900000 }`
- **Resposta:** a conta, no formato da listagem, com `referenceValue` recalculado.
- **Permissão:** `cost:base:edit` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** conta da empresa e administrativa ("Conta não encontrada"); `criterion` em `LAST_MONTH · AVG_3 · AVG_6 · AVG_12 · MANUAL`; critério de média sem histórico → "Esta conta ainda não tem histórico para este critério"; `MANUAL` exige `manualValue > 0` → "Informe o valor mensal desta conta" (hoje só o zod do front confere); fora do manual, `manualValue` é gravado `null`. Auditado.
- **A tela:** toast "Critério atualizado"; invalida a lista, os totais e também o Resumo e o Por setor (que dependem do valor).
- **Substitui:** `cost-base.ts › updateAdminExpenseCriterion`

### Base de custos — Por setor e Resumo

O custo próprio de cada setor soma quatro origens, cada uma vinda do seu cadastro (D3 §1, a edição fica na origem): `LABOR` = custo dos colaboradores do setor na folha (ALT-19); `DEPRECIATION` = depreciação dos bens do setor; `ASSETS` = custos fixos mensais dos bens (o custo variável por unidade não entra no custo do setor, §6.1); `OTHER` = despesas administrativas (só setores administrativos) e lançamentos diretos.

#### GET /cost-base/sector

Custo de cada setor por origem, o administrativo recebido e o critério de rateio interno.

- **Resposta:** `{ "referenceMonth": "2026-08", "isDistributing": false, "sectors": [ { "id": "impressao", "name": "Impressão", "nature": "PRODUCTIVE", "labor": null, "assets": 41667, "depreciation": 141750, "other": null, "ownCost": 183417, "receivedCost": null, "totalCost": 183417, "allocationCriterion": "ACTIVITY_TIME", "items": [ { "id": "imp-1", "name": "Impressora Solvente", "origin": "DEPRECIATION", "detail": "Depreciação mensal", "value": 64167 } ] }, … ] }`
- **Permissão:** `cost:base:view` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** só setores da empresa; auditado (SEG-4).
- **O servidor calcula:** cada origem = Σ dos itens dela (`null` sem lançamento, nunca 0, DC-15); `ownCost` = Σ itens; `receivedCost` = `round(totalAdministrativo × percentage / 100)` só em produtivo com % > 0; `totalCost` = próprio + recebido; `isDistributing` = algum setor recebe; `allocationCriterion` = o critério gravado no setor (`ACQUISITION_VALUE · ACTIVITY_TIME · MANUAL`), não mais fixo no código (BC-4).
- **A tela:** duas tabelas (produtivos e administrativos), com a expansão por item; "Rateio interno por …" e, no manual, "· não se atualiza sozinho" (BC-3.1).
- **Substitui:** `cost-base.ts › getSectorCosts`

#### GET /cost-base/summary

Consolida o custo mensal de referência da empresa para a aba Resumo.

- **Resposta:** `{ "referenceMonth": "2026-08", "total": 3220432, "byOrigin": { "adminExpenses": 885599, "labor": 1964833, "assets": 102167, "depreciation": 267833 }, "productiveCost": 1121333, "administrativeCost": 2099099, "distributedCost": 0, "bySector": [ { "id": "administracao", "name": "Administração", "value": 1619099 }, … ] }`
- **Permissão:** `cost:base:view` + `values:values:view`; feature `cost_base`.
- **O servidor calcula:** a partir do mesmo cálculo do `GET /cost-base/sector`: `byOrigin` = Σ de cada origem; `productiveCost`/`administrativeCost` = Σ `ownCost` por natureza; `total` = os dois; `distributedCost` = Σ do recebido; `bySector` = setores com custo, do maior para o menor. Auditado.
- **A tela:** cartões por origem, gráfico por setor e o bloco produtivo × administrativo.
- **Substitui:** `cost-base.ts › getCostSummary`

### Base de custos — Distribuição do administrativo

Os setores administrativos formam um total único (BC-7); cada produtivo tem o percentual que recebe desse total. A distribuição é opcional, parcial e seletiva (BC-5).

#### GET /cost-base/distribution

Setores com natureza, percentual recebido e custo direto, junto com os totais (a tela lê os dois sempre juntos).

- **Resposta:** `{ "referenceMonth": "2026-08", "sectors": [ { "id": "administracao", "name": "Administração", "nature": "ADMINISTRATIVE", "percentage": 0, "directCost": 1619099 }, { "id": "impressao", "name": "Impressão", "nature": "PRODUCTIVE", "percentage": 12.5, "directCost": 183417 }, … ], "totals": { "administrativeCost": 2099099, "distributedCost": 262387, "notDistributedCost": 1836712, "receivingSectors": 1 } }`
- **Permissão:** `cost:base:view` + `values:values:view`; feature `cost_base`.
- **O servidor calcula:** `directCost` = o `ownCost` do setor (o mesmo do Por setor, não um número à parte); `administrativeCost` = Σ `directCost` dos administrativos; `distributedCost` = Σ `round(adm × % / 100)` dos produtivos; `notDistributedCost` = a diferença; `receivingSectors` = produtivos com % > 0. Auditado.
- **A tela:** inicia as barras com `percentage`; o badge "Passou / Faltam X % · R$" é simulação local com os mesmos números, revalidada no `PUT`.
- **Substitui:** `cost-base.ts › getDistribution`, `cost-base.ts › getDistributionTotals`

#### PUT /cost-base/distribution

Grava o percentual que cada setor produtivo recebe (substitui a distribuição inteira).

- **Corpo:** `{ "percentages": [ { "id": "impressao", "percentage": 12.5 }, { "id": "producao", "percentage": 40 } ] }`
- **Resposta:** o mesmo corpo do `GET /cost-base/distribution`, já recalculado.
- **Permissão:** `cost:base:edit` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** cada `id` é setor **produtivo** da empresa (administrativo ou desconhecido → 400 "Só setor produtivo recebe distribuição"; hoje o mock grava sem conferir); `percentage` entre 0 e 100, até duas casas (BC-9); soma conferida **pelo valor**, com tolerância de 1 centavo: Σ `round(adm × p / 100)` ≤ adm + 1 (com adm = 0, Σ p ≤ 100) → "A soma dos setores produtivos não pode passar de 100%." (BC-5, design.md §6.8). Setor produtivo ausente do corpo fica com 0. Auditado.
- **O servidor calcula:** o recebido de cada setor, que muda o Por setor, o Resumo, a Mão de obra e o rateio entre equipamentos.
- **A tela:** toast "Distribuição salva"; invalida também `sector-costs`, `cost-summary`, `labor-sectors` e o rateio entre equipamentos (hoje esquece).
- **Substitui:** `cost-base.ts › updateDistribution`

### Base de custos — Rateio entre os equipamentos do setor (BC-3, BC-3.1, BC-4)

Construído no front em 07/10/2026 (branch `rateio-manual-2026-10-07`). Campos no setor: `allocationCriterion` (`ACQUISITION_VALUE` · `ACTIVITY_TIME` · `MANUAL`, padrão `ACQUISITION_VALUE`), `allocationPercentages` (`[{ assetId, percentage }]`, só no manual) e `allocationPreviousCriterion` (o automático de onde o manual nasceu). Entram no rateio só os patrimônios **detalhados e ativos** do setor (P-15, P-16). Rotas e campos como em `analise/backend-pendente.md` ("Base de custos: rateio entre os equipamentos do setor").

#### GET /cost-base/sector/allocation

Setores produtivos com equipamento detalhado, com o critério em uso, o custo a repartir e o que cada critério daria por equipamento.

- **Resposta:** `{ "data": [ { "sectorId": "impressao", "sectorName": "Impressão", "criterion": "ACTIVITY_TIME", "previousCriterion": null, "pool": 7000, "equipment": [ { "id": "sublimatica", "name": "Impressora Sublimática", "acquisitionValue": 4000000, "activityHours": 164, "ownCost": 43333, "shares": { "ACQUISITION_VALUE": 20.94, "ACTIVITY_TIME": 35.2, "MANUAL": null }, "share": 35.2, "monthlyCost": 45797, "hourCost": 279 }, … ], "missingTime": ["Plotter de Recorte"] }, … ] }`
- **Permissão:** `cost:base:view` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** só setores `PRODUCTIVE` da empresa com ao menos um patrimônio detalhado e ativo. Auditado (SEG-4).
- **O servidor calcula:** `activityHours` = Σ (tempo por unidade em min × produtividade de cada configuração) ÷ 60 (BC-2); `ownCost` = depreciação + Σ custo mensal dos custos do bem; `pool` = custo do setor que **não** é de equipamento detalhado (bens simplificados, lançamentos diretos, administrativo recebido); `shares` = percentual de cada critério com duas casas, fechando 100 (a sobra do arredondamento vai para o maior); `share` = o do critério em uso; tempo de atividade sem nenhum tempo no setor cai no valor de aquisição (ORG-33); `monthlyCost` = `ownCost + round(pool × share / 100)`; `hourCost` = `monthlyCost ÷ activityHours` (null sem tempo); `missingTime` = bens sem tempo informado. **É este custo que a Precificação › Máquinas e a linha de máquina da composição leem**; o custo da configuração produtiva = parte do equipamento pelo tempo de atividade ÷ produtividade (SEG-1).
- **A tela:** cartão "Rateio entre os equipamentos do setor" na aba Distribuição; o diálogo mostra os critérios lado a lado e simula custo no mês e custo-hora com estes números.
- **Substitui:** `sector-allocation.ts › getSectorAllocations` (branch rateio-manual-2026-10-07)

#### PUT /cost-base/sector/:id/allocation

Troca o critério do rateio do setor e, no manual, grava o percentual de cada equipamento.

- **Corpo:** `{ "criterion": "MANUAL", "percentages": [ { "assetId": "sublimatica", "percentage": 35.2 }, { "assetId": "solvente", "percentage": 64.8 } ] }` (fora do manual, só `criterion`)
- **Resposta:** o setor no formato de um item de `GET /cost-base/sector/allocation`, recalculado.
- **Permissão:** `cost:base:edit` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** setor da empresa ("Setor não encontrado"); só produtivo ("Só setor produtivo tem rateio entre equipamentos"); com equipamento detalhado ativo ("Este setor não tem equipamento detalhado para ratear"); no manual, um percentual para **cada** equipamento detalhado e ativo do setor e nenhum de fora ("Informe o percentual de <bem>"), entre 0 e 100 ("O percentual de <bem> precisa ficar entre 0 e 100%"), aceitando mais de duas casas; fechamento **pelo valor**, `|Σ round(pool × p / 100) − pool| ≤ 1` centavo (com `pool` = 0, Σ p = 100) → "A soma dos equipamentos precisa fechar 100%" (BC-3.1, BC-9). Ao entrar no manual, grava `allocationPreviousCriterion` com o critério automático que estava em uso (se já era manual, mantém o anterior); fora do manual, limpa `allocationPercentages` e `allocationPreviousCriterion`. Auditado.
- **O servidor calcula:** o custo de cada equipamento e de cada configuração produtiva, e propaga para Precificação, composição e patrimônio. No manual o rateio **não se atualiza sozinho**: quando entra ou sai um bem detalhado do setor, o novo fica com 0 % e o setor passa a sinalizar `allocationOutdated: true` até a empresa salvar de novo.
- **A tela:** toast "Rateio do setor salvo" e invalida tudo (a tela já faz `invalidateQueries()`). No front o item do corpo chama-se `id`; ao ligar, envia `assetId`.
- **Substitui:** `sector-allocation.ts › updateSectorAllocation` (branch rateio-manual-2026-10-07)

### Base de custos — Mão de obra (custo-hora, F-11)

A carga do setor é a soma das horas informadas por colaborador (F-11). Guardar por empresa: `employeeId`, `sectorId` (o do cadastro do colaborador, F-2) e `hours`.

#### GET /cost-base/labor

Custo-hora e margem de cada setor produtivo, com as horas por colaborador.

- **Resposta:** `{ "referenceMonth": "2026-08", "data": [ { "id": "producao", "name": "Produção", "distributedCost": 405750, "hours": 246, "costPerHour": 1649, "salePrice": 6000, "margin": 72.5, "collaborators": [ { "id": "joao", "name": "João", "role": "Aplicação", "hours": 100 }, { "id": "marcos", "name": "Marcos", "role": "Gerente de produção", "hours": 146 } ] }, … ] }`
- **Permissão:** `cost:base:view` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** colaboradores ativos do setor (`/employee`); auditado (SEG-4).
- **O servidor calcula:** `distributedCost` = `totalCost` do setor (próprio + recebido); `hours` = Σ horas (null se 0); `costPerHour` = `round(distributedCost / hours)`; `salePrice` = o preço praticado da hora no grupo `labor` da Precificação (uma fonte só; hoje o mock tem uma tabela à parte); `margin` = margem atual pela mesma regra da Precificação (PR-3).
- **A tela:** tabela da aba Mão de obra (margem negativa em vermelho, "-" sem dado); o lápis de preço abre o modal de precificação do grupo `labor`.
- **Substitui:** `cost-base.ts › getLaborSectors`

#### PUT /cost-base/labor/:sectorId/hours

Grava a carga horária de cada colaborador do setor.

- **Corpo:** `{ "hours": [ { "id": "joao", "hours": 100 }, { "id": "marcos", "hours": 146.5 } ] }`
- **Resposta:** o setor no formato de um item de `GET /cost-base/labor`, recalculado.
- **Permissão:** `cost:base:edit` + `values:values:view`; feature `cost_base`. **A tela não tem gate de edição no WorkloadModal**: o servidor recusa sem `:edit` (e o front passa a esconder o salvar).
- **O servidor valida:** setor produtivo da empresa com colaboradores ("Setor sem colaboradores"); cada `id` é colaborador ativo **deste** setor (desconhecido → 400, hoje o mock ignora); `hours` ≥ 0, arredondado ao minuto (`round(h × 60) / 60`, design.md §6.8). Auditado.
- **O servidor calcula:** o custo-hora do setor e, em cadeia, o custo da hora na Precificação.
- **A tela:** toast "Carga horária salva"; invalida `labor-sectors` e a Precificação. A pré-visualização do custo-hora no modal é simulação com `distributedCost`, já recebido.
- **Substitui:** `cost-base.ts › updateLaborHours`

### Base de custos — Patrimônios e Comparativo

A aba Patrimônios da Base de custos lê o **mesmo** cadastro de `/asset` (P-23): a lista usa `GET /asset` e as contagens `GET /asset/quantity` (seção Patrimônios); aqui fica só o total do topo.

#### GET /cost-base/depreciation

Totais de depreciação dos patrimônios ativos (fora os inativos).

- **Resposta:** `{ "referenceMonth": "2026-08", "invested": 38600000, "depreciated": 9120345, "remaining": 18899655, "monthlyDepreciation": 194167, "activeAssets": 7 }`
- **Permissão:** `cost:base:view` + `values:values:view`; feature `cost_base`.
- **O servidor calcula:** sobre os bens ≠ `INACTIVE`: Σ `acquisitionValue`, Σ `depreciatedValue`, Σ `remainingValue`, Σ `monthlyDepreciation` (fórmulas no `GET /asset`). Auditado.
- **A tela:** cartões da aba Patrimônios; `activeAssets > 0` decide o estado vazio.
- **Substitui:** `cost-base.ts › getDepreciationTotals`

#### GET /cost-base/comparison

Previsto × realizado por conta do plano de contas que não é despesa administrativa, no período (§10).

- **Resposta:** `{ "period": "12", "coverage": { "total": 5, "withEstimate": 4, "withoutEstimate": 1 }, "data": [ { "id": "1", "chartAccount": "02.01.03.03", "name": "Manutenção de máquina", "estimated": 501972, "actual": 936000, "difference": -434028, "differencePercent": -86.5, "sources": [ { "id": "1-1", "name": "Impressora Solvente", "detail": "Manutenção — a cada 6 meses", "value": 500004 } ] }, … ], "page": 1, "lastPage": 1, "total": 5 }`
- **Permissão:** `cost:base:view` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** `period` em `1 · 3 · 6 · 12` (padrão 12, últimos meses completos); `status` em `todas · com-previsao · sem-previsao`; `limit` ≤ 100. Auditado.
- **O servidor calcula:** `estimated` = Σ das fontes, cada uma = estimativa unitária do cadastro × volume do período (custo do bem por mês × meses; R$/km × km; R$/m² × m² vendidos; custo financeiro × recebido; material estimado das composições vendidas); `actual` = Σ dos lançamentos do financeiro na conta no período; `difference` = previsto − realizado; `differencePercent` = `round1(difference / estimated × 100)`; `coverage` conta todas as contas, sem o filtro de status. Depreciação não entra (ORG-5).
- **A tela:** abas de período e situação, cobertura e tabela com as fontes. Na resposta, a lista sai em `data` (no mock é `accounts`).
- **Substitui:** `cost-base.ts › getCostComparison`

### Patrimônios

`Asset`: `name`, `imageUrl`, `kind` (`MACHINES · FURNITURE · VEHICLES`, só agrupa a lista, P-29), `sectorId`, `groupId`, `detailed` (P-15), `unit` (`HR · M2 · M · KM · UN · KG · LT`; `null` no simplificado), `monthlyProductivity`, `acquisitionDate`, `acquisitionValue`, `usefulLifeMonths`, `residualPercent`, `status` (`DEPRECIATING · REVIEW_NEEDED · DEPRECIATED · INCONSISTENT · INACTIVE`), mais `costs[]`, `setups[]` e `processes[]` (leitura, P-18). Patrimônio é **inativado, nunca excluído**. Na resposta o setor vem como `sector` (nome) e `sectorId`; o front deixa de usar a lista fixa de setores do `Assets.tsx` e passa a ler `/sector`.

#### GET /asset

Lista os patrimônios, com a depreciação já calculada; serve ao cadastro e à aba Patrimônios da Base de custos.

- **Resposta:** `{ "data": [ { "id": "sublimatica", "name": "Impressora Sublimática", "imageUrl": "https://…", "kind": "MACHINES", "sector": "Impressão", "sectorId": "…", "groupId": null, "detailed": true, "unit": "M2", "monthlyProductivity": 164, "acquisitionDate": "2022-05-27", "acquisitionValue": 4000000, "usefulLifeMonths": 120, "residualPercent": 30, "residualValue": 1200000, "monthlyDepreciation": 23333, "depreciableValue": 2800000, "depreciatedValue": 1213316, "remainingValue": 1586684, "elapsedMonths": 52, "status": "DEPRECIATING" }, … ], "page": 1, "lastPage": 1, "total": 8 }`
- **Permissão:** `cost:base:view`; feature `cost_base`. Sem `values:values:view`, omite os campos de valor.
- **O servidor valida:** filtros `status` — `ativos` (tudo menos `INACTIVE`, o cadastro), `em-depreciacao` (`DEPRECIATING` + `DEPRECIATED`, a aba "Ativos" da Base), `em-revisao`, `inconsistencias`, `inativos` —, `sectorId`, `kind`, `search`; `limit` ≤ 100 (SEG-2). Auditado (SEG-4).
- **O servidor calcula:** `residualValue` = `round(acquisitionValue × residualPercent / 100)`; `monthlyDepreciation` = `round((acquisitionValue − residualValue) / usefulLifeMonths)` (`null` sem vida útil ou residual — "não calculada", nunca zero, P-12); `depreciatedValue` = `min(monthlyDepreciation × elapsedMonths, depreciableValue)`; `remainingValue` = depreciável − depreciado; `status` pela P-9/P-26: `REVIEW_NEEDED` ao fim da vida útil, `INCONSISTENT` quando residual ≥ aquisição, detalhado sem produtividade, detalhado sem tempo por unidade em setor que rateia por tempo, ou vida útil vencida sem revisão.
- **A tela:** lista do cadastro (com foto e grupo) e tabela da aba Patrimônios da Base. A aba da Base lê `kind` onde hoje lê `group` e a aba "Ativos" envia `status=em-depreciacao` (no mock, `ativos` tem os dois sentidos).
- **Substitui:** `assets.ts › getAssets`, `cost-base.ts › getDepreciationAssets`

#### GET /asset/quantity

Contagem por aba da situação.

- **Resposta:** `{ "em-depreciacao": 5, "em-revisao": 1, "inconsistencias": 1, "inativos": 1 }`
- **Permissão:** `cost:base:view`; feature `cost_base`.
- **A tela:** badges das abas da aba Patrimônios da Base (e do cadastro, quando ganhar as mesmas abas).
- **Substitui:** `cost-base.ts › getDepreciationCounts`

#### GET /asset/:id

Detalhe do bem com custos, configurações produtivas e processos que o usam.

- **Resposta:** o item da listagem mais `{ "costs": [ { "id": "c2", "name": "Cabeça de impressão", "nature": "FIXED", "unitCost": 480000, "yieldAmount": 24, "yieldUnit": "MONTH", "financialNatureId": "…", "chartAccount": "02.01.03.03 — Manutenção de máquina", "lastOccurrence": "2025-11-03", "monthlyCost": 20000, "setupId": null } ], "setups": [ { "id": "s1", "name": "Standart", "abbreviation": "std", "unit": "M2", "timePerUnit": 60, "monthlyProductivity": 164, "activityHours": 164, "unitCost": 152, "salePrice": 447 } ], "processes": [ { "id": "p1", "name": "Impressão sublimática", "taskType": "Impressão" } ] }`
- **Permissão:** `cost:base:view`; feature `cost_base`. Sem `values:values:view`, omite `costs`, `unitCost` e `salePrice`.
- **O servidor valida:** bem da empresa ("Patrimônio não encontrado"). Auditado (SEG-4): é tela de método (SEG-6).
- **O servidor calcula:** `monthlyCost` de cada custo (fórmula no `POST /asset/:id/cost`); `activityHours` da configuração = `timePerUnit × monthlyProductivity ÷ 60`; `unitCost` da configuração = (parte do custo do equipamento no mês pelo tempo de atividade, já com o rateio do setor) ÷ `monthlyProductivity` + custos variáveis por unidade (P-19, §6.3); `salePrice` = preço praticado na Precificação › Máquinas.
- **A tela:** página do bem (situação, depreciação, custos, configurações, "Usado nos processos").
- **Substitui:** `assets.ts › getAsset`

#### POST /asset

Cadastro rápido do patrimônio (P-12, P-24); simplificado ou detalhado (P-15).

- **Corpo:** `{ "name": "Impressora UV", "imageUrl": "https://…", "kind": "MACHINES", "sectorId": "…", "detailed": true, "unit": "M2", "monthlyProductivity": 200, "acquisitionDate": "2026-09-10", "acquisitionValue": 6000000, "groupId": null }`
- **Resposta:** o `Asset` criado (formato do `GET /asset/:id`), com `id`.
- **Permissão:** `cost:base:create` (a tela usa `cost:base:edit` no botão "novo"; aceitar as duas até a matriz ALT-6) + `values:values:view`; feature `cost_base`.
- **O servidor valida:** `name` obrigatório ("Informe o nome do bem"); `sectorId` da empresa; `acquisitionValue` ≥ 0; detalhado exige `unit`; simplificado grava `unit` e `monthlyProductivity` como `null`; `groupId` precisa ter a mesma unidade e o mesmo setor do bem (P-5.2); `imageUrl` só do armazenamento da API (recusa `data:`, ALT-16).
- **O servidor calcula:** `usefulLifeMonths` = 60 e `residualPercent` = 30 por padrão (P-24) e a depreciação; `status` inicial `DEPRECIATING`; a capacidade do grupo (P-28) e o custo do setor (que muda na hora, §6.2).
- **A tela:** toast "Patrimônio cadastrado"; invalida `assets`. A tela mostra o lembrete de revisar vida útil e residual (P-24).
- **Substitui:** `assets.ts › createAsset`

#### PATCH /asset/:id

Edição do patrimônio (ALT-17), inclusive vida útil, residual, nível e foto.

- **Corpo:** `{ "name": "Impressora Sublimática", "imageUrl": "https://…", "detailed": true, "unit": "M2", "monthlyProductivity": 164, "usefulLifeMonths": 120, "residualPercent": 30, "groupId": null, "sectorId": "…" }` (parcial)
- **Resposta:** o `Asset` atualizado.
- **Permissão:** `cost:base:edit` + `values:values:view`; feature `cost_base`. **O botão de editar da linha na lista não tem gate**: o servidor recusa sem `:edit`.
- **O servidor valida:** bem da empresa ("Patrimônio não encontrado"); `residualPercent` entre 0 e 100 e residual < aquisição (BR-ASSET-004); `usefulLifeMonths` > 0; troca de nível sem recadastro (P-16): de detalhado para simplificado com configuração usada em composição → 409 com a lista das composições afetadas, e a tela confirma com `confirmed: true`; bem inativo não é editado (reativar antes); troca de setor tira o bem do grupo de outro setor. Auditado.
- **O servidor calcula:** residual, depreciação e `status` de novo, nos dois sentidos (inclusive voltar de `INCONSISTENT` para `DEPRECIATING` quando o dado é corrigido; o mock não volta); o custo do setor e o rateio.
- **A tela:** toast "Patrimônio atualizado"; invalida `assets` e `asset`.
- **Substitui:** `assets.ts › updateAsset`

#### PATCH /asset/:id/toggle-status

Inativa ou reativa o bem (nunca exclui).

- **Corpo:** `{ "active": false, "reason": "Fora de uso" }`
- **Resposta:** o `Asset` atualizado.
- **Permissão:** `cost:base:edit` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** bem da empresa ("Patrimônio não encontrado"); ao inativar, guarda data e motivo (§2) e, se houver configuração usada em composição, devolve o aviso da P-16 junto da resposta (`warnings`). Auditado.
- **O servidor calcula:** inativar encerra a depreciação (`monthlyDepreciation` `null`) e tira o bem do custo do setor, do grupo e do rateio; reativar recalcula e devolve `DEPRECIATING` ou `INCONSISTENT`.
- **A tela:** toast "Patrimônio inativado/reativado"; invalida `asset` e `assets`.
- **Substitui:** `assets.ts › setAssetActive`

#### POST /asset/:id/sell

Venda do patrimônio: saída do bem e receita no financeiro (P-25).

- **Corpo:** `{ "value": 1500000, "date": "2026-10-07", "financialNatureId": "…", "bankAccountId": "…" }`
- **Resposta:** `{ "received": 1500000, "remaining": 2786684, "result": -1286684, "financialEntryId": "…" }`
- **Permissão:** `cost:base:edit` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** bem da empresa e não inativo ("Patrimônio não encontrado" / "Este patrimônio já está inativo"); `value` ≥ 0; `financialNatureId` é conta de receita do plano de contas (`/financial/nature`). Auditado.
- **O servidor calcula:** `remaining` = aquisição − **depreciação acumulada até a data** (o mock usa aquisição − residual, que está errado pela P-25); `result` = recebido − restante (ganho ou perda, gravado no registro do bem); lança a **receita** no financeiro com a conta escolhida (hoje não lança nada); inativa o bem com data e motivo "Venda" e tira-o do custo do setor a partir do mês seguinte.
- **A tela:** o modal já vem preenchido com o restante e a conta (a tela tem uma lista fixa de duas contas: passa a ler `/financial/nature`); toast "Patrimônio vendido e receita lançada".
- **Substitui:** `assets.ts › sellAsset`

#### POST /asset/:id/cost

Lança um custo do bem com natureza e periodicidade (P-6, P-19, P-30).

- **Corpo:** `{ "name": "Cabeça de impressão", "nature": "FIXED", "unitCost": 480000, "yieldAmount": 24, "yieldUnit": "MONTH", "financialNatureId": "…", "lastOccurrence": "2025-11-03", "setupId": null }`
- **Resposta:** o `Asset` atualizado (o front só invalida; o mock devolve `null`).
- **Permissão:** `cost:base:edit` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** bem da empresa e não inativo ("Patrimônio não encontrado"); `nature` em `FIXED · MACHINE_VARIABLE · SETUP_VARIABLE`; `FIXED` usa `yieldUnit: "MONTH"`, as variáveis `UNIT`; `SETUP_VARIABLE` exige `setupId` do próprio bem; `yieldAmount` > 0; `financialNatureId` da empresa — a conta ligada a custo de bem sai das Despesas administrativas (P-17). Auditado.
- **O servidor calcula:** `monthlyCost` = `round(unitCost / yieldAmount)` no `MONTH`; `round(unitCost / yieldAmount × produtividade)` no `UNIT` (P-19, P-32); e, em cadeia, custo do setor, rateio e custo das configurações.
- **A tela:** toast e invalida `asset`. A conta, hoje string livre (`chartAccount`), passa a ser escolhida de `/financial/nature`; a resposta continua trazendo `chartAccount` (código e nome) para exibir.
- **Substitui:** `assets.ts › createAssetCost`

#### POST /asset/:id/setup

Cria uma configuração produtiva do bem (P-2, P-19, P-31).

- **Corpo:** `{ "name": "6 passes", "abbreviation": "6p", "unit": "M2", "timePerUnit": 5, "monthlyProductivity": 100 }`
- **Resposta:** o `Asset` atualizado.
- **Permissão:** `cost:base:edit` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** bem da empresa, **detalhado** e ativo ("Patrimônio não encontrado"); `name` obrigatório e único no bem; `unit` igual à do bem; `timePerUnit` (min por unidade) ≥ 0 e `monthlyProductivity` > 0. Auditado.
- **O servidor calcula:** a produtividade do bem = Σ produtividade das configurações (P-31); o tempo de atividade (BC-2); `unitCost` da configuração (o mock deixa `null`); e refaz o rateio do setor quando ele é por tempo de atividade.
- **A tela:** toast "Configuração produtiva criada"; invalida `asset`.
- **Substitui:** `assets.ts › createAssetSetup`

Foto do bem (ALT-16): o arquivo vai pelo upload que já existe, `POST /file/upload-file` (devolve `url`), e a URL entra em `imageUrl` no `POST`/`PATCH /asset`. O servidor limita tamanho e tipo (imagem), guarda em armazenamento de objetos com link assinado e prazo, e recusa `data:`. Hoje a tela guarda data URL no mock.

### Patrimônios — Grupos de bens equivalentes (P-5.2, P-13, P-28)

`AssetGroup`: `name`, `unit`, `sectorId`. Carros, Motos e Caminhões (km) nascem cadastrados e são editáveis (P-13). Grupo com histórico é inativado; grupo vazio pode ser excluído.

#### GET /asset/group

Lista os grupos com a contagem, o custo médio e a capacidade somada.

- **Resposta:** `{ "data": [ { "id": "motos", "name": "Motos", "unit": "KM", "sector": "Frota", "sectorId": "…", "assetCount": 3, "averageCost": 18500, "totalProductivity": 3000 }, … ], "page": 1, "lastPage": 1, "total": 4 }`
- **Permissão:** `cost:base:view`; feature `cost_base`. Sem `values:values:view`, omite `averageCost`.
- **O servidor valida:** `limit` ≤ 100. Auditado.
- **O servidor calcula:** `assetCount` = bens não inativos; `averageCost` = média do custo **unitário** dos bens do grupo (P-28; o mock faz média da depreciação mensal); `totalProductivity` = Σ produtividade. Grupo sem bem fica marcado como inconsistência (P-28).
- **A tela:** filtro e seleção de grupo no cadastro; tela de grupos.
- **Substitui:** `assets.ts › getAssetGroups`

#### POST /asset/group

Cria um grupo de bens equivalentes.

- **Corpo:** `{ "name": "Impressoras UV", "unit": "M2", "sectorId": "…" }`
- **Resposta:** o grupo criado, com `id`.
- **Permissão:** `cost:base:create` (a tela usa `cost:base:edit`; aceitar as duas até ALT-6) + `values:values:view`; feature `cost_base`.
- **O servidor valida:** `name` obrigatório ("Informe o nome do grupo") e único na empresa (o mock gera o id pelo nome e não confere); `unit` válida; `sectorId` da empresa.
- **A tela:** toast e invalida a lista de grupos.
- **Substitui:** `assets.ts › createAssetGroup`

#### PATCH /asset/group/:id

Renomeia o grupo.

- **Corpo:** `{ "name": "Motos de entrega" }`
- **Resposta:** o grupo atualizado.
- **Permissão:** `cost:base:edit` + `values:values:view`; feature `cost_base`.
- **O servidor valida:** grupo da empresa ("Grupo não encontrado"); `name` não vazio e único (o mock não confere). Unidade e setor não mudam com bens no grupo (P-5.2).
- **A tela:** renomear na tela de grupos.
- **Substitui:** `assets.ts › renameAssetGroup`

#### DELETE /asset/group/:id

Exclui um grupo vazio.

- **Resposta:** `204`
- **Permissão:** `cost:base:delete`; feature `cost_base`.
- **O servidor valida:** grupo da empresa ("Grupo não encontrado"); sem nenhum bem, inclusive inativo ("Este grupo tem N bem(ns). Tire os bens do grupo antes de excluir"); grupo usado em composição ou venda não se exclui (vale a regra geral de inativar).
- **A tela:** confirmação e invalida a lista.
- **Substitui:** `assets.ts › deleteAssetGroup`

### Precificação

Parâmetros da empresa em décimos de ponto: `taxation`, `commission`, `financialCost`, `desiredMargin` (PR-4, D3 §7.2). Cada item guarda `rule` (`FIXED · VARIABLE`), `price` e, no variável, `profit` (o lucro que o preço preserva). O **custo nunca é gravado aqui**: vem da origem (DC-6). Itens por grupo: `labor` = setor (custo-hora da Mão de obra); `machines` = configuração produtiva do patrimônio, ou o grupo de bens equivalentes como uma linha só (P-28), com o custo já pelo rateio do setor; `materials` = material ou variação (`mat:<material>[:<variação>]`, MT-3); `products` = produto (custo da composição; sem composição, "custo não calculado", DC-15).

#### GET /pricing/summary

Parâmetros com o markup calculado e as contagens por grupo.

- **Resposta:** `{ "referenceMonth": "2026-08", "parameters": { "taxation": 60, "commission": 30, "financialCost": 15, "desiredMargin": 300, "markup": 1.68 }, "groups": [ { "group": "labor", "total": 3, "priced": 3, "pending": 0, "belowCost": 1 }, { "group": "materials", "total": 9, "priced": 7, "pending": 2, "belowCost": 0 }, … ] }`
- **Permissão:** `cost:pricing:view` + `values:values:view`; feature `pricing_center`. O modal de preço também é aberto do cadastro de produtos e de materiais (`product_settings:products:edit`): ali o servidor aceita essa chave para ler só `parameters`.
- **O servidor valida:** auditado (SEG-4).
- **O servidor calcula:** `markup` = `round2(1 / (1 − (taxation + commission + financialCost + desiredMargin) / 1000))`, método divisor (D3 §7.2; com encargos ≥ 1000, `null` e aviso); por grupo `total` = `priced` + `pending` (item sem preço), `belowCost` = preço < custo (§8.1). O grupo `materials` conta a lista real (no mock sai zerado) e `machines` usa o custo já rateado.
- **A tela:** Resumo (markup "1,68", barra custo × encargos, progresso por grupo). O `EditPriceModal` usa só `parameters`: a soma `taxation + financialCost + commission` é o coeficiente que a simulação do modal precisa (exceção da SEG-1).
- **Substitui:** `pricing.ts › getPricingSummary`

#### PUT /pricing/parameters

Grava os quatro parâmetros de referência da empresa.

- **Corpo:** `{ "taxation": 60, "commission": 30, "financialCost": 15, "desiredMargin": 300 }`
- **Resposta:** `{ "taxation": 60, "commission": 30, "financialCost": 15, "desiredMargin": 300, "markup": 1.68 }`
- **Permissão:** `cost:pricing:edit` + `values:values:view`; feature `pricing_center`.
- **O servidor valida:** os quatro obrigatórios, inteiros ≥ 0; soma < 1000 ("A soma dos parâmetros precisa ficar abaixo de 100%") — o mock não confere nada. Auditado.
- **O servidor calcula:** o markup e, em cadeia, o preço de todo item com regra `VARIABLE` (o preço acompanha, preservando o `profit`) e a margem dos `FIXED`.
- **A tela:** nenhuma tela chama ainda (o Resumo ganha "Editar parâmetros" quando ligar). Fica no contrato porque é a única forma de definir os parâmetros.
- **Substitui:** `pricing.ts › updatePricingParameters`

#### GET /pricing/item

Itens de um grupo com custo, regra, preço, margem e situação.

- **Resposta:** `{ "data": [ { "id": "producao", "name": "Produção", "code": "MO-01", "sector": "Produção", "unit": "HR – Hora", "cost": 1649, "costUpdatedAt": "2026-08-31", "rule": "FIXED", "price": 6000, "profit": null, "margin": 62.0, "status": "PRICED" }, { "id": "mat:lona-440:v1", "name": "Lona 440 · Marca X Branca", "code": "MAT-01", "sector": "Impressão", "unit": "m²", "cost": 1250, "costUpdatedAt": "2026-09-10", "rule": "VARIABLE", "price": 2803, "profit": 449, "margin": 44.9, "status": "PRICED" } ], "page": 1, "lastPage": 2, "total": 142 }`
- **Permissão:** `cost:pricing:view` + `values:values:view`; feature `pricing_center`.
- **O servidor valida:** `group` obrigatório (`labor · machines · materials · products`); `status` (`todos · PRICED · PENDING · BELOW_COST · NO_COST`) e `search`; `limit` ≤ 100 (SEG-2). Auditado (SEG-4).
- **O servidor calcula:** `cost` da origem (custo-hora do setor; custo unitário da configuração com o rateio; custo do material ou da variação, ou custo médio do estoque no FULL; custo da composição); `costUpdatedAt` = quando aquele custo mudou pela última vez; `margin` = lucro depois de tributação, comissão e custo financeiro, em % do preço: `round1((price − cost − price × (taxation + commission + financialCost) / 1000) / price × 100)` — a mesma leitura do modal (PR-2); `status`: sem custo `NO_COST`, sem preço `PENDING`, preço < custo `BELOW_COST`, senão `PRICED`.
- **A tela:** lista de cada aba (Mão de obra, Máquinas, Materiais, Produtos) com margem em vermelho quando negativa; o lápis abre o modal.
- **Substitui:** `pricing.ts › getPricingItems`

#### PATCH /pricing/item/:id

Grava a regra e o preço de um item de mão de obra, máquina ou produto (modal de precificação, PR-2), no mesmo dado do cadastro (DC-6). O preço de **material** é gravado em `PATCH /material/:id/price` (módulo 1, parte B), com a mesma regra, tanto na aba Materiais quanto no cadastro.

- **Corpo:** variável `{ "group": "machines", "rule": "VARIABLE", "profit": 449, "price": 2803 }`; fixo `{ "group": "labor", "rule": "FIXED", "price": 6000 }`
- **Resposta:** o `PricingItem` atualizado.
- **Permissão:** `cost:pricing:edit` + `values:values:view`; feature `pricing_center`.
- **O servidor valida:** item da empresa no grupo ("Item não encontrado"); com custo ("Este item ainda não tem custo calculado."); `FIXED` exige `price` > 0; `VARIABLE` exige `profit` com `1 − encargos − profit/1000 > 0`, e o `price` enviado é só conferência (diferença de mais de 1 centavo do que o servidor calcula → 400 "O preço mudou; abra o item de novo"). Auditado (antes, depois, custo do momento: histórico mínimo da DC-14).
- **O servidor calcula:** no `VARIABLE`, `price = round(cost / (1 − (taxation + commission + financialCost + profit) / 1000))`; a margem e a situação.
- **A tela:** toast "Preço salvo"; invalida `pricing-items` e `pricing-summary`. Hoje o modal envia só `price`; ao ligar, envia também `profit` no variável.
- **Substitui:** `pricing.ts › updateItemPrice`

#### PATCH /product/:id (muda)

O preço do produto definido no modal a partir do cadastro de produtos.

- **Corpo:** `{ "priceRule": "VARIABLE", "profit": 344, "salePrice": 4900 }`
- **Resposta:** o produto, com `unitCost`, `salePrice`, `priceRule`, `profit` e `margin`.
- **Permissão:** `product_settings:products:edit`; os campos de custo e margem exigem `values:values:view` (omitidos sem ela).
- **O servidor valida:** **deixa de aceitar `unitCost` do front** (hoje `ProductsData.tsx` grava o custo calculado no navegador): o custo vem da composição (SEG-1). `priceRule`/`profit` pelas mesmas regras do `PATCH /pricing/item/:id`.
- **A tela:** `saveProductPrice` deixa de mandar `unitCost`.
- **Substitui:** —

#### POST /pricing/item/apply-suggested

Aplica o preço sugerido a vários itens de uma vez (CP-7: "entra, bem escondido", decidido em 05/10/2026; **sem tela ainda**).

- **Corpo:** `{ "group": "products", "ids": ["camiseta", "banner-lona"], "confirmed": false }`
- **Resposta:** `{ "items": [ { "id": "camiseta", "name": "Camiseta em malha", "cost": 2700, "price": 4900, "suggestedPrice": 4536, "marginBefore": 34.4, "marginAfter": 30.0 } ], "applied": 0 }` (com `confirmed: true`, `applied` = quantos mudaram)
- **Permissão:** `cost:pricing:edit` + `values:values:view`; feature `pricing_center`.
- **O servidor valida:** até 100 ids; item sem custo fica de fora com motivo; sem `confirmed: true` só devolve a prévia e não grava nada. Auditado, um registro por item.
- **O servidor calcula:** `suggestedPrice` pela regra do grupo (produto: soma do preço de venda de cada recurso da composição, IP-25; recurso sem preço próprio: custo × markup).
- **A tela:** a construir — ação no menu de mais ações da Precificação, com prévia e confirmação explícita.
- **Substitui:** —

### Estrutura da folha (ALT-18, ALT-19, F-14)

A folha continua nas telas que existem (F-13); as rotas reais `/financial/payroll-templates` (item de custo da empresa) e `/financial/payroll-setup` (linha do item em cada colaborador) mudam. O item passa a ter **acréscimo e desconto** e o **comportamento** como campo (`ONLY_INCREASE · ONLY_DISCOUNT · INCREASE_AND_DISCOUNT · PROVISION`). O colaborador (`/employee`) ganha `contract` (`CLT · PRO_LABORE · MEI_PJ`) e `baseSalary`: com eles o servidor gera os encargos.

#### GET /financial/payroll-setup (muda)

A configuração da folha por colaborador, com acréscimo, desconto, comportamento e os custos já somados.

- **Resposta:** `{ "data": [ { "id": "e1", "code": "10", "name": "Natihely Ribeiro", "roleName": "Designer", "sectorName": "Criação", "avatarUrl": null, "contract": "CLT", "baseSalary": 500000, "monthlyHours": 220, "employeeCost": 603333, "employeePayroll": 500000, "totalIncrease": 643333, "totalDiscount": 40000, "items": [ { "id": "ps-1", "templateId": "i2", "name": "INSS", "behavior": "INCREASE_AND_DISCOUNT", "increase": 40000, "discount": 40000, "finalCost": 0, "isSet": true, "derivedFromSalary": true, "fixedByLaw": false, "manualOverride": false }, … ] } ], "page": 1, "lastPage": 1, "total": 3 }`
- **Permissão:** `financial_settings:payroll:view` + `values:values:view` (a página usa `requireAll`; sem valores, 403).
- **O servidor valida:** colaboradores da empresa; filtros `sectorId`, `employeeId`, `search` na query (hoje filtrados no cliente); `limit` ≤ 100.
- **O servidor calcula:** `finalCost` = `isSet ? max(0, increase − discount) : 0`; `employeeCost` = Σ `finalCost` (é o custo `LABOR` do setor na Base de custos, ALT-19); `employeePayroll` = Σ (`increase − discount`) dos itens ≠ `PROVISION` (folha a pagar); `totalIncrease`/`totalDiscount`. Os encargos derivados (`derivedFromSalary`) são gerados a partir de `baseSalary` e `contract` (ALT-18): só `CLT` tem INSS, FGTS, 13º e férias; 13º e férias = 1/12 ao mês cada, com os encargos sobre eles (F-14); INSS e FGTS pelas alíquotas do item de custo da empresa. `PRO_LABORE` e `MEI_PJ` sem encargos da CLT (F-9, F-10).
- **A tela:** um colaborador por vez, com salário base e derivados aninhados, custo do colaborador e folha a pagar. Deixa de calcular `itemFinalCost`, `employeeCost` e `employeePayroll` no cliente (as funções de `folhas-de-pagamento/types.ts` passam a só ler).
- **Substitui:** `payroll-structure.ts › getPayrollStructure`

#### PATCH /financial/payroll-setup/:id (muda)

Edita a linha do item no colaborador: acrescentar, tirar, comportamento, acréscimo e desconto. No lugar do `amount` único de hoje.

- **Corpo:** `{ "behavior": "INCREASE_AND_DISCOUNT", "increase": 10000, "discount": 25000 }`; acrescentar `{ "isSet": true }`; tirar `{ "isSet": false }`
- **Resposta:** a linha atualizada (formato de `items[]`), mais `employeeCost` e `employeePayroll` do colaborador.
- **Permissão:** `financial_settings:payroll:edit` + `values:values:view`; encargos automáticos dependem da feature `cost_base`.
- **O servidor valida:** linha da empresa ("Item não encontrado"); `fixedByLaw` (13º e férias) não aceita `increase`/`discount`/`behavior` → "Férias e 13º são calculados por lei e não podem ser editados" (F-14); INSS e FGTS aceitam valor à mão e passam a `manualOverride: true` (F-4); valores ≥ 0; coerência pelo comportamento (`ONLY_INCREASE` zera `discount`, `ONLY_DISCOUNT` zera `increase`); não tira o salário base nem item `fixedByLaw` de colaborador CLT ("Este item faz parte da folha CLT"); tirar zera os valores e mantém o item na empresa. Auditado (EC-21: a tela já bloqueia, a rota também precisa).
- **O servidor calcula:** `finalCost`, o custo do colaborador e, em cadeia, o custo `LABOR` do setor e o custo-hora.
- **A tela:** `EditPayrollItem` (toast "Item atualizado") e o acrescentar/tirar do `Main.tsx`; invalida `payroll-structure`.
- **Substitui:** `payroll-structure.ts › updatePayrollItem`, `payroll-structure.ts › setPayrollItem`

#### PATCH /financial/payroll-templates/:id (muda)

O item de custo da empresa passa a ter comportamento, valores padrão e, nos encargos, a alíquota.

- **Corpo:** `{ "name": "INSS", "behavior": "INCREASE_AND_DISCOUNT", "rate": 8 }` (`POST /financial/payroll-setup`, que cria o item, aceita os mesmos campos com `defaultIncrease` e `defaultDiscount` no lugar de `type`/`amount`)
- **Resposta:** `{ "id": "i2", "name": "INSS", "behavior": "INCREASE_AND_DISCOUNT", "defaultIncrease": 0, "defaultDiscount": 0, "derivedFromSalary": true, "fixedByLaw": false, "rate": 8, "isBase": false, "linkedEmployees": 3, "canDelete": false }`
- **Permissão:** `financial_settings:payroll:edit` (criar `:create`, excluir `:delete`) + `values:values:view` (EC-21).
- **O servidor valida:** `behavior` obrigatório (substitui `type`; `ADVANCE` continua para adiantamento); `rate` só nos itens de encargo editáveis (INSS e FGTS), percentual com duas casas entre 0 e 100; itens `fixedByLaw` não aceitam `rate` nem exclusão; item com histórico de folha lançada não se exclui. Auditado.
- **O servidor calcula:** mudar `rate` recalcula os derivados de todos os colaboradores CLT sem `manualOverride`.
- **A tela:** "Gerenciar itens de custo" mostra o comportamento no lugar de "Acréscimo/Desconto".
- **Substitui:** —

#### PATCH /employee/:id (muda)

O colaborador ganha forma de contratação e salário base, que disparam os encargos.

- **Corpo:** `{ "contract": "CLT", "baseSalary": 500000 }` (também no `POST /employee`)
- **Resposta:** o colaborador com os dois campos.
- **Permissão:** a do cadastro de colaborador; `baseSalary` exige `values:values:view` para ser lido.
- **O servidor valida:** `contract` em `CLT · PRO_LABORE · MEI_PJ`; `baseSalary` ≥ 0. Autônomo não entra (vira terceirizado, F-12).
- **O servidor calcula:** ao criar ou mudar salário/contrato, gera ou atualiza as linhas de encargo do colaborador (F-7, F-8): o colaborador **não** nasce com custo zero como no legado.
- **A tela:** cadastro de colaborador; a folha recarrega com os encargos.
- **Substitui:** —

Sem endpoint (sem tela): rateio por item de custo administrativo (BC-8) — decidido em 29/09/2026, ainda sem tela; quando existir, entra como `PUT /cost-base/admin-expense/:id/allocation` com percentuais só para setores produtivos e soma ≤ 100 %, e o total administrativo passa a ser a sobra.

## 5. Venda rápida, contas, caixa (LITE) e estoque (FULL) — fora da sequência principal

**Ordem dentro do módulo.** Primeiro as **contas bancárias** ("muda" em `/bank/account`: tipo, conta padrão por forma, saldo inicial): elas são o destino de tudo o que vem depois. Em seguida o **caixa do dia** (`/financial/cash-control`), que recebe os fechamentos e as sangrias. Depois a **venda rápida** (configuração, criação direta ALT-22, aprovação que manda à fila) e, por fim, a **frente de caixa** (`/financial/pdv`), que depende das três. O **estoque** é independente (FULL) e pode ser feito em paralelo ou por último. Todos são recursos fora da prioridade atual; os blocos abaixo são enxutos de propósito. Regras completas: `regras-de-negocio/caixa-venda-rapida-e-frente-de-caixa.md` e `areas/12-recursos-do-lite.md`.

Convenções do módulo: valores em centavos; `amount` positivo é entrada e negativo é saída; quem abriu, fechou, aprovou ou lançou é **sempre o usuário da sessão** (os mocks têm nomes fixos), gravado com data e hora (CX-2). O servidor responde com o erro padrão (`userMessage.message`) e as mensagens abaixo são as que a tela já mostra.

### Venda rápida — configuração (VR-4, FC-17)

Uma configuração por empresa: `{ enabled, payment: "CASH_ONLY" | "POS", cashMethods[], downPaymentRequired, downPaymentPercent, clientId, description, seriesId, serviceTypeId, responsibleId }`. `payment` decide o caminho do recebimento (VR-5). As opções dos selects vêm de rotas que já existem (`GET /sale/series`, `GET /contact-source`, `GET /employee`).

#### GET /sale/quick-sale/settings

Devolve a configuração da venda rápida da empresa; sem nada salvo, devolve os padrões (série padrão que não é de treinamento, atendimento "Venda Direta", cliente de balcão).

- **Resposta:**
```json
{ "enabled": true, "payment": "POS", "cashMethods": ["dinheiro", "pix", "cartao"], "downPaymentRequired": true, "downPaymentPercent": 50,
  "clientId": "6f1c…", "clientName": "Consumidor", "description": "", "seriesId": "2b9e…", "serviceTypeId": "a41d…", "responsibleId": null }
```
- **Permissão:** `sales_settings:series:view`; feature `quotation_quick_sale`. A leitura também é feita pelo orçamento (`sale:quotation:view`) e pela frente de caixa (`financial:pdv:view`, para o sinal mínimo): aceitar qualquer uma das três.
- **O servidor valida:** nada além da permissão.
- **A tela:** preenche `/configuracoes/vendas/venda-rapida`; no orçamento, `payment` escolhe entre "Cobrar R$ X" e "Enviar R$ X ao caixa" e `cashMethods` limita as formas do recebimento; na frente de caixa, calcula o sinal mínimo.
- **Substitui:** `quick-sale.ts › getQuickSaleSettings`.

#### PUT /sale/quick-sale/settings

Grava a configuração inteira (a tela sempre envia o objeto completo).

- **Corpo:**
```json
{ "enabled": true, "payment": "POS", "cashMethods": ["dinheiro", "pix"], "downPaymentRequired": true, "downPaymentPercent": 50,
  "clientId": "6f1c…", "description": "", "seriesId": "2b9e…", "serviceTypeId": "a41d…", "responsibleId": null }
```
- **Resposta:** a configuração gravada (mesmo formato do GET).
- **Permissão:** `sales_settings:series:edit`; feature `quotation_quick_sale`.
- **O servidor valida:** "Escolha o cliente padrão da venda rápida" quando ligada sem `clientId` (ALT-22, VR-4); "O sinal precisa ser um percentual entre 1% e 100%" quando `downPaymentRequired` (FC-17); `seriesId`, `serviceTypeId`, `clientId` e `responsibleId` da empresa; `cashMethods` só entre `dinheiro`, `pix`, `cartao` (VR-5).
- **A tela:** toast "Venda rápida atualizada" e recarrega a configuração.
- **Substitui:** `quick-sale.ts › updateQuickSaleSettings`.

Sem endpoint: `getQuickSaleOptions` — as opções vêm de `GET /sale/series?isActive=true`, `GET /contact-source` e `GET /employee`, que já existem; `cashMethods` é lista fixa no front.

### Venda rápida — no orçamento (ALT-22, VR-5, FC-1, FC-11, FC-12)

É o mesmo orçamento (`quickSale: true`, VR-3). Três comportamentos da API, como no backend-pendente: (1) criar com os padrões; (2) **aprovar sem condição de pagamento**, e com *enviar ao caixa* a aprovação **coloca a venda na fila da frente de caixa**; (3) com *cobrar na hora*, um endpoint que recebe as partes do pagamento. O orçamento devolve a **situação no caixa**.

#### POST /sale/quotation/quick-sale

Cria o orçamento de venda rápida já com os padrões da configuração e devolve o id (ALT-22, VR-1, VR-2).

- **Corpo:** `{}` (nada: cliente, descrição, série e atendimento vêm da configuração; vendedor = usuário da sessão; responsável = o da configuração ou vazio).
- **Resposta:** `{ "id": "uuid-orcamento", "code": "VR-2026-0320", "quickSale": true, "status": "OPEN", … }` (o mesmo registro de `POST /sale/quotation`).
- **Permissão:** `sale:quotation:create`; feature `quotation_quick_sale`.
- **O servidor valida:** venda rápida ligada e configurada — "Venda rápida ainda não configurada: escolha o cliente padrão e a série em Configurações › Vendas › Venda rápida" (VR-4); o vendedor da sessão precisa ter colaborador vinculado.
- **A tela:** redireciona para `/vendas/orcamentos/:id?adicionar=1`, com o modal "Qual item deseja adicionar?" aberto (VR-4). Em erro, abre o modal normal de novo orçamento.
- **Substitui:** a chamada direta a `POST /sale/quotation` com `quickSale: true` em `Quotations.tsx` (que hoje lê `getQuickSaleSettings` e manda `companyId` no corpo — a empresa vem do token).

#### POST /sale/quotation/:id/approve (muda)

Na venda rápida, aprovar é enviar ao caixa (FC-12): não existe segundo gesto.

- **Corpo:** o atual (vazio; `approvedAt` só para admin).
- **Resposta:** a atual (`{ "id": "uuid-ordem", … }`).
- **Permissão:** `sale:order:create` (a de hoje).
- **O servidor valida:** com `quickSale: true`, **não exige condição de pagamento** (FC-1: a forma é com o caixa). Com a configuração `payment = "POS"`, cria o item da fila da frente de caixa (`kind: "QUICK"`, `total` = valor final do orçamento, `paid: 0`, `approvedAt`) — "Esta venda já foi enviada ao caixa" se já estiver na fila. Com `payment = "CASH_ONLY"`, recusa a aprovação simples: a venda rápida cobrada na hora conclui pelo `quick-sale/charge`. A venda aprovada **trava** (FC-11): `add-product`, `update-product` e `remove-product` recusam, como no orçamento aprovado.
- **A tela:** botão "Enviar R$ X ao caixa" (com confirmação de que a venda trava); recarrega a situação no caixa, a fila do caixa e a lista de orçamentos.
- **Substitui:** `cash-front.ts › sendQuickSaleToCash`.

#### POST /sale/quotation/:id/quick-sale/charge

Cobrar na hora, só à vista (VR-5): recebe as partes do pagamento, aprova e encerra a venda no atendimento.

- **Corpo:**
```json
{ "parts": [ { "method": "CASH", "paymentConditionId": "uuid-dinheiro", "bankAccountId": null, "amount": 3000 },
             { "method": "PIX", "paymentConditionId": "uuid-pix", "bankAccountId": "uuid-bradesco", "amount": 1500 } ],
  "discount": 50 }
```
- **Resposta:** a situação no caixa (formato de `GET /sale/quotation/:id/cash-status`), com `path: "CASH_ONLY"`, `delivered: true`.
- **Permissão:** `sale:order:create`; feature `quotation_quick_sale`.
- **O servidor valida:** orçamento `quickSale` aberto e configuração `CASH_ONLY`; ainda não cobrado; formas dentro de `cashMethods`; `Σ parts + discount = total` — "A venda rápida é cobrada pelo total. Para parcelar ou cobrar depois, use um orçamento comum" (o troco já vem descontado da parte em dinheiro, FC-9); `discount` até o limite de arredondamento — "Arredondamento acima do limite do balcão" (FC-18); cada parte com valor > 0.
- **O servidor calcula:** aprova o orçamento (gera a ordem), grava o `discount` como desconto na venda e lança cada parte na conta padrão da forma (CX-2): dinheiro **realizado** na conta Caixa; PIX e cartão como **previsão** pelo valor cheio, com o líquido do cartão pela taxa configurada e a taxa confirmada na baixa (FC-10).
- **A tela:** diálogo "Cobrar R$ X" (mesmo `PaymentSplit` do caixa); toast com o troco; recarrega a situação no caixa.
- **Substitui:** `cash-front.ts › chargeQuickSaleNow`.

#### GET /sale/quotation/:id/cash-status

A situação da venda rápida no caixa, para o vendedor (a tela consulta a cada 15 s, por isso é uma rota leve à parte).

- **Resposta:**
```json
{ "quotationId": "uuid-orcamento", "path": "POS", "sentAt": "2026-10-07T15:40:00Z", "total": 68000, "paid": 34000,
  "delivered": false, "cancelled": false, "parts": [ { "method": "CASH", "amount": 34000 } ] }
```
  ou `null` quando ainda não foi enviada nem cobrada.
- **Permissão:** `sale:quotation:view`.
- **O servidor valida:** orçamento da empresa.
- **A tela:** trava o orçamento quando há situação (FC-11) e mostra os passos *enviada → sinal recebido / recebida → entregue*, ou *cancelada no caixa*. O comprovante (FC-16) sai a pedido pelo `pdf-data` que já existe, que deve passar a trazer as `parts` e o troco.
- **Substitui:** `cash-front.ts › getQuickSaleCheckout`.

### Contas bancárias (CX-1, CX-2, CX-3)

A conta já existe (`/bank/account`, com `cashControl` e as regras por condição de pagamento em `bankAccountCashControl`). Muda: `kind` (`CASH` caixa físico, `BANK` banco, `CARD` operadora de cartão), `isDefault` em cada regra de `bankAccountCashControl`, `openingBalance` + `openingDate`, `blindCount` e `shortageTolerance` (só conta `CASH` com controle), e os calculados `balance` e `hasHistory`. As formas da tabela de regras são as condições de pagamento reais (`GET /payment-condition`): o mock usa uma lista fixa (`getPaymentMethods`), que fica sem endpoint.

#### GET /bank/account (muda)

Acrescenta os campos novos e o saldo calculado.

- **Resposta:**
```json
{ "data": [ { "id": "a2", "name": "Bradesco", "kind": "BANK", "bank": { "id": "…", "name": "Banco Bradesco", "code": "237", "icon": "bancoBradesco" },
  "cashControl": true, "blindCount": false, "shortageTolerance": null, "isActive": true, "hasHistory": true,
  "openingBalance": 150000, "openingDate": "2026-09-07", "balance": 255210,
  "bankAccountCashControl": [ { "paymentCondition": { "id": "uuid-pix", "name": "PIX" }, "acceptIncomes": true, "incomeType": "PAYSOFF",
    "acceptPayments": true, "paymentType": "PAYSOFF", "isDefault": true } ] }, … ], "page": 1, "lastPage": 1, "total": 4 }
```
- **Permissão:** `financial_settings:bank_accounts:view` (tela de contas) ou `financial:pdv:edit` (escolha da conta na sangria). `balance` só com `values:values:view` (sem ela, o campo é omitido).
- **O servidor valida:** filtros novos `isActive` e `kind`, além dos atuais `bankId` e `cashControl`.
- **O servidor calcula:** `balance` = conta com controle: saldo do último caixa do dia (`opening + entradas − saídas + retroativos`, só compensados); sem dia, `openingBalance`. Conta sem controle: saldo dos lançamentos desde `openingDate` (CX-2: o saldo é calculado, nunca digitado). `hasHistory` = existe lançamento ou caixa do dia na conta.
- **A tela:** separa ativas e inativas, mostra "Saldo em todas as contas" atrás de "Mostrar totais", as pílulas "PIX · padrão · provisiona"; na sangria, lista as contas ativas que não são `CARD`, com a `CASH` pré-selecionada.
- **Substitui:** `cash-accounts.ts › getBankAccounts`.

#### POST /bank/account · PATCH /bank/account/:id (muda)

Cria ou edita a conta com os campos novos.

- **Corpo:**
```json
{ "name": "Caixa Empresa", "kind": "CASH", "bankId": "uuid-banco-empresa", "cashControl": true, "blindCount": true, "shortageTolerance": 500,
  "openingBalance": 20000, "openingDate": "2026-09-07",
  "bankAccountCashControl": [ { "paymentConditionId": "uuid-dinheiro", "acceptIncomes": true, "incomeType": "PAYSOFF",
    "acceptPayments": true, "paymentType": "PAYSOFF", "isDefault": true } ] }
```
- **Resposta:** a conta gravada (formato do GET).
- **Permissão:** `financial_settings:bank_accounts:create` (POST) / `:edit` (PATCH); os campos novos dependem da feature `cash_control`.
- **O servidor valida:** "Dê um nome para a conta"; `kind = CARD` força `cashControl = false` (a operadora não fecha o dia, CX-3); `blindCount` e `shortageTolerance` só valem em `CASH` com controle (FC-7, 4.1); `isDefault` só com `acceptIncomes`; `openingDate` obrigatória quando há `openingBalance`, e não editável depois que a conta tem histórico (CX-2).
- **O servidor calcula:** **conta padrão única por forma** — marcar `isDefault` numa forma desmarca essa forma em todas as outras contas da empresa (CX-2).
- **A tela:** toast "Conta criada"/"Conta atualizada"; antes de salvar, avisa qual conta perde o "padrão"; recarrega contas e controle de caixa.
- **Substitui:** `cash-accounts.ts › saveBankAccount`.

#### DELETE /bank/account/:id (muda)

Um botão só, o servidor decide: sem histórico exclui; com histórico inativa (CX-2).

- **Resposta:** `{ "removed": "DELETED" }` ou `{ "removed": "INACTIVATED" }`.
- **Permissão:** `financial_settings:bank_accounts:delete`.
- **O servidor valida:** para inativar, "A conta tem saldo. Transfira o saldo para outra conta antes de inativar" e "Feche o caixa desta conta antes de inativar"; "Conta não encontrada".
- **A tela:** confirmação "Excluir…" ou "Inativar…" conforme `hasHistory`; recarrega a lista.
- **Substitui:** `cash-accounts.ts › removeBankAccount`.

#### PATCH /bank/account/:id/toggle-status (muda)

Reativa a conta inativa (inativar continua pelo `DELETE`, com as mesmas regras).

- **Resposta:** a conta, com `isActive: true`.
- **Permissão:** `financial_settings:bank_accounts:edit`.
- **O servidor valida:** conta da empresa; ao inativar por esta rota, as mesmas regras do `DELETE` (saldo zero, sem caixa aberto).
- **A tela:** toast "Conta reativada" e recarrega.
- **Substitui:** `cash-accounts.ts › reactivateBankAccount`.

### Controle de caixa — caixa do dia por conta (CX-2, CX-3, CX-4, FC-14, ALT-7)

`/financial/cash-control` está declarada no front e não é usada: passa a ser o **caixa do dia** de cada conta com controle. `CashDay { id, number, bankAccountId, date, status: OPEN|CLOSED, opening, openedBy, openedAt, closedBy, closedAt, informed, note, reopenings[{at, by, reason}], movements[] }`; `Movement { id, kind: INCOME|EXPENSE|ADJUSTMENT|TRANSFER_IN|TRANSFER_OUT|SHORTAGE|OVERAGE|REVERSAL, description, amount, method, operationDate, settled, retroactive, responsible, awaitingApproval, approvedBy, reason, natureId, categoryId, linkedId }`. **Retroativo** não tem endpoint: a baixa do Fluxo financeiro com data de um dia fechado entra no caixa aberto da conta com `retroactive: true` e as duas datas (CX-3). Conta sem controle não tem caixa do dia (só saldo e histórico). A conciliação por OFX (CX-6) ainda não tem tela e fica fora deste contrato.

#### GET /financial/cash-control (muda)

A tela do controle de caixa: a linha de hoje de cada conta e o histórico de caixas.

- **Resposta:**
```json
{ "today": "2026-10-07",
  "accounts": [ { "id": "a1", "name": "Caixa Empresa", "kind": "CASH", "cashControl": true, "balance": 64700,
    "todayDay": { "id": "d3", "status": "OPEN" }, "stuckDay": { "id": "d2", "date": "2026-10-06", "awaitingApproval": 1 } }, … ],
  "data": [ { "id": "d2", "number": 22, "bankAccountId": "a1", "date": "2026-10-06", "status": "OPEN", "opening": 64700,
    "openedBy": "Renata Alves", "openedAt": "2026-10-06T08:02:00Z", "informed": null, "reopenings": [],
    "totals": { "entries": 85000, "exits": 0, "retroactive": 0, "balance": 149700, "pending": 85000 }, "movements": [ … ] } ],
  "page": 1, "lastPage": 2, "total": 31 }
```
- **Permissão:** `financial:cash_control:view` + `values:values:view`; feature `cash_control`.
- **O servidor valida:** filtros `status` (`OPEN`/`CLOSED`), `bankAccountId`, `sort`, `page`, `limit` (máx. 100); `accounts` só ativas.
- **O servidor calcula:** `totals` por dia (CX-2): só movimentos `settled`; `entries` = positivos não retroativos, `exits` = negativos não retroativos (absoluto), `retroactive` = soma dos retroativos, `balance = opening + entries − exits + retroactive`, `pending` = não compensados (provisionados ou aguardando aprovação). `stuckDay` = dia OPEN da conta com data anterior a hoje (FC-14).
- **A tela:** monta as linhas (CARD "Não fecha", sem controle "Livre", aberto, fechado, "Sem caixa hoje", aviso "Fechar dd/mm"/"Aprovar e fechar dd/mm"), o aviso de valores aguardando aprovação e o histórico agrupado por data, com o relatório do dia (CX-4).
- **Substitui:** `cash-accounts.ts › getCashControl`.

`GET /financial/cash-control/quantity` (também declarada) devolve a contagem das abas Todos/Abertos/Fechados.

#### POST /financial/cash-control

Abre o caixa de uma conta numa data (hoje ou "outro dia").

- **Corpo:** `{ "bankAccountId": "a1", "date": "2026-10-07" }`
- **Resposta:** o `CashDay` aberto.
- **Permissão:** `financial:cash_control:create`; feature `cash_control`.
- **O servidor valida:** "Conta não encontrada"; "Esta conta está sem controle de caixa: não tem abertura" (CX-1, inclui `CARD`); "Esta conta já tem caixa nesse dia"; "O caixa de dd/mm/aaaa desta conta ainda está aberto. Feche-o antes de abrir outro dia" — bloqueio **por conta** (FC-14, CX-3).
- **O servidor calcula:** `opening` = `balance` do caixa anterior mais recente da mesma conta, ou `openingBalance` da conta (abertura encadeada, CX-3); `number` sequencial por empresa.
- **A tela:** toast "Caixa aberto" e recarrega.
- **Substitui:** `cash-accounts.ts › openCashDay`.

#### POST /financial/cash-control/:id/adjustment

Lança um ajuste de entrada ou de saída no caixa aberto.

- **Corpo:** `{ "amount": -1500, "reason": "Troco dado a mais", "natureId": "uuid-natureza", "categoryId": "uuid-categoria" }`
- **Resposta:** o movimento criado (`kind: "ADJUSTMENT"`).
- **Permissão:** `financial:cash_control:edit`.
- **O servidor valida:** "Este caixa está fechado e não permite lançamento"; "Informe o valor do ajuste"; "Informe o motivo do ajuste" (CX-3); "Informe o plano de contas do ajuste" (CX-5) — grava `natureId`/`categoryId`, não o texto da categoria (o mock manda o texto).
- **A tela:** toast e recarrega o controle de caixa.
- **Substitui:** `cash-accounts.ts › addAdjustment`.

#### POST /financial/cash-control/:id/close

Fecha o dia com o valor informado: contagem na gaveta (`CASH`) ou saldo do extrato (`BANK`).

- **Corpo:** `{ "informed": 149400, "note": "Faltaram R$ 3,00" }`
- **Resposta:** `{ "expected": 149700, "informed": 149400, "difference": -300, "posted": true }`
- **Permissão:** `financial:cash_control:edit`. Fechar dia anterior esquecido (destravamento, FC-14) com a mesma permissão e `note` obrigatória.
- **O servidor valida:** "Caixa não encontrado"; "Este caixa já está fechado"; `BANK` com diferença: "O extrato não bate com o sistema: explique a diferença"; `CASH` com diferença fora da tolerância: "A contagem não bate: explique a diferença"; `CARD` não fecha (CX-3). Saldo negativo bloqueado em `CASH`.
- **O servidor calcula:** `expected = balance − quebra já lançada`, `difference = informed − expected`. Em `CASH`, fora de `shortageTolerance` (ou sem tolerância), lança `SHORTAGE`/`OVERAGE` "Diferença da contagem" com `amount = difference`, `reason = note`, no nome de quem fecha; dentro da tolerância só registra (`posted: false`) — esperado, contado e diferença ficam sempre visíveis (4.1). Em `BANK` não lança quebra.
- **A tela:** conferência simples ou às cegas (`blindCount`), toast e recarrega. Hoje calcula a diferença no front para habilitar o botão.
- **Substitui:** `cash-accounts.ts › closeCashDay`.

#### POST /financial/cash-control/:id/reopen

Reabre um caixa fechado, com justificativa (CX-3, ALT-7).

- **Corpo:** `{ "reason": "Contagem refeita" }`
- **Resposta:** o `CashDay` reaberto.
- **Permissão:** só administrador hoje (a tela confere `isAdmin`); a regra pede permissão própria restrita — proposta `financial:cash_control:reopen`.
- **O servidor valida:** "Só se reabre um caixa fechado"; "Informe por que o caixa está sendo reaberto"; com dia posterior da mesma conta já aberto ou fechado, recusar ou recalcular a abertura encadeada (ponto a decidir; o mock não trata).
- **O servidor calcula:** remove `SHORTAGE`/`OVERAGE` do dia (a conferência é anulada), volta a `OPEN`, limpa `informed` e acrescenta `{ at, by, reason }` em `reopenings`.
- **A tela:** o detalhe do dia lista as reaberturas.
- **Substitui:** `cash-accounts.ts › reopenCashDay`.

#### POST /financial/cash-control/:id/movement/:movementId/approve

O responsável pelo caixa principal aprova o dinheiro que chegou do fechamento da frente de caixa (CX-4).

- **Corpo:** `{}`
- **Resposta:** o movimento, com `awaitingApproval: false`, `settled: true`, `approvedBy`.
- **Permissão:** `financial:cash_control:edit`.
- **O servidor valida:** "Lançamento não encontrado"; "Este caixa está fechado: reabra para aprovar"; "Este valor não aguarda aprovação".
- **A tela:** toast "Valor aprovado e somado ao saldo" e recarrega.
- **Substitui:** `cash-accounts.ts › approveMovement`.

#### POST /financial/cash-control/transfer

Transferência em par entre duas contas da empresa (CX-2).

- **Corpo:** `{ "fromId": "a1", "toId": "a2", "method": "PIX", "amount": 50000, "date": "2026-10-07" }`
- **Resposta:** `{ "linkedId": "uuid", "out": { "id": "…", "amount": -50000 }, "in": { "id": "…", "amount": 50000 } }`
- **Permissão:** `financial:cash_control:create`.
- **O servidor valida:** "Escolha a origem e o destino"; "Origem e destino precisam ser diferentes"; "O valor precisa ser maior que zero"; "Conta não encontrada"; "Abra o caixa de {conta} nesse dia antes de transferir" (origem ou destino com controle sem caixa aberto na data).
- **O servidor calcula:** `TRANSFER_OUT` na origem e `TRANSFER_IN` no destino com o mesmo `linkedId`; conta sem controle recebe o lançamento direto no histórico. Fora do resultado, sem plano de contas; cancelar uma ponta cancela a outra.
- **A tela:** toast "Transferência lançada nas duas contas".
- **Substitui:** `cash-accounts.ts › transferBetweenAccounts`.

### Frente de caixa — sessão do operador (FC-3, FC-7, FC-8, FC-14)

`CashSession { id, number, cashFrontId, name, operator, openedAt, openingBalance, status: OPEN|CLOSED, blindCount, shortageTolerance, roundingLimit, closingNote, movements[{ kind: SALE|WITHDRAWAL|SUPPLY|REVERSAL, description, parts[{method, paymentConditionId, bankAccountId, amount}], discount, reason, responsible, bankAccountId }] }`. A configuração vem do **cadastro da frente de caixa** (3.1: nome, `blindCount`, `shortageTolerance`, `roundingLimit` em valor ou percentual, conta padrão por forma), que ainda não tem tela: o servidor precisa da entidade, com uma frente padrão por empresa; editar exige a permissão própria "Configurar frente de caixa" (FC-15). Ligar a frente de caixa liga o controle na conta da gaveta (CX-1).

#### GET /financial/pdv

O estado da frente de caixa: a sessão do operador (aberta, ou a última fechada) e a fila.

- **Resposta:**
```json
{ "session": { "id": "c1", "number": 13, "name": "Caixa 1", "operator": "Renata Alves", "status": "OPEN", "openingBalance": 20000,
    "blindCount": false, "shortageTolerance": null, "roundingLimit": 100, "movements": [ … ] },
  "sales": [ { "id": "s2", "quotationId": "uuid", "reference": "VR-2026-0319", "client": "Marcelo Dias", "seller": "Tiago Nunes", "kind": "QUICK",
    "total": 68000, "paid": 34000, "delivered": false, "approvedAt": "2026-10-07T15:40:00Z", "goesToCash": true,
    "claimedBy": "Caixa 2 · Paulo Mendes", "billing": null, "ready": false, "readyAt": null, "phone": "(48) 99911-4420" } ],
  "openCashFronts": 2 }
```
- **Permissão:** `financial:pdv:view`; feature `pdv_screen`. O operador vê os valores do caixa sem `values:values:view` (FC-15).
- **O servidor valida:** sessão do usuário da sessão; fila da empresa, ordenável por `approvedAt`.
- **A tela:** abas "A receber" (`goesToCash && !ready`), "Movimento do caixa", "Aguardando retirada" (`ready && !delivered`) e o bloco das faturadas pelo caixa (`!goesToCash`, fora da soma); badge MINE/OTHER/FREE por `claimedBy`; com `openCashFronts > 1` mostra "Puxar para mim".
- **Substitui:** `cash-front.ts › getCashFront`.

#### POST /financial/pdv/session

Abre a sessão com o troco que já está na gaveta.

- **Corpo:** `{ "cashFrontId": "uuid-frente", "openingBalance": 20000 }`
- **Resposta:** a `CashSession` aberta.
- **Permissão:** `financial:pdv:create`.
- **O servidor valida:** uma sessão aberta por frente de caixa; `openingBalance ≥ 0`; sessão do dia anterior ainda aberta na mesma frente bloqueia (FC-14, por caixa). O mock não valida nada disso.
- **A tela:** toast "Caixa aberto" e recarrega.
- **Substitui:** `cash-front.ts › openCashSession`.

#### POST /financial/pdv/session/:id/movement

Sangria ou suprimento: dinheiro mudando de lugar, com motivo e responsável (FC-8).

- **Corpo:** `{ "kind": "WITHDRAWAL", "amount": 15000, "reason": "Acima do limite de dinheiro em gaveta", "bankAccountId": "a1" }`
- **Resposta:** a `CashSession` atualizada.
- **Permissão:** `financial:pdv:edit` (FC-15 prevê permissão própria "Sangria e suprimento").
- **O servidor valida:** "Nenhum caixa aberto"; "Informe o motivo: sangria e suprimento registram motivo e responsável"; "Informe o valor"; sangria não passa do dinheiro em gaveta; conta ativa e não `CARD` (o mock manda o **nome** da conta; a API recebe `bankAccountId`).
- **O servidor calcula:** grava o par na conta escolhida — sangria entra como `TRANSFER_IN` (na conta Caixa, aguardando aprovação como o dinheiro do fechamento — a confirmar com o time), suprimento sai como `TRANSFER_OUT` — fora do resultado, sem plano de contas (CX-5).
- **A tela:** toast e recarrega.
- **Substitui:** `cash-front.ts › addCashMovement`.

#### POST /financial/pdv/session/:id/close

Fecha a sessão com a conferência e transfere o recebido às contas (FC-7, 4.2).

- **Corpo:** `{ "countedCash": 30900, "keep": 10000, "note": "Faltaram R$ 3,00" }`
- **Resposta:**
```json
{ "expected": 31200, "countedCash": 30900, "difference": -300, "posted": true, "keep": 10000,
  "transfers": [ { "method": "CASH", "amount": 20900, "bankAccountId": "a1", "destination": "Caixa Empresa", "pending": true },
                 { "method": "PIX", "amount": 10000, "bankAccountId": "a2", "destination": "Bradesco" }, … ],
  "billed": [ { "reference": "VR-2026-0316", "client": "Supermercado Bom Preço", "total": 32000, "billing": "Faturamento mensal" } ] }
```
- **Permissão:** `financial:pdv:edit` (FC-15 prevê "Fechar caixa").
- **O servidor valida:** sessão aberta; "O valor que fica na gaveta não pode passar do contado"; `note` obrigatória quando a diferença passa da tolerância (hoje só a tela exige).
- **O servidor calcula:** `expected = openingBalance + Σ partes CASH` (sangria e estorno negativos); `difference = countedCash − expected`; `posted` = fora da tolerância → lança a quebra no nome do operador. Um movimento por forma, "Fechamento FC nº N · {forma}", na **conta padrão** de cada forma (CX-2, CX-4): dinheiro = `countedCash − keep`, na conta Caixa, **aguardando aprovação**; PIX no banco; cartão na operadora pelo valor cheio (FC-10). As vendas faturadas pelo caixa saem da fila para `billed`.
- **A tela:** conferência simples ou às cegas, prévia das transferências; toast "Caixa fechado".
- **Substitui:** `cash-front.ts › closeCashSession`.

### Frente de caixa — fila "a receber" (FC-2, FC-4, FC-5, FC-6, FC-9, FC-13, FC-17, FC-18, FC-19)

Cada item da fila é a venda aprovada que chegou ao caixa (`PendingSale`, formato no `GET /financial/pdv`). As ações abaixo valem para a sessão aberta do operador.

#### POST /financial/pdv/sale/:id/claim

Com mais de um caixa, o operador puxa para si a venda que vai atender (FC-5).

- **Corpo:** `{}`
- **Resposta:** a venda, com `claimedBy`.
- **Permissão:** `financial:pdv:edit`.
- **O servidor valida:** "Venda não encontrada"; "Esta venda já está com o {claimedBy}"; sessão aberta.
- **A tela:** toast "{ref} com você".
- **Substitui:** `cash-front.ts › claimSale`.

#### POST /financial/pdv/sale/:id/receive

Recebe a venda: pagamento misto, troco, sinal, arredondamento, e entrega ou não (FC-2, FC-9, FC-12).

- **Corpo:**
```json
{ "parts": [ { "method": "CASH", "paymentConditionId": "uuid-dinheiro", "bankAccountId": null, "amount": 3000 },
             { "method": "CARD", "paymentConditionId": "uuid-credito", "bankAccountId": "uuid-rede", "amount": 1500 } ],
  "deliver": false, "discount": 0, "waiveDownPayment": false }
```
- **Resposta:** a venda atualizada (`paid`, `delivered`, `claimedBy`); sai da fila quando `paid ≥ total && delivered`.
- **Permissão:** `financial:pdv:edit`; `waiveDownPayment` exige a permissão própria "Dispensar sinal" (FC-15/FC-17; hoje a tela libera só ao admin).
- **O servidor valida:** "Venda não encontrada"; "Abra o caixa antes de receber"; "Esta venda está sendo atendida no {claimedBy}"; "O arredondamento no balcão vai até {limite}. Acima disso, vale o limite de desconto do perfil do vendedor" (FC-18); valor recebido > 0; entregar exige tudo pago; venda rápida com `paid = 0`, sem entregar e com sinal obrigatório: `Σ parts ≥ ceil(total × downPaymentPercent / 100)`, salvo dispensa (FC-6, FC-17); guarda `paymentConditionId` e `bankAccountId` por parte (hoje se perdem no front).
- **O servidor calcula:** reserva a venda para quem recebe; `discount` reduz o total da venda (desconto, não quebra); grava o movimento `SALE` com as partes (cartão pelo valor cheio, FC-10); atualiza a situação no caixa do orçamento.
- **A tela:** toast "Recebimento confirmado e entregue" ou "…aguardando retirada"; recarrega a fila. O comprovante sai a pedido (FC-16).
- **Substitui:** `cash-front.ts › receiveSale`.

#### POST /financial/pdv/sale/:id/ready

Marca o trabalho como pronto e não retirado: a venda passa para "Aguardando retirada" (FC-19).

- **Corpo:** `{}`
- **Resposta:** a venda, com `ready: true`, `readyAt`.
- **Permissão:** `financial:pdv:edit`.
- **O servidor valida:** "Venda não encontrada"; "A venda já foi entregue". Com o gerenciador de produção (ELITE), a conclusão da ordem faz o mesmo sem esta rota.
- **A tela:** toast "{ref} aguardando retirada".
- **Substitui:** `cash-front.ts › markSaleReady`.

#### POST /financial/pdv/sale/:id/discard

Dá baixa no trabalho não retirado e lança a perda (FC-19).

- **Corpo:** `{ "reason": "Cliente não voltou em 60 dias" }`
- **Resposta:** `{ "loss": 12000, "discardedBy": "Renata Alves", "discardedAt": "2026-10-07T18:00:00Z" }`
- **Permissão:** `financial:pdv:delete`.
- **O servidor valida:** "Trabalho não encontrado" (só `ready`); "Descartar exige justificativa".
- **O servidor calcula:** `loss = max(0, total − paid)` (o sinal abate), lançada como perda no resultado; encerra a venda e marca a situação no caixa como cancelada.
- **A tela:** toast "Trabalho descartado · perda de R$ X registrada".
- **Substitui:** `cash-front.ts › discardPickup`.

#### POST /financial/pdv/sale/:id/reverse

Cancela a venda com estorno do que foi pago (FC-13, ALT-7).

- **Corpo:** `{ "reason": "Cliente desistiu" }`
- **Resposta:** `{ "reversal": { "id": "…", "parts": [ { "method": "PIX", "amount": 10000 } ] } }`
- **Permissão:** a tela usa `financial:pdv:edit`; a regra pede permissão restrita "Cancelar venda paga" (FC-15) — proposta `financial:pdv:delete`. Caixa já fechado: só administrador (ALT-7, 7.2).
- **O servidor valida:** "Venda não encontrada"; "O estorno exige justificativa" (hoje a tela manda texto fixo "Cancelamento pelo caixa"; passa a pedir ao usuário).
- **O servidor calcula:** movimento `REVERSAL` **pelas formas e contas originais** (o mock estorna tudo em dinheiro), ligado ao cancelamento e a quem fez; cancela o orçamento/ordem e marca a situação no caixa como cancelada.
- **A tela:** confirmação, toast e recarrega a fila.
- **Substitui:** `cash-front.ts › reverseSale`.

#### POST /financial/pdv/sale/:id/bill

Reverte a venda rápida para faturamento no nome do cliente (FC-4).

- **Corpo:** `{ "clientId": "uuid-cliente", "paymentConditionId": "uuid-cond", "installmentQty": 3, "dueDate": "2026-11-07", "notes": "Fatura mensal" }`
- **Resposta:** a venda, com `client` trocado, `billing: "3x · 1º vencimento 07/11/2026"`, `goesToCash: false`, `claimedBy: null`.
- **Permissão:** `financial:pdv:edit` + "Reverter venda para faturamento" (FC-15; hoje a tela confere `isAdmin`).
- **O servidor valida:** "Escolha o cliente"; "Informe a forma de pagamento e o vencimento"; "A venda já tem sinal recebido. Estorne o sinal antes de faturar para o cliente"; só venda rápida; cliente com cadastro aprovado e liberado para a forma escolhida (FC-12.1, CL-1/CL-2).
- **O servidor calcula:** troca o cliente do orçamento, grava a condição de pagamento e gera a conta a receber com as parcelas no fluxo financeiro; a venda fica na tela como registro, fora da soma, até o fechamento (`billed`).
- **A tela:** toast "Venda faturada para o cliente".
- **Substitui:** `cash-front.ts › reverseToBilling`.

Sem endpoint (sem chamador): `cash-front.ts › releaseSale` (soltar a reserva; se for usado, `DELETE /financial/pdv/sale/:id/claim`, só com `paid = 0`).

### Estoque e entrada de nota (FULL: ES-1 a ES-6)

`StockItem { id, materialId, variationId, name, variation, unit, quantity, minimum, averageCost, lastEntryCost, lastEntryDate }` — o saldo é por material/variação (ES-2). `Invoice { id, number, supplierId, supplier, issueDate, total, status: PENDING|MATCHED|ENTERED, items[{ id, supplierCode, description, supplierUnit, quantity, unitValue, gtin, materialId, variationId, materialName, conversionFactor }] }`. A primeira versão cobre NF → conferência → estoque (ES-1); a baixa por consumo nasce da produção (ES-7) e não tem tela de ação. **Nota:** a entrada automática pela Migrate (ALT-20, `04-entrada-automatica-de-notas.md`) vai alimentar a mesma `/stock/invoice-entry` (webhook de documento recebido, manifestação e conta a pagar), com o mesmo de-para; fica fora deste contrato.

#### GET /stock

Saldo do estoque, com mínimo e custo médio.

- **Resposta:** `{ "data": [ { "id": "st1", "materialId": "lona-440", "name": "Lona 440", "variation": "Marca X · Branca", "unit": "m²", "quantity": 120, "minimum": 50, "averageCost": 1250, "lastEntryCost": 1310, "lastEntryDate": "2026-09-10" } ], "page": 1, "lastPage": 1, "total": 4 }`
- **Permissão:** `stock:stock:view`; feature `stock_control`. `averageCost` e `lastEntryCost` só com `values:values:view` (omitidos sem ela).
- **O servidor valida:** filtros `status` (`abaixo-do-minimo`: `quantity < minimum`; `zerados`: `quantity = 0`), `search`, `page`, `limit` (máx. 100).
- **A tela:** abas Todos/Abaixo do mínimo/Zerados; badges vermelho, amarelo e verde; aviso quando a última entrada ficou acima do custo médio (ES-5).
- **Substitui:** `stock.ts › getStockItems`.

#### GET /stock/movement

Movimentações com a origem (ES-6).

- **Resposta:** `{ "data": [ { "id": "mv2", "date": "2026-09-11", "kind": "CONSUMPTION", "name": "Lona 440 · Marca X · Branca", "quantity": -12, "unit": "m²", "origin": "OS #1042 — Impressão em lona" } ], "page": 1, "lastPage": 3, "total": 52 }`
- **Permissão:** `stock:stock:view`; feature `stock_control`.
- **O servidor valida:** `kind` (`ENTRY`, `CONSUMPTION`, `ADJUSTMENT`), período, `materialId`, `page`, `limit` (máx. 100). O mock não pagina.
- **A tela:** tabela de movimentos com o badge do tipo.
- **Substitui:** `stock.ts › getStockMovements`.

#### GET /stock/invoice-entry

Notas de entrada com os itens do fornecedor e a conciliação.

- **Resposta:** `{ "data": [ { "id": "nf1", "number": "12.987", "supplier": "Distribuidora Sul", "issueDate": "2026-09-20", "total": 186000, "status": "PENDING", "items": [ { "id": "it1", "supplierCode": "LN440-BR", "description": "LONA BRILHO 440G 1,52M BRANCA", "supplierUnit": "ROLO", "quantity": 2, "unitValue": 68000, "materialId": "lona-440", "materialName": "Lona 440 · Marca X · Branca", "conversionFactor": 76 } ] } ], "page": 1, "lastPage": 1, "total": 1 }`
- **Permissão:** `stock:invoice_entry:view`; feature `invoice_entry`.
- **O servidor valida:** filtros `status`, `search`, `page`, `limit`.
- **A tela:** badge de pendências por nota e "1 ROLO = 76 m²" em cada item.
- **Substitui:** `stock.ts › getInvoices`.

#### PATCH /stock/invoice-entry/:id/item/:itemId

Concilia o item da nota com o material interno e o fator de conversão (ES-3).

- **Corpo:** `{ "materialId": "lona-440", "variationId": "v1", "conversionFactor": 76 }`
- **Resposta:** o item atualizado, com `materialName`, a quantidade que entra (`quantity × conversionFactor`) e o custo de entrada por unidade do material; mais o `status` da nota.
- **Permissão:** `stock:invoice_entry:edit`; feature `invoice_entry`.
- **O servidor valida:** "Item não encontrado"; material e variação da empresa; `conversionFactor > 0`; nota ainda não lançada. O nome do material vem do cadastro, não do corpo (o mock recebe `materialName`).
- **O servidor calcula:** a nota fica `MATCHED` quando todos os itens têm material; grava o **de-para** fornecedor + `supplierCode` → material + fator, e o aplica nas próximas notas do mesmo fornecedor.
- **A tela:** toast "Item vinculado ao material" e recarrega as notas.
- **Substitui:** `stock.ts › matchInvoiceItem`.

#### POST /stock/invoice-entry/:id/confirm

Dá entrada da nota no estoque (ES-4, ES-5).

- **Corpo:** `{}`
- **Resposta:** a nota com `status: "ENTERED"` e os saldos atualizados de cada material.
- **Permissão:** `stock:invoice_entry:edit`; feature `invoice_entry`.
- **O servidor valida:** "Nota não encontrada"; "{n} item(ns) da nota ainda não foram vinculados a um material." (ES-4); nota já lançada recusa — a entrada é **idempotente** (o mock duplica o saldo).
- **O servidor calcula:** por item, `qtd = quantity × conversionFactor`; `lastEntryCost = round(unitValue × quantity / qtd)`; **custo médio ponderado** `(qtdAnterior × custoMédio + qtd × lastEntryCost) / (qtdAnterior + qtd)` (ES-5; o mock não recalcula); saldo `+= qtd`; movimento `ENTRY` com origem "NF {número} — {fornecedor}"; cria o registro de estoque se o material ainda não tiver. O custo médio passa a ser o custo do material na composição (ES-5).
- **A tela:** toast "Entrada confirmada e estoque atualizado"; recarrega notas, saldo e movimentos.
- **Substitui:** `stock.ts › confirmInvoiceEntry`.

## 6. Locação

**Ordem dentro do módulo.** Nada daqui deve ser construído antes dos módulos 1 a 4. A locação **não tem tela nem mock**: as telas estão no backlog e o desenho entra depois do gerenciador de produção (área 13, "Telas: no backlog"). O que segue serve para **modelar o banco sem fechar portas**: o patrimônio de locação, a tabela de períodos do produto e a reserva. Se for preciso começar alguma coisa, comece pelos campos do patrimônio e do produto, que são os que as decisões de 07/10/2026 já fecharam (LC-1 a LC-14).

### Setor e patrimônio de locação

Não há cadastro novo (LC-1, LC-2): o setor Locação é um setor comum (`/sector`, com ícone e cor), e o bem alugado é um patrimônio detalhado (módulo 4), com unidade em **dias** e campos próprios.

#### PATCH /asset/:id (muda)

Acrescenta ao patrimônio os campos de locação.

- **Corpo:**
  ```json
  { "unit": "DAY", "monthlyProductivity": 22,
    "rental": { "mode": "INDIVIDUAL", "quotaPerPeriod": null,
      "point": { "address": "Av. Brasil, 1200", "lat": -23.55, "lng": -46.63, "face": "Sentido centro",
        "lit": true, "artWidth": 9000, "artHeight": 3000, "photos": ["asset/123/photo/1.jpg"] } } }
  ```
- **Resposta:** o patrimônio com `rental` e com `dailyCost` calculado.
- **Permissão:** `cost:base:edit`; feature `cost_base`.
- **O servidor valida:** `mode` é `INDIVIDUAL` (outdoor, painel: agenda por bem) ou `QUANTITY` (box truss, mobiliário: agenda pelo saldo do grupo de bens equivalentes) (LC-6); no modo por quantidade o bem precisa estar num grupo de bens equivalentes (P-5.2); `quotaPerPeriod` só para painel vendido por inserção (LC-9); `monthlyProductivity` em dias por mês é a **ocupação de referência** (LC-7).
- **O servidor calcula:** `dailyCost = custo mensal do bem ÷ dias de ocupação de referência` (LC-7), com os custos fixos próprios do bem, como aluguel do ponto e energia (LC-3); e, com histórico, a ocupação realizada média dos últimos 12 meses, para comparar (LC-7).
- **A tela:** (backlog) cadastro do bem com os dados do ponto, usados na proposta (LC-10).
- **Substitui:** nenhuma action (não há mock).

### Tabela de valores do produto de locação

O produto de locação é um produto comum (`/product`) com uma tabela de preço por período (LC-4, LC-5), no mesmo espírito da faixa de quantidade (FQ).

#### PUT /product/:id/rental-prices

Substitui a tabela de períodos do produto.

- **Corpo:**
  ```json
  { "assetId": "outdoor-av-brasil", "periods": [
      { "name": "Bissemana", "days": 14, "price": 180000 },
      { "name": "Mês", "days": 30, "price": 320000 } ] }
  ```
- **Resposta:** `{ "periods": [ … ], "suggestedDailyPrice": 13500 }`
- **Permissão:** `product_settings:products:edit`; o preço sugerido exige `values:values:view`.
- **O servidor valida:** períodos com `days` > 0, sem repetir; preço em centavos (LC-5).
- **O servidor calcula:** o preço sugerido parte do custo por dia do bem (LC-7) com o markup de referência da precificação (área 6).
- **A tela:** (backlog) a precificação do produto.
- **Substitui:** nenhuma action (não há mock).

### Disponibilidade e reserva

#### GET /rental/availability

Mostra se o bem (ou o grupo, no modo por quantidade) está livre no período.

- **Resposta:**
  ```json
  { "assetId": "outdoor-av-brasil", "from": "2026-11-01", "to": "2026-11-14", "available": false,
    "conflicts": [ { "quotationId": 812, "status": "PRE_RESERVED", "from": "2026-11-10", "to": "2026-11-23" } ],
    "quotaLeft": null }
  ```
- **Permissão:** `sale:quotation:view`.
- **O servidor valida:** no modo individual, duas reservas do mesmo bem não se sobrepõem; no modo por quantidade, a soma das reservas não passa do saldo do grupo; no painel por inserção, conta as cotas do período (LC-6, LC-9).
- **A tela:** (backlog) a agenda do item de locação no orçamento.
- **Substitui:** nenhuma action (não há mock).

#### POST /sale/quotation/:id/add-product (muda)

O item de locação leva o período, e entrar no orçamento cria a pré-reserva.

- **Corpo (campos novos):** `{ "rental": { "assetId": "outdoor-av-brasil", "quantity": 1, "startDate": "2026-11-01", "endDate": "2026-11-14" } }`
- **Resposta:** o item com `rental.status = "PRE_RESERVED"` e `rental.expiresAt` (a validade do orçamento).
- **Permissão:** `sale:quotation:edit`.
- **O servidor valida:** disponibilidade, como em `/rental/availability`, recusando com a reserva que conflita; preço pela tabela de períodos (o total sai do número de dias) (LC-5, LC-8).
- **A tela:** (backlog) mostra a reserva na agenda.
- **Substitui:** nenhuma action (não há mock).

#### POST /sale/quotation/:id/approve (muda)

- **O servidor:** transforma as pré-reservas em reserva confirmada; uma pré-reserva vencida libera o bem sozinha (LC-8). Com `recurring: true` na condição de pagamento, gera a cobrança mensal recorrente enquanto a reserva durar, e encerrar o contrato antes cancela as cobranças futuras (LC-12). Os serviços em volta (impressão da lona, montagem, frete) são itens comuns e viram tarefas no gerenciador; a foto do bem instalado é anexo da tarefa de instalação e pode ser exigida para concluir (LC-11, GP-25).

#### GET /rental/asset/:id/result

O resultado de cada bem no período: custo, receita e resultado (LC-7, "a estudar a fundo depois").

- **Resposta:** `{ "assetId": "outdoor-av-brasil", "from": "2026-01-01", "to": "2026-09-30", "occupiedDays": 201, "revenue": 2140000, "cost": 1185000, "result": 955000 }`
- **Permissão:** `cost:base:view` + `values:values:view`; feature `cost_base`.
- **A tela:** (backlog) o resultado por bem, que mostra qual ponto dá mais e qual dá menos.
- **Substitui:** nenhuma action (não há mock).

## 7. Decisões de modelagem a revisar

Estas são escolhas de modelagem que o contrato fez porque nem a regra nem a tela respondiam. Precisam do "de acordo" do time antes de virar código. Cada item diz em que módulo está.

### Rotas mexidas por mais de um módulo

Juntar numa mudança só:

- **`/sector`** ganha três campos, um de cada módulo: `saleUnit`, que diz como o setor vende (hora ou a unidade do equipamento, módulo 1, AB-19); `color` (módulo 3, §4.14); e `nature`, produtivo ou administrativo (módulo 4, BC-7).
- **`POST /sale/quotation/:id/approve`** muda em quatro módulos:
  - recusa sem condição de pagamento e com produto inativo (módulo 2, PAD-7);
  - cria o projeto da produção (módulo 3);
  - na venda rápida "enviar ao caixa", aprova sem condição e põe na fila (módulo 5);
  - confirma as pré-reservas de locação (módulo 6).
- **`add-product` e `update-product`** recebem `composition`, `variationId` e `addition` (módulo 2), e `rental` na locação (módulo 6).

### Processos e produtos (módulo 1)

1. **Variação: uma entidade só.** É a variação do produto, com nome e preço já no START (PV-6). No PRO, ela pode ter composição própria, que nasce como cópia (revisão de 03/10). As exceções por linha (PV-2) e as etapas só da variação (PV-7) ficaram sem endpoint. As rotas da composição recebem `variationId`.
2. **A composição guarda só o que é dela:** `status`, `dimension` e `allowRenameStages`. Preço, padrão de medidas e descritivo continuam no `/product`. "Adotar preço sugerido" é um `POST` que grava o valor calculado pelo próprio servidor (CP-16).
3. **Permissão própria para a composição:** `product_settings:composition:view|edit`, para cumprir a SEG-6. Hoje as telas usam `product_settings:products:*`.
4. **Recursos paginados** (até 100 por página, SEG-2). A tela troca a carga única por busca.
5. **A biblioteca devolve os materiais que não casaram** com o cadastro, para a conciliação (IP-7, área 4).
6. **Materiais:**
   - o setor passa a ser `sectorId`, apontando para `/sector` (MT-7);
   - a busca de venda direta nunca devolve custo, e a empresa sem `cost_base` recebe lista vazia em vez de 403;
   - inativar o material já o tira das composições na mesma transação;
   - o preço do material é gravado só em `PATCH /material/:id/price`, com o campo novo `desiredMargin`;
   - a importação aceita até 500 linhas e devolve as ignoradas;
   - trocar a unidade de material já usado é recusado;
   - não há `DELETE`;
   - o código `MAT-nn` é gerado pelo servidor.

### Orçamento (módulo 2)

1. **Medidas das linhas em milímetros**, como o `add-product`. O backend pendente falava em metros.
2. **Prévia de preço da linha sem custo** (`…/line/preview`). Hoje o painel do item chama o detalhe do processo, que devolve custo ao vendedor (ORC-7).
3. **Item montado na hora.** É um rascunho ligado ao orçamento, montado pelas mesmas rotas de etapa da composição, com dono do tipo `QUOTATION_DRAFT` e a permissão do orçamento.
4. **"Salvar como produto"** passa a exigir `product_settings:products:create`. Hoje a tela não confere.
5. **Remover item do orçamento** passa a exigir `sale:quotation:edit`, pela regra "remover linha de dentro do registro é `:edit`". Hoje a tela usa `:delete`.
6. **Resultado previsto (ORC-8)** com chaves próprias, `sale:quotation_result:view` e `:export`. Hoje a tela usa `cost:pricing:view` com `values:values:view`.
7. **Recusa de aprovar com produto inativo.** Devolve os itens em `userMessage.items`, um campo a mais no formato de erro.
8. **Acréscimo em campo próprio** (`addition`, ALT-25). Com ele, desconto negativo passa a dar 400.

### Gerenciador de produção (módulo 3)

1. **Colaborador da produção:** o usuário do sistema com um perfil (`OPERATOR` ou `MANAGER`). Quem não tem perfil entra como operador. Hoje a tela casa pelo e-mail.
2. **Dependências na aprovação.** Vêm do "depende de" do fluxo da composição, dentro do mesmo item (FL-1), ajustado pela regra do tipo de tarefa. Venda sem composição aprova sem criar projeto, e reaprovar não duplica.
3. **Chaves novas:**
   - `production:time_entry:edit` para corrigir e lançar tempo (GP-44); a provisória é `production:production:edit`;
   - `production:productivity:view` para a produtividade por pessoa; sem ela, o servidor omite essa parte.
4. **Tempo sem venda (GP-34).** Por enquanto é só o tempo apontado em tarefa cancelada.
5. **Link assinado** por versão de anexo, com prazo de 15 minutos.
6. **A ordem das etapas do tipo de tarefa é gravada inteira** (`PUT …/step-order`).

### Base de custos e precificação (módulo 4)

1. **`margin` é o lucro depois de tributação, comissão e custo financeiro,** que é o que o modal mostra (PR-2). O mock grava margem bruta.
2. **Preço variável.** O front manda `profit` e o servidor calcula o preço; o `price` enviado serve só de conferência.
3. **`PATCH /product/:id` deixa de aceitar `unitCost`** vindo do front (SEG-1).
4. **A aba Patrimônios da Base de custos usa `GET /asset`**, a mesma rota do cadastro.
5. **Venda do patrimônio.** O valor que resta é a aquisição menos a depreciação acumulada até a data (P-25). O mock usa a aquisição menos o residual.
6. **Folha.** O comportamento de acréscimo e desconto fica na linha do colaborador (`payroll-setup`); a alíquota de INSS e FGTS fica no item de custo da empresa (`payroll-templates`).
7. **Rateio do setor manual.** Ganha `allocationOutdated`, para avisar quando a lista de equipamentos muda.
8. **Sem tela:** `PUT /pricing/parameters` e `POST /pricing/item/apply-suggested` (CP-7, com prévia e confirmação). O rateio por item de custo (BC-8) ficou sem endpoint.

### Venda rápida, caixa e estoque (módulo 5)

1. **Rotas próprias para a venda rápida:** `POST /sale/quotation/quick-sale`, para criar direto (ALT-22), e `GET …/cash-status`, rota leve porque a tela consulta a cada 15 segundos.
2. **Venda rápida "cobrar na hora".** O `approve` simples é recusado: quem aprova e lança é `quick-sale/charge`.
3. **Arredondamento (FC-18).** Vem do cadastro da frente de caixa, uma entidade nova com uma frente padrão por empresa.
4. **Chaves novas:** `financial:cash_control:reopen` e `financial:pdv:delete`. "Dispensar sinal" e "reverter para faturamento" ainda não têm chave; hoje só o administrador faz.
5. **A confirmar com o time:**
   - se a sangria chega à conta Caixa aguardando aprovação;
   - o que fazer ao reabrir um dia que já tem dia posterior: recusar, ou recalcular a abertura encadeada.
6. **Fora do contrato:** a conciliação com o extrato (CX-6) e a entrada automática de notas (ALT-20).

## 8. Tabela mock → endpoint

Uma linha por action exportada dos arquivos provisórios do branch `integracao-2026-10-07` (e do `rateio-manual-2026-10-07`, onde indicado), na ordem dos módulos. Para trocar o mock pela chamada real: a tela chama a rota com `getData`, `getItem`, `createItemNew`, `updateItemNew`, `putItemNew` ou `deleteItemNew` de `src/actions/_cruds.ts`. A resposta já vem no formato `{ success, data, message }` que as telas esperam dos mocks. "Sem endpoint" quer dizer que a action some (dado de exemplo, cálculo que vai para o servidor ou função sem chamador) ou que vira efeito de outra rota.

| Arquivo | Action provisória | Endpoint | Telas que chamam |
|---|---|---|---|
| product-assembly.ts | getAssembly | GET /product/:id/assembly | AssemblyEditor (`/configuracoes/produtos/[id]/composicao` e aba Composição do NewProduct em `/configuracoes/produtos`); ProductsData (`/configuracoes/produtos`, R$ da lista) |
| product-assembly.ts | getProcessCatalog | sem endpoint: sem chamador (a lista de ativos é GET /process?status=ativos) | — |
| product-assembly.ts | updateAssembly | PATCH /product/:id/assembly (status, dimension, allowRenameStages); POST /product/:id/assembly/adopt-suggested-price (unitPrice do adotar); o resto (unitPrice, measure, unitAmount, technicalDescription, allowEdit*) vai no PATCH /product/:id que já existe | AssemblyEditor (`/configuracoes/produtos/[id]/composicao`); ProductsData (`/configuracoes/produtos`) |
| product-assembly.ts | getAssemblyResources | GET /product/assembly-resource (setores vêm de /sector; "como vende" de PATCH /sector/:id muda, `saleUnit`) | AssemblyEditor; ProcessEditor (`/configuracoes/produtos/processos/[id]`); QuotationComposeModal (`/vendas/orcamentos/[quotationId]`); hook useCompanySectors (composição, processos, `/configuracoes/producao`) |
| product-assembly.ts | addAssemblyLine | POST /product/:id/assembly/block/:blockId/line; POST /process/:id/line | AssemblyEditor; ProcessEditor |
| product-assembly.ts | addProductField | POST /product/:id/assembly/field; POST /process/:id/field | ProductFields (AssemblyEditor e ProcessEditor) |
| product-assembly.ts | updateProductField | PATCH /product/:id/assembly/field/:fieldId; PATCH /process/:id/field/:fieldId | ProductFields |
| product-assembly.ts | removeProductField | DELETE /product/:id/assembly/field/:fieldId; DELETE /process/:id/field/:fieldId | ProductFields |
| product-assembly.ts | addProductFormula | POST /product/:id/assembly/formula; POST /process/:id/formula | ProductFormulas; AssemblyEditor (Nova fórmula… na linha); ProcessEditor |
| product-assembly.ts | updateProductFormula | PATCH /product/:id/assembly/formula/:formulaId; PATCH /process/:id/formula/:formulaId | ProductFormulas |
| product-assembly.ts | removeProductFormula | DELETE /product/:id/assembly/formula/:formulaId; DELETE /process/:id/formula/:formulaId | ProductFormulas |
| product-assembly.ts | copyCompositionFrom | POST /product/:id/duplicate | DuplicateProductButton (`/configuracoes/produtos`) |
| product-assembly.ts | getProductVariants | GET /product/:id/variation | AssemblyEditor (abas de variação) |
| product-assembly.ts | createProductVariant | POST /product/:id/variation | AssemblyEditor |
| product-assembly.ts | renameProductVariant | PATCH /product/:id/variation/:variationId | AssemblyEditor |
| product-assembly.ts | removeProductVariant | DELETE /product/:id/variation/:variationId | AssemblyEditor |
| product-assembly.ts | removeAssemblyLine | DELETE /product/:id/assembly/block/:blockId/line/:lineId; DELETE /process/:id/line/:lineId | AssemblyEditor; ProcessEditor |
| product-assembly.ts | restoreProcessLines | POST /product/:id/assembly/block/:blockId/restore-process-lines | AssemblyEditor |
| product-assembly.ts | moveAssemblyBlock | sem endpoint: sem chamador (a ordem é a dependência, FL-5) | — |
| product-assembly.ts | updateAssemblyLine | PATCH /product/:id/assembly/block/:blockId/line/:lineId; PATCH /process/:id/line/:lineId | AssemblyEditor; ProcessEditor |
| product-assembly.ts | resetAssemblyLine | POST /product/:id/assembly/block/:blockId/line/:lineId/reset | AssemblyEditor |
| product-assembly.ts | setBlockLocalRules | PATCH /product/:id/assembly/block/:blockId (name, taskType, rules); PATCH /process/:id (no host processo:) | AssemblyEditor; ProcessEditor |
| product-assembly.ts | getMaterialUsage | GET /material/:id/usage (parte B) | InactivateMaterialDialog (`/configuracoes/produtos/materiais`) |
| product-assembly.ts | removeMaterialFromCompositions | sem endpoint: efeito de PATCH /material/:id/toggle-status | InactivateMaterialDialog (`/configuracoes/produtos/materiais`) |
| product-assembly.ts | getProductVariations | GET /product/:id/variation | ProductVariations (NewProduct, `/configuracoes/produtos`); QuotationProdDetailModal (`/vendas/orcamentos/[quotationId]`) |
| product-assembly.ts | saveProductVariations | PUT /product/:id/variation | ProductVariations (`/configuracoes/produtos`) |
| product-assembly.ts | addVariation | sem endpoint: modelo de exceções substituído em 03/10; chamador só no trecho oculto (SHOW_SECOND_PART) | AssemblyEditor (oculto) |
| product-assembly.ts | removeVariation | sem endpoint: idem (exceções substituídas pelas cópias) | AssemblyEditor (oculto) |
| product-assembly.ts | setVariationPrice | POST /product/:id/assembly/adopt-suggested-price (variationId) no adotar; preço manual em PATCH /product/:id/variation/:variationId | AssemblyEditor |
| product-assembly.ts | setVariationLine | sem endpoint: exceção por linha (PV-2) substituída em 03/10; chamador só no trecho oculto | AssemblyEditor (oculto) |
| product-assembly.ts | clearVariationLine | sem endpoint: idem | AssemblyEditor (oculto) |
| product-assembly.ts | getPriceTiers | GET /product/:id/price-tier | ProductPriceTiers (EditPriceModal, `/precificacao/*` e R$ de `/configuracoes/produtos`); QuotationProdDetailModal (`/vendas/orcamentos/[quotationId]`) |
| product-assembly.ts | setPriceTiers | PUT /product/:id/price-tier | ProductPriceTiers; PriceTiersCard (AssemblyEditor, oculto) |
| product-assembly.ts | getSaleForm | GET /product/:id/sale-form | SaleCompositionFields (QuotationProdDetailModal em `/vendas/orcamentos/[quotationId]`; ItemForm em `/vendas/orcamentos/[quotationId]/composicao`); AddToItem (instruções) |
| product-assembly.ts | getSaleComposition | POST /product/:id/sale-composition | CompositionReport (`/vendas/orcamentos/[quotationId]` e `/composicao`); ProposalPrint (`/vendas/orcamentos/[quotationId]/composicao/proposta`); servidor: production-manager.ts › tasksFromComposition (`/producao/projetos`) |
| product-assembly.ts | addLineOption | POST /product/:id/assembly/block/:blockId/line/:lineId/option; POST /process/:id/line/:lineId/option | AssemblyEditor; ProcessEditor |
| product-assembly.ts | removeLineOption | DELETE /product/:id/assembly/block/:blockId/line/:lineId/option/:optionId; DELETE /process/:id/line/:lineId/option/:optionId | AssemblyEditor; ProcessEditor |
| product-assembly.ts | getProductUsage | GET /product/:id/usage | InactivateProductDialog (`/configuracoes/produtos`) |
| product-assembly.ts | setProductActive | sem endpoint: o servidor lê isActive do cadastro (PATCH /product/:id/toggle-status já existe) | InactivateProductDialog (`/configuracoes/produtos`) |
| product-assembly.ts | getComposedProductIds | GET /product (muda: filtro hasComposition e campo no item) | ProductsData (`/configuracoes/produtos`) |
| product-assembly.ts | getLibrary | GET /product/assembly-library | Products (`/configuracoes/produtos`, botão Biblioteca) |
| product-assembly.ts | importFromLibrary | POST /product/:id/assembly/import-library | Products (`/configuracoes/produtos`, onSuccess do POST /product) |
| product-assembly.ts | addVariationBlock | sem endpoint: etapa só da variação (PV-7) substituída pelas cópias em 03/10; chamador só no trecho oculto | AssemblyEditor (oculto) |
| product-assembly.ts | removeVariationBlock | sem endpoint: idem | AssemblyEditor (oculto) |
| product-assembly.ts | getProcessUsage | GET /process/:id/usage | InactivateProcessDialog (`/configuracoes/produtos/processos`) |
| product-assembly.ts | getProcessList | GET /process (+ GET /process/quantity para as abas) | Processes (`/configuracoes/produtos/processos`); AddToItem (`/vendas/orcamentos/[quotationId]`) |
| product-assembly.ts | createProcessDef | POST /process | NewProcess (`/configuracoes/produtos/processos`) |
| product-assembly.ts | updateProcessMeta | PATCH /process/:id; PATCH /process/:id/toggle-status (active) | ProcessEditor; InactivateProcessDialog (`/configuracoes/produtos/processos`) |
| product-assembly.ts | getUsualNext | GET /process/:id/usual-next | ProcessEditor (`/configuracoes/produtos/processos/[id]`) |
| product-assembly.ts | setUsualNext | PUT /process/usual-next | ProcessEditor |
| product-assembly.ts | getFlow | sem endpoint: sem chamador (o fluxo vem em GET /product/:id/assembly) | — |
| compositions.ts | getComposition | sem endpoint novo: o cabeçalho vem de GET /product/:id (já existe) e a composição de GET /product/:id/assembly | CompositionDetail (`/configuracoes/produtos/[id]/composicao`) |
| compositions.ts | addCompositionStep | sem endpoint: sem chamador (coberto por POST /product/:id/assembly/block) | — |
| compositions.ts | updateCompositionStep | sem endpoint: sem chamador (coberto por PATCH /product/:id/assembly/block/:blockId) | — |
| compositions.ts | moveCompositionStep | sem endpoint: sem chamador (ordem pela dependência, FL-5) | — |
| compositions.ts | removeCompositionStep | sem endpoint: sem chamador (coberto por DELETE /product/:id/assembly/block/:blockId) | — |
| compositions.ts | applySuggestedPrice | sem endpoint: sem chamador (coberto por POST /product/:id/assembly/adopt-suggested-price) | — |
| compositions.ts | addProductField | sem endpoint: sem chamador (homônimo de product-assembly.ts; POST /product/:id/assembly/field) | — |
| compositions.ts | updateProductField | sem endpoint: sem chamador (PATCH /product/:id/assembly/field/:fieldId) | — |
| compositions.ts | removeProductField | sem endpoint: sem chamador (DELETE /product/:id/assembly/field/:fieldId) | — |
| compositions.ts | getAvailableParts | sem endpoint: sem chamador (coberto por GET /product/:id/assembly/part-candidate) | — |
| compositions.ts | setReleasedForSale | sem endpoint: sem chamador (coberto por PATCH /product/:id/assembly, status) | — |
| compositions.ts | addProductVariation | sem endpoint: sem chamador (coberto por POST /product/:id/variation) | — |
| compositions.ts | removeProductVariation | sem endpoint: sem chamador (coberto por DELETE /product/:id/variation/:variationId) | — |
| compositions.ts | setVariationOverride | sem endpoint: sem chamador; modelo de exceções (PV-2) substituído em 03/10 | — |
| compositions.ts | clearVariationOverride | sem endpoint: sem chamador; idem | — |
| compositions.ts | setVariationPrice | sem endpoint: sem chamador (coberto por PATCH /product/:id/variation/:variationId) | — |
| product-assembly.ts | addOwnBlock | POST /product/:id/assembly/block (etapa do produto, sem `processId`) | AssemblyEditor (`/configuracoes/produtos/[id]/composicao` e aba Composição do produto); QuotationComposeModal (`/vendas/orcamentos/[quotationId]`, item montado: mesmas rotas sob `/sale/quotation/:id/composed-draft/:draftId/assembly`, módulo 2) |
| product-assembly.ts | addAssemblyBlock | POST /product/:id/assembly/block (com `processId`) | AssemblyEditor (`/configuracoes/produtos/[id]/composicao` e aba Composição do produto); QuotationComposeModal (`/vendas/orcamentos/[quotationId]`, item montado: mesmas rotas sob `/sale/quotation/:id/composed-draft/:draftId/assembly`, módulo 2) |
| product-assembly.ts | addPartBlock | POST /product/:id/assembly/block (com `partProductId`) | AssemblyEditor (`/configuracoes/produtos/[id]/composicao` e aba Composição do produto); QuotationComposeModal (`/vendas/orcamentos/[quotationId]`, item montado: mesmas rotas sob `/sale/quotation/:id/composed-draft/:draftId/assembly`, módulo 2) |
| product-assembly.ts | removeAssemblyBlock | DELETE /product/:id/assembly/block/:blockId | AssemblyEditor (`/configuracoes/produtos/[id]/composicao` e aba Composição do produto); QuotationComposeModal (`/vendas/orcamentos/[quotationId]`, item montado: mesmas rotas sob `/sale/quotation/:id/composed-draft/:draftId/assembly`, módulo 2) |
| product-assembly.ts | linkBlock | PATCH /product/:id/assembly/block/:blockId (`dependsOn`) | AssemblyEditor (`/configuracoes/produtos/[id]/composicao` e aba Composição do produto); QuotationComposeModal (`/vendas/orcamentos/[quotationId]`, item montado: mesmas rotas sob `/sale/quotation/:id/composed-draft/:draftId/assembly`, módulo 2) |
| product-assembly.ts | unlinkBlock | PATCH /product/:id/assembly/block/:blockId (`dependsOn`) | AssemblyEditor (`/configuracoes/produtos/[id]/composicao` e aba Composição do produto); QuotationComposeModal (`/vendas/orcamentos/[quotationId]`, item montado: mesmas rotas sob `/sale/quotation/:id/composed-draft/:draftId/assembly`, módulo 2) |
| product-assembly.ts | replaceBlockProcess | PATCH /product/:id/assembly/block/:blockId (`processId`) | AssemblyEditor (`/configuracoes/produtos/[id]/composicao` e aba Composição do produto); QuotationComposeModal (`/vendas/orcamentos/[quotationId]`, item montado: mesmas rotas sob `/sale/quotation/:id/composed-draft/:draftId/assembly`, módulo 2) |
| product-assembly.ts | getNextStepCandidates | GET /product/:id/assembly/next-step | AssemblyEditor (`/configuracoes/produtos/[id]/composicao` e aba Composição do produto); QuotationComposeModal (`/vendas/orcamentos/[quotationId]`, item montado: mesmas rotas sob `/sale/quotation/:id/composed-draft/:draftId/assembly`, módulo 2) |
| product-assembly.ts | getPartCandidates | GET /product/:id/assembly/part-candidate | AssemblyEditor (`/configuracoes/produtos/[id]/composicao` e aba Composição do produto); QuotationComposeModal (`/vendas/orcamentos/[quotationId]`, item montado: mesmas rotas sob `/sale/quotation/:id/composed-draft/:draftId/assembly`, módulo 2) |
| product-assembly.ts | getProcessDetail | GET /process/:id (no painel "Acrescentar a este item" e no recálculo das linhas: POST /sale/quotation/:id/item/:itemId/line/preview, módulo 2) | Processos (`/configuracoes/produtos/processos/[id]`, NewProcess, ProcessEditor); orçamento (`AddToItem`, `QuotationItems` em `/vendas/orcamentos/[quotationId]`) |
| materials.ts | getMaterials | GET /material | Materiais (`/configuracoes/produtos/materiais`, `Materials.tsx`; a lista também alimenta `ImportMaterialsDialog`); Entrada de nota (`/estoque/entrada-de-nota`, `MatchItemModal.tsx`) |
| materials.ts | createMaterial | POST /material | Materiais › Novo material (`NewMaterial.tsx`) |
| materials.ts | updateMaterial | PATCH /material/:id | Materiais › Editar material (`NewMaterial.tsx`) |
| materials.ts | createMaterialVariations | POST /material/:id/variation | Materiais › Editar material, seção Variações (`NewMaterial.tsx`) |
| materials.ts | updateMaterialVariation | PATCH /material/:id/variation/:variationId | Materiais › R$ › Custo e preço (`VariationsModal.tsx`) |
| materials.ts | setMaterialActive | PATCH /material/:id/toggle-status | Materiais › Editar material › Inativar/Reativar (`InactivateMaterialDialog.tsx`) |
| materials.ts | previewMaterialImport | POST /material/import/preview | Materiais › Importar lista (`ImportMaterialsDialog.tsx`) |
| materials.ts | importMaterials | POST /material/import | Materiais › Importar lista (`ImportMaterialsDialog.tsx`) |
| materials-data.ts | materialUnitSymbol | sem endpoint: formatação da sigla da unidade, fica no front | Materiais (`Materials.tsx`, `VariationsModal.tsx`); `pricing.ts` |
| materials-data.ts | materialResources | sem endpoint próprio: vira a parte de materiais do endpoint de recursos da composição (módulo 1, parte A) | Composição do produto e Processos (`/configuracoes/produtos/[id]/composicao`, via `product-assembly.ts › getAssemblyResources`) |
| materials-data.ts | materials | sem endpoint: é a lista de exemplo em memória; quem a lê passa a usar GET /material | `materials.ts`, `pricing.ts`, `product-assembly.ts` (no servidor) |
| quotation-composition.ts | getOpenQuotationsUsingProduct | GET /product/:id/usage (módulo 1, campo `openQuotations`) | `/configuracoes/produtos` (NewProduct › InactivateProductDialog) |
| quotation-composition.ts | getQuotation | sem endpoint: orçamento de exemplo do protótipo (vitrine). No real, `/resultado` lê GET /sale/quotation/:id/result e a proposta lê GET /sale/quotation/:id/pdf-data | `/vendas/orcamentos/[quotationId]/composicao`, `/vendas/orcamentos/[quotationId]/resultado`, `/vendas/orcamentos/[quotationId]/composicao/proposta` |
| quotation-composition.ts | getQuotationProducts | sem endpoint: lista de produtos de exemplo. No real, GET /product com variações, campos e `hasComposition` (módulo 1) | `/vendas/orcamentos/[quotationId]/composicao`; `/vendas/orcamentos/[quotationId]` (AddToItem, só como reserva quando a API vem vazia); `/producao/projetos` (Projects) |
| quotation-composition.ts | getItemOptions | sem endpoint: protótipo (vitrine). No real, os processos vêm do módulo 1 e as partes de GET /product | `/vendas/orcamentos/[quotationId]/composicao` |
| quotation-composition.ts | addQuotationItem | sem endpoint: protótipo (vitrine). No real, POST /sale/quotation/:id/add-product (muda) | `/vendas/orcamentos/[quotationId]/composicao` |
| quotation-composition.ts | addQuotationLine | sem endpoint: protótipo (vitrine). No real, POST /sale/quotation/:id/item/:itemId/line | `/vendas/orcamentos/[quotationId]/composicao` |
| quotation-composition.ts | updateQuotationItem | sem endpoint: protótipo (vitrine). No real, PATCH /sale/quotation/update-product/:itemId (muda) | `/vendas/orcamentos/[quotationId]/composicao` |
| quotation-composition.ts | removeQuotationLine | sem endpoint: protótipo (vitrine). No real, DELETE /sale/quotation/:id/item/:itemId/line/:lineId | `/vendas/orcamentos/[quotationId]/composicao` |
| quotation-composition.ts | removeQuotationItem | sem endpoint: protótipo (vitrine). No real, DELETE /sale/quotation/remove-product/:itemId | `/vendas/orcamentos/[quotationId]/composicao` |
| quotation-composition.ts | getItemLines | GET /sale/quotation/:id (muda: `items[].lines`) | `/vendas/orcamentos/[quotationId]` (QuotationItems); `/sandbox/orcamento` |
| quotation-composition.ts | addItemLine | POST /sale/quotation/:id/item/:itemId/line (com a prévia POST …/line/preview) | `/vendas/orcamentos/[quotationId]` (AddToItem) |
| quotation-composition.ts | recalculateItemLines | PATCH /sale/quotation/update-product/:itemId (muda: recalcula as linhas e devolve `linesRecalculated`) | `/vendas/orcamentos/[quotationId]` (QuotationProdDetailModal, edição) |
| quotation-composition.ts | removeItemLine | DELETE /sale/quotation/:id/item/:itemId/line/:lineId | `/vendas/orcamentos/[quotationId]` (QuotationItems) |
| quotation-composition.ts | saveItemComposition | POST /sale/quotation/:id/add-product e PATCH /sale/quotation/update-product/:itemId (muda: campo `composition`) | `/vendas/orcamentos/[quotationId]` (QuotationProdDetailModal) |
| quotation-composition.ts | getItemCompositions | GET /sale/quotation/:id (muda: `items[].composition`) | `/vendas/orcamentos/[quotationId]` (QuotationItems, CompositionReport, QuotationProdDetailModal) |
| quotation-composition.ts | getDirectSaleMaterials | sem endpoint neste módulo: GET /material?directSale=true&active=true (módulo 1) | `/vendas/orcamentos/[quotationId]` (QuotationItemsModal, MaterialItemDialog) |
| quotation-composition.ts | addMaterialItem | POST /sale/quotation/:id/add-material | `/vendas/orcamentos/[quotationId]` (MaterialItemDialog) |
| quotation-composition.ts | updateMaterialItem | PATCH /sale/quotation/update-material/:itemId | `/vendas/orcamentos/[quotationId]` (MaterialItemDialog, edição) |
| quotation-composition.ts | addComposedItem | POST /sale/quotation/:id/add-composed | `/vendas/orcamentos/[quotationId]` (QuotationComposeModal); `/sandbox/fluxo` |
| quotation-composition.ts | updateComposedItem | PATCH /sale/quotation/update-composed/:itemId | `/vendas/orcamentos/[quotationId]` (QuotationComposeModal, edição); `/sandbox/fluxo` |
| quotation-composition.ts | removeComposedItem | DELETE /sale/quotation/remove-product/:itemId (muda: qualquer origem) | `/vendas/orcamentos/[quotationId]` (QuotationItems) |
| quotation-composition.ts | getComposedItems | GET /sale/quotation/:id (muda: itens `COMPOSED` e `MATERIAL` no detalhe) | `/vendas/orcamentos/[quotationId]` (QuotationItems, FinishQuotation) |
| sales-settings.ts | getSalesSettings | GET /sales-settings (o painel do item passa a ler o markup da prévia da linha) | `/configuracoes/vendas/terceirizados` (OutsourcedSettingsForm); `/vendas/orcamentos/[quotationId]` (AddToItem) |
| sales-settings.ts | updateSalesSettings | PUT /sales-settings | `/configuracoes/vendas/terceirizados` (OutsourcedSettingsForm) |
| product-assembly.ts | createDraftAssembly | POST /sale/quotation/:id/composed-draft | `/vendas/orcamentos/[quotationId]` (QuotationComposeModal); `/sandbox/fluxo` |
| product-assembly.ts | updateDraftAssembly | sem endpoint próprio: nome e medida vão no corpo de POST /sale/quotation/:id/add-composed e PATCH /sale/quotation/update-composed/:itemId | `/vendas/orcamentos/[quotationId]` (QuotationComposeModal); `/sandbox/fluxo` |
| product-assembly.ts | getComposedItemView | GET /sale/quotation/:id/composed-draft/:draftId | `/vendas/orcamentos/[quotationId]` (QuotationComposeModal); `/sandbox/fluxo` |
| product-assembly.ts | resolveComposedItem | sem endpoint: o retrato (ORC-10) é calculado dentro de add-composed e update-composed; só o servidor chama | servidor (`quotation-composition.ts` › addComposedItem/updateComposedItem) |
| product-assembly.ts | saveDraftAsProduct | POST /sale/quotation/:id/composed-draft/:draftId/save-as-product | `/vendas/orcamentos/[quotationId]` (QuotationComposeModal); `/sandbox/fluxo` |
| sector-colors.ts | getSectorColors | GET /sector (muda: campo `color`) | todas as que usam `useSectorColor`/`SectorIcon`: setores, gerenciador, detalhe da tarefa, projeto, ficha, produtividade, Agenda de entrega, composição, processos, Configurações › Produção |
| sector-colors.ts | setSectorColor | PATCH /sector/:id (muda: campo `color`; também no POST /sector) | /configuracoes/empresa-e-sistema/setores (diálogo Editar) |
| production-manager.ts | getManagerConfig | GET /production/config | /configuracoes/producao; /producao/projetos/[id] |
| production-manager.ts | getManagerSummary | GET /production/manager | /producao/gerenciador |
| production-manager.ts | getManagerBoard | GET /production/manager/:id/board | /producao/gerenciador (visão quadro) |
| production-manager.ts | getViewer | GET /production/manager/:id/board (campo `viewer`, tirado da sessão) | /producao/gerenciador |
| production-manager.ts | getAgenda | GET /production/agenda | /producao/gerenciador (Agenda viva, Veículos) |
| production-manager.ts | getTask | sem endpoint: sem chamador (as ações devolvem a TaskView) | — |
| production-manager.ts | getProjects | GET /production/project (+ GET /production/project/quantity) | /producao/projetos |
| production-manager.ts | getProject | GET /production/project/:id | /producao/projetos/[id]; /producao/projetos/[id]/ficha |
| production-manager.ts | saveManager | POST /production/manager · PUT /production/manager/:id | /configuracoes/producao |
| production-manager.ts | inactivateManager | POST /production/manager/:id/inactivate | /configuracoes/producao |
| production-manager.ts | reactivateManager | POST /production/manager/:id/reactivate | /configuracoes/producao |
| production-manager.ts | setManagerUser | PUT /production/manager/:id/user/:collaboratorId | /configuracoes/producao |
| production-manager.ts | setCollaboratorRole | PATCH /production/collaborator/:id | /configuracoes/producao |
| production-manager.ts | saveTaskType | POST /production/task-type · PUT /production/task-type/:id | /configuracoes/producao |
| production-manager.ts | setTaskTypeActive | PATCH /production/task-type/:id/toggle-status | /configuracoes/producao |
| production-manager.ts | saveTaskStep | POST /production/task-type/:id/step · PATCH /production/task-type/:id/step/:stepId | /configuracoes/producao |
| production-manager.ts | removeTaskStep | DELETE /production/task-type/:id/step/:stepId | /configuracoes/producao |
| production-manager.ts | moveTaskStep | PUT /production/task-type/:id/step-order | /configuracoes/producao |
| production-manager.ts | saveVehicle | POST /production/vehicle · PUT /production/vehicle/:id | /configuracoes/producao |
| production-manager.ts | setVehicleActive | PATCH /production/vehicle/:id/toggle-status | /configuracoes/producao |
| production-manager.ts | actOnTask | POST /production/task/:id/action | /producao/gerenciador; /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | addPendency | POST /production/task/:id/pendency | /producao/gerenciador; /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | releaseNext | POST /production/task/:id/release-next | /producao/gerenciador; /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | scheduleTask | PUT /production/task/:id/schedule | /producao/gerenciador; /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | assignTask | PATCH /production/task/:id (`assigneeId`) | /producao/gerenciador; /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | setTaskVehicle | PATCH /production/task/:id (`vehicleId`, `km`) | /producao/gerenciador; /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | startWork | POST /production/task/:id/work/start | /producao/gerenciador (arrastar no quadro, TaskDetailDialog); /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | stopWork | POST /production/task/:id/work/stop | /producao/gerenciador (painel de colaboradores, TaskDetailDialog); /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | correctTimeEntry | PUT /production/task/:id/time-entry/:entryId | /producao/gerenciador; /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | addTimeEntry | POST /production/task/:id/time-entry | /producao/gerenciador; /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | addAttachment | POST /production/task/:id/attachment (novo) · POST /production/task/:id/attachment/:attachmentId/version (nova versão) | /producao/gerenciador; /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | setCurrentVersion | PUT /production/task/:id/attachment/:attachmentId/current | /producao/gerenciador; /producao/projetos/[id] (TaskDetailDialog) |
| production-manager.ts | setProjectStatus | POST /production/project/:id/release · /finish · /cancel | /producao/projetos/[id] |
| production-manager.ts | changeDelivery | PATCH /production/project/:id/delivery | /producao/projetos/[id] |
| production-manager.ts | createProjectFromSale | sem endpoint: o projeto nasce em POST /sale/quotation/:id/approve (muda); o botão de exemplo sai | /producao/projetos (botão "Projeto da venda aprovada (exemplo)") |
| production-manager.ts | getProductivity | GET /production/productivity | /producao/produtividade |
| cost-base.ts | getAdminExpenses | GET /cost-base/admin-expense | Base de custos › Despesas administrativas (`AdminExpenses.tsx`) |
| cost-base.ts | getAdminExpensesTotals | GET /cost-base/admin-expense/totals | Base de custos › Despesas administrativas (`AdminExpenses.tsx`) |
| cost-base.ts | updateAdminExpenseCriterion | PATCH /cost-base/admin-expense/:id | Base de custos › Despesas administrativas, modal Editar critério (`EditCriterion/index.tsx`) |
| cost-base.ts | getDistribution | GET /cost-base/distribution | Base de custos › Distribuição (`Distribution.tsx`) |
| cost-base.ts | getDistributionTotals | GET /cost-base/distribution (campo `totals`) | Base de custos › Distribuição (`Distribution.tsx`) |
| cost-base.ts | updateDistribution | PUT /cost-base/distribution | Base de custos › Distribuição, Salvar distribuição (`Distribution.tsx`) |
| cost-base.ts | getSectorCosts | GET /cost-base/sector | Base de custos › Por setor (`SectorCosts.tsx`) |
| cost-base.ts | getCostSummary | GET /cost-base/summary | Base de custos › Resumo (`CostSummaryView.tsx`) |
| cost-base.ts | getLaborSectors | GET /cost-base/labor | Base de custos › Mão de obra (`LaborCosts.tsx`) |
| cost-base.ts | updateLaborHours | PUT /cost-base/labor/:sectorId/hours | Base de custos › Mão de obra, carga por colaborador (`WorkloadModal.tsx`) |
| cost-base.ts | getDepreciationAssets | GET /asset | Base de custos › Patrimônios (`Depreciation.tsx`) |
| cost-base.ts | getDepreciationTotals | GET /cost-base/depreciation | Base de custos › Patrimônios (`Depreciation.tsx`) |
| cost-base.ts | getDepreciationCounts | GET /asset/quantity | Base de custos › Patrimônios (`Depreciation.tsx`) |
| cost-base.ts | getCostComparison | GET /cost-base/comparison | Base de custos › Comparativo (`Comparison.tsx`) |
| sector-allocation.ts (branch rateio-manual-2026-10-07) | getSectorAllocations | GET /cost-base/sector/allocation | Base de custos › Distribuição, cartão Rateio entre os equipamentos do setor (`SectorAllocations.tsx`) |
| sector-allocation.ts (branch rateio-manual-2026-10-07) | updateSectorAllocation | PUT /cost-base/sector/:id/allocation | Base de custos › Distribuição, configuração do rateio do setor (`SectorAllocationDialog.tsx`) |
| pricing.ts | getPricingSummary | GET /pricing/summary | Precificação › Resumo (`PricingSummaryView.tsx`); modal de precificação (`EditPriceModal.tsx`), aberto também do cadastro de produtos (`ProductsData.tsx`) e de materiais (`Materials.tsx`, `VariationsModal.tsx`) |
| pricing.ts | getPricingItems | GET /pricing/item | Precificação › Mão de obra, Máquinas, Materiais e Produtos (`PricingList.tsx`) |
| pricing.ts | updatePricingParameters | PUT /pricing/parameters | nenhuma (sem chamador; mantido porque é a única forma de definir os parâmetros) |
| pricing.ts | updateItemPrice | PATCH /pricing/item/:id (materiais: PATCH /material/:id/price) | modal de precificação (`EditPriceModal.tsx`) na Precificação (`PricingList.tsx`) e no cadastro de materiais (`Materials.tsx`, `VariationsModal.tsx`) |
| payroll-structure.ts | getPayrollStructure | GET /financial/payroll-setup (muda) | Configurações › Financeiro › Folha de pagamento (`Main.tsx`) |
| payroll-structure.ts | updatePayrollItem | PATCH /financial/payroll-setup/:id (muda) | Configurações › Financeiro › Folha de pagamento, editar item (`EditPayrollItem.tsx`) |
| payroll-structure.ts | setPayrollItem | PATCH /financial/payroll-setup/:id (muda; `isSet`) | Configurações › Financeiro › Folha de pagamento, acrescentar e tirar item (`Main.tsx`) |
| assets.ts | getAssets | GET /asset | Patrimônios (`Assets.tsx`) |
| assets.ts | getAsset | GET /asset/:id | Patrimônios › detalhe do bem (`AssetDetail.tsx`) |
| assets.ts | getAssetGroups | GET /asset/group | Patrimônios (`Assets.tsx`); Patrimônios › Grupos (`AssetGroups.tsx`) |
| assets.ts | createAssetGroup | POST /asset/group | Patrimônios › Grupos, novo grupo (`NewGroup.tsx`) |
| assets.ts | renameAssetGroup | PATCH /asset/group/:id | Patrimônios › Grupos (`AssetGroups.tsx`) |
| assets.ts | createAsset | POST /asset | Patrimônios, novo patrimônio (`NewAsset/index.tsx`) |
| assets.ts | updateAsset | PATCH /asset/:id | Patrimônios, editar da linha (`NewAsset/index.tsx`); detalhe do bem, editar (`EditAssetModal.tsx`) |
| assets.ts | createAssetCost | POST /asset/:id/cost | Patrimônios › detalhe do bem, novo custo (`NewCostModal.tsx`) |
| assets.ts | createAssetSetup | POST /asset/:id/setup | Patrimônios › detalhe do bem, nova configuração produtiva (`NewSetupModal.tsx`) |
| assets.ts | sellAsset | POST /asset/:id/sell | Patrimônios › detalhe do bem, vender (`SellAssetModal.tsx`) |
| assets.ts | setAssetActive | PATCH /asset/:id/toggle-status | Patrimônios › detalhe do bem, inativar e reativar (`AssetDetail.tsx`) |
| assets.ts | deleteAssetGroup | DELETE /asset/group/:id | Patrimônios › Grupos (`AssetGroups.tsx`) |
| quick-sale.ts | getQuickSaleSettings | GET /sale/quick-sale/settings | `/configuracoes/vendas/venda-rapida` (QuickSaleSettingsForm), `/vendas/orcamentos?novo=venda-rapida` (Quotations), `/vendas/orcamentos/[quotationId]` (QuickSaleCheckout), `/financeiro/frente-de-caixa` (ReceiveSaleDialog) |
| quick-sale.ts | updateQuickSaleSettings | PUT /sale/quick-sale/settings | `/configuracoes/vendas/venda-rapida` (QuickSaleSettingsForm) |
| quick-sale.ts | getQuickSaleOptions | sem endpoint: usa GET /sale/series, GET /contact-source e GET /employee, que já existem | `/configuracoes/vendas/venda-rapida` (QuickSaleSettingsForm) |
| cash-accounts.ts | getBankAccounts | GET /bank/account (muda) | `/configuracoes/financeiro/contas-bancarias` (BankAccounts), `/financeiro/frente-de-caixa` (CashDialogs: sangria/suprimento) |
| cash-accounts.ts | getPaymentMethods | sem endpoint: as formas são as condições de pagamento reais (GET /payment-condition) | `/configuracoes/financeiro/contas-bancarias` (BankAccounts → AccountDialog) |
| cash-accounts.ts | saveBankAccount | POST /bank/account · PATCH /bank/account/:id (muda) | `/configuracoes/financeiro/contas-bancarias` (AccountDialog) |
| cash-accounts.ts | removeBankAccount | DELETE /bank/account/:id (muda) | `/configuracoes/financeiro/contas-bancarias` (BankAccounts) |
| cash-accounts.ts | reactivateBankAccount | PATCH /bank/account/:id/toggle-status (muda) | `/configuracoes/financeiro/contas-bancarias` (BankAccounts) |
| cash-accounts.ts | getCashControl | GET /financial/cash-control (muda) | `/financeiro/controle-de-caixa` (CashControl) |
| cash-accounts.ts | openCashDay | POST /financial/cash-control | `/financeiro/controle-de-caixa` (CashDayDialogs › OpenDayDialog) |
| cash-accounts.ts | addAdjustment | POST /financial/cash-control/:id/adjustment | `/financeiro/controle-de-caixa` (CashDayDialogs › AdjustmentDialog) |
| cash-accounts.ts | transferBetweenAccounts | POST /financial/cash-control/transfer | `/financeiro/controle-de-caixa` (CashDayDialogs › TransferDialog) |
| cash-accounts.ts | closeCashDay | POST /financial/cash-control/:id/close | `/financeiro/controle-de-caixa` (CashDayDialogs › CloseDayDialog) |
| cash-accounts.ts | reopenCashDay | POST /financial/cash-control/:id/reopen | `/financeiro/controle-de-caixa` (CashDayDialogs › ReopenDayDialog) |
| cash-accounts.ts | approveMovement | POST /financial/cash-control/:id/movement/:movementId/approve | `/financeiro/controle-de-caixa` (CashControl → CashDayDetail) |
| cash-front.ts | getCashFront | GET /financial/pdv | `/financeiro/frente-de-caixa` (PDV) |
| cash-front.ts | openCashSession | POST /financial/pdv/session | `/financeiro/frente-de-caixa` (CashDialogs › OpenCashDialog) |
| cash-front.ts | addCashMovement | POST /financial/pdv/session/:id/movement | `/financeiro/frente-de-caixa` (CashDialogs › CashMovementDialog) |
| cash-front.ts | receiveSale | POST /financial/pdv/sale/:id/receive | `/financeiro/frente-de-caixa` (ReceiveSaleDialog) |
| cash-front.ts | reverseSale | POST /financial/pdv/sale/:id/reverse | `/financeiro/frente-de-caixa` (PDV) |
| cash-front.ts | closeCashSession | POST /financial/pdv/session/:id/close | `/financeiro/frente-de-caixa` (CashDialogs › CloseCashDialog) |
| cash-front.ts | markSaleReady | POST /financial/pdv/sale/:id/ready | `/financeiro/frente-de-caixa` (PDV) |
| cash-front.ts | discardPickup | POST /financial/pdv/sale/:id/discard | `/financeiro/frente-de-caixa` (CashDialogs › DiscardPickupDialog) |
| cash-front.ts | getQuickSaleCheckout | GET /sale/quotation/:id/cash-status | `/vendas/orcamentos/[quotationId]` (QuickSaleCheckout, QuickSaleQuotation) |
| cash-front.ts | sendQuickSaleToCash | POST /sale/quotation/:id/approve (muda) | `/vendas/orcamentos/[quotationId]` (QuickSaleCheckout) |
| cash-front.ts | chargeQuickSaleNow | POST /sale/quotation/:id/quick-sale/charge | `/vendas/orcamentos/[quotationId]` (QuickSaleCheckout › ChargeNowDialog) |
| cash-front.ts | claimSale | POST /financial/pdv/sale/:id/claim | `/financeiro/frente-de-caixa` (PDV) |
| cash-front.ts | releaseSale | sem endpoint: sem chamador (se usado, DELETE /financial/pdv/sale/:id/claim) | nenhuma |
| cash-front.ts | reverseToBilling | POST /financial/pdv/sale/:id/bill | `/financeiro/frente-de-caixa` (BillingDialog) |
| stock.ts | getStockItems | GET /stock | `/estoque` (Stock) |
| stock.ts | getStockMovements | GET /stock/movement | `/estoque` (Stock) |
| stock.ts | getInvoices | GET /stock/invoice-entry | `/estoque/entrada-de-nota` (InvoiceEntry) |
| stock.ts | matchInvoiceItem | PATCH /stock/invoice-entry/:id/item/:itemId | `/estoque/entrada-de-nota` (MatchItemModal) |
| stock.ts | confirmInvoiceEntry | POST /stock/invoice-entry/:id/confirm | `/estoque/entrada-de-nota` (InvoiceEntry) |

Locação (módulo 6) não tem action provisória: não há tela.
