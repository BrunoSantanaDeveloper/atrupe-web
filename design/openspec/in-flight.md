# Em andamento — OpenSpec de design

Quadro das mudanças de design que existem agora em `design/openspec/changes/`.
Só estado presente e ordem próxima: sem datas, sem números de PR, sem
histórico (o histórico está no Git e em `changes/archive/`).

Regras de manutenção:

- **Mudança nova** → acrescentar a entrada, anotar as dependências, pôr numa onda.
- **Mudança de status** → atualizar a entrada.
- **Arquivamento** → apagar a entrada **e** toda dependência que aponte para ela.
- **Renomeação** → varrer este arquivo junto com as outras referências.
- **Inserir ou tirar da ordem** → mover a linha. A ordem é pela posição, não
  numerada; referências citam a mudança pelo nome, nunca pela posição.
- Status é uma palavra de estado: `spec-only` | `in progress` | `blocked: <o quê>`.
- Mudanças do OpenSpec de regras (`openspec/`, repositório `atrupe-regras`)
  não entram aqui.

## Mudanças pendentes

- `microinteracoes` — movimento e carregamento · `in progress`. Durações e
  curvas nomeadas, esqueleto, botão em progresso, modais/painéis, retorno de
  navegação e recarga de listagens; toca `tailwind.config.ts`, `globals.css`,
  `src/components/ui`, `src/components/layout`, `src/components/common` e as
  listagens de `src/app/(app-sidebar)`.

## Dependências

Nenhuma.

## Ondas

1. Movimento e carregamento — refina os primitivos de `src/components/ui` que
   todas as telas usam.
   - `microinteracoes` — única pendente.
