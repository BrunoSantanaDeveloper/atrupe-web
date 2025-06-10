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

- Node.js 18+ 
- npm, yarn, pnpm ou bun

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

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3018

# Configurações de autenticação
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3018

# Outras configurações necessárias
# (Consulte a equipe de desenvolvimento para valores específicos)
```

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

A aplicação estará disponível em [http://localhost:3018](http://localhost:3018)

## 📁 Estrutura do Projeto

```
src/
├── app/                          # App Router do Next.js
│   ├── (app)/                   # Rotas protegidas/autenticadas
│   │   ├── admin/               # Área administrativa
│   │   ├── cadastros/           # Gestão de cadastros
│   │   ├── configuracoes/       # Configurações do sistema
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── financeiro/          # Módulo financeiro
│   │   ├── producao/            # Controle de produção
│   │   └── vendas/              # Módulo de vendas
│   └── (blank-layout-pages)/    # Páginas sem layout (auth, etc.)
├── components/                   # Componentes React
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
npm run dev              # Inicia servidor de desenvolvimento na porta 3018

# Build e Produção
npm run build           # Gera build de produção
npm run start           # Inicia servidor de produção

# Qualidade de Código
npm run lint            # Executa ESLint com correções automáticas

# Componentes UI
npm run shadcn          # Adiciona novos componentes ShadCN UI
```

## 🎨 Padrões de Desenvolvimento

O projeto segue rigorosos padrões de código estabelecidos pela equipe:

- **Componentes:** PascalCase para componentes, camelCase para arquivos
- **Styling:** Tailwind CSS com classes utilitárias
- **Formulários:** React Hook Form + Zod para validação
- **Data Fetching:** React Query para gerenciamento de estado do servidor
- **Tipagem:** TypeScript estrito com interfaces bem definidas

## 🚦 Status de Desenvolvimento

- ✅ **Autenticação e Autorização**
- ✅ **Gestão de Cadastros**
- ✅ **Módulo Financeiro**
- ✅ **Dashboard e Relatórios**
- ✅ **Controle de Produção**
- ✅ **Sistema de Vendas**  
- ✅ **Configurações do Sistema**

## Acessos

# Cliente teste
    cliente@teste.com
    atrupe123@

## 🤝 Contribuindo

1. Siga os padrões de código estabelecidos no projeto
2. Use commits convencionais: `feat:`, `fix:`, `refactor:`, etc.
3. Mantenha a tipagem TypeScript rigorosa
4. Teste suas alterações localmente antes de commitar

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
