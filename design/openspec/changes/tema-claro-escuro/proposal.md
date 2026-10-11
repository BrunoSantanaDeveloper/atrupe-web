## Why

O Atrupe só tem tema claro. Quem usa o sistema o dia inteiro, ou com o sistema
operacional e o navegador no escuro, recebe telas brancas; e os avisos (toasts)
já seguem o tema do sistema operacional sozinhos, ficando escuros dentro de uma
tela clara. O design system é todo em tokens de cor (variáveis CSS extraídas do
Figma), o que permite um tema escuro completo sem reescrever as telas.

## What Changes

- O usuário escolhe o tema entre **Claro**, **Escuro** e **Sistema** (segue o
  sistema operacional/navegador e acompanha a troca em tempo real). Padrão:
  **Sistema**. A escolha fica salva no navegador e vale em todas as páginas,
  inclusive login.
- Seletor de tema no menu do usuário da barra lateral (desktop) e no menu
  lateral do celular.
- Paleta escura para todos os tokens de cor do design system: neutros,
  superfícies, bordas, cores de marca e de estado, sombras e anéis de foco.
- Componentes de biblioteca que já têm modo escuro passam a usá-lo, ligados à
  escolha do usuário: avisos (toasts), gráficos, e os controles nativos do
  navegador (barras de rolagem, campos de data, autopreenchimento).
- Componentes sem modo escuro próprio passam a ter, pelos tokens.
- **Remoção:** as classes `dark:` que vieram do modelo do shadcn em 26
  componentes de `src/components/ui` saem. Elas apontam para a escala de cinza
  padrão do Tailwind, que o projeto substituiu (16 delas usam `gray-950`, que
  não existe aqui), e brigariam com os tokens escuros.
- Cores escritas à mão no código (`text-[#667085]` etc.) que são exatamente
  valores do design system passam a usar o token correspondente; a aparência no
  tema claro não muda.
- Vitrine `/sandbox/tema` para conferir tokens e componentes nos dois temas.

## Capabilities

### New Capabilities
- `preferencia-de-tema`: escolha entre Claro, Escuro e Sistema; onde se escolhe,
  padrão, persistência, acompanhamento do sistema e carregamento sem piscar.
- `tema-escuro`: como o sistema se apresenta no tema escuro — legibilidade,
  superfícies, cores de marca e estado, componentes de biblioteca e o que fica
  de fora (documentos PDF).

### Modified Capabilities
<!-- Nenhuma: não há specs de design anteriores. -->

## Impact

- `src/app/globals.css` (tokens escuros), `tailwind.config.ts` (mapeamento de
  fundo/borda para superfície e preenchimentos sólidos), `src/app/layout.tsx`
  e `src/components/Providers.tsx` (provedor de tema).
- `src/components/layout/UserDropdown.tsx` e `MobileSidebar.tsx` (seletor).
- `src/components/ui/*` com classes `dark:` (26 arquivos), `sonner.tsx`,
  `chart.tsx`, calendários.
- Telas e componentes com cores hexadecimais iguais a tokens (62 arquivos,
  troca mecânica sem mudança visual no claro).
- Sem dependência nova: `next-themes` já está instalado. Sem mudança de API;
  a preferência não vai para o servidor.
- PDFs gerados (`@react-pdf/renderer`) não mudam.
