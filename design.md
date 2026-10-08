# Atrupe · Design (UI)

> Este arquivo trata do **design visual e de interface** (tokens, componentes, layout e telas), extraído do Figma.
> Os **padrões de código** (estrutura de pastas, componentes React, convenções) estão em [`openspec/design.md`](openspec/design.md). Os dois são complementares e não se substituem.

Gerado em 03/10/2026 a partir do Figma via MCP. Cada item indica a origem no formato **Fonte: arquivo › página**.
Regra de prioridade: vale o arquivo mais novo; arquivos antigos só completam lacunas. Conflitos estão em [Divergências encontradas](#7-divergências-encontradas), sem decisão tomada.

Abreviações dos arquivos usadas nas fontes:

| Abreviação | Arquivo no Figma | Data |
|---|---|---|
| **Allan** | Atrupe Pro, Elite e Full - Allan (cópia) | set/2026 |
| **Jul/26** | Atrupe Pro, Elite e Full | jul/2026 |
| **Pro** | Atrupe - Pro | abr/2026 |
| **Mobile** | Atrupe - Mobile | fev/2026 |
| **Novas telas** | Atrupe - Novas telas | out/2025 |
| **DS** | Atrupe - Design System | jan/2024 |

---

## 1. Visão geral e princípios visuais

- **Base:** kit Untitled UI adaptado para a Atrupe. As páginas de fundação (Colors, Typography, Shadows, Grids) mantêm a estrutura do kit, com a paleta **Brand** trocada para verde. Fonte: Allan › Colors, Typography.
- **Componentes próprios da Atrupe** convivem com os do kit: conjunto de botões com cores Brand/Neutral/Danger/Success, input de formulário, datepicker, badge de status com ponto e alertas de assinatura. Quando existir versão Atrupe de um componente, ela tem prioridade sobre a do kit. Fonte: Allan › Buttons, Inputs, Datepicker, Badges, Alert.
- **Aparência geral:** sidebar branca fixa à esquerda, área de conteúdo cinza-clara e conteúdo em cards brancos com borda Gray/200 e cantos arredondados. Fonte: Allan › Base de Custos; Jul/26 › Orçamentos.
- **Cor de ação:** verde Brand para ações principais e item ativo da navegação. Vermelho só para ações destrutivas ou despesas. Fonte: Allan › Buttons; Jul/26 › Fluxo financeiro.
- **Tipografia única:** Inter em todos os textos. Fonte: Allan › Typography.
- **Ícones:** Tabler Icons, estilo contorno. Fonte: Allan › Icons.
- **Densidade:** média. Tabelas com linhas de cerca de 50 px, textos de 12 a 14 px e muito uso de ícones de ação por linha. Fonte: Jul/26 › Orçamentos, A receber.
- **Status do design no Figma:** frames marcados com o kit "Status Tags" (Rascunho, Em Progresso, Em Revisão, Aguardando Aprovação, Rejeitada, Bloqueada, Concluída, Pronto para Dev). As páginas com ✅ no nome estão aprovadas. Fonte: Allan › Status Tag; Jul/26 (nomes das páginas).

---

## 2. Tokens

### 2.1 Cores

Valores reais das variáveis do Figma. Fonte: Allan › Colors (frame "Colors").

**Brand (verde Atrupe)**

| 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| #ECFDF4 | #D2F9E3 | #A9F1CC | #71E4AF | #38CF8F | #14B375 | #099260 | #077550 | #085D40 | #084C36 | #032B1F |

**Gray (neutros)**

| 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| #FCFCFD | #F9FAFB | #F2F4F7 | #EAECF0 | #D0D5DD | #98A2B3 | #667085 | #475467 | #344054 | #1D2939 | #101828 |

Também existe a variável **Gray/60 = #E9EBF0**, usada nas divisórias da sidebar. Fonte: Jul/26 › Orçamentos (variáveis da tela); Allan › Base de Custos (sidebar).

**Feedback**

| Escala | 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Error | #FFFBFA | #FEF3F2 | #FEE4E2 | #FECDCA | #FDA29B | #F97066 | #F04438 | #D92D20 | #B42318 | #912018 | #7A271A |
| Warning | #FFFCF5 | #FFFAEB | #FEF0C7 | #FEDF89 | #FEC84B | #FDB022 | #F79009 | #DC6803 | #B54708 | #93370D | #7A2E0E |
| Success | #F6FEF9 | #ECFDF3 | #D1FADF | #A6F4C5 | #6CE9A6 | #32D583 | #12B76A | #039855 | #027A48 | #05603A | #054F31 |

**Cores de apoio** (gráficos, categorias, etiquetas)

| Escala | 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Blue gray | – | #F8F9FC | #EAECF5 | #D5D9EB | #AFB5D9 | #717BBC | #4E5BA6 | #3E4784 | #363F72 | #002D4B | #101323 |
| Blue light | #F5FBFF | #F0F9FF | #E0F2FE | #B9E6FE | #7CD4FD | #36BFFA | #0BA5EC | #0086C9 | #026AA2 | #065986 | #0B4A6F |
| Blue | #F5FAFF | #EFF8FF | #D1E9FF | #B2DDFF | #84CAFF | #53B1FD | #2E90FA | #1570EF | #175CD3 | #1849A9 | #194185 |
| Indigo | #F5F8FF | #EEF4FF | #E0EAFF | #C7D7FE | #A4BCFD | #8098F9 | #6172F3 | #444CE7 | #3538CD | #2D31A6 | #2D3282 |
| Purple | #FAFAFF | #F4F3FF | #EBE9FE | #D9D6FE | #BDB4FE | #9B8AFB | #7A5AF8 | #6938EF | #5925DC | #4A1FB8 | #3E1C96 |
| Pink | #FEF6FB | #FDF2FA | #FCE7F6 | #FCCEEE | #FAA7E0 | #F670C7 | #EE46BC | #DD2590 | #C11574 | #9E165F | #851651 |
| Rosé | #FFF5F6 | #FFF1F3 | #FFE4E8 | #FECDD6 | #FEA3B4 | #FD6F8E | #F63D68 | #E31B54 | #C01048 | #A11043 | #89123E |
| Orange | #FFFAF5 | #FFF6ED | #FFEAD5 | #FDDCAB | #FEB273 | #FD853A | #FB6514 | #EC4A0A | #C4320A | #9C2A10 | #7E2410 |

Base: **White #FFFFFF**, **Black #000000**. A página Colors também tem um frame "Gradients" do kit, sem uso identificado nas telas.

**Uso semântico observado nas telas**

| Papel | Token | Fonte |
|---|---|---|
| Fundo da página (área de conteúdo) | Gray/100 #F2F4F7 | Jul/26 › Orçamentos (variáveis aplicadas e screenshot) |
| Superfície de card | White, borda Gray/200 | Allan › Base de Custos |
| Texto principal / títulos | Gray/900 | Allan › Base de Custos (navbar) |
| Texto de rótulo | Gray/700 | Allan › Inputs |
| Texto secundário / dica | Gray/500 | Allan › Inputs |
| Placeholder | Gray/400 | Allan › Inputs |
| Ação primária | Brand/500 (hover Brand/700) | Allan › Buttons |
| Item ativo da sidebar | fundo Brand/25, texto Brand/600 | Allan › Base de Custos (sidebar) |
| Borda de foco | Brand/300 com anel Gray/600 | Allan › Inputs |
| Erro em campo | borda Error/300, texto Error/500 | Allan › Inputs |
| Valor a receber / receita | verde (Success/700 no texto) | Jul/26 › A receber, Fluxo financeiro |
| Valor a pagar / despesa / desconto | vermelho (Error) | Jul/26 › Fluxo financeiro |
| Grupo Mão de obra | Blue/500 | Allan › Precificação |
| Grupo Máquinas | Success/500 | Allan › Precificação |
| Grupo Materiais | Purple/500 | Allan › Precificação |
| Grupo Produtos | Orange/500 | Allan › Precificação |
| Tributação · Comissão · Custo financeiro | Blue/500 · Warning/500 · Purple/500 | Allan › Precificação |

### 2.2 Tipografia

Família **Inter**. Fonte: Allan › Typography.

| Estilo | Tamanho / altura de linha | Pesos disponíveis | Letter-spacing |
|---|---|---|---|
| Display 2xl | 72 / 90 | Regular 400, Medium 500, Semibold 600, Bold 700 | -2 |
| Display xl | 60 / 72 | 400 · 500 · 600 · 700 | -2 |
| Display lg | 48 / 60 | 400 · 500 · 600 · 700 | -2 |
| Display md | 36 / 44 | 400 · 500 · 600 · 700 | -2 |
| Display sm | 30 / 38 | 400 · 500 · 600 · 700 | 0 |
| Display xs | 24 / 32 | 400 · 500 · 600 · 700 | 0 |
| Text xl | 20 / 30 | 400 · 500 · 600 · 700 | 0 |
| Text lg | 18 / 28 | 400 · 500 · 600 · 700 (há também "Medium underlined") | 0 |
| Text md | 16 / 24 | 400 · 500 · 600 · 700 | 0 |
| Text sm | 14 / 20 | 400 · 500 · 600 · 700 | 0 |
| Text xs | 12 / 18 | 400 · 500 · 600 · 700 | 0 |

Variável extra "Text / Small": Inter Semibold 12 / 16, usada nos contadores das abas. Fonte: Allan › Base de Custos.

**Papéis no código**

A partir de `tipografia-e-hierarquia` (design/openspec), cada texto pertence a
um papel com tamanho, linha, peso e cor fixos. Classe `type-<papel>` ou os
componentes `Heading`/`Text` (`src/components/ui/typography.tsx`); tabela
em `src/lib/typography-roles.ts`; vitrine em `/sandbox/tipografia`.

| Papel | Estilo | Onde |
|---|---|---|
| `page-title` | Display xs Semibold, Gray/900 | título da página (um `h1`) |
| `page-subtitle` | Text sm Regular, Gray/600 | linha abaixo do título |
| `section-title` | Text lg Semibold, Gray/900 | `h2` de seção |
| `card-title` | Text md Semibold, Gray/900 | título de card |
| `dialog-title` | Text lg Semibold, Gray/900 | título de diálogo e painel |
| `object-title` | Display xs Semibold, Gray/900 | nome do registro no detalhe |
| `kpi-value` / `kpi-hero` | Display xs / Display sm Semibold, tabular | valor de indicador |
| `kpi-label` | Text sm Medium, Gray/600 | rótulo de indicador |
| `body` / `body-strong` | Text sm Regular Gray/700 / Semibold Gray/900 | corpo, células, identificador da linha |
| `secondary` / `helper` | Text sm Regular, Gray/600 | apoio, ajuda de campo |
| `caption` | Text xs Regular, Gray/600 | metadados |
| `label` | Text sm Medium, Gray/700 | rótulo de campo e de valor |
| `eyebrow` | Text xs Semibold, Gray/600, caixa alta, +0,04em | único uppercase: grupo de tabela, seção de formulário |
| `table-header` | Text xs Medium, Gray/600 | cabeçalho de tabela |
| `nav-item` | Text sm Medium, Gray/700 | item e subitem da barra lateral |

Divergência deliberada do Figma (Allan › Base de Custos): o título da
página sobe de Text lg para Display xs, para ficar acima de títulos de
card e diálogo; o subitem da barra lateral sobe de Text xs para Text sm;
dica e erro de campo sobem de 12 px para Text sm. Nenhum texto abaixo de
12 px e nenhum peso 700 (regra de lint).

### 2.3 Espaçamento e grid

**Escala de espaçamento** (base 16 px). Fonte: Allan › Grids & spacing.

| Token | rem | px |
|---|---|---|
| 1 | 0.25 | 4 |
| 2 | 0.5 | 8 |
| 3 | 0.75 | 12 |
| 4 | 1 | 16 |
| 5 | 1.25 | 20 |
| 6 | 1.5 | 24 |
| 8 | 2 | 32 |
| 10 | 2.5 | 40 |
| 12 | 3 | 48 |
| 16 | 4 | 64 |
| 20 | 5 | 80 |
| 24 | 6 | 96 |
| 32 | 8 | 128 |
| 40 | 10 | 160 |
| 48 | 12 | 192 |
| 56 | 14 | 224 |
| 64 | 16 | 256 |

O guia tem 17 valores, de 4 a 256 px.

Variáveis de espaçamento nomeadas que aparecem aplicadas: **Spacing/spacing-2xs = 4**, **Spacing/spacing-md = 12** (Jul/26 › Orçamentos) e **spacing/spacing-sm = 12** (Allan › Alert). Ver divergência D-07.

**Containers:** sm 640 · md 768 · lg 1024 · xl 1280. Fonte: Allan › Grids & spacing.

**Grid**

| Breakpoint | Largura do frame | Colunas | Gutter | Margem lateral | Área útil |
|---|---|---|---|---|---|
| Desktop | 1440 | 12 | 32 | 32 dentro do container de 1280 | 1216 |
| Tablet | 768 | 6 | 32 | 32 | 704 |
| Mobile | 375 | 4 | 16 | 16 | 343 |

Fonte: Allan › Grids & spacing (frame "Grid layouts"; colunas contadas pelas réguas).

**Estrutura da aplicação (desktop)**

| Elemento | Medida | Fonte |
|---|---|---|
| Sidebar | 296 px de largura | Allan › Base de Custos; Jul/26 (todas as telas) |
| Área de conteúdo | 1144 px em frame de 1440, ou 1204 px em frame de 1500 | Allan › Base de Custos, Empresas e Sistemas |
| Navbar da página | 60 px de altura: padding 16 no topo e 24 nas laterais, linha de 44 px | Allan › Base de Custos |
| Corpo da página | padding 20 no topo, 24 nas laterais e 24 embaixo; gap de 16 entre blocos | Allan › Precificação |

### 2.4 Raios

| Valor | Variável | Onde aparece | Fonte |
|---|---|---|---|
| 4 | Radii/radius-sm | botão de aba segmentada, item ativo da sidebar, miniatura na tabela | Jul/26 › Orçamentos; Allan › Base de Custos |
| 6 | Radii/radius | barras de progresso | Jul/26 › Orçamentos; Allan › Precificação |
| 8 | border-radius/rounded-lg | botões, inputs, alertas, container de abas | Allan › Buttons, Inputs, Alert |
| 10 | – | ícone de destaque quadrado (40 px) | Allan › Base de Custos |
| 12 | rounded-xl | cards, modais | Allan › Base de Custos, Empresas e Sistemas |
| 16 | – | badges (pílula) | Allan › Badges |
| 28 | – | ícone de destaque circular (48 px) | Allan › Empresas e Sistemas |

### 2.5 Sombras

Fonte: Allan › Shadows & blurs.

| Token | Valor |
|---|---|
| Shadow/xs | 0 1 2 0 #1018280D |
| Shadow/sm | 0 1 3 0 #1018281A, 0 1 2 0 #1018280F |
| Shadow/md | 0 4 8 -2 #1018281A, 0 2 4 -2 #1018280F |
| Shadow/lg | 0 12 16 -4 #10182814, 0 4 6 -2 #10182808 |
| Shadow/xl | 0 20 24 -4 #10182814, 0 8 8 -4 #10182808 |
| Shadow/2xl | 0 24 48 -12 #1018282E |
| Shadow/3xl | 0 32 64 -12 #10182824 |
| Shadows/sm-strong | 0 1 3 0 #1018281A, 0 1 2 -1 #0000001A (aba ativa) |
| Focus ring/4px gray-600 | anel de 2 px branco + 4 px #475467 |

Uso: cards de tela quase sem sombra (apenas borda, às vezes drop 0 1 1 #1018280D). Modais usam Shadow/xl. Fonte: Allan › Precificação, Empresas e Sistemas.

A página também tem um frame "Blurs" do kit, sem uso identificado.

### 2.6 Ícones

- **Biblioteca:** Tabler Icons, contorno. A página Icons organiza os ícones pelas categorias do Tabler (Animals, Arrows, Badges, Brand, Buildings, Charts, Communication, Currencies, Database, Document, E-commerce e outras). Fonte: Allan › Icons.
- **Tamanhos usados:** 16 px em ações de tabela e chevrons; 20 px em botões da navbar e dentro de ícone de destaque; 24 px na sidebar e em botões. Fonte: Allan › Base de Custos; Jul/26 › Orçamentos.
- **Ícone de destaque (Featured icon):** quadrado de 40 px, raio 10, fundo tingido da cor da categoria (ex.: Success/50) e ícone de 20 a 24 px. Nos cabeçalhos de card e de modal, o fundo é branco com borda Gray/200. Fonte: Allan › Base de Custos; Jul/26 › Clientes (modal).
- **Ícones de setores e serviços** (256 px, conjunto próprio): Serralheria, CNC, Impressão, Acabamento, Criação, Instalação, Tempo, Pintura, Marcenaria, Entrega, Cliente retira, Frota, Confecção, Administração, Almoxarifado, Produção, Terceirizados, Comercial, Locação, Gráfica rápida, Patrimônio, Serigrafia. Fonte: Jul/26 › Orçamentos (seção "Ícones de setores / serviços").
- **Outros conjuntos do kit:** ícones de país, meios de pagamento, redes sociais e integrações. Integrações inclui um grupo "Fiscal" próprio. Fonte: Allan › Icons.

---

## 3. Componentes

### 3.1 Botão (conjunto Atrupe)

Fonte: Allan › Buttons (frame "Button", conjunto com cores Atrupe).

- **Cores:** Brand Primary, Neutral, Danger, Success.
- **Hierarquias:** Primary (preenchido), Secondary (contorno de 2 px), Tertiary (só texto).
- **Tamanhos:** sm 32 px, md 44 px, lg 56 px.
- **Estados:** Default, Hover, Focused, Pressed, Disable.
- **Variante só ícone:** "Only icon = Yes".
- **Medidas md:** padding horizontal 16, gap 8, raio 8, texto Text sm Semibold, ícones de 24 px à esquerda e à direita (opcionais).
- **Brand Primary:** fundo e borda Brand/500, texto branco. Hover: Brand/700.
- **Brand Secondary:** borda 2 px Brand/500, texto Brand/500, sem fundo.
- **Brand Tertiary:** sem borda e sem fundo, texto Brand/500.
- **Neutral Secondary** (Cancelar, Voltar): borda 2 px Gray/300, texto Gray/500 Semibold. Fonte: Allan › Empresas e Sistemas (modal); Jul/26 › Clientes (modal).
- **Danger Primary** (Excluir, Inativar, Nova despesa): fundo Error/500. Fonte: Allan › Empresas e Sistemas; Jul/26 › Fluxo financeiro, Clientes.
- **Success Primary** (Nova receita): fundo verde de sucesso. Fonte: Jul/26 › A receber, Fluxo financeiro.

**Quando usar:** uma única ação Primary por tela, no canto superior direito ("Novo orçamento", "Novo produto"). Secondary e Tertiary para ações de apoio. Danger só para ação destrutiva ou para o lado "despesa" do financeiro.

**Botões de ícone da navbar:** 40 × 40, fundo Gray/50, borda 2 px Gray/300, raio 8, ícone de 20 px. Ajuda (?), Imprimir e Exportar. Exportar tem texto Text sm Regular Gray/600. Fonte: Allan › Base de Custos.

**Conjunto do kit** (Untitled UI): hierarquias Primary, Secondary gray, Secondary color, Tertiary gray, Tertiary color, Link gray, Link color; tamanhos sm 36, md 40, lg 44, xl 48, 2xl 60; estados Default, Hover, Focused, Disabled; variante Destructive. Fonte: Allan › Buttons. Ver divergência D-03.

### 3.2 Campo de texto (Input field Atrupe)

Fonte: Allan › Inputs (frame "Input field" 10894:10507).

- **Tipos:** Default, Leading icon, Payment, Leading dropdown, Leading text, Prefix, Sufix.
- **Estados:** Placeholder, Filled, Focused, Disabled; variante Destructive (erro).
- **Estrutura:** rótulo, campo e texto de dica, com gap de 6 px.
- **Campo:** altura 40, padding 10 × 14, raio 8, fundo branco, borda 1 px Gray/300, Shadow/xs. Texto 12 px Regular (placeholder Gray/400; preenchido Gray/900). Ícone de ajuda (?) de 16 px à direita.
- **Foco:** borda Brand/300 e anel Gray/600 (2 px branco + 4 px).
- **Erro:** borda Error/300, ícone alert-circle de 16 px e mensagem 12 px Error/500.
- **Rótulo:** Text sm Medium Gray/700. **Dica:** 12 px Gray/500.

Também na página: Textarea, Verification code (4 ou 6 dígitos), Mega input e editor WYSIWYG (barra e tooltip). Fonte: Allan › Inputs.

**Campo de busca nas listagens:** input com ícone de lupa e botão quadrado verde (Brand) com lupa ao lado. Fonte: Jul/26 › Orçamentos, Clientes.

### 3.3 Seleção (Input dropdown) e menu suspenso

Fonte: Allan › Dropdowns (kit).

- **Input dropdown:** tipos Default, Icon leading, Avatar leading, Dot leading, Search. Estados Placeholder, Default, Open/focused. Com ou sem rótulo e texto de apoio. Largura de referência 320, altura 44 (70 com rótulo).
- **Item de menu:** estados Default, Hover, Focus, Disabled; com ou sem check, texto de apoio, ícone, avatar ou ponto. Altura 44.
- **Dropdown menu:** com ícone, checkbox, atalho e cabeçalho (avatar ou título).
- **Menu de ajuda** (botão ? da navbar): Vídeo, PDF, Planilha, Suporte. Fonte: Jul/26 › Orçamentos (estado vazio).
- **Menu de exportação** (botão imprimir): PDF, Excel. Fonte: Jul/26 › Dashboard.

### 3.4 Datepicker

Fonte: Allan › Datepicker.

- **Tipos:** Default (data única, 193 px de largura de referência) e Range (período, 240 px).
- **Estados:** Default, Filled, Open/focused, Disabled; com ou sem rótulo.
- **Medidas:** padding 10 × 14, raio 8, texto Text md Regular 16 px Gray/900, ícone calendar-month de 20 px à direita. Foco igual ao input (Brand/300 + anel Gray/600).
- **Menu de calendário:** "_Date picker menu" de 328 × 533. Fonte: Jul/26 › Agenda de Entrega.

### 3.5 Badge

Fonte: Allan › Badges.

- **Badge do kit:** cores Primary, Gray, Error, Warning, Success, Blue, Blue gray, Blue light, Indigo, Purple, Pink, Rosé, Orange; tamanhos sm, md, lg; ícone opcional (ponto, ícone à esquerda/direita, só ícone, X, avatar, bandeira).
- **Badge md Primary:** fundo Brand/50, texto Brand/700 Text sm Medium, padding 2 × 10, raio 16.
- **Badge de status com ponto** (listas): ponto de 8 px, texto Text xs Medium, padding 2 × 8 (6 à esquerda), raio 16. Ex.: "Em depreciação" = fundo Success/50, texto Success/700. Fonte: Allan › Base de Custos.
- **Badge dot status** (só o ponto, componente Atrupe): tipos Success, Warning, Error, Info, Neutral e Pendência. Fundos Success/100, Warning/100, Error/100, Blue/100, Gray/100; Pendência tem fundo Warning/500 sólido.
- **Contador de aba:** pílula com padding horizontal 6, texto Semibold 12/16 na cor do status (Brand, Warning, Error, Gray). Fonte: Allan › Base de Custos.

**Status por cor nas listagens** (Fonte: Jul/26 › Orçamentos, Clientes, Agenda):

| Status | Cor |
|---|---|
| Digitação, Inativo, Sem lançamento | Gray |
| Aguardando, Aberta | Blue |
| Regularizado, Finalizado, Realizado | Success |
| Pré-cadastro, Vencido, Fechada, Não realizado, Em revisão | Warning / Orange |
| Rejeitado, Inconsistência | Error |

Etiquetas de status secundário com fundo sólido (ex.: "Proposta enviada" em Pink, "Em desenvolvimento" em azul-petróleo, "Cliente não encontrado" em vermelho). Fonte: Jul/26 › Orçamentos.

Tags sólidas de tipo de lançamento: Acréscimo (verde), Desconto (vermelho), Adiantamento (laranja). Fonte: Allan › Folha de pagamento.

### 3.6 Alerta

Fonte: Allan › Alert.

- **Alerta em linha:** tipos Neutral, Success, Warning, Error. Padding 12 × 14, gap 12, raio 8, borda 1 px. Ícone de 20 px, título Text sm Semibold e texto de apoio Text sm Regular Gray/500.

| Tipo | Fundo | Borda | Título |
|---|---|---|---|
| Neutral | Gray/50 | Gray/200 | Gray/600 |
| Success | Success/50 | Success/200 | Success/600 |
| Warning | Warning/50 | Warning/200 | Warning/600 |
| Error | Error/50 | Error/200 | Error/600 |

- **Faixa de assinatura** (largura total, topo da tela): "Teste em andamento" e "Pagamento atrasado" em Warning; "Teste expirado" e "Conta bloqueada" em Error. Ícone de 32 px, título e texto centralizados e botão Primary ("Contratar" ou "Pagar agora"). Bordas só em cima e embaixo.

### 3.7 Abas

- **Abas segmentadas** (filtro de status no topo da página): container Gray/200, padding 4, gap 4, raio 8. Aba com altura 34, padding 6 × 12, raio 4, Text sm Medium. Ativa: fundo branco, Shadows/sm-strong, texto Gray/700. Inativa: texto Gray/500. Contador opcional. Fonte: Allan › Base de Custos; Jul/26 › Orçamentos.
- **Abas sublinhadas** (dentro de card): fundo Gray/25 e borda inferior de 3 px Gray/300. Aba com padding 16 × 20, texto 13 px Semibold. Ativa: borda e texto Brand/400. Contador colorido por status. Fonte: Allan › Base de Custos (Patrimônios).

### 3.8 Tabela

Fonte: Allan › Base de Custos (Patrimônios); Jul/26 › Orçamentos, A receber, Produtos.

- **Cabeçalho:** texto 12 px Gray/500, fundo cinza-claro.
- **Linha:** fundo branco, borda inferior 1 px Gray/100. Altura 40 (compacta) ou cerca de 50 (com duas linhas de texto). Padding horizontal 12 a 16.
- **Célula principal:** título de 12 a 14 px em peso Medium ou Semibold (Gray/900 ou Gray/600) e subtítulo 12 px Gray/500 (ex.: "Nome do Cliente Ltda" / "108-v1 - Venda rápida").
- **Valores:** 12 a 14 px. Positivo em verde, negativo em vermelho.
- **Agrupamento:** linha de grupo com fundo cinza e texto 12 px. Agrupa por data ("Terça-feira, 13 de Agosto de 2024") ou categoria ("Grupo de Produtos A"). Pode ser recolhível com chevron e pode trazer totais à direita (ex.: "Previsto R$ 4.500,00" em pílula verde). Fonte: Jul/26 › A receber, Fluxo financeiro; Allan › Base de Custos.
- **Ações por linha:** ícones de 16 a 20 px em Gray/500, alinhados à direita (ver, editar, imprimir, histórico, comentários, excluir). Um ponto colorido de 6 px sobre o ícone indica pendência ou novidade.
- **Seleção:** checkbox na primeira coluna. Fonte: Allan › Folha de pagamento.
- **Barra de progresso na célula:** trilho Gray/200, preenchimento Brand/400, altura 4, com texto "6 anos • 25%". Fonte: Allan › Base de Custos.
- **Rodapé:** "Mostrando 1 a 5 de 5 registros" e paginação.

### 3.9 Paginação

Botões "Anterior" (desabilitado na primeira página) e "Próximo" com seta, nas pontas. Números de 40 × 40 no centro com reticências. A página ativa tem fundo verde-claro (Brand/25 a Brand/50) e texto Brand. Fonte: Jul/26 › Orçamentos, Clientes.

### 3.10 Cards

- **Card de seção (detalhe):** fundo branco, borda Gray/200, raio 12. Cabeçalho com ícone de destaque branco de 40 px, título em Semibold e ações em botões de ícone (editar, duplicar, recolher). Conteúdo em grade de 4 colunas de rótulo (12 px Gray/500) e valor (14 px Gray/900), separadas por divisórias. Fonte: Jul/26 › Orçamentos (detalhe), Clientes (detalhe).
- **Card de ação no topo do detalhe:** botão grande branco com ícone em círculo colorido e texto (ex.: "Prévia da proposta", "Rejeitar orçamento", "Concluir orçamento"). Fonte: Jul/26 › Orçamentos (detalhe).
- **Card de KPI compacto:** fundo branco, borda Gray/200, raio 12, padding 8 × 12, gap 12. Ícone de destaque de 40 px, rótulo 10 px Gray/500 e valor Text lg Semibold Gray/900. Fonte: Allan › Base de Custos (Patrimônios).
- **Card de KPI do dashboard:** ícone colorido conforme o sentido (verde aprovado, amarelo aguardando, vermelho não aprovado, cinza neutro), rótulo pequeno e valor grande. Fonte: Jul/26 › Dashboard.
- **Card de resumo com "Ver detalhes":** KPI com rodapé "Ver detalhes ›" separado por borda Gray/100. Fonte: Allan › Base de Custos (Resumo), Precificação.
- **Card de grupo de precificação:** raio 14, ícone de 40 px tingido da cor do grupo, número grande (30 px Semibold), barra de progresso de 8 px, legenda "Com preço configurado / Pendentes" e "Ver detalhes". Fonte: Allan › Precificação. Ver divergência D-05.

### 3.11 Modal

Fonte: Jul/26 › Clientes (Novo cliente); Allan › Empresas e Sistemas.

- **Cabeçalho:** fundo Gray/100, borda inferior Gray/300, padding 24. Ícone de destaque de 40 px (fundo branco, borda, raio 10), título Semibold Gray/900 e botão fechar (X de 24 px) à direita.
- **Corpo:** fundo branco (no detalhe de item composto, fundo Gray/100), formulário em grade de 2 ou 3 colunas, seções separadas por divisória e subtítulo.
- **Rodapé:** borda superior Gray/300, padding 24, botões à direita com gap 16: Neutral Secondary ("Voltar"/"Cancelar") + Primary com ícone à direita ("Cadastrar cliente →", "Salvar ✓"). Pode ter total à esquerda ("R$ 40,00 · Valor Final") ou checkbox ("Inserir outro depois deste"). Fonte: Jul/26 › Orçamentos (item composto), Produtos (novo produto).
- **Raio** 12 e **sombra** Shadow/xl.
- **Larguras em uso:** 400 (confirmação), 450, 564, 644/652, 696 (cadastro padrão), 855, 875, 900, 940, 950 (formulários largos).
- **Confirmação (400 px):** centralizado, padding 24, gap 32. Ícone circular de 48 px (ex.: Warning/100 com anel de 8 px Warning/50), pergunta em Text lg Semibold e botões Cancelar + Excluir (Danger). Fonte: Allan › Empresas e Sistemas.

### 3.12 Navegação lateral (Sidebar)

Fonte: Allan › Base de Custos (componente "Sidebar tribo"); Jul/26 (todas as telas).

- Largura 296, fundo branco, borda direita Gray/200.
- **Topo:** logo Atrupe (154 × 37,5) e botão de recolher (chevron-left), altura 112.
- **Usuário:** avatar de 48 px, nome Text sm Semibold Gray/700, função 12 px Gray/500 e menu ⋮.
- **Módulos:** Vendas, Financeiro, Produção, Nota Fiscal, Cadastros, Relatórios, Configurações, Academy. Ícone de 24 px, Text sm Semibold Gray/700 e chevron verde. Divisória entre módulos.
- **Subitens:** altura 40, ícone de 24 px, Text xs Medium Gray/500. Ativo: fundo Brand/25, raio 4, texto Brand/600. Contador "+9" opcional à direita. Atalho de criação ("Nova venda rápida", "Novo cliente") com ícone + verde preenchido.

### 3.13 Estado vazio

Card branco ocupando a área. No centro: ícone em círculo duplo verde (Brand/50 e Brand/100), título Text md Semibold, subtítulo Gray/500 e botão Primary (ex.: "Sem orçamentos cadastrados" · "Cadastre seu primeiro orçamento" · "Novo orçamento"). As abas de filtro continuam visíveis. Fonte: Jul/26 › Orçamentos (estado vazio); Allan › Folha de pagamento.

Há também o estado "sem resultado para a busca". Fonte: Jul/26 › Produtos.

### 3.14 Outros

- **Tooltip:** fundo escuro, texto branco 12 px, seta (ex.: "Valor editado", "Valor líquido: R$ 490,00"). Fonte: Jul/26 › Orçamentos, Fluxo financeiro.
- **Gráficos:** linha suave verde, barras empilhadas (verde/amarelo/vermelho), rosca com legenda e barras horizontais. Tooltip de gráfico próprio ("Tooltip chart" 200 × 78). Fonte: Jul/26 › Dashboard; Allan › Base de Custos.
- **Upload de arquivo:** área tracejada verde, "Clique para adicionar imagem ou arraste e solte", "PNG ou JPG até 200kb". Item de upload com barra de progresso e estados Em andamento, Completo e Erro. Fonte: Jul/26 › Produtos; Allan › Modals.
- **Toggle e checkbox:** verdes quando ativos. Fonte: Jul/26 › Produtos (novo produto).
- **Seletor de etapas de produção:** lista com sequência ordenável (1º, 2º...), ícone do setor em círculo verde quando ativo e toggle por etapa. Fonte: Jul/26 › Produtos (novo produto).
- **Ícones de etapa na agenda:** quadrados de 32 px com o ícone do setor, fundo verde quando concluída, e ponto colorido de status. O clique abre menu Iniciar / Adicionar pendência / Cancelar / Finalizar. Fonte: Jul/26 › Agenda de Entrega.

---

## 4. Padrões de layout

### 4.1 Cabeçalho da página (navbar)

Fonte: Jul/26 › Header navigation (componente "Navbar"); Allan › Base de Custos.

- **Variante lista:** título à esquerda. À direita, botões de ícone (Ajuda, Imprimir, Exportar) e até três botões Primary.
- **Variante detalhe:** seta voltar, título, subtítulo em cinza (nome do cliente/item) e status com ponto (ex.: "• Digitação").
- **Abas segmentadas** logo abaixo, com contador por status.

A página "Header navigation 🚧" do Jul/26 é o kit de navegação superior do Untitled UI, ainda em construção. O produto usa sidebar, não header de navegação.

### 4.2 Listagem

Fonte: Jul/26 › Orçamentos, Clientes, Produtos, A receber.

1. Navbar com título, Ajuda, Imprimir e ação Primary.
2. Abas segmentadas de status com contadores.
3. Card branco com os **filtros no topo**: rótulos acima dos campos (selects, datepicker, busca) e botão de busca verde.
4. Tabela no mesmo card, com agrupamento por data ou categoria.
5. Paginação no rodapé do card.

### 4.3 Detalhe

Fonte: Jul/26 › Orçamentos (detalhe), Ordens de Serviço, Clientes (detalhe); Allan › Empresas e Sistemas.

1. Navbar com voltar, título, subtítulo, status e ações (ou botão Danger "Excluir"/"Inativar cadastro").
2. Linha de cards de ação (ex.: "Prévia da proposta" à esquerda; "Rejeitar" e "Concluir" à direita).
3. Cards de seção empilhados (Resumo, Itens, Entrega, Condições de pagamento, Financeiro). Cada um pode ser recolhido e tem ações no cabeçalho.
4. Itens compostos aparecem como linha expansível com subitens indentados.
5. Abas segmentadas no topo quando o registro tem sub-áreas (Cadastro, Orçamentos, Ordens de serviço, Financeiro).

### 4.4 Formulários

- Formulários de cadastro e edição ficam **em modal**, não em página. Fonte: Jul/26 › Clientes, Produtos, Orçamentos.
- Grade de 2 ou 3 colunas, rótulo acima do campo, seções com subtítulo e divisória.
- Valores monetários com prefixo "R$" e percentuais com sufixo "%". Fonte: Allan › Empresas e Sistemas (Editar precificação).
- Escolha entre opções exclusivas em cards selecionáveis (ex.: "Preço variável" / "Preço fixo", com check verde e fundo Brand/25 no selecionado). Fonte: Allan › Empresas e Sistemas.
- Resumo calculado ao lado do formulário, em tabela de duas colunas (ex.: "Resumo de Precificação" e "Estimativa do Mês"). Fonte: Allan › Empresas e Sistemas.

### 4.5 Filtros

Ficam no topo do card da tabela. Tipos: select (Série, Vendedor, Setor, Categoria, Unidade), datepicker simples ou período, campo de mês com setas ‹ › (Folha) e busca livre. Botão "Limpar filtros" com ícone de funil quando há filtros avançados. Fonte: Jul/26 › Orçamentos; Allan › Folha de pagamento, Base de Custos.

### 4.6 Estados vazios

Ver 3.13. O estado vazio substitui a tabela dentro do card e mantém navbar e abas.

### 4.7 Resumos e relatórios

Telas de análise usam abas segmentadas por tema, linha de KPIs, gráficos em cards lado a lado e cards com "Ver detalhes". Ações Exportar, Ajuda e Imprimir na navbar. Fonte: Allan › Base de Custos, Precificação; Jul/26 › Dashboard.

---

## 5. Telas por módulo

### 5.1 Acesso e contratação

**Sign-up, Login, Recuperação de senha.** Fonte: Jul/26 › Sign-up + Login + Planos.
- **Objetivo:** criar conta (teste grátis de 7 dias), entrar e recuperar senha.
- **Layout:** card centralizado sobre fundo cinza, dividido em imagem à esquerda (foto e frases "Criado por especialistas." / "Desenvolvido para transformar sua gestão!" em laranja) e formulário à direita com logo.
- **Componentes:** inputs com rótulo, reCAPTCHA, botão Primary largo ("Avançar →", desabilitado até completar), links em verde ("Entre agora!", "Termos de Uso", "Aviso de Privacidade").
- **Contratação:** páginas de planos com cards de plano (frame "Plano" 599 px).

### 5.2 Dashboard

Fonte: Jul/26 › Dashboard.
- **Objetivo:** visão geral de vendas e financeiro do período.
- **Componentes:** saudação "Olá, [Nome do Usuário]", filtros (Origem, Período, Período personalizado), 6 KPIs (Aprovadas, Aguardando, Não aprovadas, Ticket médio O.S, Comissão, Aprovação média), gráfico de linha "Evolução de vendas do período", barras "Aprovadas x Não aprovadas", roscas "Origens dos orçamentos/OS" (WhatsApp, Balcão, Instagram, Site, Outros), barras horizontais "Produtos mais vendidos" e "Melhores clientes".
- **Comportamento:** cada gráfico tem imprimir e expandir. Imprimir abre menu PDF / Excel. Existe versão Financeiro (Receitas).

### 5.3 Vendas

**Orçamentos (listagem).** Fonte: Jul/26 › Orçamentos.
- **Objetivo:** acompanhar orçamentos por fase.
- **Componentes:** abas Digitação, Aguardando, Vencidos, Rejeitados, Todos; filtros Concluído até, Série, Vendedor, Buscar; colunas Referência, Valor, Fase atual, Status, Concluído em, Válido até; ações imprimir e editar.
- **Comportamento:** agrupamento por data. Fase com badge de ponto e status comercial com etiqueta sólida. Estado vazio com menu de ajuda.

**Orçamento (detalhe).** Fonte: Jul/26 › Orçamentos (Orçamento normal).
- **Objetivo:** montar e concluir o orçamento.
- **Componentes:** cards de ação (Prévia da proposta, Rejeitar orçamento, Concluir orçamento); seções Resumo, Itens, Entrega, Condições de pagamento.
- **Comportamento:** itens com ações por linha (observação, imagem, duplicar, editar, preço, excluir). Ponto laranja e tooltip "Valor editado" quando o valor foi alterado. Item composto expande mostrando produto e composições. Fluxos documentados por status: Digitação (vazio, adicionando itens, preenchido), Aguardando, Vencido, Cancelado; comissão e duplicação.
- **Modais:** Novo orçamento, Categorias de itens, Itens, Detalhes do item simples, Detalhes do item composto, Desconto para item, Edição de entrega, Opções de impressão, Observações internas, Imagem, Duplicar orçamento.

**Detalhes do item composto (modal).** Fonte: Jul/26 › Orçamentos.
- Imagem à esquerda ("Alterar imagem" e lixeira) e campos à direita: Descrição do serviço, Quantidade, uma seção por etapa/setor (Quantidade, Valor Unitário, Valor) e Descritivo técnico. Rodapé com "Valor Final" à esquerda e Voltar / Salvar.

**Venda rápida.** Fonte: Jul/26 › Orçamentos (Venda rápida).
- Tela de orçamento simplificada (1440 px), com modais de categorias e itens. Inclusão de itens por unidade de medida em seção própria.

**Ordens de Serviço.** Fonte: Jul/26 › Ordens de Serviço.
- **Listagem** igual à de orçamentos, com estado vazio.
- **Detalhe:** status "Em produção"; ações Via de produção, Via do cliente e Cancelar venda (Danger); seções Resumo (com datas de conclusão e aprovação), Itens (somente leitura), Entrega (status "Aguardando"), Condições de pagamento e Financeiro (parcelas, comissão e entrega, com status Realizado / Não realizado).

### 5.4 Financeiro

**Movimentações a receber.** Fonte: Jul/26 › A receber.
- **Componentes:** filtros Vencimento até e Buscar; colunas Referência, parcela (1/4), Valor, Forma de pagamento; ações ver, renegociar, observações, histórico e baixa (polegar).
- **Comportamento:** agrupamento por data com pílula "Previsto" e total. Ponto colorido sinaliza pendência. Modais: Observações parcela, Histórico, Editar parcelas, Nova receita, Detalhes, edição e cancelamento.

**Fluxo Financeiro.** Fonte: Jul/26 › Fluxo financeiro.
- **Componentes:** etiqueta do critério de data no título ("Data de vencimento"); ações ordenar, calendário, ocultar valores, imprimir, Nova despesa (Danger) e Nova receita (Success); filtros Período, Conta, Situação, Forma de pagamento, Buscar; resumo "Não realizado / Realizado" com A receber, A pagar e Saldo.
- **Comportamento:** grupos por data com receita e despesa previstas e realizadas. Polegar verde/laranja/vermelho indica situação. Tooltip mostra valor líquido.
- Inclui modelo de recibo A4.

**Folha de pagamento.** Fonte: Allan › Folha de pagamento.
- **Listagem:** mês de referência com setas, busca, colunas Colaborador, Salário total, Saldo, Status (Sem lançamento, Aberta, Fechada), ação + (lançar) ou lápis (editar).
- **Aberta:** "Folha de pagamento 11/24 · Nome do colaborador · Aberta". Ações Imprimir e Fechar folha. Seção Itens com total "Salário a pagar" e tipos Acréscimo / Desconto / Adiantamento; botões "Adicionar item" e "Adiantamento de salário". Seção Movimentação do salário.
- **Fechada** e **estado vazio** ("Sem folha de pagamento cadastrada" · "Criar folha de pagamento").
- Modais de pagamento e de itens; PDFs A4 (Não pago, Pago, Adiantamento de salário).

### 5.5 Produção

**Agenda de Entrega.** Fonte: Jul/26 › Agenda de Entrega.
- **Componentes:** abas Produção, Entrega, Todos os ativos, Finalizados; filtros Série, Vendedor, Buscar; colunas Referência, Produção (ícones das etapas), Financeiro (ícones de pagamento e nota).
- **Comportamento:** cada etapa é um ícone de setor com estado por cor. O clique abre Iniciar / Adicionar pendência / Cancelar / Finalizar. Quando todas as etapas terminam, aparece o botão "Finalizar serviço". Modal "Andamento produção".

### 5.6 Cadastros

**Clientes.** Fonte: Jul/26 › Clientes.
- **Listagem:** abas Pré-cadastros, Regularizados, Inativos, Todos; ações duplicar, imprimir, importar, consulta e "Novo pré-cadastro"; colunas Cliente, PF/PJ, Categoria, Contato, Status.
- **Detalhe (PF e PJ):** status, ações Atualizar cadastro automaticamente, transferir, editar e Inativar cadastro; abas Cadastro, Orçamentos, Ordens de serviço, Financeiro; seções Resumo, Responsável, Endereço Principal, Endereço Cobrança.
- **Modais:** Novo cliente / Editar cliente (696 px), Categorias de Clientes, Erros de importação. "Consulta de CNPJ/CPF" está marcada como ainda em definição.

### 5.7 Configurações

**Produtos.** Fonte: Jul/26 › Produtos.
- **Listagem:** abas Ativos e Inativos; botões Grupos de produtos e Novo produto; filtros Setor, Grupo de produtos, Unidade, Buscar; colunas Produto (nome e código), Setor (badge), Custo, P.V.; agrupamento por grupo de produtos.
- **Novo produto (modal 855 px):** Setor, Grupo de produtos, Nome, Código, Unidade comercial, Valor de venda, "Adicionar composição", upload de imagem, Descritivo técnico, Etapas de produção (sequência e toggle por setor), toggles "Permitir editar valor" e "Permite editar descrição", checkbox "Inserir outro depois deste".
- Variante **Produtos + Nota Fiscal** com modal "Configurações de Nota Fiscal do produto".

**Empresa e sistema · Patrimônios.** Fonte: Allan › Empresas e Sistemas e Configurações › Empresa e Sistema.
- **Listagem de patrimônios:** ícone do tipo em círculo verde, Patrimônio, Setor, Quantidade; botão "Novo patrimônio".
- **Detalhe do patrimônio:** Excluir (Danger); seções Resumo (aquisição, valor, vida útil, residual, depreciação), Centro de custos (Custos fixos, Custos variáveis da máquina, por categoria), Categorias (com P.V. e custo por m²) e Utilização em serviços.
- **Modais:** Novo/editar patrimônio, Novo custo, Nova/editar categoria, Novo serviço composto, Editar precificação (preço variável ou fixo, com resumo e estimativa do mês) e confirmação de exclusão.

**Base de Custos.** Fonte: Allan › Base de Custos.
- **Objetivo:** consolidar o custo mensal de referência da empresa.
- **Abas:** Resumo, Despesas Adm., Mão de obra, Comparativo, Patrimônios, Distribuição, Por setor.
- **Resumo:** 4 cards de categoria (Despesas Administrativas, Custos dos Setores Produtivos, Mão de Obra, Patrimônio e Depreciação) com % do total, card "Custo mensal de referência" com realizado e diferença, rosca de composição e barras de evolução.
- **Patrimônios:** KPIs (investido, depreciado, restante, depreciação mensal, ativos), "Relatório de depreciação" com abas Ativos / Em revisão / Inconsistências / Inativos, grupos recolhíveis e status.
- **Despesas Adm.:** plano de contas com Último mês, Média 6m, Média 12m e Referência. Modal "Usar como referência" para escolher o critério (último mês, média de 6 meses, média anual ou manual).
- **Modal de detalhamento do patrimônio:** informações gerais, depreciação, alertas e decisão ("O patrimônio não existe mais" / "continua em uso").

**Precificação.** Fonte: Allan › Precificação.
- **Objetivo:** definir parâmetros de preço e acompanhar o que falta precificar.
- **Abas:** Resumo, Mão de obra, Máquinas, Materiais, Produtos.
- **Resumo:** card "Parâmetros de referência" (Tributação, Comissão, Custo financeiro, Margem desejada) com barra de composição do preço sugerido, card "Markup de referência" (ex.: 1,68 · 68,1% sobre o custo) e "Precificação por grupo" com 4 cards e total de pendentes.
- **Modal:** edição dos parâmetros.

**Configurações › Financeiro.** Fonte: Pro › Configurações › Financeiro.
- **Folha de pagamento:** itens de custo por colaborador (Salário base, INSS, FGTS, 13º, Férias, Ajuda de custo, Horas extras, Hora falta, Vale transporte) com colunas Acréscimo, Desconto e Custo final; filtros Setores, Colaborador, Tipos de custos; botão "Novo item de custo".
- **Precificação:** tela e modais "Precificar" e "itens". O screenshot não foi obtido por limite de cota.

---

## 6. Mobile

**Pendente.** O arquivo Atrupe - Mobile pertence a outro time e a cota de chamadas do Figma acabou antes da leitura. O que se sabe por outras fontes:

- **Grid mobile:** frame de 375, 4 colunas, gutter 16 e margem 16. Fonte: Allan › Grids & spacing.
- **Modais do kit** têm variante Mobile de 375 × 812. Fonte: Allan › Modals.

Páginas a ler quando o arquivo for duplicado: Dashboard e Orçamentos.

---

## 7. Divergências encontradas

Registradas sem decisão.

| ID | Tema | O que diverge | Onde |
|---|---|---|---|
| D-01 | Gray/200 | Duas variáveis com valores diferentes: "Gray/200" = #EAECF0 e "Gray / 200" = #E4E7EC (borda do ícone no cabeçalho de modal). | Allan › Colors × Jul/26 › Clientes (modal) |
| D-02 | Altura e texto de campo | Input field Atrupe: 40 px e texto 12 px. Datepicker e input dropdown: 44 px e texto 16 px. | Allan › Inputs × Datepicker, Dropdowns |
| D-03 | Altura de botão | Conjunto Atrupe: md = 44 px. Conjunto do kit: md = 40 px. Rodapé de modal (Jul/26) usa 40 px; confirmação (Allan) usa 44 px; navbar usa 40 px; card de precificação usa 32 px. | Allan › Buttons, Empresas e Sistemas, Base de Custos; Jul/26 › Clientes |
| D-04 | Anel de foco | Input usa anel Gray/600 de 4 px. O mesmo campo traz o efeito do kit "Shadow/xs focused 4px primary-100" com #F4EBFF (roxo do Untitled, não verde). | Allan › Inputs |
| D-05 | Valores fora da escala | Precificação e Base de Custos usam tamanhos 10; 11,5; 12,5; 13; 15 e 17 px, raios 11 e 14 e cores #FAFBFC, #F0F1F4, #16A34A, #EAF4FF e #E7F6EC, que não existem nos tokens. | Allan › Precificação, Base de Custos |
| D-06 | Título de modal | Cabeçalho de modal usa 17 px Semibold; a escala tem 16 (Text md) ou 18 (Text lg). | Jul/26 › Clientes |
| D-07 | Nome da variável de 12 px | O mesmo valor 12 aparece como "spacing-sm" no Alert e como "spacing-md" nas abas. | Allan › Alert, Base de Custos |
| D-08 | Ações da folha aberta | Pro: "Imprimir" e "Fechar folha" como cards grandes (cerca de 56 px). Allan: botões compactos. | Pro × Allan › Folha de pagamento |
| D-09 | Submenu Configurações | Allan: Empresa e sistema, Custos e precificação, Financeiro, Nota Fiscal, Vendas. Jul/26 e Pro: Empresa e sistema, Produtos, Financeiro, Nota Fiscal, Vendas. | Allan › Empresas e Sistemas × Jul/26 › Produtos; Pro › Financeiro |
| D-10 | Largura de frame | Telas novas do Allan em 1500 px (conteúdo 1204). Demais em 1440 px (conteúdo 1144). A sidebar é 296 px nas duas. | Allan › Base de Custos, Precificação × Jul/26 |
| D-11 | Páginas duplicadas no Allan | "Empresas e Sistemas" e "Configurações › Empresa e Sistema" têm as mesmas telas, com modais 16 px mais altos na primeira (ex.: 472/478 × 462/472; 388 × 372). | Allan |
| D-12 | Cor de "Nova receita" | Ação primária de receita usa verde de sucesso, diferente do Brand/500 das demais ações primárias. | Jul/26 › A receber, Fluxo financeiro |
| D-13 | Rótulo de KPI | Cards de KPI usam rótulo de 10 px, abaixo do menor estilo da escala (Text xs 12). | Allan › Base de Custos |

---

## 8. Índice de fontes

| Arquivo | Páginas lidas | O que foi aproveitado | Situação |
|---|---|---|---|
| **Allan** (sslRuRZekIjtdO3oyhI9U1) | Colors, Typography, Icons, Shadows & blurs, Grids & spacing, Buttons, Inputs, Dropdowns, Tables, Modals, Badges, Status Tag, Datepicker, Alert, Empresas e Sistemas, Base de Custos, Precificação, Configurações › Empresa e Sistema, Financeiro › Folha de pagamento | Todos os tokens, componentes Atrupe, layout da aplicação e telas novas | Lido |
| **Jul/26** (8BRU08x8QxVhIg7GyZGsdK) | Header navigation, Dashboard, Orçamentos, Ordens de Serviço, A receber, Fluxo financeiro, Clientes, Agenda de Entrega, Produtos, Sign-up + Login + Planos | Padrões de listagem, detalhe e modal; telas do sistema atual; ícones de setores | Lido |
| **Pro** (YSjDEZtT8MakeJC2Yx3GMB) | Folha de pagamento, Empresa e sistema, Configurações › Financeiro | Comparação com Allan (D-08, D-09) e Configurações › Financeiro | Parcial: cota esgotada antes do screenshot de Precificação |
| **Mobile** (3puViNWfugxw65SZbcs7Qm) | Dashboard, Orçamentos | Nada | Bloqueado: cota do time esgotada |
| **Novas telas** (dQU8LUjoXEp64nZF6r3urE) | Gerenciador de tarefas | Nada | Bloqueado: cota do time esgotada |
| **DS** (Fy4q4mZd91Ah5eQgtknB7c) | Colors, Typography, Bancos e Contas, Formas de pagamento | Nada | Não consultado; só serviria para lacunas |

Não lidas por não estarem na lista de links: Allan › Configurações › Folha de pagamento; Jul/26 › Super Admin, PDFs, Academy, Perfil, Nota Fiscal, Relatórios e A pagar. A seção BACKUPS / TRASH foi ignorada.
