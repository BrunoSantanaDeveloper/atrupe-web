# Como ligar a biblioteca de idiomas às telas

Escrito em 07/10/2026 para quem integra o front (Bruno). A biblioteca foi preparada **em paralelo**: este branch (`idioma-2026-10-07`) só **acrescenta** arquivos, sem mudar nenhuma tela, o `package.json` ou o layout. Nada do sistema importa `src/i18n/` ainda. Ligar é uma etapa própria, a ser feita **depois** de juntar os PRs de 07/10 (integração e rateio manual), para não gerar conflito.

## O que já está pronto

| Arquivo | O que é |
|---|---|
| `src/i18n/messages/<idioma>/<area>.json` | Mensagens em formato ICU (o do `next-intl`), uma pasta por idioma (`pt-BR`, `es`, `en`) e um arquivo por área (`vendas`, `producao`, `configuracoes`, `comum`…). |
| `src/i18n/mapa.json` | Para cada chave: o texto em português, as variáveis, as marcas e **onde aparece** (arquivo, linha, tipo). É o roteiro da migração. |
| `src/i18n/extracao.json` | O resultado bruto da extração (um registro por texto). |
| `src/i18n/traducoes.json` | As traduções por texto (`{ id: { es, en } }`), fonte da verdade das traduções. |
| `src/i18n/glossario.md` | Os termos do ramo nos três idiomas. Toda tradução nova segue ele. |
| `src/i18n/config.ts` | Idiomas, padrão, rótulos e a escolha do idioma (`resolveLocale`). |
| `src/i18n/format.ts` | Número, moeda, percentual e data pelo idioma, com a moeda sempre como parâmetro. |
| `scripts/i18n/extract.mjs` e `build.mjs` | Extraem os textos e montam as mensagens e o mapa. Rodar de novo atualiza tudo. |

## Passo a passo da ligação

1. **Instalar** `next-intl` (versão compatível com Next 14, app router).
2. **Preferência do usuário:** campo `locale` no perfil (API) e seletor em Configurações › Minha conta, com `LOCALE_LABELS`. Sem preferência, `resolveLocale` usa o idioma do navegador e depois `pt-BR`.
3. **Provedor:** no layout raiz, `NextIntlClientProvider` com as mensagens do idioma do usuário (carregar só as áreas da rota, para não pesar). Nas páginas de servidor, `getTranslations`.
4. **Sem prefixo na URL:** o Atrupe é um sistema logado, então o idioma vem da preferência (cookie), não de `/es/...`. O `middleware.ts` só precisa gravar o cookie quando ele faltar; não muda as rotas.
5. **Migrar tela a tela**, guiado pelo `mapa.json`: trocar o texto pelo `t('chave')`. Ordem sugerida: componentes comuns e avisos → Vendas (orçamento, ordens de serviço) → Produção → Cadastros → o restante. O fiscal brasileiro não precisa migrar (ver marcas).
6. **Formatação:** trocar `formatCurrencyToBrl` e os `'pt-BR'` fixos por `format.ts`, passando o idioma do usuário e a moeda da empresa.
7. **Regra para tela nova:** depois da ligação, nenhum texto escrito direto na tela. Tela nova já nasce com chave. O `extract.mjs` pode virar uma verificação no CI que acusa texto novo fora das mensagens.

## Marcas no mapa

| Marca | O que significa | O que fazer |
|---|---|---|
| `fiscal-br` | NF-e, NFC-e, NFS-e, CFOP e o restante do fiscal brasileiro | Não traduzido. Fica em português; não vai para outro país. |
| `pais-br` | CNPJ, CPF, CEP, PIX, boleto, estados… | Traduzido como texto, mas o **projeto de país** troca o campo por configuração. |
| `juridico` | Contrato e termos | Não traduzido. Tradução por advogado. |
| `interno` | Painel do Super Admin | Não traduzido. Só a equipe Atrupe usa. |
| `vitrine` | Páginas de demonstração (`/sandbox`) | Não traduzido. |

## Limites conhecidos da extração

- **Frases montadas no código.** Quando a tela junta pedaços com condição (`{a ? 'x' : 'y'}`) ou lista, a extração pega os pedaços separados. Na migração, essas frases viram uma mensagem ICU só, com `select` ou `plural` (ex.: `{count, plural, one {# item} other {# itens}}`).
- **Plural.** Os textos "item(ns)", "cliente(s)" foram traduzidos como estão; na migração devem virar `plural`.
- **Nomes de variável.** As variáveis (`{valor}`, `{name}`) vêm do código; `valor` aparece quando a expressão não tinha nome claro. Ajustar na migração, mantendo as três línguas iguais.
- **Textos que vêm da API.** Mensagens de erro do backend continuam em português até a API devolver um **código** de erro em vez da frase (pedido ao backend: responder `{ code: 'QUOTATION_NOT_FOUND' }` e o front traduzir).
- **O que o cliente digita** (nome de produto, setor, plano de contas) não se traduz.
- **Documentos impressos** (proposta, ordem de serviço): o idioma pode ser o do cliente final, não o do usuário. Decisão em aberto (IN-4).

## Manter as traduções em dia (regra IN-5)

Decidido em 07/10/2026: **todo recurso novo e todo termo alterado atualizam a tradução junto**, sem depender de alguém lembrar.

```
node scripts/i18n/check.mjs         # lista o que está sem tradução (--strict falha)
node scripts/i18n/translate.mjs     # traduz o que falta com o Claude e remonta tudo
node scripts/i18n/build.mjs         # só remonta messages/ e mapa.json
```

- **Hoje (antes da ligação):** a regra está em `CLAUDE.md`, que o assistente de IA de quem desenvolve lê em toda tarefa. Ele roda a verificação e a tradução antes de terminar.
- **Na ligação, para ficar automático para todos:**
  1. `npm install -D @anthropic-ai/sdk` (a tradução automática usa a biblioteca oficial do Claude) e a chave `ANTHROPIC_API_KEY` nos segredos do GitHub.
  2. Acrescentar `node scripts/i18n/check.mjs --strict` ao `lint-staged` (bloqueia o commit com texto sem tradução) **ou**, se preferir não travar o commit, um passo no GitHub Actions que roda `translate.mjs` e commita as traduções no próprio PR.
  3. Custo: só o texto novo vai à API; uma tela nova inteira custa centavos.
- **Termo que muda de sentido:** além das mensagens, atualizar a linha do `glossario.md`, porque a tradução automática segue o glossário.
- `translate.mjs --limpar` remove as traduções de textos que não existem mais.
