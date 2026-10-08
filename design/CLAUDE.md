# design/ — OpenSpec de design

Esta pasta guarda o OpenSpec **exclusivo de design** (tema, tokens,
componentes visuais, layout, telas). Rode o CLI `openspec` daqui de dentro
(`design/`); os comandos `/opsx:*` e as skills `openspec-*` desta pasta
trabalham sobre `design/openspec/`.

- **Não misturar com o OpenSpec de regras.** O `openspec/` na raiz do front é
  o repositório `atrupe-regras` (regras de negócio, só o Maicol acessa). Uma
  mudança de design nunca é criada, editada ou citada como dependência lá, e
  vice-versa.
- **Toda mutação em `design/openspec/` atualiza `design/openspec/in-flight.md`
  no mesmo PR.** Criar, renomear, arquivar ou mudar o escopo de uma mudança
  edita a lista de pendentes, as dependências e a onda. Regras de manutenção:
  topo do `in-flight.md`.
- **Arquivar no PR que implementa.** Quando um PR completa uma mudança — o
  `tasks.md` todo marcado —, `openspec archive <id>` (rodado em `design/`) é o
  **último commit** desse PR, junto com a edição do `in-flight.md`. Nunca num
  PR de acompanhamento. Se o PR já foi mesclado, o arquivamento ganha branch e
  PR próprios.
