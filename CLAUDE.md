# Regras para quem desenvolve no front do Atrupe

## Idioma: toda mudança de texto atualiza as traduções (IN-7, 07/10/2026)

O Atrupe tem uma biblioteca de idiomas em `src/i18n/` (português, espanhol e inglês). Ela precisa acompanhar o sistema. Por isso, **em toda tarefa que cria uma tela ou um recurso, ou que muda um texto ou um termo do sistema**, antes de terminar:

1. Rode `node scripts/i18n/check.mjs`. Ele lista os textos novos ou alterados sem tradução.
2. Se houver algum, rode `node scripts/i18n/translate.mjs` (tradução automática com o glossário; precisa de `ANTHROPIC_API_KEY`). Sem a chave, traduza você mesmo em `src/i18n/traducoes.json`, seguindo `src/i18n/glossario.md`, e rode `node scripts/i18n/build.mjs`.
3. Se o termo mudou de sentido (ex.: "Orçamento" passou a se chamar outra coisa), atualize também a linha do termo em `src/i18n/glossario.md`, nos três idiomas.
4. Commite as traduções **no mesmo commit** da mudança de tela.

Não traduza: o fiscal brasileiro (NF-e, CFOP…), o painel do Super Admin, a vitrine (`/sandbox`), contratos e termos, e o que o cliente digita. A extração já marca esses textos.

Depois que a biblioteca for ligada às telas (ver `src/i18n/LIGACAO.md`), tela nova não leva texto escrito direto: usa a chave da mensagem.
