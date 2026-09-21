# Atrupe Web 🚀

Sistema de gestão completo para empresas de comunicação visual, desenvolvido com Next.js 14, TypeScript e tecnologias modernas.

## 📋 Sobre o Projeto

O Atrupe Web é uma aplicação web robusta que oferece funcionalidades completas para gestão empresarial, incluindo:

- 👥 **Gestão de Clientes e Fornecedores**
- 💰 **Controle Financeiro Completo**
- 📊 **Dashboard e Relatórios**
- 🏭 **Controle de Produção**
- 💼 **Vendas e Orçamentos**
- ⚙️ **Configurações do Sistema**
- 👤 **Gestão de Usuários e Permissões**

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 14 com App Router
- **Linguagem:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN UI + Radix UI
- **Formulários:** React Hook Form + Zod
- **Estado:** Zustand + React Query
- **Autenticação:** NextAuth.js v5
- **Ícones:** Tabler Icons + Lucide React
- **Gráficos:** Recharts

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js 18+ (o ambiente de referência usa Node 26 e npm 11)
- npm, yarn, pnpm ou bun
- Acesso ao backend (`API_URL`): o ambiente de desenvolvimento é `https://dev.atrupe.com.br`

Para rodar o mapeamento automatizado e a documentação, veja também
[Ferramentas de apoio](#-ferramentas-de-apoio-mapeamento-e-documentação).

### 1. Clonar o Repositório

```bash
git clone [URL_DO_REPOSITÓRIO]
cd atrupe-web
```

### 2. Instalar Dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

### 3. Configurar Variáveis de Ambiente

O jeito mais rápido é copiar o exemplo versionado, que já traz todas as chaves:

```bash
cp .env.example .env.local
```

Variáveis mínimas para o ambiente local:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENV=development

# Autenticação (Auth.js v5)
AUTH_SECRET=uma-chave-qualquer-para-desenvolvimento

# Backend
API_URL=https://dev.atrupe.com.br

# Logs das chamadas à API
SHOW_API_REQUEST_LOG=true
SHOW_API_RESPONSE_LOG=false
SHOW_API_ERROR_LOG=true
```

O `.env.example` traz ainda as variáveis opcionais de rastreamento (GTM, GA4 e
pixel) e as de testes automatizados. O arquivo `.env.local` está no
`.gitignore` e **não deve ser commitado**.

> **Rodando o build de produção em localhost:** o Auth.js recusa o host e
> devolve `UntrustedHost`. Inicie com `AUTH_TRUST_HOST=true npm run start`.

### 4. Executar o Servidor de Desenvolvimento

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto (deprecated)

```
src/
├── app/                         # App Router do Next.js
│   ├── (app-sidebar)/           # Rotas protegidas/autenticadas
│   │   ├── admin/               # Área administrativa
│   │   ├── cadastros/           # Gestão de cadastros
│   │   ├── configuracoes/       # Configurações do sistema
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── financeiro/          # Módulo financeiro
│   │   ├── producao/            # Controle de produção
│   │   └── vendas/              # Módulo de vendas
│   └── (blank-layout-pages)/    # Páginas sem layout (auth, etc.)
├── components/                  # Componentes React
│   ├── ui/                      # Componentes base (ShadCN UI)
│   ├── common/                  # Componentes reutilizáveis
│   └── layout/                  # Componentes de layout
├── types/                       # Definições TypeScript
├── lib/                         # Utilitários e configurações
├── hooks/                       # Custom hooks
├── actions/                     # Server actions e funções de API
├── store/                       # Gerenciamento de estado global
└── utils/                       # Funções auxiliares
```

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento na porta 3000

# Build e Produção
npm run build           # Gera build de produção
npm run start           # Inicia servidor de produção

# Qualidade de Código
npm run lint            # Executa ESLint com correções automáticas

# Componentes UI
npm run shadcn          # Adiciona novos componentes ShadCN UI
```

## 🧰 Ferramentas de apoio (mapeamento e documentação)

Ferramentas usadas no mapeamento do sistema e na documentação em
[`openspec/`](openspec/). Não são necessárias para rodar o app, só para
reproduzir ou continuar esse trabalho.

### Playwright (navegação automatizada)

Já está em `devDependencies` (`@playwright/test`), mas os navegadores são
baixados à parte, uma vez por máquina:

```bash
npx playwright install chromium
```

Os scripts de análise em [`openspec/analise/ferramentas/`](openspec/analise/ferramentas/)
abrem o navegador com `channel: 'chromium'` e leem as credenciais do
`.env.local`:

```env
# Conta de teste da empresa (usada pelos scripts de mapeamento)
E2E_USER_EMAIL=
E2E_USER_PASSWORD=

# Conta de administrador do sistema (apenas para a área /admin)
E2E_ADMIN_EMAIL=
E2E_ADMIN_PASSWORD=
```

Use sempre contas do ambiente de desenvolvimento, nunca de produção.

Exemplo de uso do crawler somente-leitura, com o servidor rodando em
`http://localhost:3000`:

```bash
node openspec/analise/ferramentas/crawl.js
```

> Se o download do navegador falhar (proxy ou rede), baixe o pacote do Chromium
> manualmente e extraia em `~/Library/Caches/ms-playwright/chromium-<build>`
> (no macOS). A versão usada na referência é a `chromium-1217`.

Opcional: a extensão **Playwright Test for VSCode** (`ms-playwright.playwright`)
permite rodar e depurar os testes pelo editor.

### OpenSpec (documentação de specs e mudanças)

A documentação do sistema fica em `openspec/` e é validada pela CLI:

```bash
npm install -g @fission-ai/openspec   # versão de referência: 1.13.1
openspec validate --all --strict      # valida specs e propostas
openspec list                         # lista as propostas de mudança
```

A configuração do projeto está em [`openspec/config.yaml`](openspec/config.yaml):
os artefatos são escritos em português, mantendo em inglês os títulos estruturais
do OpenSpec e as palavras SHALL e MUST.

### Python (opcional, só para os relatórios em PDF)

Os PDFs da análise (`openspec/analise/*.pdf`) foram gerados a partir dos
arquivos Markdown. Para regerá-los ou para ler planilhas e PDFs de evidência:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install markdown pypdf openpyxl pillow
```

A conversão para PDF usa o próprio Chromium do Playwright, pela API de
impressão; os HTML de origem estão em
[`openspec/analise/ferramentas/`](openspec/analise/ferramentas/).

## 🎨 Padrões de Desenvolvimento

O projeto segue rigorosos padrões de código estabelecidos pela equipe:

- **Componentes:** PascalCase para componentes, camelCase para arquivos
- **Styling:** Tailwind CSS com classes utilitárias
- **Formulários:** React Hook Form + Zod para validação
- **Data Fetching:** React Query para gerenciamento de estado do servidor
- **Tipagem:** TypeScript estrito com interfaces bem definidas

## 🤝 Contribuindo

1. Siga os padrões de código estabelecidos no projeto
2. Use commits convencionais: `feat:`, `fix:`, `refactor:`, etc.
3. Mantenha a tipagem TypeScript rigorosa
4. Teste suas alterações localmente antes de commitar

## 📚 Documentação do sistema

O mapeamento do sistema está em [`openspec/`](openspec/):

- [`openspec/specs/`](openspec/specs/) — comportamento e regras de cada módulo
- [`openspec/changes/`](openspec/changes/) — propostas de mudança em aberto
- [`openspec/analise/README.md`](openspec/analise/README.md) — índice da análise:
  erros confirmados, dúvidas, mapa de rotas, mapa de permissões, revisão em
  celular e pendências

## 📚 Recursos Úteis

- [Documentação do Next.js](https://nextjs.org/docs)
- [ShadCN UI Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

---

Desenvolvido com ❤️ pela equipe Atrupe
