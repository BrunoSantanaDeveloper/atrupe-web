# O que depende do backend

Lista reunida em 24/09/2026 a pedido do time, juntando três origens: os **erros** que não são corrigíveis no front, as **alterações de regra** já decididas e os **endpoints que não existem** para as telas construídas nesta cópia.

Ordem sugerida: primeiro o que **corrige dinheiro errado**, depois o que **fecha buraco de permissão**, depois o que **destrava telas prontas**.

---

## 1. Erros — cálculo errado na API

| # | O que está errado | Onde |
|---|---|---|
| **EC-12** | **Totais do dia somam movimentação cancelada já recebida.** O resumo do topo mostra "Recebido R$ 0,00" e o total do dia continua somando a parcela cancelada. Os totais (`expectedRevenue`, `realizedRevenue`) vêm prontos de `/financial/flow`. **O front já contorna** descontando o cancelado que a listagem mostra — ao corrigir a API, **apagar `src/lib/dayTotals.ts`**, senão desconta duas vezes | Fluxo financeiro |
| **EC-18** | **Comissões e Resultado por setor contam a venda cancelada.** Mesma origem do EC-12, visto de outra tela | Relatórios |
| **EC-19** | **"Relatório avançado" de vendas nunca funciona:** `GET /report/sales/pdf-data` responde 400 com `property periodBy should not exist`. **A listagem de vendas aceita o mesmo campo** — falta declará-lo no DTO do relatório | Relatório de vendas |

> **EC-12 e EC-18 são o mesmo problema:** movimentação cancelada continua entrando em conta. Tratar junto, com a regra de cancelamento do **ALT-7**.

## 2. Permissões — a tela já bloqueia, a rota ainda aceita

Nestes casos a correção do front **já foi feita** nesta cópia, mas **quem chamar a API direto continua passando**. Sem a validação no servidor, o controle não existe.

| # | O que validar no backend |
|---|---|
| **EC-21** | `:create`, `:edit` e `:delete` em Perfil de vendedor, Plano de contas, Condições de pagamento e itens da Folha. **O mais grave:** sem isso, um vendedor pode alterar o próprio desconto máximo e a própria comissão |
| **EC-25** | Comissões restrito ao vendedor da sessão quando falta `sale:other_quotation:view` — ignorando qualquer `sellerId` recebido |
| **EC-2 / EC-17** | Limite de desconto **sobre o preço base** e **recusa** do desconto acima do limite, no checkout |
| **EC-31** | `/category` (grupos de cliente e de fornecedor) validando `register:client:*` e `register:supplier:*` — decisão do time: o grupo faz parte do cadastro |
| **ALT-6** | A revisão completa da matriz de permissões, que engloba os acima |

**A regra que a auditoria do front firmou, e que a API precisa seguir igual:**

> **Excluir um cadastro próprio exige `:delete`. Remover uma linha de dentro do
> registro que se está editando — item da ordem de serviço, etapa da
> composição, recurso do processo — é `:edit`.**

Sem isso as duas camadas divergem: a tela esconde o botão e a rota aceita, ou
o contrário, a tela mostra e a rota recusa.

**Uma pendência de dados, não de código:** existem **duas chaves em circulação
para a mesma permissão** — `sale:other_sellers` nos cargos antigos e
`sale:other_quotation` nos salvos pela tela de cargos atual. O front aceita as
duas de propósito, mas a tela de cargos só mostra a segunda: um cargo antigo
carrega uma permissão que ninguém consegue ver nem tirar. Precisa de uma
migração que troque a chave antiga pela nova no banco.

## 3. Regras de negócio já decididas

| # | O que fazer |
|---|---|
| **ALT-7** | Regra de cancelamento de venda já recebida e de movimentações de caixa, inclusive retroativas |
| **ALT-8** | Limite de desconto pelo preço base (a regra completa, com os casos de produto com preço zero) |
| **ALT-3 / ALT-4** | Dados obrigatórios do cliente aprovado, a partir do que a nota fiscal exige, e a regra de pré-cadastro → aprovado |
| **ALT-9** | Data de vencimento obrigatória nos lançamentos |
| **ALT-12** | Escolher quais origens de contato ficam disponíveis no orçamento |
| **ALT-13** | Canceladas na barra "Não aprovadas" do gráfico de vendas |
| **ALT-18** | Encargos automáticos dentro da configuração da folha, com **férias e 13º sem percentual editável** e INSS e FGTS ajustáveis |
| **ALT-19** | Item de custo da folha com **acréscimo e desconto no mesmo item**, e o comportamento como campo (inclusive "provisão sem lançamento") |
| **ALT-22** | Venda rápida **criando o orçamento direto**, com os padrões configurados, sem passar pelo modal |
| **ALT-5 (só a parte do front)** | Corrigir a validação do formulário de imagem do item, hoje cópia da de observações. **A cota de armazenamento saiu desta lista**: é infraestrutura, do time, não do desenvolvedor |

## 4. Endpoints que não existem — telas prontas esperando

Todas as telas do PRO e do LITE construídas nesta cópia rodam com **dados de exemplo em memória**. Cada arquivo abaixo tem, no topo, o aviso de que a API não existe.

| Arquivo provisório | Telas que dependem dele |
|---|---|
| `cost-base.ts` | Base de custos — as 7 abas |
| `pricing.ts` | Precificação — as 5 abas |
| `assets.ts` | Patrimônios, grupos de bens, custos e configurações produtivas |
| `materials.ts` | Materiais e variações |
| `processes.ts` | Processos e recursos |
| `compositions.ts` | Composição do produto: campos e variações |
| `production-manager.ts` | **Gerenciador de produção (ELITE):** fluxos, gerenciadores (modelo, controle de tempo, usuários com acesso), tipos de tarefa (cor, regra de liberação, etapas com gerenciador), projetos e tarefas. A tarefa nasce de cada etapa da composição do item vendido (`getSaleComposition`), com código, tempo estimado, consumo, campos e observação; `advanceTask` passa de etapa ou conclui e libera os acabamentos; `startWork`/`stopWork` medem o tempo. A API precisa criar o projeto quando a venda é aprovada |
| `product-assembly.ts` | **Processos (MS-11):** o processo é uma etapa no mesmo formato da composição (`getProcessList`, `getProcessDetail`, `createProcessDef`, `updateProcessMeta`; linhas, opções e regras pelas mesmas ações da composição, sobre o produto técnico `processo:<id>`). O `processes.ts` antigo foi removido. — Composição do produto por etapas (o item pronto do legado): situação, medida padrão, cobrança, blocos por setor, linhas calculadas com perda e mínimo, regras de venda por produto. **O cálculo está na action e tem de ir para a API** (SEG-1). Cada recurso precisa devolver **custo e preço de venda por unidade** (`unitCost`, `unitSale`); o preço sugerido é a soma de quantidade × preço de venda de cada linha, mais o preparo pela hora vendida do setor (IP-25). Sem preço de venda, o recurso usa custo × markup de referência. A etapa pode ser **montada no produto** (`processId` nulo, `addOwnBlock`) ou incluída de um processo (`addAssemblyBlock`); linhas entram e saem com `addAssemblyLine` e `removeAssemblyLine`, e os recursos disponíveis vêm de `getAssemblyResources` (IP-29, IP-31). As opções de uma escolha precisam ter a mesma unidade (IP-39). Na venda: `getSaleForm` devolve só o que o vendedor edita (campos extras, escolhas, listas) e `getSaleComposition` devolve o relatório da composição daquela venda **sem custo** (IP-36, ORC-7); o item do orçamento guarda `productId` e `composition` (extras, escolhas, listas e o resumo). **No orçamento do sistema**, `add-product` e `update-product` precisam aceitar e devolver `composition` no item; até lá o front grava em `saveItemComposition` / `getItemCompositions` (mock em `quotation-composition.ts`). A lista de produtos precisa do filtro **`hasComposition`** (com / sem) e do campo no item da lista; hoje o front filtra só a página exibida (`getComposedProductIds`). Biblioteca (IP-7): `getLibrary` e `importFromLibrary` — importar copia os processos para o produto, e os materiais precisam ser conciliados com o cadastro do cliente |
| `quotation-composition.ts` | Itens do orçamento e resultado previsto da venda |
| `production.ts` | Gerenciador de produção e produtividade |
| `stock.ts` | Estoque e entrada de nota |
| `quick-sale.ts` | Configuração da venda rápida |
| `cash-accounts.ts` | Contas bancárias e Controle de caixa (CX-0 a CX-3) |
| `cash-front.ts` | Frente de caixa (lado do caixa) e o recebimento da venda rápida no orçamento (lado do vendedor) |

**Junto com eles:**

- **ALT-14** — criar as **features de plano** `cost_base` e `pricing_center` no backend (hoje ligadas por variável de ambiente nesta cópia);
- **ALT-17** — endpoints de **edição** de patrimônio, material, processo e serviço terceirizado;
- **ALT-16** — **upload da foto do patrimônio** (hoje a imagem é guardada como data URL no mock);
- **ALT-20** — **entrada automática de notas** pela Migrate: webhook de documento recebido, manifestação, conciliação item↔material, entrada no estoque e conta a pagar;
- **Venda rápida no orçamento** (FC-1, FC-11, FC-12, VR-5) — três comportamentos da API: (1) **aprovar a venda rápida sem condição de pagamento**, porque o vendedor não monta condição nela; (2) quando a configuração for *enviar ao caixa*, a aprovação **coloca a venda na fila da frente de caixa** — não existe um segundo gesto; (3) quando for *cobrar na hora*, um endpoint que recebe as partes do pagamento (forma e valor cheio), exige que somem o total e lança na conta Caixa Empresa — o dinheiro realizado; cartão e PIX como previsão, com o líquido do cartão calculado pela taxa configurada e a taxa confirmada na baixa (FC-10). O orçamento precisa devolver a **situação no caixa** (enviada, sinal recebido, recebida, entregue, cancelada), que é o que a tela do vendedor mostra;
- **Contas bancárias e controle de caixa** (CX-0 a CX-3, LITE): o cadastro de contas já existe (`bankAccountRoute`, com `cashControl` e as regras por condição de pagamento em `bankAccountCashControl`). Falta na conta: o **tipo** (caixa físico ou banco), a **conta padrão por forma** para recebimento (uma só por forma; marcar numa desmarca nas outras), o **saldo inicial com data** e a regra de remoção (sem histórico exclui; com histórico inativa, só com saldo zero e sem caixa aberto). Falta o **caixa do dia** por conta: abertura igual ao saldo do caixa anterior; bloqueio por conta de abrir um dia com outro anterior ainda aberto; ajuste com motivo; fechamento com o valor **informado** (contagem na gaveta, saldo do extrato no banco), a diferença lançada como **quebra de caixa** e tolerância configurável; **retroativo** (lançamento com data de dia fechado entra no caixa aberto, marcado, com as duas datas); **reabertura** só pelo administrador, com justificativa, que desfaz a quebra apurada; e **transferência em par** (saída e entrada ligadas, origem diferente do destino, fora do resultado). Contas sem controle não têm caixa do dia: só saldo e histórico;
- **ALT-23 — Comissões em dois modos** (START): a rota `/report/commission` já recebe `commissionType`. Falta: com `received_value`, filtrar por `receivedStartDate/receivedEndDate` e devolver **uma linha por recebimento** (parcela ou entrada baixada no período, com a data e o valor dela e a data da venda de origem), e calcular o `commissionTotal` do resumo sobre a base do modo — hoje a tela recalcula a comissão da linha, mas o total vem da API. Com `sold_value`, manter uma linha por venda. Valem as regras do EC-18 (cancelada entra pelo recebido) e do EC-25 (vendedor da sessão);
- **ALT-21** — mover as rotas de produtos, materiais e processos para `/cadastros`, com redirecionamento.

## 5. Segurança da API

**ALT-15** reúne as regras que precisam existir **antes de os endpoints do PRO nascerem**, porque mudam o contrato:

- **SEG-1** — todo cálculo de custo, preço e consumo **no servidor**; o front recebe o resultado, não a fórmula;
- **SEG-2** — limite por página e por minuto em toda listagem;
- **SEG-3** — exportação com permissão própria e arquivo identificado;
- **SEG-4** — registro e alerta de acesso em massa.

## 6. Dois pedidos de estrutura

| # | O que é |
|---|---|
| ~~ALT-5 / GP-27~~ | **Saiu desta lista em 24/09/2026.** Armazenamento é infraestrutura: o sistema roda na AWS e o time vai tratar disso na atualização de estrutura prevista para quando a LITE estiver mais resolvida, quando assumir os acessos. Fica no backlog |
| **ALT-11** | Academy com conclusão monitorada (ideia, ainda a definir) |

---

## O que **não** é backend

Para não gerar expectativa errada: os erros **EC-1, EC-3, EC-14, EC-21 (tela), EC-22, EC-23, EC-24, EC-25 (tela), EC-26 e EC-28 já foram corrigidos** nesta cópia, no front. A situação de cada um está em [erros-situacao.md](erros-situacao.md).

## Setor com cor (05/10/2026)

Regra nova (área 9 §4.14): cada setor tem uma cor, com padrão inicial, editável no cadastro de setores, e ela acompanha o setor no gerenciador, na ficha de produção, na Agenda de entrega e na composição. A API do setor (`/sector`) devolve `icon`, mas não tem cor. Falta: campo `color` (hexadecimal) no setor, aceito no criar e no editar, com um padrão por setor novo. O tipo de tarefa do gerenciador não tem cor própria: usa a do setor.

## Orçamento: acrescentar dentro de um item já lançado (05/10/2026)

O item do orçamento é um recipiente aberto, como no legado (`analise/levantamento-orcamento-legado.md` §2 e §3): depois de lançado, recebe processos, terceirizados e, em seguida, itens prontos. O front já faz isso (botão **"Acrescentar a este item"** no item aberto), mas guarda as linhas num mock em memória (`src/actions/quotation-composition.ts`, `getItemLines` / `addItemLine` / `removeItemLine`). Falta na API:

| O que | Detalhe |
|---|---|
| Guardar as linhas no item | `POST /sale/quotation/:id/item/:itemId/line` e `DELETE …/line/:lineId`. A linha tem tipo (processo, parte, terceirizado avulso), nome, setor, as medidas usadas, preço de venda e o **retrato do cálculo** (recursos, quantidades, custo; ORC-10) |
| Recalcular o item | o valor do item passa a somar as linhas acrescentadas; desconto e acréscimo continuam no item (janela Valores) |
| Totais | o resumo do orçamento e as condições de pagamento passam a ver o valor novo. Hoje a tela avisa "o que foi acrescentado ainda não soma no total" |
| Processo com campos | instalação pede km e tempo (legado §4); a rota de preço do processo precisa receber esses campos, além de largura, altura e quantidade |
| Permissão | `sale:quotation:edit`, só com o orçamento em digitação (mesma regra do editar item) |

## Orçamento: rotina de 06/10/2026 (modal, item pronto, terceirizado, material, aprovação, medida, proposta)

O que a rotina do orçamento de 06/10/2026 construiu no front e ainda depende da API. Não repete a tabela acima ("acrescentar dentro de um item já lançado"): as rotas de linha continuam as mesmas, com os campos novos abaixo.

| Item | O que a API precisa |
|---|---|
| **Modal de adicionar item (ORC-1)** | nada novo: a lista de produtos (`GET /product`) e os setores com produtos já servem. Confirmar que a lista **não devolve produto inativo** (hoje a tela filtra `isActive === false` por garantia) |
| **Item pronto dentro do item (ORC-5)** | na rota de linha (`POST /sale/quotation/:id/item/:itemId/line`), o tipo `PART` com `productId`, a medida usada (`quantity`, `width`, `height`, em metros) e o preço calculado pela unidade de venda do produto. A API deve devolver o **custo da parte** pela composição do produto (hoje a linha nasce com custo zero) e as **instruções ao vendedor** dos processos do produto, que o front lê do mock |
| **Terceirizado avulso com markup (MS-16, T-4)** | `GET/PUT /sales-settings` (ou campo na série) com `outsourcedMarkup` (percentual, padrão 45). Na linha `LOOSE`: `supplier`, `description`, `cost` e `price`; a API guarda o custo para o resultado da venda e **nunca o devolve** a quem não tem `values:values:view` (ORC-7). O custo vira despesa no financeiro quando a venda acontece (T-3) |
| **Material de venda direta (ORG-1)** | o item do orçamento aceitar um **material** além de produto: `POST /sale/quotation/:id/add-material` com `materialId`, `variationId` (opcional) e `quantity`; a linha guarda a unidade e o preço por unidade do material (ou da variação) e aparece com a marca de material. A busca precisa de `GET /material?directSale=true&active=true` com setor, unidade, preço e variações com preço. Hoje fica no mock dos itens montados na hora com `origin: 'MATERIAL'` |
| **Concluir sem condição de pagamento** | `POST /sale/quotation/:id/finish` **aceitar** orçamento sem condição de pagamento (hoje o front deixava de chamar; agora chama depois de avisar). `POST /sale/quotation/:id/approve` continua **recusando** sem condição, com mensagem |
| **Produto inativo trava a aprovação (PAD-7)** | `POST /sale/quotation/:id/approve` recusar quando algum item tem produto com `isActive = false`, devolvendo os itens; o detalhe do orçamento devolver `product.isActive` em cada item, para a tela não precisar de uma consulta por produto (hoje `GET /product/:id` por item distinto) |
| **Mudar a medida de um item já composto** | na linha: `followsBase` (booleano), `processId` ou `productId`, e `measure`. Ao `update-product` mudar quantidade, largura ou altura, a API **recalcula as linhas com `followsBase`** (processo pela rota de preço do processo com a medida nova; parte pela proporção da unidade de venda) e mantém as de medida própria; devolve quantas mudaram. Hoje o front chama `recalculateItemLines` no mock depois de salvar o item |
| **Proposta com valores por padrão (IP-12)** | nada na API: o nível é escolhido na impressão. Se a proposta passar a ser gerada no servidor, receber `detailLevel` (`resumo` · `lista` · `valores`) e aplicar a permissão de valores. As linhas acrescentadas (mock) ainda não entram no `pdf-data` |
| **Valor agregado (ALT-25)** | já descrito no ALT-25: campo próprio de **acréscimo** no item (hoje vai como desconto negativo), fora do limite de desconto e sem linha própria na proposta |

## Produção: rotina de 06/10/2026 (setor com cor, tarefas, apontamentos, anexos, veículos)

O gerenciador do ELITE foi construído com dados em memória (`src/actions/production-manager.ts`, `src/actions/sector-colors.ts`). O que a API precisa, sem repetir o setor com cor já pedido acima (o campo `color` no `/sector`, aceito no criar e no editar, com um padrão por setor novo; a tela guarda por id e por nome até lá):

| O que | Detalhe |
|---|---|
| **Gerenciadores** | `GET/POST/PUT /production/manager`: nome, `sectorId` (de onde vem a cor e o ícone), fluxo, `timeMode` (`PLAY_STOP` · `DRAG_DROP`), `intervalMinutes` (GP-20), ativo; inativar com destino das etapas (GP-15); `users` com `onlyAssigned` (GP-11) |
| **Tipos de tarefa e etapas** | sem `color` (usa a do setor): nome, `release` (`AFTER_BASE` · `WITH_BASE` · `DONE`), `timeControl`, etapas ordenadas com `managerId` (GP-13, GP-14) |
| **Colaboradores na produção** | o colaborador ligado ao usuário (`userId`) com `role` (`OPERATOR` · `MANAGER`); é por ele que o quadro sabe quem está olhando (hoje a tela casa pelo e-mail) |
| **Projeto nasce da venda aprovada** | ao aprovar o orçamento, criar o projeto em stand-by com **uma tarefa por etapa da composição de cada item** (PCP-4, GP-16), com código curto, setor, tipo de tarefa, tempo previsto (mão de obra + preparo), preparo, máquina, consumo resolvido, campos, observação de produção (MS-13), imagem do item e a dependência (`dependsOn`) pela regra do tipo e pelo fluxo da composição (FL-1). O front tem `createProjectFromSale` como exemplo |
| **Estado da tarefa** | `POST /production/task/:id/action` com `action` (`START` · `PAUSE` · `RESUME` · `FINISH` · `CANCEL` · `RESTART`), registrando quem e quando; `FINISH` na última etapa grava `completedBy` e `completedAt` e libera o que dependia; nas etapas do meio passa à próxima (outro gerenciador). Bloqueio: `START` recusado enquanto a dependência não terminou nem liberou |
| **Pendência** | `POST …/pendency` com texto; o estado vira `PENDING`, os relógios param; `RESUME` resolve |
| **Liberar próxima (FL-13)** | `POST …/release-next` com `quantity` opcional; grava quem, quando, quantidade e total; destrava as dependentes |
| **Apontamento (GP-43)** | `POST …/work/start` e `/work/stop` por colaborador (origem `CLOCK` ou `DRAG`); trechos por pessoa com início e fim; o apontado da tarefa é a soma. `PUT …/time-entry/:entryId` (correção) e `POST …/time-entry` (lançamento à mão) **só com a permissão do gerente**, com motivo, guardando o que era antes, quem e quando (GP-44) e visível a quem foi afetado |
| **Anexos por etapa (GP-25/26)** | `POST …/attachment` (nome, tipo, arquivo) e `POST …/attachment/:id/version`; `PUT …/attachment/:id/current` com a versão válida; cada versão com quem e quando. Arquivo em armazenamento de objetos com link assinado e prazo (seguranca.md); a cota (GP-27) com a BSP/AWS |
| **Agenda e cadeia (§12.2)** | `PUT …/schedule` (dia, início, duração); a API devolve por tarefa o `alert` (`OVERDUE` · `LATE_PREDECESSOR` · `DELIVERY_RISK`) calculado pela cadeia de dependências, pelo expediente da empresa (calendário de trabalho, feriados) e pela data de entrega; **sem reagendar sozinha**. O preparo ocupa a máquina na agenda; o intervalo do gerenciador entra entre tarefas do mesmo recurso |
| **Veículos (VS-7)** | `GET/POST/PUT /production/vehicle` (nome, placa, ativo); na tarefa, `vehicleId` e `km`; a agenda devolve a ocupação por veículo e por dia e acusa a sobreposição |
| **Quem vê o quê (GP-11)** | o quadro filtra pelo perfil e pelo acesso ao gerenciador; permissão própria para a produtividade por pessoa (`production:productivity:view`), hoje coberta por `production:production:edit` |
| **Produtividade (GP-30, GP-32)** | por setor e por pessoa: tempo vendido das tarefas finalizadas, repartido na proporção dos trechos de cada pessoa; tempo sem venda (GP-34) à parte |
| **Ordens de serviço (ALT-10)** | os nomes das fases unificados nas duas telas; a API não muda, só os rótulos |

## Base de custos: rateio entre os equipamentos do setor (07/10/2026)

Construído no front com dados em memória (`src/actions/sector-allocation.ts` e `src/actions/sector-allocation-data.ts`); regra na área 5, BC-3, BC-3.1, BC-4 e BC-9.

| O que | Detalhe |
|---|---|
| **Campo no setor** | `allocationCriterion` (`ACQUISITION_VALUE` · `ACTIVITY_TIME` · `MANUAL`), padrão `ACQUISITION_VALUE`; no manual, `allocationPercentages` (`[{ assetId, percentage }]`, percentual com mais de duas casas aceito) e `allocationPreviousCriterion` (o automático de onde o manual nasceu) |
| **Rotas** | `GET /cost-base/sector/allocation` (setores produtivos com patrimônio detalhado: critério, custo a repartir, e por equipamento o valor de aquisição, as horas de atividade, o custo próprio, o percentual de cada critério, o em uso, o custo no mês e o custo-hora) e `PUT /cost-base/sector/:id/allocation` com `criterion` e, no manual, `percentages` |
| **Validação** | só setor produtivo e só patrimônio **detalhado e ativo** do setor (P-15, P-16); no manual, um percentual por equipamento, entre 0 e 100, fechando 100 % **pelo valor** com tolerância de 1 centavo (BC-9); permissão `cost:base:edit` |
| **Cálculo (SEG-1)** | custo a repartir = custo do setor que não é de equipamento detalhado (bens simplificados, lançamentos diretos, administrativo recebido); custo do equipamento = custo próprio + custo a repartir × percentual; custo da configuração produtiva = parte do equipamento pelo tempo de atividade ÷ produtividade. É esse custo que a Precificação e a composição leem; no manual não se atualiza sozinho quando entra ou sai um bem: a API deve **avisar** o setor em manual quando a lista de equipamentos mudar (bem novo fica com 0 % até a empresa ajustar) |

## Base de custos: rateio das despesas administrativas por item (08/10/2026)

| O que a tela faz | O que a API precisa |
|---|---|
| **Ratear uma conta entre os setores produtivos (BC-8)** | `GET /cost-base/admin-expense/:id/allocation` (conta, custo de referência, setores produtivos com custo próprio e percentual) e `PUT /cost-base/admin-expense/:id/allocation` com `[{ sectorId, percentage }]`; o servidor recusa soma acima de 100% (tolerância de 1 centavo pelo valor) e aceita abaixo. **Guarda só o percentual** (BC-8.1): o valor é calculado a cada leitura sobre o custo de referência do mês |
| **Lista de despesas** | cada conta devolve `allocations[]` (setor, percentual, valor), `allocatedValue` e `remainder`; os totais devolvem `allocatedValue` e `remainingValue` |
| **Por setor e Distribuição** | o custo próprio do setor produtivo inclui a parte rateada como item de origem `OTHER` com a conta de origem; o total administrativo a distribuir já vem **sem** o rateado por item (`allocatedByItem` nos totais da Distribuição); o custo-hora das máquinas (BC-3.1) parte desse custo |

## Orçamento: aproveitamento de folha na venda (08/10/2026)

| O que a tela faz | O que a API precisa |
|---|---|
| **Folhas da venda no modal (AP-5)** | `POST /product/:id/sheet-usage` (ou a composição da venda) com `{ quantity, width, height, choices }` devolvendo, por linha de folha ou chapa, `perSheet`, `firstFit`, `secondFit`, `sheets`, `leftover`, `charged` e a unidade do material (SEG-1: a conta é do servidor) |
| **Resumo do item e relatório** | o item do orçamento guarda a composição escolhida (já pedido em 06/10) e a API devolve o aproveitamento no relatório da composição do item |
| **Preço do item** | o preço calculado pela API precisa considerar as folhas cobradas (inteiras ou fração, AP-4), para o orçamento real acompanhar a composição |
