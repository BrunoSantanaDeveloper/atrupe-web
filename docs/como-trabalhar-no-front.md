# Como trabalhar no front do Atrupe

Guia de entrada para quem vai mexer no código das telas. Escrito em 28/10/2026, quando começou a revisão do PRO e do ELITE.

## 1. Os dois repositórios

| Repositório                     | O que tem                                                                          | Onde fica no seu computador              |
| ------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| `Atrupe-Sistemas/atrupe-front`  | O código do front (Next.js 14, React Query, React Hook Form, Zod, Tailwind, Radix) | a pasta do projeto                       |
| `Atrupe-Sistemas/atrupe-regras` | As regras de negócio e os padrões de tela (OpenSpec)                               | a pasta `openspec/`, **dentro** do front |

As regras ficam num repositório separado, mas o front espera encontrá-las em `openspec/`. Cada um tem os seus commits.

Existe também o repositório do Bruno (`BrunoSantanaDeveloper/atrupe-web`), que é o que vai para o homolog e a produção. **Nunca envie nada para lá.** O Bruno traz o nosso trabalho por merge. No clone, ele aparece como o remoto `upstream`, com o envio desligado.

## 2. Instalar e rodar

Precisa de Node 20 ou mais novo e do acesso aos dois repositórios (o Maicol convida pelo GitHub).

```bash
git clone https://github.com/Atrupe-Sistemas/atrupe-front.git
cd atrupe-front
git checkout correcoes-homolog-2026-10-22
git clone https://github.com/Atrupe-Sistemas/atrupe-regras.git openspec
echo "openspec/" >> .git/info/exclude

npm install
cp .env.example .env.local
```

No `.env.local`:

- `API_URL=https://dev.atrupe.com.br` (a API de desenvolvimento, a mesma do homolog);
- `AUTH_SECRET`: gere o seu com `openssl rand -base64 32`;
- descomente `NEXT_PUBLIC_DEMO_DATA=on` e `NEXT_PUBLIC_REVIEW_MARKS=on`. Algumas telas novas ainda usam dados de exemplo, e as marcas mostram o que está em revisão. Detalhe no README, em "Telas em implantação".

```bash
npm run dev    # http://localhost:3000
```

A primeira abertura de cada tela demora uns 15 segundos no modo de desenvolvimento. Depois fica rápido.

**`.env.local` nunca vai para o Git.** Senhas e chaves chegam por um canal privado, nunca por chat nem em commit.

## 3. Contas de teste

O Maicol manda o e-mail e a senha por um canal privado.

- **`admin.e2e-pro@teste.atrupe.com.br`** tem a base que o Maicol montou para a revisão do PRO: colaboradores, despesas, patrimônios, processos, cinco produtos compostos e o orçamento #1-T1 da Clínica Sorriso. O que tem lá está descrito em `openspec/revisao-pro-2026-10-28.md`. **Não apague nem altere essa base.** Se precisar criar um dado para testar, ponha `[Maycon]` no começo do nome.
- **Nunca use "gerar senha"** do painel numa conta `e2e`: ela é dos testes automáticos, e a senha nova derruba a CI.

## 4. Como o trabalho se divide

O Maicol revisa **tela a tela**: primeiro a lógica e a organização, depois o visual. Para não mexer os dois na mesma tela ao mesmo tempo:

1. O Maicol revisa a organização da tela (o que vem antes, o que é aba, o que é consulta) e a põe em `openspec/telas-para-o-visual.md`.
2. Você trabalha o visual dessa tela.
3. Se no visual aparecer algo de organização ou de regra, anote na tabela de dúvidas desse arquivo. Não mude a regra pelo visual.

**Componentes compartilhados** (`src/components/ui/`, `src/components/common/`) aparecem no sistema inteiro. Uma mudança ali muda todas as telas. Combine antes e teste em mais de uma tela.

## 5. Branch, commit e pull request

**De 30/10 a 10/11/2026 (viagem do Maicol), o trabalho vai para a branch `visual-2026-11`.** O Bruno traz para o homolog o que está em `correcoes-homolog-2026-10-22`. Por isso, o visual que o Maicol ainda não viu fica separado até ele revisar, na volta.

```bash
git fetch origin
git checkout visual-2026-11
git pull
git checkout -b visual-<tela>     # ex.: visual-processos
```

- Um pull request por tela, **para `visual-2026-11`**. Nunca para `correcoes-homolog-2026-10-22`, `main` ou o repositório do Bruno.
- Durante a viagem, você mesmo junta os seus pull requests em `visual-2026-11`. Na volta, o Maicol revisa a branch inteira e a junta à de trabalho.
- **O que você faz é uma proposta de layout.** Ela vai ter ajustes na revisão do Maicol antes de qualquer coisa ir para o Bruno. Por isso a branch separada: nada da `visual-2026-11` chega ao homolog sem essa revisão.
- **Uma vez por semana, traga a branch de trabalho para a sua:** `git checkout visual-2026-11 && git merge origin/correcoes-homolog-2026-10-22`. As correções continuam entrando lá durante a viagem; sem isso, o merge na volta conflita nas telas em que vocês dois mexeram.
- **O homolog está atrás do código.** O front local chama rotas que o servidor de desenvolvimento só ganha com os próximos patches do backend: hoje, editar o terceirizado avulso no orçamento, o preço sugerido em lote nos materiais e o acompanhamento comercial do LITE (que some da tela até o servidor ter a chave `sales_follow_up`). Não são erros de visual; não tente corrigir.
- As telas que podem receber o visual estão em `openspec/telas-para-o-visual.md`. Dúvidas de regra vão para a tabela no fim desse arquivo.
- Commits no padrão `tipo(área): o que mudou`, em português. Exemplos: `fix(processos): …`, `feat(orçamentos): …`, `style(precificação): …`.
- O commit roda o `eslint --fix` nos arquivos alterados (husky e lint-staged).

Depois de 10/11, o padrão volta a ser um pull request por tela para `correcoes-homolog-2026-10-22`.

## 6. Regras que a tela precisa seguir

Leia antes de começar:

- **`design.md`** (na raiz do front): o visual, com tokens, componentes e layout, extraído do Figma.
- **`openspec/design.md`**: os padrões de código e de tela. As seções 17, 18 e 19 são as decisões mais recentes:
  - **§18:** medidas dos componentes, um ícone por ação (Tabler) e termos únicos;
  - **§19:** cadastro, montagem e complementos separados. É o princípio da revisão do PRO e do ELITE.
- **`CLAUDE.md`**: a regra das traduções, explicada abaixo.

Pontos que mais aparecem na revisão:

- Nenhuma cor em hexadecimal: só os tokens do Tailwind.
- Dinheiro sempre pelo formatador (`useMoney` / `formatMoney`), sem escrever "R$" na tela.
- Número com vírgula: "1 × 0,5 m", nunca "1x0.5".
- Botão de ícone com `aria-label`; janela com `DialogTitle`.
- Testar em 390 px de largura.

## 7. Traduções (regra IN-7)

O sistema tem português, espanhol e inglês em `src/i18n/`. **Toda mudança de texto na tela atualiza as traduções, no mesmo commit:**

```bash
node scripts/i18n/check.mjs      # lista os textos novos sem tradução
```

Se aparecer algum, traduza em `src/i18n/traducoes.json` seguindo `src/i18n/glossario.md` e rode `node scripts/i18n/build.mjs`. Com uma `ANTHROPIC_API_KEY`, o `node scripts/i18n/translate.mjs` faz isso sozinho. Se um termo mudar de sentido, atualize também a linha dele no glossário.

## 8. Antes de abrir o pull request

```bash
npx tsc --noEmit -p .
npx eslint <arquivos alterados>
node scripts/i18n/check.mjs
```

Abra a tela no navegador, com a conta de teste, e confira:

- os quatro estados: carregando, vazio, com dados e sem permissão;
- a largura de 390 px;
- o tema escuro.
