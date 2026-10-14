## 1. Mecanismo de tema

- [x] 1.1 `ThemeProvider` do `next-themes` em `src/components/Providers.tsx` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`, `storageKey="atrupe-tema"`) e `suppressHydrationWarning` no `<html>` de `src/app/layout.tsx`
- [x] 1.2 Opções de tema (valor, rótulo, ícone) num único módulo, usado pelos seletores

## 2. Tokens escuros

- [x] 2.1 Bloco `.dark` em `globals.css` com a escala de cinza da Decisão 2 e `--surface` (claro e escuro); sem `gray-950` (ver Decisão 2)
- [x] 2.2 Escalas coloridas no `.dark` pela regra da Decisão 2 (todas as famílias, inclusive `blue-gray*` e `blue-light*`)
- [x] 2.3 Variáveis `--<cor>-<tom>-fill` (tons 600–900) sob `.dark` com o valor do claro
- [x] 2.4 Sombras, anéis de foco, cor da barra de rolagem e `color-scheme` (Decisão 7); `body` com `bg-white`
- [x] 2.5 `tailwind.config.ts`: `white` → `--surface` em fundo/borda/anel/divisória/gradiente; tons 600–900 de fundo e de gradiente → `-fill` com fallback (Decisão 3)
- [x] 2.6 Paletas padrão do Tailwind em uso viram variáveis (em canais RGB, para manter as classes com opacidade) com os valores padrão no claro e a regra da Decisão 2 no escuro
- [x] 2.7 Primária própria do tema escuro (`--brand-primary*`) nas variáveis `-fill` da marca; `bg-brand` e `bg-gray` como preenchimento; `dark:border-transparent` nos botões `default` e `primary` (Decisão 3a)
- [x] 2.8 Refazer o escuro pelo modelo de iluminação (revisão do usuário): página mais escura que cartões, cartões mais escuros que menus/modais (`--surface-raised` nos componentes sobrepostos), tintas coloridas como luz sobre o cartão, primária iluminada com tinta escura (`--on-primary`), regra global de tinta sobre fundos de marca e `bg-gray-200/300` recuados abaixo da página (`--gray-200-bg`/`--gray-300-bg`) (Decisões 2 e 3a)

## 3. Bibliotecas com tema próprio

- [x] 3.1 `ui/sonner.tsx`: tema vindo do provedor, sem classes `dark:`
- [ ] 3.2 Gráficos: cores de eixo, grade e legenda em hexadecimal passam para `var(--gray-*)`; séries ilegíveis no escuro usam `ChartConfig.theme` — troca dos hexadecimais iguais a token feita; legibilidade das séries depende da conferência visual (6.4)
- [ ] 3.3 Conferir controles nativos (campo de data, rolagem, autopreenchimento) no escuro — `color-scheme` declarado; falta a conferência visual (6.4)

## 4. Componentes sem tema próprio

- [x] 4.1 Remover as classes `dark:` dos componentes em `src/components/ui` (Decisão 4)
- [x] 4.2 Troca mecânica de classes com hexadecimal igual a token pelo token (Decisão 6); conferir que só mudaram classes cujo valor é idêntico
- [x] 4.3 Varrer combinações de preenchimento sólido + texto claro fixo e aplicar exceções `dark:` (Decisão 5)
- [x] 4.4 Listar hexadecimais sem token que pintam fundo claro e tratar cada um

## 5. Seletor de tema

- [x] 5.1 Submenu **Tema** no `UserDropdown` com Claro / Escuro / Sistema (Decisão 8)
- [x] 5.2 Linha **Tema** no `MobileSidebar` com as três opções
- [x] 5.3 Vitrine `/sandbox/tema`: seletor, amostras de todos os tokens e dos componentes de `src/components/ui` nos dois temas

## 6. Verificação

- [x] 6.1 Teste e2e (Playwright) na página de login, sem sessão: padrão segue o sistema; escolha salva sobrevive ao recarregar; **Sistema** acompanha a troca do sistema; carregamento já com a classe certa no primeiro quadro — 8/8 passam com o modelo de iluminação
- [x] 6.2 Teste e2e de contraste: no escuro, lê os tokens calculados e confere os mínimos da spec *Legibilidade*, a ordem de elevação e a primária iluminada
- [ ] 6.3 Capturas antes/depois no tema claro das telas principais e da vitrine; nenhuma diferença — comparação do CSS compilado feita (1.808 classes e 573 trocas com o mesmo valor final no claro); faltam as capturas
- [ ] 6.4 Capturas no tema escuro: login, painel, listagem de orçamentos, orçamento aberto, modal, menu, calendário, aviso, gráfico; corrigir o que aparecer — todas conferidas e corrigidas, menos gráfico (ver 3.2)
- [x] 6.5 `npx tsc --noEmit -p .` sem erros novos e `npx eslint` nos arquivos alterados
