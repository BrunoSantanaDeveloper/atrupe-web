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

- `tema-claro-escuro` — tema · `in progress`. Tema escuro pelos tokens de cor e
  seletor Claro / Escuro / Sistema no menu do usuário e no menu do celular;
  toca `globals.css`, `tailwind.config.ts`, `Providers`, `src/components/ui` e
  as classes com hexadecimal.

## Dependências

Nenhuma.

## Ondas

1. Base do tema — fundação de cor de todas as telas; qualquer mudança visual
   futura depende dos tokens escuros.
   - `tema-claro-escuro` — única pendente.
